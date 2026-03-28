import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// A. System Prompt
// ---------------------------------------------------------------------------

export const SHERA_SYSTEM_PROMPT = `Kamu Shera dari Castudio. Cuci mobil premium yang datang ke lokasi customer.

BAHASA: Selalu pakai Bahasa Indonesia. Kalau customer nulis English, baru balas English.

GAYA CHAT:
Kamu orang biasa yang lagi chat di WhatsApp. Bukan bot, bukan customer service formal.
Pesan pendek. Maksimal 2 kalimat per pesan. Ini WhatsApp bukan email.
DILARANG KERAS pakai tanda strip apapun. Tidak boleh pakai karakter ini: - atau -- atau panjang. Kalau mau list, pakai angka (1. 2. 3.) atau tulis biasa aja.
JANGAN pakai "Anda". Pakai "kak", "pak", "bu", atau nama langsung.
JANGAN pernah bilang "Selamat datang di Castudio" atau greeting formal apapun.
JANGAN ulangi pesan yang sama. Kalau customer belum jawab lengkap, tanya satu hal aja yang kurang.
Pakai emoji sesekali, jangan lebay. Maksimal 1 per pesan.

PESAN PERTAMA HARUS PERSIS INI (atau variasi pendek mirip ini):
"Halo! Aku Shera dari Castudio. Boleh tau namanya siapa ya?"
Itu aja. Jangan tambahin apa apa lagi. Jangan kasih info layanan. Jangan kasih harga. Cuma tanya nama.

SETELAH DAPAT NAMA:
Baru tanya satu per satu. Jangan borong semua pertanyaan sekaligus.
Urutan: nama > mobil apa > plat nomor > alamat lengkap > mau layanan apa > mau kapan
Tanya SATU pertanyaan per pesan. Tunggu jawaban dulu baru tanya berikutnya.

CONTOH YANG BENER:
"Halo! Aku Shera dari Castudio. Boleh tau namanya siapa ya?"
"Hai pak Andi! Mobilnya apa nih?"
"Oke Fortuner ya. Plat nomornya berapa pak?"
"Siap. Alamat lengkapnya dimana pak? Nama jalan sama nomor rumahnya ya"
"Mau cuci yang mana nih pak? Standard Wash 349rb, Professional 649rb, atau Elite 949rb?"
"Mau dijadwalkan kapan pak Andi?"
"Oke saya buatkan ya pak"
"Done pak Andi! Booking udah masuk buat hari Sabtu jam 10 pagi"

CONTOH YANG SALAH (JANGAN PERNAH KAYAK GINI):
"Halo! Selamat datang di Castudio. Kami adalah layanan premium..."
"Boleh saya tahu nama, model mobil, plat nomor, dan alamat Anda?"
"Berikut layanan kami: - Standard Wash - Professional Wash - Elite Wash..."

HARGA (cuma kasih tau kalau ditanya atau pas nawarin layanan):
Standard Wash Rp 349.000 (1 sampai 1.5 jam)
Professional Wash Rp 649.000 (2 sampai 2.5 jam)
Elite Wash Rp 949.000 (3 sampai 3.5 jam)
Interior Detail Rp 1.039.000 (4 jam)
Exterior Detail Rp 1.039.000 (5 jam)
Window Detail Rp 689.000 (2 jam)
Tire & Rims Rp 289.000 (1.5 jam)
Full Detail Rp 2.799.000 (8 jam)

Langganan:
Essentials Rp 339.000/bulan (4x Standard)
Plus Rp 449.000/bulan (4x Professional)
Elite Rp 1.000.000/bulan (4x Pro + 2x Elite)

AREA: Seluruh Jabodetabek. Jakarta, Bogor, Depok, Tangerang, Bekasi dan sekitarnya. Kalau di luar Jabodetabek bilang belum bisa.

NOMOR HP: Sudah punya dari WhatsApp. JANGAN PERNAH tanya nomor HP.

ALAMAT: Minta alamat lengkap termasuk nama jalan dan nomor. Kalau ada petunjuk khusus (rumah warna kuning, masuk gang kedua, dll) simpan di notes booking.

MULTI MOBIL: Tanya mau cuci berapa mobil. Kalau lebih dari 1, tanya detail tiap mobil satu per satu. Jadwalkan berurutan otomatis. Durasi: Standard 90 menit, Professional 150 menit, Elite 210 menit, Interior 240, Exterior 300, Window 120, Tire 90, Full Detail 480.

BOOKING: Buat pakai create_booking. Satu booking per mobil. Konfirmasi dulu sebelum buat.

SETELAH BOOKING DIBUAT: Kasih tau customer hal ini:
1. Tidak perlu deposit atau bayar di muka. Pembayaran dilakukan setelah mobil selesai dicuci.
2. Kalau mau reschedule, tolong konfirmasi minimal 48 jam sebelum jadwalnya.
Sampaikan ini dengan santai, jangan terlalu formal. Contoh: "Oh iya pak, ga perlu bayar dulu ya. Bayarnya nanti aja setelah mobilnya selesai. Kalau mau ganti jadwal, kabarin aku minimal 2 hari sebelumnya ya"

JAM KERJA: Senin sampai Sabtu, 08.00 sampai 17.00. Minggu libur. Minimal 2 jam sebelumnya untuk hari yang sama.

ESCALATE (pakai escalate_to_human) kalau:
Pesanan lebih dari 8 mobil, akses apartemen baru, komplain kualitas, minta harga khusus/korporat, partnership, di luar Jabodetabek, atau situasi yang kamu ga yakin.

PENTING BANGET soal escalate:
Kamu adalah Shera. Kamu ADALAH orang yang ngobrol sama customer. Kamu bukan bot, kamu bukan perantara.
JANGAN PERNAH bilang ke customer untuk menghubungi tim, menghubungi siapa pun, atau memberikan kontak lain.
JANGAN bilang "silakan hubungi tim kami" atau "saya akan hubungkan dengan tim" atau apapun yang menyuruh customer ngomong ke orang lain.
JANGAN bilang kamu AI atau bot.
Yang kamu bilang cuma: "Bentar ya aku cek dulu soal ini. Nanti aku kabarin lagi secepatnya."
Atau: "Oh ini aku perlu cek dulu ya. Aku follow up sebentar lagi."
Intinya: kamu yang cek, kamu yang balik lagi. Bukan menyuruh customer ke orang lain.

JANGAN escalate untuk: booking biasa, tanya harga, reschedule, cancel, customer baru.`

// ---------------------------------------------------------------------------
// B. Tool Definitions
// ---------------------------------------------------------------------------

export const SHERA_TOOLS: Anthropic.Tool[] = [
  {
    name: 'search_customer',
    description:
      'Search for a customer by phone number or name. Use this when the customer wants to check their profile, existing bookings, or when you need to find their customer ID.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Phone number or name to search for',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_customer_bookings',
    description:
      'Get bookings for a specific customer. Use this to check upcoming, past, or cancelled bookings.',
    input_schema: {
      type: 'object' as const,
      properties: {
        customer_id: {
          type: 'string',
          description: 'The customer UUID',
        },
        status: {
          type: 'string',
          description:
            'Optional filter by status: confirmed, completed, cancelled, no_show',
        },
      },
      required: ['customer_id'],
    },
  },
  {
    name: 'check_date_availability',
    description:
      'Check how many booking slots are available on a given date. Use this before creating a booking to see if the date is open.',
    input_schema: {
      type: 'object' as const,
      properties: {
        date: {
          type: 'string',
          description: 'Date to check in YYYY-MM-DD format',
        },
      },
      required: ['date'],
    },
  },
  {
    name: 'create_booking',
    description:
      'Create a new booking for a customer. Only use this after confirming all details with the customer.',
    input_schema: {
      type: 'object' as const,
      properties: {
        customer_id: {
          type: 'string',
          description: 'The customer UUID',
        },
        service_type: {
          type: 'string',
          description:
            'Service type: standard_wash, professional_wash, elite_wash, interior_detail, exterior_detail, window_detail, tire_rims, full_detail',
        },
        scheduled_date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format',
        },
        scheduled_time: {
          type: 'string',
          description: 'Time in HH:MM format (24h)',
        },
        location_address: {
          type: 'string',
          description: 'Full street address for the service location, e.g. "Jalan Kemang Raya No. 15, Kemang, Jakarta Selatan"',
        },
        notes: {
          type: 'string',
          description: 'Location notes and special instructions, e.g. "rumah warna kuning, masuk gang kedua sebelah kiri" or "Apartemen Tower B lantai 2, parkir basement"',
        },
      },
      required: ['customer_id', 'service_type', 'scheduled_date', 'scheduled_time'],
    },
  },
  {
    name: 'update_booking',
    description:
      'Update an existing booking. Use this to reschedule (change date/time) or change the service type.',
    input_schema: {
      type: 'object' as const,
      properties: {
        booking_id: {
          type: 'string',
          description: 'The booking UUID',
        },
        scheduled_date: {
          type: 'string',
          description: 'New date in YYYY-MM-DD format',
        },
        scheduled_time: {
          type: 'string',
          description: 'New time in HH:MM format (24h)',
        },
        service_type: {
          type: 'string',
          description: 'New service type',
        },
      },
      required: ['booking_id'],
    },
  },
  {
    name: 'cancel_booking',
    description:
      'Cancel an existing booking. Use this when the customer wants to cancel their appointment.',
    input_schema: {
      type: 'object' as const,
      properties: {
        booking_id: {
          type: 'string',
          description: 'The booking UUID to cancel',
        },
      },
      required: ['booking_id'],
    },
  },
  {
    name: 'create_customer',
    description:
      'Register a new customer. Use this when a customer is booking for the first time and is not found in the system.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: "Customer's full name",
        },
        phone: {
          type: 'string',
          description: 'Phone number (e.g. 628123456789)',
        },
        car_model: {
          type: 'string',
          description: 'Car make and model (e.g. Toyota Fortuner)',
        },
        plate_number: {
          type: 'string',
          description: 'License plate number (e.g. B 1234 ABC)',
        },
        address: {
          type: 'string',
          description: 'Full street address, e.g. "Jalan Kemang Raya No. 15, Kemang, Jakarta Selatan"',
        },
        neighborhood: {
          type: 'string',
          description: 'Area or neighborhood for routing, e.g. kemang, pondok_indah, bintaro, tangerang, bekasi, bogor, depok',
        },
      },
      required: ['name', 'phone'],
    },
  },
  {
    name: 'escalate_to_human',
    description: 'Flag this conversation for internal review. The customer should NOT know about this. Just tell them you need to check something and will get back to them. Use for: bulk orders (10+ cars), apartment access, complaints, custom pricing, partnerships, out-of-area requests.',
    input_schema: {
      type: 'object' as const,
      properties: {
        reason: { type: 'string', description: 'Brief reason why this needs human attention' },
        category: { type: 'string', description: 'Category: bulk_order, access_permission, complaint, custom_request, partnership, other' },
        customer_message: { type: 'string', description: 'The customer message that triggered escalation' },
      },
      required: ['reason', 'category'],
    },
  },
  {
    name: 'get_completed_jobs',
    description: 'Get recently completed jobs for a customer. Use this when following up on a completed service to check if the customer has already rated it.',
    input_schema: {
      type: 'object' as const,
      properties: {
        customer_id: { type: 'string', description: 'The customer UUID' },
      },
      required: ['customer_id'],
    },
  },
  {
    name: 'submit_job_rating',
    description: 'Save a customer rating (1-5 stars) and feedback for a completed job. Use this after the customer provides their rating and any comments about the service.',
    input_schema: {
      type: 'object' as const,
      properties: {
        job_id: { type: 'string', description: 'The job UUID to rate' },
        rating: { type: 'number', description: 'Rating from 1 to 5' },
        feedback: { type: 'string', description: 'Customer feedback, notes, or complaints about the service' },
      },
      required: ['job_id', 'rating'],
    },
  },
]

// ---------------------------------------------------------------------------
// C. Tool Execution
// ---------------------------------------------------------------------------

export async function executeSheraTool(
  toolName: string,
  input: Record<string, unknown>
): Promise<string> {
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
          // No stub exists — create new
          const { data, error } = await supabase
            .from('customers')
            .insert({
              name: String(input.name),
              phone: String(input.phone),
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
        const { data, error } = await supabase
          .from('jobs')
          .select('id, service_type, completed_at, customer_rating, customer_feedback, booking_id')
          .eq('booking_id', String(input.customer_id))
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(5)
        // Also try via bookings → customer_id
        if (!data || data.length === 0) {
          const { data: bookings } = await supabase
            .from('bookings')
            .select('id')
            .eq('customer_id', String(input.customer_id))
          const bookingIds = (bookings || []).map(b => b.id)
          if (bookingIds.length > 0) {
            const { data: jobs } = await supabase
              .from('jobs')
              .select('id, service_type, completed_at, customer_rating, customer_feedback')
              .in('booking_id', bookingIds)
              .not('completed_at', 'is', null)
              .order('completed_at', { ascending: false })
              .limit(5)
            return JSON.stringify(jobs || [])
          }
        }
        if (error) throw error
        return JSON.stringify(data || [])
      }

      case 'submit_job_rating': {
        const rating = Math.min(5, Math.max(1, Number(input.rating) || 0))
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
// D. Process Message
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
    model: data?.model || 'claude-sonnet-4-20250514',
    maxTokens: data?.max_tokens || 1024,
    systemPrompt: data?.system_prompt || null,
  }
}

async function getAnthropicClient(): Promise<Anthropic> {
  // 1. Check agent_settings table first (dedicated Shera key)
  const settings = await getSheraSettings()
  if (settings.apiKey) {
    return new Anthropic({ apiKey: settings.apiKey })
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

  // 3. Fall back to env var
  if (!apiKey) apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('No Claude API key configured.')

  return new Anthropic({ apiKey })
}

export async function processMessage(
  chatId: string,
  phone: string,
  messageText: string
): Promise<string> {
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
    .select('id, name, phone')
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

  // 3. Load last 20 messages from conversation for context
  const existingMessages: Array<{ role: string; content: string }> =
    Array.isArray(conversation.messages) ? conversation.messages.slice(-20) : []

  // 4. Build Claude messages array from conversation history
  const claudeMessages: Anthropic.MessageParam[] = existingMessages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  // 5. Add new user message
  claudeMessages.push({ role: 'user', content: messageText })

  // Use DB prompt if configured, otherwise default
  const settings = await getSheraSettings()
  const modelToUse = settings.model
  const maxTokensToUse = settings.maxTokens
  let systemPrompt = settings.systemPrompt || SHERA_SYSTEM_PROMPT

  // Load knowledge base documents
  const { data: knowledgeDocs } = await supabase
    .from('agent_knowledge')
    .select('file_name, content')
    .eq('agent_name', 'shera')

  if (knowledgeDocs && knowledgeDocs.length > 0) {
    systemPrompt += '\n\n--- Reference Documents ---'
    for (const doc of knowledgeDocs) {
      systemPrompt += `\n\n[${doc.file_name}]\n${doc.content}`
    }
  }

  // Load custom rules
  const { data: activeRules } = await supabase
    .from('agent_rules')
    .select('title, content')
    .eq('agent_name', 'shera')
    .eq('is_active', true)

  if (activeRules && activeRules.length > 0) {
    systemPrompt += '\n\n--- Custom Rules ---'
    for (const rule of activeRules) {
      systemPrompt += `\n\n[${rule.title}]\n${rule.content}`
    }
  }

  // Inject real-time context
  const now = new Date()
  const jakartaTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(now)
  const jakartaDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(now) // YYYY-MM-DD

  systemPrompt += `\n\n--- Real-Time Context ---`
  systemPrompt += `\nCurrent date and time (Jakarta/WIB): ${jakartaTime}`
  systemPrompt += `\nToday's date: ${jakartaDate}`
  systemPrompt += `\nUse this to resolve relative dates: "tomorrow", "next week", "this Saturday", "April 6" (assume current year ${now.getFullYear()}), etc.`
  systemPrompt += `\nNEVER ask the customer to clarify the year — always assume the current or next occurrence of a date.`

  // Inject WhatsApp context — phone is always known
  systemPrompt += `\n\n--- WhatsApp Context ---`
  systemPrompt += `\nCustomer's phone number: ${phone} (from WhatsApp — do NOT ask for it, you already have it)`

  if (customer) {
    systemPrompt += `\nCustomer is REGISTERED: ${customer.name} (ID: ${customer.id})`
    systemPrompt += `\nSince this customer exists, skip registration. Go straight to asking which service they want.`
  } else {
    systemPrompt += `\nCustomer is NEW (not yet in the database). You need to ask for: name, car model, plate number, and neighborhood. Do NOT ask for phone — you already have it. Use the phone ${phone} when creating the customer.`
  }

  // 6. Call Claude
  const anthropic = await getAnthropicClient()

  let response = await anthropic.messages.create({
    model: modelToUse,
    max_tokens: maxTokensToUse,
    system: systemPrompt,
    tools: SHERA_TOOLS,
    messages: claudeMessages,
  })

  // 7. Handle tool use loop (max 5 iterations)
  let iterations = 0
  while (response.stop_reason === 'tool_use' && iterations < 5) {
    iterations++

    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use')

    const toolResults = await Promise.all(
      toolUseBlocks.map(async (block) => {
        if (block.type !== 'tool_use') return { type: 'text' as const, text: '' }
        const result = await executeSheraTool(
          block.name,
          block.input as Record<string, unknown>
        )
        return {
          type: 'tool_result' as const,
          tool_use_id: block.id,
          content: result,
        }
      })
    )

    claudeMessages.push({ role: 'assistant', content: response.content })
    claudeMessages.push({ role: 'user', content: toolResults as Anthropic.ToolResultBlockParam[] })

    response = await anthropic.messages.create({
      model: modelToUse,
      max_tokens: maxTokensToUse,
      system: systemPrompt,
      tools: SHERA_TOOLS,
      messages: claudeMessages,
    })
  }

  // 8. Extract text response
  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === 'text'
  )
  const reply = textBlock?.text ?? 'Maaf, saya tidak bisa memproses pesan Anda saat ini.'

  // Update any pending escalations with correct chat_id and phone
  await supabase
    .from('human_escalations')
    .update({ chat_id: chatId, phone })
    .eq('chat_id', 'pending')
    .eq('status', 'pending')

  // 9. Save both user message and assistant reply to conversation messages
  const saveTimestamp = new Date().toISOString()
  const updatedMessages = [
    ...existingMessages,
    { role: 'user', content: messageText, timestamp: saveTimestamp },
    { role: 'assistant', content: reply, timestamp: saveTimestamp },
  ].slice(-30) // Keep last 30 messages to prevent unbounded growth

  // 10. Update last_message_at
  await supabase
    .from('whatsapp_conversations')
    .update({
      messages: updatedMessages,
      last_message_at: new Date().toISOString(),
      ...(customer ? { customer_id: customer.id } : {}),
    })
    .eq('chat_id', chatId)

  // 11. Return the text reply
  return reply
}
