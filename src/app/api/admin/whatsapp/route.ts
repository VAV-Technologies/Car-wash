import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// No bearer auth on this route — it's called from the admin panel
// which is already protected by the middleware auth check.
// External access is blocked by the middleware matcher on /admin/*.

const WAHA_API_URL = process.env.WAHA_API_URL!
const WAHA_API_KEY = process.env.WAHA_API_KEY!

async function wahaFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${WAHA_API_URL}${path}`
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': WAHA_API_KEY,
      ...options.headers,
    },
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  const session = searchParams.get('session') || 'default'

  try {
    switch (action) {
      case 'sessions': {
        const res = await wahaFetch('/api/sessions', { method: 'GET' })
        if (!res.ok) {
          const body = await res.text()
          return NextResponse.json({ error: body }, { status: res.status })
        }
        const data = await res.json()
        return NextResponse.json(data)
      }

      case 'status': {
        const res = await wahaFetch(`/api/sessions/${session}`, { method: 'GET' })
        if (!res.ok) {
          const body = await res.text()
          return NextResponse.json({ error: body }, { status: res.status })
        }
        const data = await res.json()
        return NextResponse.json(data)
      }

      case 'screenshot': {
        const res = await wahaFetch(`/api/screenshot?session=${session}`, { method: 'GET' })
        if (!res.ok) {
          const body = await res.text()
          return NextResponse.json({ error: body }, { status: res.status })
        }
        const arrayBuffer = await res.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        return NextResponse.json({ image: `data:image/png;base64,${base64}` })
      }

      case 'events': {
        // Fetch recent webhook events from whatsapp_conversations
        // and also check WAHA for any session events
        const supabase = getSupabaseAdmin()
        const { data: convos } = await supabase
          .from('whatsapp_conversations')
          .select('id, chat_id, phone, messages, last_message_at, created_at')
          .order('last_message_at', { ascending: false })
          .limit(50)

        const events: Array<Record<string, unknown>> = []
        for (const convo of convos ?? []) {
          const msgs = (convo.messages as Array<{ role: string; content: string; timestamp?: string }>) || []
          for (const msg of msgs.slice(-5)) {
            events.push({
              id: `${convo.id}-${msg.timestamp || convo.created_at}-${msg.role}`,
              event: msg.role === 'user' ? 'message' : 'message.any',
              timestamp: msg.timestamp || convo.last_message_at || convo.created_at,
              session: 'default',
              from: msg.role === 'user' ? convo.chat_id : undefined,
              to: msg.role === 'assistant' ? convo.chat_id : undefined,
              body: typeof msg.content === 'string' ? msg.content.slice(0, 200) : '',
              raw: msg,
            })
          }
        }

        events.sort((a, b) => new Date(a.timestamp as string).getTime() - new Date(b.timestamp as string).getTime())
        return NextResponse.json(events.slice(-100))
      }

      case 'server-info': {
        const res = await wahaFetch('/api/server/version', { method: 'GET' })
        if (!res.ok) return NextResponse.json({ error: 'Failed to get server info' }, { status: res.status })
        return NextResponse.json(await res.json())
      }

      case 'stats': {
        const supabase = getSupabaseAdmin()
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

        const [todayResult, totalResult, lastMessageResult] = await Promise.all([
          supabase
            .from('whatsapp_conversations')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', todayStart),
          supabase
            .from('whatsapp_conversations')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('whatsapp_conversations')
            .select('created_at')
            .order('created_at', { ascending: false })
            .limit(1),
        ])

        return NextResponse.json({
          today: todayResult.count ?? 0,
          total: totalResult.count ?? 0,
          lastMessage: lastMessageResult.data?.[0]?.created_at ?? null,
        })
      }

      case 'settings': {
        const supabase = getSupabaseAdmin()
        const { data } = await supabase
          .from('agent_settings')
          .select('*')
          .eq('agent_name', 'shera')
          .single()

        if (!data) {
          return NextResponse.json({
            api_key: null,
            has_key: false,
            model: 'gpt-5.4-mini',
            max_tokens: 1024,
            system_prompt: null,
          })
        }

        // Mask the API key
        let maskedKey = null
        let hasKey = false
        if (data.api_key) {
          try {
            const decoded = Buffer.from(data.api_key, 'base64').toString('utf-8')
            maskedKey = decoded.length > 4 ? '••••' + decoded.slice(-4) : '••••'
            hasKey = true
          } catch {
            hasKey = false
          }
        }

        return NextResponse.json({
          api_key: maskedKey,
          has_key: hasKey,
          model: data.model || 'claude-sonnet-4-20250514',
          max_tokens: data.max_tokens || 1024,
          system_prompt: data.system_prompt,
        })
      }

      case 'health-check': {
        const results: Array<{ name: string; status: 'pass' | 'fail'; error?: string }> = []

        // 1. Check Claude API Key
        try {
          const supabase = getSupabaseAdmin()
          const { data: settings } = await supabase
            .from('agent_settings')
            .select('api_key')
            .eq('agent_name', 'shera')
            .single()

          let apiKey: string | undefined
          if (settings?.api_key) {
            try { apiKey = Buffer.from(settings.api_key, 'base64').toString('utf-8') } catch {}
          }
          if (!apiKey) {
            // Fallback to connectors base model
            const { data: connector } = await supabase.from('connectors').select('encrypted_key').eq('is_base_model', true).single()
            if (connector?.encrypted_key) {
              try { apiKey = Buffer.from(connector.encrypted_key, 'base64').toString('utf-8') } catch {}
            }
          }
          if (!apiKey) apiKey = process.env.AZURE_OPENAI_KEY

          if (!apiKey) {
            results.push({ name: 'AI API Key', status: 'fail', error: 'No API key configured' })
          } else {
            // Try a minimal API call via Azure OpenAI
            const { createOpenAIClient, GPT_MODEL } = await import('@/lib/agents/openai-client')
            const openai = createOpenAIClient(apiKey)
            await openai.chat.completions.create({ model: GPT_MODEL, max_completion_tokens: 10, messages: [{ role: 'user', content: 'ping' }] })
            results.push({ name: 'AI API Key', status: 'pass' })
          }
        } catch (err: any) {
          results.push({ name: 'AI API Key', status: 'fail', error: err?.message || 'API call failed' })
        }

        // 2. Check Castudio Database
        try {
          const supabase = getSupabaseAdmin()
          const { count, error } = await supabase.from('customers').select('*', { count: 'exact', head: true })
          if (error) throw error
          results.push({ name: 'Castudio Database', status: 'pass' })
        } catch (err: any) {
          results.push({ name: 'Castudio Database', status: 'fail', error: err?.message || 'Database query failed' })
        }

        // 3. Check WAHA Server
        try {
          const res = await wahaFetch('/api/sessions', { method: 'GET' })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          results.push({ name: 'WAHA Server', status: 'pass' })
        } catch (err: any) {
          results.push({ name: 'WAHA Server', status: 'fail', error: err?.message || 'WAHA unreachable' })
        }

        // 4. Check Webhook Endpoint
        try {
          const webhookUrl = 'https://castudio.id/api/webhook/whatsapp'
          const res = await fetch(webhookUrl, { method: 'GET' })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          if (data.status === 'ok') {
            results.push({ name: 'Webhook Endpoint', status: 'pass' })
          } else {
            results.push({ name: 'Webhook Endpoint', status: 'fail', error: 'Unexpected response' })
          }
        } catch (err: any) {
          results.push({ name: 'Webhook Endpoint', status: 'fail', error: err?.message || 'Webhook unreachable' })
        }

        return NextResponse.json({ results })
      }

      case 'list-knowledge': {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from('agent_knowledge')
          .select('id, file_name, file_type, file_size, created_at')
          .eq('agent_name', 'shera')
          .order('created_at', { ascending: false })

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json(data ?? [])
      }

      case 'list-escalations': {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from('human_escalations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json(data ?? [])
      }

      case 'escalation-chat': {
        const chatId = searchParams.get('chat_id')
        if (!chatId) return NextResponse.json({ error: 'chat_id required' }, { status: 400 })
        const supabase = getSupabaseAdmin()
        const { data } = await supabase
          .from('whatsapp_conversations')
          .select('messages, phone, customer_id')
          .eq('chat_id', chatId)
          .single()
        return NextResponse.json(data ?? { messages: [], phone: '', customer_id: null })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error: any) {
    console.error('WhatsApp API GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  const session = searchParams.get('session') || 'default'

  try {
    switch (action) {
      case 'start': {
        const res = await wahaFetch(`/api/sessions/${session}/start`, { method: 'POST' })
        if (!res.ok) {
          const body = await res.text()
          return NextResponse.json({ error: body }, { status: res.status })
        }
        const data = await res.json()
        return NextResponse.json(data)
      }

      case 'stop': {
        const res = await wahaFetch(`/api/sessions/${session}/stop`, { method: 'POST' })
        if (!res.ok) {
          const body = await res.text()
          return NextResponse.json({ error: body }, { status: res.status })
        }
        const data = await res.json()
        return NextResponse.json(data)
      }

      case 'restart': {
        try {
          await wahaFetch(`/api/sessions/${session}/stop`, { method: 'POST' })
        } catch {
          // Ignore stop errors — session may not be running
        }
        await new Promise((r) => setTimeout(r, 2000))
        const res = await wahaFetch(`/api/sessions/${session}/start`, { method: 'POST' })
        if (!res.ok) {
          const body = await res.text()
          return NextResponse.json({ error: body }, { status: res.status })
        }
        const data = await res.json()
        return NextResponse.json(data)
      }

      case 'logout': {
        const res = await wahaFetch(`/api/sessions/${session}/logout`, { method: 'POST' })
        if (!res.ok) {
          const body = await res.text()
          return NextResponse.json({ error: body }, { status: res.status })
        }
        const data = await res.json()
        return NextResponse.json(data)
      }

      case 'save-settings': {
        const supabase = getSupabaseAdmin()
        const body = await req.json()

        // Check if settings row exists
        const { data: existing } = await supabase
          .from('agent_settings')
          .select('id')
          .eq('agent_name', 'shera')
          .single()

        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
        if (body.api_key !== undefined) updates.api_key = body.api_key // already base64 from client
        if (body.model !== undefined) updates.model = body.model
        if (body.max_tokens !== undefined) updates.max_tokens = body.max_tokens
        if (body.system_prompt !== undefined) updates.system_prompt = body.system_prompt

        if (existing) {
          const { error } = await supabase
            .from('agent_settings')
            .update(updates)
            .eq('id', existing.id)
          if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        } else {
          const { error } = await supabase
            .from('agent_settings')
            .insert({ agent_name: 'shera', ...updates })
          if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ ok: true })
      }

      case 'send-escalation-reply': {
        const body = await req.json()
        const { chat_id, reply_text } = body
        if (!chat_id || !reply_text) return NextResponse.json({ error: 'chat_id and reply_text required' }, { status: 400 })
        const supabase = getSupabaseAdmin()

        await wahaFetch('/api/sendText', {
          method: 'POST',
          body: JSON.stringify({ session: session, chatId: chat_id, text: reply_text }),
        })

        const { data: convo } = await supabase
          .from('whatsapp_conversations')
          .select('messages')
          .eq('chat_id', chat_id)
          .single()

        const messages = Array.isArray(convo?.messages) ? convo.messages : []
        messages.push({ role: 'assistant', content: reply_text, timestamp: new Date().toISOString(), from_human: true })

        await supabase
          .from('whatsapp_conversations')
          .update({ messages, last_message_at: new Date().toISOString() })
          .eq('chat_id', chat_id)

        return NextResponse.json({ ok: true })
      }

      case 'resolve-escalation': {
        const body = await req.json()
        const { id } = body
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
        const supabase = getSupabaseAdmin()
        await supabase.from('human_escalations').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', id)
        return NextResponse.json({ ok: true })
      }

      case 'upload-service-image': {
        const supabase = getSupabaseAdmin()
        const formData = await req.formData()
        const file = formData.get('file') as File | null
        const serviceKey = formData.get('service_key') as string | null
        if (!file || !serviceKey) return NextResponse.json({ error: 'file and service_key required' }, { status: 400 })

        const path = `services/${serviceKey}.jpg`
        const buffer = Buffer.from(await file.arrayBuffer())

        // Upload to storage (upsert)
        const { error: uploadErr } = await supabase.storage
          .from('castudio-photos')
          .upload(path, buffer, { contentType: file.type || 'image/jpeg', upsert: true })

        if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

        const { data: urlData } = supabase.storage.from('castudio-photos').getPublicUrl(path)
        const publicUrl = urlData.publicUrl

        // Upsert into agent_knowledge
        await supabase.from('agent_knowledge').upsert(
          { agent_name: 'shera', file_name: `service_image_${serviceKey}`, content: publicUrl, file_type: 'image' },
          { onConflict: 'id' }
        )
        // If upsert by id doesn't work, try delete+insert
        await supabase.from('agent_knowledge').delete().eq('agent_name', 'shera').eq('file_name', `service_image_${serviceKey}`)
        await supabase.from('agent_knowledge').insert({ agent_name: 'shera', file_name: `service_image_${serviceKey}`, content: publicUrl, file_type: 'image' })

        return NextResponse.json({ url: publicUrl })
      }

      case 'delete-service-image': {
        const supabase = getSupabaseAdmin()
        const body = await req.json()
        const { service_key } = body
        if (!service_key) return NextResponse.json({ error: 'service_key required' }, { status: 400 })

        await supabase.storage.from('castudio-photos').remove([`services/${service_key}.jpg`])
        await supabase.from('agent_knowledge').delete().eq('agent_name', 'shera').eq('file_name', `service_image_${service_key}`)

        return NextResponse.json({ ok: true })
      }

      case 'upload-knowledge': {
        const supabase = getSupabaseAdmin()
        const formData = await req.formData()
        const file = formData.get('file') as File | null
        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

        // Extract text content based on file type
        let content: string
        const fileName = file.name
        const fileType = fileName.split('.').pop()?.toLowerCase() || 'txt'

        if (fileType === 'txt' || fileType === 'md') {
          content = await file.text()
        } else if (fileType === 'pdf' || fileType === 'docx') {
          // For PDF/DOCX, store the raw text. In production, use a proper parser.
          // For now, try reading as text (works for text-based content)
          content = await file.text()
        } else {
          return NextResponse.json({ error: 'Unsupported file type. Use .txt, .md, .pdf, or .docx' }, { status: 400 })
        }

        if (!content.trim()) {
          return NextResponse.json({ error: 'File is empty or could not be read' }, { status: 400 })
        }

        const { data, error } = await supabase
          .from('agent_knowledge')
          .insert({
            agent_name: 'shera',
            file_name: fileName,
            file_type: fileType,
            content: content.slice(0, 50000), // Limit to 50K chars per file
            file_size: file.size,
          })
          .select()
          .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error: any) {
    console.error('WhatsApp API POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  try {
    switch (action) {
      case 'delete-knowledge': {
        const supabase = getSupabaseAdmin()
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

        const { error } = await supabase.from('agent_knowledge').delete().eq('id', id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
