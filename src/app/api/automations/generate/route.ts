import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const SYSTEM_PROMPT = `You are an automation workflow generator for Castudio, a premium car wash and detailing company in Jakarta, Indonesia. When the user describes an automation they want to build, you must return ONLY a valid JSON object with this exact structure:

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
- Available integrations: WhatsApp, Email, Supabase Database, HTTP Webhook, Claude AI, Google Sheets, Slack, SMS

If the user provides an existing workflow to modify, adjust it according to their instructions while keeping the same structure.`

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
  }

  let body: { prompt: string; existingWorkflow?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  let userMessage = body.prompt.trim()
  if (body.existingWorkflow) {
    userMessage += `\n\nHere is the current workflow to modify:\n${JSON.stringify(body.existingWorkflow, null, 2)}`
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    // Clean response — remove any markdown code fences if present
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
