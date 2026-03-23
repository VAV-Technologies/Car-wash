import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'

const BASE_SYSTEM_PROMPT = `You are an automation workflow generator for Castudio, a premium car wash and detailing company in Jakarta, Indonesia. When the user describes an automation they want to build, you must return ONLY a valid JSON object with this exact structure:

{
  "name": "Short name for the automation",
  "description": "One-sentence description of what this automation does",
  "workflow": {
    "nodes": [
      {
        "id": "1",
        "type": "trigger",
        "label": "Human-readable label for this step",
        "config": { "key": "value pairs for configuration" },
        "position": { "x": 250, "y": 0 }
      }
    ],
    "edges": [
      { "source": "1", "target": "2" }
    ]
  }
}

Rules:
- The first node must always be type "trigger" (what starts the automation)
- Subsequent nodes are type "action" (do something) or "condition" (branch logic)
- Position nodes vertically: first at y=0, each subsequent +150 on y-axis, centered at x=250
- For conditions, branch left (x=100) and right (x=400)
- Edge labels are optional, use them for condition branches ("yes"/"no")
- Config should contain meaningful parameters for each step
- Return ONLY the JSON object, no markdown, no explanation, no code fences

If the user provides an existing workflow to modify, adjust it according to their instructions while keeping the same structure.`

export async function POST(request: NextRequest) {
  // Try to get Claude key from connectors (base model), fall back to env var
  const admin = getSupabaseAdmin()
  const { data: baseModel } = await admin
    .from('connectors')
    .select('encrypted_key')
    .eq('is_base_model', true)
    .single()

  let apiKey: string | undefined
  if (baseModel?.encrypted_key) {
    try {
      apiKey = Buffer.from(baseModel.encrypted_key, 'base64').toString('utf-8')
    } catch { /* fall through */ }
  }
  if (!apiKey) apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'No Claude API key configured. Add it in Connectors.' }, { status: 503 })
  }

  const anthropic = new Anthropic({ apiKey })

  let body: { prompt: string; existingWorkflow?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  // Fetch active connectors to inject into system prompt
  const { data: connectors } = await admin
    .from('connectors')
    .select('service_name, ai_analysis')
    .eq('status', 'active')
    .eq('is_base_model', false)
    .not('ai_analysis', 'is', null)

  let systemPrompt = BASE_SYSTEM_PROMPT

  if (connectors && connectors.length > 0) {
    const connectorContext = connectors.map(c => {
      const analysis = c.ai_analysis as { scope?: string; capabilities?: string[]; functions?: { name: string; description: string }[] } | null
      if (!analysis) return `- ${c.service_name}`
      const caps = analysis.capabilities?.join(', ') || 'unknown'
      const funcs = analysis.functions?.map(f => f.name).join(', ') || ''
      return `- ${c.service_name}: ${analysis.scope || caps}${funcs ? `. Functions: ${funcs}` : ''}`
    }).join('\n')

    systemPrompt += `\n\nAvailable connectors (the user has API keys configured for these services):\n${connectorContext}\n\nWhen the user mentions any of these services, use them as action nodes in the workflow with their actual capabilities.`
  } else {
    systemPrompt += `\n\nAvailable integrations: WhatsApp, Email, Supabase Database, HTTP Webhook, Claude AI, Google Sheets, Slack, SMS`
  }

  let userMessage = body.prompt.trim()
  if (body.existingWorkflow) {
    userMessage += `\n\nHere is the current workflow to modify:\n${JSON.stringify(body.existingWorkflow, null, 2)}`
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    let jsonStr = textBlock.text.trim()
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    }

    let parsed: { name: string; description: string; workflow: unknown }
    try {
      parsed = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid JSON. Please try rephrasing your prompt.' },
        { status: 422 }
      )
    }

    if (!parsed.workflow || !parsed.name) {
      return NextResponse.json(
        { error: 'AI response missing required fields (name, workflow)' },
        { status: 422 }
      )
    }

    return NextResponse.json({
      name: parsed.name,
      description: parsed.description || '',
      workflow: parsed.workflow,
    })
  } catch (err) {
    console.error('Workflow generation error:', err)
    return NextResponse.json({ error: 'Failed to generate workflow' }, { status: 500 })
  }
}
