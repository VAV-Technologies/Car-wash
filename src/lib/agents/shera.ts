import { createOpenAIClient, GPT_MODEL } from '@/lib/agents/openai-client'
import type { ChatCompletionTool, ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isToolAllowed, getToolBlockReason, getNextState, deriveState, getStatePrompt, type SheraState } from './shera-state'
import { extractContext, formatContextBlock, validateResponse, type ConvoContext } from './shera-rules'
import { alertImageDeliveryFailure } from './shera-alerts'
import { trackMetric } from './shera-metrics'

// ---------------------------------------------------------------------------
// A. System Prompt
// ---------------------------------------------------------------------------

// ─── Part A: Identity & Personality (always included) ─────────────
export const PROMPT_IDENTITY = `Kamu Shera dari Castudio. Cuci mobil & detailing premium yang datang ke lokasi customer.

GAYA: Casual WhatsApp chat. Bukan bot, bukan CS formal. Pesan pendek, maks 2 kalimat. 1 emoji maks per pesan.
BAHASA: Ikuti bahasa customer. "Hallo/Halo/Hai" = Indonesian. Kalau English, SEMUA harus English tanpa campur.
PANGGILAN: Selalu "kak" + nama. JANGAN PERNAH "pak", "bu", "Anda", "kamu".
SETIAP PESAN harus AKHIRI dengan pertanyaan atau ajakan ke langkah berikutnya. Jangan pernah jawab lalu diam.
FORMAT: Kalau pesanmu ada 2 bagian (jawaban + CTA), PISAHKAN dengan satu baris kosong. Contoh:
"Standard cocok buat perawatan rutin, Professional lebih lengkap buat mobil yang udah lama ga dicuci.

Kak mau pilih yang mana?"
JANGAN gabung jawaban + CTA jadi 1 paragraf. Selalu ada gap sebelum CTA.
JANGAN pakai tanda strip (-). Pakai angka (1. 2. 3.) kalau mau list.
JANGAN PERNAH ASSUME kondisi mobil customer. Kalau mereka tanya "X itu apa?", jawab pertanyaannya saja. JANGAN assume mereka punya masalah itu. JANGAN rekomendasiin paket berdasarkan pertanyaan mereka kecuali mereka MINTA rekomendasi.
JANGAN pernah bilang kamu AI atau bot. Kamu Shera, orang biasa.
JANGAN PERNAH minta info yang sudah diberikan. Alamat, mobil, plat, jadwal yang customer kasih = FINAL.`

// ─── Part B: Business Knowledge (always included) ─────────────────
export const PROMPT_BUSINESS = `
LAYANAN CASTUDIO:
Cuci Mobil: Standard Wash Rp 349.000 | Professional Wash Rp 649.000 | Elite Wash Rp 949.000
Detailing: Interior Rp 1.039.000 | Exterior Rp 1.039.000 | Window Rp 689.000 | Tire & Rims Rp 289.000 | Full Detail Rp 2.799.000
Langganan (HANYA untuk CUCI MOBIL, BUKAN detailing): Essentials Rp 339.000/bln | Plus Rp 449.000/bln | Elite Rp 1.000.000/bln

HARGA FINAL. JANGAN PERNAH kasih diskon atau ubah harga.
Kalau customer minta diskon CUCI MOBIL → "Sayangnya harga kita ga bisa di-diskon kak, karena kita pakai produk premium import dan prosesnya teliti. Tapi kalau mau hemat buat cuci rutin, bisa cek langganan kita 🙂"
Kalau customer minta diskon DETAILING → "Sayangnya harga detailing kita ga bisa di-diskon kak, karena prosesnya panjang dan kita pakai produk premium import biar hasilnya maksimal. Tapi hasilnya worth it kok 🙂" JANGAN tawarkan langganan untuk detailing karena langganan HANYA untuk cuci mobil.
Satu-satunya harga spesial: Standard Wash Rp 249.000 untuk customer yang booking detailing (cuci prereq).

DETAILING BUTUH CUCI DULU: Setelah customer pilih paket detailing, info: "Sebelum detailing mobilnya perlu dicuci dulu ya kak. Kalau mau, kita cuci Standard Wash harga spesial Rp 249.000. Atau cuci sendiri juga boleh 🙂"

AREA: Jabodetabek only. Luar area → "Maaf kak, baru bisa layani Jabodetabek."
JAM KERJA: Senin-Sabtu 08:00-17:00. Minggu libur. Booking besok/hari ini BOLEH.
GARANSI: Ga puas → kita balik buat benerin tanpa biaya.
BAYAR: Ga perlu deposit. Bayar setelah selesai.

CUCI RECOMMENDATION (HANYA kalau customer minta bantu pilih cuci):
Standard → perawatan rutin, mobil ga terlalu kotor
Professional → lama ga dicuci, noda interior, bercak hujan, kontaminan (brake dust, iron, tree sap)
Elite → paling lengkap, ceramic coating, engine bay, interior deep clean

MAHAL? → "Kita emang beda kak, produk premium import, prosesnya teliti, hasilnya aman buat cat 🙂"

ESCALATE hanya: >8 mobil, akses apartemen, komplain Castudio, harga korporat, partnership.
JANGAN escalate: competitor complaint (itu peluang!), pertanyaan umum, booking biasa.`

// Legacy export for backward compatibility with tests
export const SHERA_SYSTEM_PROMPT = PROMPT_IDENTITY + '\n' + PROMPT_BUSINESS

// Old prompt content removed — now in PROMPT_IDENTITY + PROMPT_BUSINESS + per-state prompts
// The safety net rule is now in PROMPT_BUSINESS

// ---------------------------------------------------------------------------
// B. Tool Definitions
// ---------------------------------------------------------------------------

export const SHERA_TOOLS: ChatCompletionTool[] = [
  { type: 'function', function: { name: 'search_customer', description: 'Search for a customer by phone number or name. Use this when the customer wants to check their profile, existing bookings, or when you need to find their customer ID.', parameters: { type: 'object', properties: { query: { type: 'string', description: 'Phone number or name to search for' } }, required: ['query'] } } },
  { type: 'function', function: { name: 'get_customer_bookings', description: 'Get bookings for a specific customer. Use this to check upcoming, past, or cancelled bookings.', parameters: { type: 'object', properties: { customer_id: { type: 'string', description: 'The customer UUID' }, status: { type: 'string', description: 'Optional filter by status: confirmed, completed, cancelled, no_show' } }, required: ['customer_id'] } } },
  { type: 'function', function: { name: 'check_date_availability', description: 'Check how many booking slots are available on a given date. Use this before creating a booking to see if the date is open.', parameters: { type: 'object', properties: { date: { type: 'string', description: 'Date to check in YYYY-MM-DD format' } }, required: ['date'] } } },
  { type: 'function', function: { name: 'create_booking', description: 'Create a new booking for a customer. Only use this after confirming all details with the customer.', parameters: { type: 'object', properties: { customer_id: { type: 'string', description: 'The customer UUID' }, service_type: { type: 'string', description: 'Service type: standard_wash, professional, elite_wash, interior_detail, exterior_detail, window_detail, tire_rims, full_detail' }, scheduled_date: { type: 'string', description: 'Date in YYYY-MM-DD format' }, scheduled_time: { type: 'string', description: 'Time in HH:MM format (24h)' }, location_address: { type: 'string', description: 'Full street address for the service location' }, notes: { type: 'string', description: 'Location notes and special instructions' } }, required: ['customer_id', 'service_type', 'scheduled_date', 'scheduled_time'] } } },
  { type: 'function', function: { name: 'update_booking', description: 'Update an existing booking. Use this to reschedule (change date/time) or change the service type.', parameters: { type: 'object', properties: { booking_id: { type: 'string', description: 'The booking UUID' }, scheduled_date: { type: 'string', description: 'New date in YYYY-MM-DD format' }, scheduled_time: { type: 'string', description: 'New time in HH:MM format (24h)' }, service_type: { type: 'string', description: 'New service type' } }, required: ['booking_id'] } } },
  { type: 'function', function: { name: 'cancel_booking', description: 'Cancel an existing booking. Use this when the customer wants to cancel their appointment.', parameters: { type: 'object', properties: { booking_id: { type: 'string', description: 'The booking UUID to cancel' } }, required: ['booking_id'] } } },
  { type: 'function', function: { name: 'create_customer', description: 'Register a new customer OR update an existing customer record. Call this whenever you learn new customer details (name, car, plate, address) to save them to the database. If a customer with this phone already exists, their record will be updated with the new info.', parameters: { type: 'object', properties: { name: { type: 'string', description: "Customer's full name" }, phone: { type: 'string', description: 'Phone number (e.g. 628123456789)' }, car_model: { type: 'string', description: 'Car make and model (e.g. Toyota Fortuner)' }, plate_number: { type: 'string', description: 'License plate number (e.g. B 1234 ABC)' }, address: { type: 'string', description: 'Full street address' }, neighborhood: { type: 'string', description: 'Area or neighborhood for routing' } }, required: ['name', 'phone'] } } },
  { type: 'function', function: { name: 'send_service_images', description: 'Send service menu images to the customer via WhatsApp. ONLY call this AFTER the customer has explicitly said they want either "cuci mobil/wash" or "detailing". NEVER call this just because you learned the customer\'s name. The customer MUST have stated what service category they want first.', parameters: { type: 'object', properties: { service_type: { type: 'string', description: 'Comma-separated service types to send. For wash: "standard_wash,professional,elite_wash". For detailing: "interior_detail,exterior_detail,window_detail,tire_rims,full_detail". Or "all" for everything.' }, chat_id: { type: 'string', description: 'The WhatsApp chat ID to send images to' } }, required: ['service_type', 'chat_id'] } } },
  { type: 'function', function: { name: 'escalate_to_human', description: 'Flag this conversation for internal review. The customer should NOT know about this. Just tell them you need to check something and will get back to them.', parameters: { type: 'object', properties: { reason: { type: 'string', description: 'Brief reason why this needs human attention' }, category: { type: 'string', description: 'Category: bulk_order, access_permission, complaint, custom_request, partnership, other' }, customer_message: { type: 'string', description: 'The customer message that triggered escalation' } }, required: ['reason', 'category'] } } },
  { type: 'function', function: { name: 'get_completed_jobs', description: 'Get recently completed jobs for a customer. Use this when following up on a completed service to check if the customer has already rated it.', parameters: { type: 'object', properties: { customer_id: { type: 'string', description: 'The customer UUID' } }, required: ['customer_id'] } } },
  { type: 'function', function: { name: 'submit_job_rating', description: 'Save a customer rating (1-5 stars) and feedback for a completed job. Use this after the customer provides their rating and any comments about the service.', parameters: { type: 'object', properties: { job_id: { type: 'string', description: 'The job UUID to rate' }, rating: { type: 'number', description: 'Rating from 1 to 5' }, feedback: { type: 'string', description: 'Customer feedback, notes, or complaints about the service' } }, required: ['job_id', 'rating'] } } },
]

// ---------------------------------------------------------------------------
// C. Tool Execution
// ---------------------------------------------------------------------------

/** Request-scoped context to avoid globalThis pollution across concurrent requests */
export interface SheraRequestContext {
  serviceImagesSent: boolean
}

export async function executeSheraTool(
  toolName: string,
  input: Record<string, unknown>,
  state?: SheraState,
  ctx?: SheraRequestContext
): Promise<string> {
  // State gate: block tools that shouldn't be called in the current state
  if (state && !isToolAllowed(toolName, state)) {
    const reason = getToolBlockReason(toolName, state)
    console.warn(`[shera-state] Tool ${toolName} BLOCKED in state ${state}`)
    return JSON.stringify({ error: reason, blocked_by_state: true, current_state: state })
  }

  const supabase = getSupabaseAdmin()

  try {
    switch (toolName) {
      case 'search_customer': {
        const query = String(input.query)
        const { data, error } = await supabase
          .from('customers')
          .select('id, name, phone, car_model, plate_number, neighborhood')
          .or(`phone.ilike.%${query}%,name.ilike.%${query}%`)
          .limit(5)
        if (error) throw error
        return JSON.stringify(data ?? [])
      }

      case 'get_customer_bookings': {
        const customerId = String(input.customer_id)
        let q = supabase
          .from('bookings')
          .select('id, service_type, scheduled_date, scheduled_time, status, notes, customer_id, customers(name, phone)')
          .eq('customer_id', customerId)
          .order('scheduled_date', { ascending: false })
          .limit(10)
        if (input.status) {
          q = q.eq('status', String(input.status))
        }
        const { data, error } = await q
        if (error) throw error
        return JSON.stringify(data ?? [])
      }

      case 'check_date_availability': {
        const date = String(input.date)
        const { count, error } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('scheduled_date', date)
          .not('status', 'in', '("cancelled","no_show")')
        if (error) throw error
        const n = count ?? 0
        let availability: string
        if (n < 8) availability = 'available'
        else if (n <= 12) availability = 'limited slots'
        else availability = 'fully booked'
        return JSON.stringify({ date, booked: n, availability })
      }

      case 'create_booking': {
        // Use the createBooking function so auto-assign kicks in
        const { createBooking } = await import('@/lib/admin/bookings')
        const bookingData: Record<string, unknown> = {
          customer_id: String(input.customer_id),
          service_type: String(input.service_type),
          scheduled_date: String(input.scheduled_date),
          scheduled_time: String(input.scheduled_time),
          notes: input.notes ? String(input.notes) : null,
          status: 'confirmed',
        }
        if (input.location_address) bookingData.location_address = String(input.location_address)
        const booking = await createBooking(bookingData as any)
        trackMetric(String(input.customer_id), 'booking_created', {
          service_type: String(input.service_type),
          scheduled_date: String(input.scheduled_date),
        }).catch(() => {})
        return JSON.stringify(booking)
      }

      case 'update_booking': {
        const updates: Record<string, string> = {}
        if (input.scheduled_date) updates.scheduled_date = String(input.scheduled_date)
        if (input.scheduled_time) updates.scheduled_time = String(input.scheduled_time)
        if (input.service_type) updates.service_type = String(input.service_type)
        const { data, error } = await supabase
          .from('bookings')
          .update(updates)
          .eq('id', String(input.booking_id))
          .select()
          .single()
        if (error) throw error
        return JSON.stringify(data)
      }

      case 'cancel_booking': {
        const { data, error } = await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', String(input.booking_id))
          .select()
          .single()
        if (error) throw error
        return JSON.stringify(data)
      }

      case 'create_customer': {
        const phoneClean = cleanPhone(String(input.phone))
        // Check if stub customer already exists (auto-created on first message)
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .or(`phone.ilike.%${phoneClean}%`)
          .limit(1)
          .single()

        if (existing) {
          // Update the stub with real details
          const { data, error } = await supabase
            .from('customers')
            .update({
              name: String(input.name),
              car_model: input.car_model ? String(input.car_model) : null,
              plate_number: input.plate_number ? String(input.plate_number) : null,
              address: input.address ? String(input.address) : null,
              neighborhood: input.neighborhood ? String(input.neighborhood) : null,
            })
            .eq('id', existing.id)
            .select()
            .single()
          if (error) throw error
          return JSON.stringify(data)
        } else {
          // No stub exists — create new (use cleaned phone to avoid duplicates)
          const { data, error } = await supabase
            .from('customers')
            .insert({
              name: String(input.name),
              phone: phoneClean,
              car_model: input.car_model ? String(input.car_model) : null,
              plate_number: input.plate_number ? String(input.plate_number) : null,
              address: input.address ? String(input.address) : null,
              neighborhood: input.neighborhood ? String(input.neighborhood) : null,
              segment: 'new',
              acquisition_source: 'whatsapp',
            })
            .select()
            .single()
          if (error) throw error
          return JSON.stringify(data)
        }
      }

      case 'get_completed_jobs': {
        // Look up customer's bookings first, then find completed jobs for those bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select('id')
          .eq('customer_id', String(input.customer_id))
        const bookingIds = (bookings || []).map(b => b.id)
        if (bookingIds.length === 0) {
          return JSON.stringify([])
        }
        const { data: jobs, error } = await supabase
          .from('jobs')
          .select('id, service_type, completed_at, customer_rating, customer_feedback')
          .in('booking_id', bookingIds)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(5)
        if (error) throw error
        return JSON.stringify(jobs || [])
      }

      case 'submit_job_rating': {
        const rawRating = Number(input.rating)
        if (!Number.isFinite(rawRating) || rawRating < 1 || rawRating > 5) {
          return JSON.stringify({ error: 'Rating harus angka 1 sampai 5.', invalid_rating: input.rating })
        }
        const rating = Math.round(rawRating)
        const { data, error } = await supabase
          .from('jobs')
          .update({
            customer_rating: rating,
            customer_feedback: input.feedback ? String(input.feedback) : null,
          })
          .eq('id', String(input.job_id))
          .select()
          .single()
        if (error) throw error
        return JSON.stringify({ success: true, rating, feedback: input.feedback || null })
      }

      case 'send_service_images': {
        const { sendImage } = await import('@/lib/agents/waha')
        // Get service images from knowledge base
        const { data: images } = await supabase
          .from('agent_knowledge')
          .select('file_name, content')
          .eq('agent_name', 'shera')
          .like('file_name', 'service_image_%')

        if (!images || images.length === 0) {
          return JSON.stringify({ sent: false, reason: 'No service images uploaded yet. Describe services in text instead.' })
        }

        const chatId = String(input.chat_id)
        // HARD RULE: Auto-expand to full category — never send just 1 image
        const WASH_TYPES = ['standard_wash', 'professional', 'elite_wash']
        const DETAIL_TYPES = ['interior_detail', 'exterior_detail', 'window_detail', 'tire_rims', 'full_detail']
        const SUB_TYPES = ['sub_essentials', 'sub_plus', 'sub_elite']
        let serviceTypeStr = input.service_type ? String(input.service_type).trim() : 'all'
        if (!serviceTypeStr || serviceTypeStr === 'undefined' || serviceTypeStr === 'null') serviceTypeStr = 'all'
        const rawRequested = serviceTypeStr.split(',').map(s => s.trim()).filter(Boolean)
        // Auto-expand any partial category to full category
        if (rawRequested.some(t => WASH_TYPES.includes(t))) serviceTypeStr = WASH_TYPES.join(',')
        else if (rawRequested.some(t => DETAIL_TYPES.includes(t))) serviceTypeStr = DETAIL_TYPES.join(',')
        else if (rawRequested.some(t => SUB_TYPES.includes(t))) serviceTypeStr = SUB_TYPES.join(',')
        else if (serviceTypeStr !== 'all') serviceTypeStr = 'all' // unknown types → send everything
        const requestedTypes = serviceTypeStr === 'all' ? null : serviceTypeStr.split(',').map(s => s.trim())

        const SERVICE_LABELS: Record<string, string> = {
          standard_wash: 'Standard Wash',
          professional: 'Professional Wash',
          elite_wash: 'Elite Wash',
          interior_detail: 'Interior Detail',
          exterior_detail: 'Exterior Detail',
          window_detail: 'Window Detail',
          tire_rims: 'Tire & Rims',
          full_detail: 'Full Detail',
          sub_essentials: 'Langganan Essentials',
          sub_plus: 'Langganan Plus',
          sub_elite: 'Langganan Elite',
        }

        // Prevent duplicate sends in same conversation turn
        if (ctx?.serviceImagesSent) {
          return JSON.stringify({ sent: 0, already_sent: true, message: 'Images were already sent in this conversation turn. Do NOT call this tool again. Just ask the customer which package they prefer.' })
        }

        // Sort order: full_detail first for detailing, then rest alphabetically
        const SEND_ORDER: Record<string, number> = {
          standard_wash: 1, professional: 2, elite_wash: 3,
          full_detail: 1, interior_detail: 2, exterior_detail: 3, tire_rims: 4, window_detail: 5,
          sub_essentials: 1, sub_plus: 2, sub_elite: 3,
        }
        const sortedImages = [...images].sort((a, b) => {
          const ka = a.file_name.replace('service_image_', '')
          const kb = b.file_name.replace('service_image_', '')
          return (SEND_ORDER[ka] || 99) - (SEND_ORDER[kb] || 99)
        })

        let sent = 0
        let failed = 0
        for (const img of sortedImages) {
          const key = img.file_name.replace('service_image_', '')
          if (requestedTypes && !requestedTypes.includes(key)) continue
          const caption = SERVICE_LABELS[key] || key
          try {
            await sendImage(chatId, img.content, caption)
            sent++
            // Small delay between images
            if (sent < images.length) await new Promise(r => setTimeout(r, 1000))
          } catch (err) {
            failed++
            console.error(`[send_service_images] Failed to send ${key}:`, err)
          }
        }

        // Verify images were actually delivered (WAHA can return 2xx but not deliver)
        if (sent > 0) {
          try {
            await new Promise(r => setTimeout(r, 2000))
            const WAHA_API_URL = process.env.WAHA_API_URL!
            const WAHA_API_KEY = process.env.WAHA_API_KEY!
            // Check recent outgoing messages for image type
            const verifyRes = await fetch(`${WAHA_API_URL}/api/default/chats/${chatId}/messages?limit=10&downloadMedia=false`, {
              headers: { 'X-Api-Key': WAHA_API_KEY },
            })
            if (verifyRes.ok) {
              const recentMsgs = await verifyRes.json()
              const recentImages = Array.isArray(recentMsgs)
                ? recentMsgs.filter((m: any) => m.fromMe && m.hasMedia).length
                : 0
              if (recentImages === 0) {
                console.error(`[send_service_images] Verification failed: WAHA accepted ${sent} images but 0 delivered to ${chatId}`)
                sent = 0
              }
            }
          } catch (verifyErr) {
            console.error('[send_service_images] Verification check failed:', verifyErr)
            // Can't verify — trust the original send result
          }
        }

        if (sent > 0 && ctx) ctx.serviceImagesSent = true
        if (sent === 0) {
          alertImageDeliveryFailure(chatId, failed).catch(() => {})
          trackMetric(chatId, 'image_delivery_failure', { images_sent: 0, images_failed: failed }).catch(() => {})
          return JSON.stringify({ sent: 0, failed, message: 'GAGAL kirim gambar. Kamu WAJIB kirim daftar harga pakai TEXT sebagai pengganti. Pakai format backup harga yang ada di system prompt.' })
        }
        trackMetric(chatId, 'image_delivery_success', { images_sent: sent, images_failed: failed }).catch(() => {})
        return JSON.stringify({ sent, failed, message: 'Images sent successfully. Do NOT call send_service_images again. Ask the customer which package they want.' })
      }

      case 'escalate_to_human': {
        const { data, error } = await supabase
          .from('human_escalations')
          .insert({
            chat_id: 'pending',
            phone: 'pending',
            reason: String(input.reason),
            category: String(input.category || 'other'),
            customer_message: input.customer_message ? String(input.customer_message) : null,
            status: 'pending',
          })
          .select()
          .single()
        if (error) throw error
        return JSON.stringify({ escalated: true, id: data.id })
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` })
    }
  } catch (err: any) {
    console.error(`executeSheraTool error [${toolName}]:`, err)
    return JSON.stringify({ error: err.message ?? 'Tool execution failed' })
  }
}

// ---------------------------------------------------------------------------
// D. Customer Context Helpers (exported for testing)
// ---------------------------------------------------------------------------

export interface CustomerRecord {
  id: string
  name: string
  phone?: string
  car_model?: string | null
  plate_number?: string | null
  address?: string | null
  neighborhood?: string | null
}

/** Classify a customer as new, stub, or returning */
export function classifyCustomer(customer: CustomerRecord | null): 'new' | 'stub' | 'returning' {
  if (!customer) return 'new'
  if (customer.name === 'WhatsApp User' || customer.name === 'Unknown') return 'stub'
  return 'returning'
}

/** Build the customer context block for the system prompt */
export function buildCustomerContext(
  customer: CustomerRecord | null,
  phone: string,
  lastBooking?: { service_type: string; scheduled_date: string } | null
): string {
  const type = classifyCustomer(customer)
  let ctx = ''

  if (type === 'returning') {
    ctx += `\nCustomer is REGISTERED: ${customer!.name} (ID: ${customer!.id})`
    if (customer!.car_model) ctx += `\nCar: ${customer!.car_model}`
    if (customer!.plate_number) ctx += `\nPlate: ${customer!.plate_number}`
    if (customer!.address) ctx += `\nAddress: ${customer!.address}`
    if (customer!.neighborhood) ctx += `\nArea: ${customer!.neighborhood}`
    ctx += `\nThis is a RETURNING customer. JANGAN tanya info yang sudah ada di atas.`
    if (lastBooking) {
      const SERVICE_NAMES: Record<string, string> = {
        standard_wash: 'Standard Wash', professional: 'Professional Wash', elite_wash: 'Elite Wash',
        interior_detail: 'Interior Detail', exterior_detail: 'Exterior Detail', window_detail: 'Window Detail',
        tire_rims: 'Tire & Rims', full_detail: 'Full Detail',
      }
      const lastServiceName = SERVICE_NAMES[lastBooking.service_type] || lastBooking.service_type
      ctx += `\nLast booking: ${lastServiceName} on ${lastBooking.scheduled_date}`
      ctx += `\nKalau customer mau booking lagi dan pilih KATEGORI YANG SAMA (cuci/detailing), tawarkan: "Mau yang sama kayak terakhir, ${lastServiceName}, atau mau coba yang lain kak?" JANGAN langsung kirim gambar — tanya dulu.`
      ctx += `\nKalau customer bilang "sama aja" atau "yang kemarin" → langsung lanjut ke jadwal, ga perlu kirim gambar atau tanya paket lagi.`
      ctx += `\nKalau customer mau KATEGORI BEDA dari terakhir (misal terakhir cuci, sekarang mau detailing) → baru kirim gambar kategori baru.`
    }
    ctx += `\nUntuk cek booking, reschedule, atau cancel: pakai customer_id "${customer!.id}" saat panggil tool get_customer_bookings, update_booking, atau cancel_booking.`
    ctx += `\nKalau customer mau reschedule: panggil get_customer_bookings dulu dengan customer_id di atas untuk cari booking_id, lalu panggil update_booking.`
    ctx += `\nKalau customer mau booking baru dan TIDAK ada last booking di atas: tanya mau cuci atau detailing.`
  } else if (type === 'stub') {
    ctx += `\nCustomer record exists but is INCOMPLETE (ID: ${customer!.id}). Name is still placeholder "${customer!.name}".`
    ctx += `\nThis is a NEW customer. Ikuti FLOW BOOKING dari awal: nama dulu, lalu layanan, paket, mobil, plat, alamat, jadwal.`
    ctx += `\nSETIAP KALI kamu dapat info baru (nama, mobil, plat, alamat), WAJIB panggil create_customer untuk UPDATE record customer ini. Pakai phone ${phone}. Ini SANGAT PENTING agar data customer tersimpan dengan benar.`
    ctx += `\nDo NOT ask for phone — you already have it.`
  } else {
    ctx += `\nCustomer is NEW (not yet in the database). Ikuti FLOW BOOKING dari awal: nama dulu, lalu layanan, paket, mobil, plat, alamat, jadwal. Do NOT ask for phone — you already have it. Use the phone ${phone} when creating the customer.`
    ctx += `\nSETIAP KALI kamu dapat info baru (nama, mobil, plat, alamat), WAJIB panggil create_customer untuk simpan data customer. Ini SANGAT PENTING.`
  }

  return ctx
}

// ---------------------------------------------------------------------------
// E. Process Message
// ---------------------------------------------------------------------------

/** Clean a phone number: remove +, spaces, dashes */
function cleanPhone(phone: string): string {
  return phone.replace(/[\s+\-()]/g, '')
}

export async function getSheraSettings(): Promise<{ apiKey: string | null; model: string; maxTokens: number; systemPrompt: string | null }> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('agent_settings')
    .select('api_key, model, max_tokens, system_prompt')
    .eq('agent_name', 'shera')
    .single()

  let apiKey: string | null = null
  if (data?.api_key) {
    try { apiKey = Buffer.from(data.api_key, 'base64').toString('utf-8') } catch {}
  }

  return {
    apiKey,
    model: data?.model || GPT_MODEL,
    maxTokens: data?.max_tokens || 1024,
    systemPrompt: data?.system_prompt || null,
  }
}

async function getOpenAIClient() {
  // 1. Check agent_settings table first (dedicated Shera key)
  const settings = await getSheraSettings()
  if (settings.apiKey) {
    return createOpenAIClient(settings.apiKey)
  }

  // 2. Fall back to connectors base model (shared key)
  const admin = getSupabaseAdmin()
  const { data } = await admin
    .from('connectors')
    .select('encrypted_key')
    .eq('is_base_model', true)
    .single()

  let apiKey: string | undefined
  if (data?.encrypted_key) {
    try { apiKey = Buffer.from(data.encrypted_key, 'base64').toString('utf-8') } catch {}
  }

  // 3. Fall back to env var (AZURE_OPENAI_KEY is used by createOpenAIClient default)
  return createOpenAIClient(apiKey)
}

export async function processMessage(
  chatId: string,
  phone: string,
  messageText: string,
  signal?: AbortSignal
): Promise<string> {
  // Request-scoped context (safe for concurrent requests, unlike globalThis)
  const reqCtx: SheraRequestContext = { serviceImagesSent: false }
  const supabase = getSupabaseAdmin()
  const cleanedPhone = cleanPhone(phone)

  // 1. Get or create conversation
  let { data: conversation } = await supabase
    .from('whatsapp_conversations')
    .select('*')
    .eq('chat_id', chatId)
    .single()

  if (!conversation) {
    const { data: newConv, error } = await supabase
      .from('whatsapp_conversations')
      .insert({ chat_id: chatId, phone: cleanedPhone, messages: [] })
      .select()
      .single()
    if (error) {
      console.error('Failed to create conversation:', error)
      throw error
    }
    conversation = newConv
  }

  // 2. Try to find existing customer by phone, or auto-create stub
  let { data: customer } = await supabase
    .from('customers')
    .select('id, name, phone, car_model, plate_number, address, neighborhood')
    .or(`phone.ilike.%${cleanedPhone}%,phone.ilike.%${phone}%`)
    .limit(1)
    .single()

  // Auto-create customer stub if first time texting
  if (!customer) {
    const { data: newCustomer } = await supabase
      .from('customers')
      .insert({
        phone: cleanedPhone,
        name: 'WhatsApp User',
        segment: 'new',
        acquisition_source: 'whatsapp',
      })
      .select('id, name, phone')
      .single()
    if (newCustomer) {
      customer = newCustomer
      // Link conversation to this customer
      await supabase
        .from('whatsapp_conversations')
        .update({ customer_id: newCustomer.id })
        .eq('chat_id', chatId)
    }
  }

  // 2b. For returning customers, fetch their last booking for context
  let lastBooking: { service_type: string; scheduled_date: string } | null = null
  if (customer && classifyCustomer(customer) === 'returning') {
    const { data: recentBooking } = await supabase
      .from('bookings')
      .select('service_type, scheduled_date')
      .eq('customer_id', customer.id)
      .order('scheduled_date', { ascending: false })
      .limit(1)
      .single()
    if (recentBooking) lastBooking = recentBooking
  }

  // 3. Load last 20 messages from conversation for context
  const existingMessages: Array<{ role: string; content: string }> =
    Array.isArray(conversation.messages) ? conversation.messages.slice(-20) : []

  // 4. Build OpenAI messages array from conversation history
  const chatMessages: ChatCompletionMessageParam[] = existingMessages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  // 5. Add new user message
  chatMessages.push({ role: 'user', content: messageText })

  // ─── LAYER 1+4: Extract context from conversation history + current message ──
  // Include the current message in context extraction so first-message info dumps work
  const msgsForContext = [
    ...existingMessages,
    { role: 'user', content: messageText },
  ]
  const convoCtx = extractContext(msgsForContext)
  const contextBlock = formatContextBlock(convoCtx)

  // ─── LAYER 2: Derive state from context ────────────────────────
  const customerType = classifyCustomer(customer)
  const isReturning = customerType === 'returning'
  let currentState: SheraState = deriveState(msgsForContext, convoCtx, isReturning)

  // Stuck-state recovery
  if (currentState === 'collecting_name' && existingMessages.length >= 6) {
    currentState = 'awaiting_intent'
  }

  // If name was just given in THIS message and we're at greeting/collecting_name, advance
  if (convoCtx.customerName && (currentState === 'greeting' || currentState === 'collecting_name')) {
    currentState = 'intro_pitch'
  }

  // Pass state to context for validator enforcement
  convoCtx.currentState = currentState

  // ─── LAYER 3: Build focused prompt (Part A + B + State + Context) ─
  const settings = await getSheraSettings()
  const modelToUse = settings.model
  const maxTokensToUse = settings.maxTokens

  let systemPrompt = PROMPT_IDENTITY + '\n' + PROMPT_BUSINESS

  // State-specific instructions (Part C) — only 2-5 lines for this state
  systemPrompt += '\n\n' + getStatePrompt(currentState)

  // Structured context injection
  systemPrompt += '\n' + contextBlock

  // Real-time context
  const now = new Date()
  const jakartaTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(now)
  const jakartaDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(now)

  systemPrompt += `\n\n--- Real-Time ---`
  systemPrompt += `\nNow: ${jakartaTime} | Date: ${jakartaDate}`

  // WhatsApp context
  systemPrompt += `\nPhone: ${phone} (SUDAH punya, JANGAN tanya)`
  systemPrompt += `\nChat ID: ${chatId}`

  // Customer context
  systemPrompt += buildCustomerContext(customer, phone, lastBooking)

  // Safety net for reasoning model
  systemPrompt += `\n\nKalau bingung: rangkum apa yang sudah kamu tau, list apa yang kurang, dan tanya langkah berikutnya.`

  // 6. Call OpenAI
  const openai = await getOpenAIClient()

  const allMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...chatMessages,
  ]

  // Timeout: Vercel has 60s max. Budget: 15s buffer + 5-10s delay already spent.
  // Leave max 25s for all LLM calls combined.
  // Reasoning models need more time to think (Grok 4 reasoning, o3, etc.)
  // Grok 4 reasoning needs more time. Vercel maxDuration set to 120s on webhook.
  const LLM_TIMEOUT = 90000

  let response = await openai.chat.completions.create({
    model: modelToUse,
    max_completion_tokens: maxTokensToUse,
    tools: SHERA_TOOLS,
    messages: allMessages,
  }, { timeout: LLM_TIMEOUT, signal: signal as any })

  // 7. Handle tool use loop (max 5 iterations) — with state gating
  let iterations = 0
  const toolsCalled: string[] = []
  while (response.choices[0]?.finish_reason === 'tool_calls' && iterations < 5) {
    iterations++

    const assistantMsg = response.choices[0].message
    allMessages.push(assistantMsg)

    const toolCalls = assistantMsg.tool_calls || []
    const toolResults = await Promise.all(
      toolCalls.map(async (tc: any) => {
        const input = JSON.parse(tc.function.arguments || '{}')
        const result = await executeSheraTool(tc.function.name, input, currentState, reqCtx)
        toolsCalled.push(tc.function.name)
        return {
          role: 'tool' as const,
          tool_call_id: tc.id,
          content: result,
        }
      })
    )

    allMessages.push(...toolResults)

    response = await openai.chat.completions.create({
      model: modelToUse,
      max_completion_tokens: maxTokensToUse,
      tools: SHERA_TOOLS,
      messages: allMessages,
    }, { timeout: LLM_TIMEOUT, signal: signal as any })
  }

  // 8. Extract text response
  let reply = response.choices[0]?.message?.content ?? 'Ada yang bisa aku bantu kak?'
  // Strip leaked tool JSON
  reply = reply.replace(/\{["\s]*(?:service_type|chat_id|customer_id|booking_id|query|job_id|reason)["\s]*:[\s\S]*?\}\n?/g, '').trim()
  if (!reply) reply = 'Ada yang bisa aku bantu kak?'

  // ─── LAYER 5: Validate and fix response ────────────────────────
  const validation = validateResponse(reply, convoCtx)
  if (validation.shouldRegenerate) {
    // Don't regenerate (too slow for reasoning models) — use a canned safe response based on the issue
    console.warn('[shera-validator] Blocked response due to:', validation.issues)
    const isDiscountIssue = validation.issues.some(i => /discount|diskon|freebie|price/i.test(i))
    if (isDiscountIssue) {
      reply = convoCtx.language === 'en'
        ? "Unfortunately we can't offer discounts — our prices reflect the premium materials and thorough process we use. But trust us, the result is worth it 🙂\n\nWould you like to continue?"
        : "Sayangnya harga kita ga bisa di-diskon kak, karena kita pakai produk premium import dan prosesnya teliti biar hasilnya maksimal 🙂\n\nMau lanjut kak?"
    } else {
      reply = validation.output // use the fixed version
    }
  } else {
    reply = validation.output
  }

  // Update any pending escalations with correct chat_id and phone
  await supabase
    .from('human_escalations')
    .update({ chat_id: chatId, phone })
    .eq('chat_id', 'pending')
    .eq('status', 'pending')

  // 9. Save both user message and assistant reply to conversation messages
  //    If images were sent this turn, tag the assistant message so future turns know
  const saveTimestamp = new Date().toISOString()
  let replyToSave = reply
  if (reqCtx.serviceImagesSent) {
    replyToSave = `[IMAGES_SENT]\n${reply}`
  }
  // Don't duplicate the user message if it was already saved by the webhook's immediate-save
  const lastExisting = existingMessages[existingMessages.length - 1]
  const userAlreadySaved = lastExisting?.role === 'user' && lastExisting?.content === messageText
  const updatedMessages = [
    ...existingMessages,
    ...(userAlreadySaved ? [] : [{ role: 'user', content: messageText, timestamp: saveTimestamp }]),
    { role: 'assistant', content: replyToSave, timestamp: saveTimestamp },
  ].slice(-30)

  // 10. Advance state machine — derive from updated conversation reality
  const updatedCtx = extractContext(updatedMessages)
  const nextState = deriveState(updatedMessages, updatedCtx, isReturning)

  // 11. Update conversation + state
  await supabase
    .from('whatsapp_conversations')
    .update({
      messages: updatedMessages,
      last_message_at: new Date().toISOString(),
      state: nextState,
      ...(customer ? { customer_id: customer.id } : {}),
    })
    .eq('chat_id', chatId)

  // 12. Return the text reply
  return reply
}
