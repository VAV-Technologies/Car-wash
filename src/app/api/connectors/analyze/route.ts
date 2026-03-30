import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createOpenAIClient, GPT_MODEL } from '@/lib/agents/openai-client'
import { getSupabaseAdmin } from '@/lib/supabase'

async function isAuthorized(req: NextRequest): Promise<boolean> {
  // Check Bearer token (for external API access)
  const key = process.env.CASTUDIO_API_KEY
  if (key && req.headers.get('authorization') === `Bearer ${key}`) return true

  // Check Supabase session (for admin panel browser access)
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
  } catch {
    return false
  }
}

const SYSTEM_PROMPT = `You are an API connector analyzer. Given a service name and a description of what an API key is for, analyze the connector and return a JSON object with this exact structure:

{
  "scope": "Brief description of what this API key grants access to",
  "capabilities": ["list", "of", "things", "this", "connector", "can", "do"],
  "auth_method": "bearer_token | api_key_header | oauth2 | basic_auth | query_param",
  "base_url": "https://api.example.com/v1",
  "functions": [
    {"name": "function_name", "description": "What this function does", "params": ["param1", "param2"]}
  ],
  "notes": "Any important notes about rate limits, pricing, or usage"
}

Rules:
- Return ONLY the JSON object, no markdown, no explanation
- Base your analysis on the service name and the user's description
- If docs URLs are mentioned, reference what you know about that API
- List the most commonly used functions/endpoints
- Be specific about capabilities — what can and cannot be done
- If you're unsure about something, note it in the "notes" field`

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { connectorId: string; description: string; serviceName: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.connectorId || !body.serviceName) {
    return NextResponse.json({ error: 'connectorId and serviceName required' }, { status: 400 })
  }

  // Get the Claude base model key from connectors table
  const admin = getSupabaseAdmin()
  const { data: baseModel } = await admin
    .from('connectors')
    .select('encrypted_key')
    .eq('is_base_model', true)
    .single()

  let apiKey: string | undefined
  if (baseModel?.encrypted_key) {
    try { apiKey = Buffer.from(baseModel.encrypted_key, 'base64').toString('utf-8') } catch {}
  }

  try {
    const openai = createOpenAIClient(apiKey)

    const userMessage = `Service: ${body.serviceName}\n\nDescription from user:\n${body.description || 'No description provided. Analyze based on the service name.'}`

    const response = await openai.chat.completions.create({
      model: GPT_MODEL,
      max_completion_tokens: 2048,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    })

    const text = response.choices[0]?.message?.content
    if (!text) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    let jsonStr = text.trim()
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    }

    let analysis: Record<string, unknown>
    try {
      analysis = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json({ error: 'AI returned invalid analysis. Try adding more detail to your description.' }, { status: 422 })
    }

    // Save analysis to the connector record
    const { error: updateError } = await admin
      .from('connectors')
      .update({ ai_analysis: analysis, updated_at: new Date().toISOString() })
      .eq('id', body.connectorId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 })
    }

    return NextResponse.json({ analysis })
  } catch (err) {
    console.error('Connector analysis error:', err)
    return NextResponse.json({ error: 'Failed to analyze connector' }, { status: 500 })
  }
}
