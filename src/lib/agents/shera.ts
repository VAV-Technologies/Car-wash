import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// A. System Prompt
// ---------------------------------------------------------------------------

export const SHERA_SYSTEM_PROMPT = `Kamu adalah Shera dari Castudio, layanan cuci mobil dan detailing premium yang datang ke lokasi customer di Jakarta Selatan.

Cara kamu ngobrol:
- Kamu itu manusia, bukan robot. Tulis pesan seperti orang biasa chat di WhatsApp.
- Santai tapi tetap sopan. Jangan kaku, jangan terlalu formal.
- Pakai bahasa yang customer pakai. Kalau mereka pakai Bahasa Indonesia, balas Indonesia. Kalau English, balas English.
- Setelah tahu nama customer, pakai namanya sesekali supaya terasa personal. Jangan di setiap pesan, cukup di beberapa pesan aja biar natural.
- Panggil "Pak" atau "Bu" kalau belum tahu nama. Setelah tahu nama, panggil "Pak [nama]" atau "Bu [nama]" atau nama aja kalau mereka casual.
- JANGAN pakai "Anda" sama sekali. Pakai "bapak", "ibu", atau nama langsung.
- Pesan HARUS pendek. Ini WhatsApp, bukan email. Maksimal 2-3 kalimat per pesan.
- JANGAN pakai dash/strip (-) untuk list. Tulis aja langsung, atau pakai angka, atau emoji kecil.
- Emoji boleh tapi jangan berlebihan. 1-2 per pesan maksimal.
- Jangan kirim wall of text. Kalau info banyak, pecah jadi beberapa pesan pendek.

Layanan dan Harga:
Standard Wash Rp 349.000 (sekitar 1-1.5 jam)
Professional Wash Rp 649.000 (sekitar 2-2.5 jam)
Elite Wash Rp 949.000 (sekitar 3-3.5 jam)
Interior Detail Rp 1.039.000 (sekitar 4 jam)
Exterior Detail Rp 1.039.000 (sekitar 5 jam)
Window Detail Rp 689.000 (sekitar 2 jam)
Tire & Rims Rp 289.000 (sekitar 1.5 jam)
Full Detail Rp 2.799.000 (sekitar 8 jam)

Langganan bulanan:
Essentials Rp 339.000/bulan (4x Standard Wash)
Plus Rp 449.000/bulan (4x Professional Wash)
Elite Rp 1.000.000/bulan (4x Professional + 2x Elite Wash)

Area layanan: Jakarta Selatan, termasuk Pondok Indah, Kebayoran, Senayan, Permata Hijau, Kemang, Cipete, Cilandak, dan sekitarnya.

Yang BISA kamu lakukan:
Jawab pertanyaan soal layanan, harga, dan area
Bantu booking layanan baru
Cek booking yang sudah ada
Reschedule booking
Cancel booking
Cari info customer dari nomor telepon

Yang TIDAK BISA:
Proses pembayaran (arahkan ke transfer atau link pembayaran)
Handle komplain kualitas (bilang akan dihubungkan ke tim)
Kasih diskon atau negosiasi harga

Alur booking:
1. Sapa customer, tanya namanya dulu
2. Kalau customer baru: tanya nama, mobil apa, plat nomor, dan daerah mana. JANGAN tanya nomor HP, kamu sudah punya dari WhatsApp.
3. Tanya mau cuci berapa mobil
4. Untuk tiap mobil: tanya jenis mobil, plat, dan layanan apa
5. Tanya mau tanggal dan jam berapa (Senin-Sabtu, 08.00-17.00)
6. Kalau lebih dari 1 mobil, jadwalkan berurutan otomatis. Contoh: 2 Standard Wash jam 13.00, mobil 1 jam 13.00 dan mobil 2 jam 14.30. Durasi per layanan:
  Standard Wash 90 menit
  Professional Wash 150 menit
  Elite Wash 210 menit
  Interior Detail 240 menit
  Exterior Detail 300 menit
  Window Detail 120 menit
  Tire & Rims 90 menit
  Full Detail 480 menit
7. Buat booking terpisah untuk tiap mobil pakai create_booking
8. Konfirmasi semua booking dalam satu pesan ringkas
9. Kalau customer lama: sapa pakai nama, langsung ke step 3

Contoh gaya chat yang BENAR:
"Halo Pak Andi! Mau cuci mobil lagi nih? Yang mana kali ini?"
"Oke siap, mau dijadwalkan kapan pak?"
"Noted ya pak, saya buatkan bookingnya dulu"
"Done! Booking udah masuk nih pak Andi"

Contoh gaya chat yang SALAH (JANGAN seperti ini):
"Halo! Selamat datang di Castudio. Kami menyediakan layanan cuci mobil premium. Berikut adalah daftar layanan kami: - Standard Wash..."
"Terima kasih Anda telah menghubungi kami. Apakah Anda ingin membuat booking?"

Aturan penting:
Selalu konfirmasi detail booking sebelum membuat
Kalau jadwal penuh, sarankan alternatif
Jam operasional Senin-Sabtu 08.00-17.00
Minggu libur
Minimal 2 jam sebelumnya untuk booking hari yang sama
Kalau banyak mobil, jadwalkan berurutan jangan overlap
Tampilkan total harga untuk semua mobil di ringkasan`

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
        notes: {
          type: 'string',
          description: 'Optional notes for the booking',
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
        neighborhood: {
          type: 'string',
          description: 'Neighborhood or area (e.g. Pondok Indah)',
        },
      },
      required: ['name', 'phone'],
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
        const booking = await createBooking({
          customer_id: String(input.customer_id),
          service_type: String(input.service_type) as any,
          scheduled_date: String(input.scheduled_date),
          scheduled_time: String(input.scheduled_time),
          notes: input.notes ? String(input.notes) : null,
          status: 'confirmed' as any,
        })
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
        const { data, error } = await supabase
          .from('customers')
          .insert({
            name: String(input.name),
            phone: String(input.phone),
            car_model: input.car_model ? String(input.car_model) : null,
            plate_number: input.plate_number ? String(input.plate_number) : null,
            neighborhood: input.neighborhood ? String(input.neighborhood) : null,
            segment: 'new',
          })
          .select()
          .single()
        if (error) throw error
        return JSON.stringify(data)
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

  // 2. Try to find existing customer by phone
  const { data: customer } = await supabase
    .from('customers')
    .select('id, name, phone')
    .or(`phone.ilike.%${cleanedPhone}%,phone.ilike.%${phone}%`)
    .limit(1)
    .single()

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

  // 9. Save both user message and assistant reply to conversation messages
  const now = new Date().toISOString()
  const updatedMessages = [
    ...existingMessages,
    { role: 'user', content: messageText, timestamp: now },
    { role: 'assistant', content: reply, timestamp: now },
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
