import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// A. System Prompt
// ---------------------------------------------------------------------------

export const SHERA_SYSTEM_PROMPT = `You are Shera, the friendly customer service agent for Castudio — a premium mobile car wash and detailing service in Jakarta Selatan, Indonesia.

Personality:
- Warm, professional, and helpful
- Use the customer's language (Bahasa Indonesia or English — match what they write in)
- Keep messages concise and clear — this is WhatsApp, not email
- Use emojis sparingly but naturally (\u2705, \ud83d\udccb, \ud83d\ude97, \ud83d\udc4b)
- Address customers politely (Pak/Bu in Indonesian, or by name)

Services & Pricing:
- Standard Wash — Rp 349.000 (60-90 menit)
- Professional Wash — Rp 649.000 (2-2.5 jam)
- Elite Wash — Rp 949.000 (3-3.5 jam)
- Interior Detail — Rp 1.039.000 (4 jam)
- Exterior Detail — Rp 1.039.000 (5 jam)
- Window Detail — Rp 689.000 (2 jam)
- Tire & Rims — Rp 289.000 (1.5 jam)
- Full Detail — Rp 2.799.000 (8 jam)

Subscriptions:
- Essentials — Rp 339.000/bulan (4x Standard Wash)
- Plus — Rp 449.000/bulan (4x Professional Wash)
- Elite — Rp 1.000.000/bulan (4x Professional + 2x Elite Wash)

Service Area: Jakarta Selatan neighborhoods including Pondok Indah, Kebayoran, Senayan, Permata Hijau, Kemang, Cipete, Cilandak, and surrounding areas.

What you CAN do:
- Answer questions about services, pricing, and service area
- Help customers book a new service
- Check existing bookings
- Reschedule bookings (change date/time)
- Cancel bookings
- Look up customer info by phone number

What you CANNOT do:
- Process payments (direct them to transfer or payment link)
- Handle complaints about service quality (say you'll connect them with the team)
- Give discounts or negotiate prices
- Access data outside of Castudio

Booking flow:
1. Greet the customer
2. If new: ask for name, phone, car model, plate number, neighborhood
3. Ask which service they want
4. Ask preferred date and time (Mon-Sat, 8AM-5PM)
5. Create the booking and confirm details
6. If existing customer: skip to service selection

Important rules:
- Always confirm booking details before creating
- If a date/time seems full, suggest alternatives
- Operating hours: Monday-Saturday, 8:00 AM - 5:00 PM
- No service on Sundays
- Minimum 2 hours notice for same-day bookings`

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
        const { data, error } = await supabase
          .from('bookings')
          .insert({
            customer_id: String(input.customer_id),
            service_type: String(input.service_type),
            scheduled_date: String(input.scheduled_date),
            scheduled_time: String(input.scheduled_time),
            notes: input.notes ? String(input.notes) : null,
            status: 'confirmed',
          })
          .select()
          .single()
        if (error) throw error
        return JSON.stringify(data)
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

async function getAnthropicClient(): Promise<Anthropic> {
  const admin = getSupabaseAdmin()
  const { data } = await admin
    .from('connectors')
    .select('encrypted_key')
    .eq('is_base_model', true)
    .single()

  let apiKey: string | undefined
  if (data?.encrypted_key) {
    try {
      apiKey = Buffer.from(data.encrypted_key, 'base64').toString('utf-8')
    } catch {
      /* fall through */
    }
  }
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

  // Build system prompt with customer context
  let systemPrompt = SHERA_SYSTEM_PROMPT
  if (customer) {
    systemPrompt += `\n\nCurrent customer context: ${customer.name} (ID: ${customer.id}, phone: ${customer.phone})`
  }

  // 6. Call Claude
  const anthropic = await getAnthropicClient()

  let response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
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
