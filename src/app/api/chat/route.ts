import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'

async function getAnthropicClient(): Promise<Anthropic> {
  // Try to get key from connectors table (base model) first
  const admin = getSupabaseAdmin()
  const { data } = await admin
    .from('connectors')
    .select('encrypted_key')
    .eq('is_base_model', true)
    .single()

  let apiKey: string | undefined
  if (data?.encrypted_key) {
    try { apiKey = Buffer.from(data.encrypted_key, 'base64').toString('utf-8') } catch { /* fall through */ }
  }
  if (!apiKey) apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('No Claude API key configured. Add it in Settings.')

  return new Anthropic({ apiKey })
}

const SYSTEM_PROMPT = `You are the Castudio AI business assistant. Castudio is a premium mobile car wash and detailing company in Jakarta, Indonesia. You have access to the business database and can answer questions about operations, finances, customers, and strategy.

Business context:
- Launched March 2026 (Month 1)
- Services: Standard Wash (Rp 349K), Professional (Rp 649K), Elite (Rp 949K), Interior Detail (Rp 1.039M), Exterior Detail (Rp 1.039M), Window Detail (Rp 689K), Tire & Rims (Rp 289K), Full Detail (Rp 2.799M)
- Subscriptions: Essentials (Rp 339K/mo, 4 Standard), Plus (Rp 449K/mo, 4 Pro), Elite (Rp 1M/mo, 15 Pro + 3 Elite/yr)
- Monthly fixed costs: ~Rp 13.5M
- Break-even: ~32 services (mixed) or ~57 services (standard only)
- Target: 19 Elite subscribers covers all fixed costs
- Employee base salary: Rp 6.6M + per-service bonuses

When answering, be concise and data-driven. Format currency as "Rp X,XXX,XXX". Reference scenario targets when relevant. Give actionable recommendations.`

async function queryDatabase(query: string): Promise<string> {
  const admin = getSupabaseAdmin()

  try {
    if (query.includes('services_this_month') || query.includes('jobs_count')) {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const { count } = await admin.from('jobs').select('*', { count: 'exact', head: true }).gte('completed_at', startOfMonth).not('completed_at', 'is', null)
      return JSON.stringify({ services_this_month: count ?? 0 })
    }

    if (query.includes('revenue_this_month')) {
      const now = new Date()
      const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      const { data } = await admin.from('transactions').select('amount').eq('type', 'revenue').eq('payment_status', 'confirmed').gte('date', startOfMonth)
      const total = data?.reduce((sum, t) => sum + t.amount, 0) ?? 0
      return JSON.stringify({ revenue_this_month: total })
    }

    if (query.includes('customer_count')) {
      const { count } = await admin.from('customers').select('*', { count: 'exact', head: true })
      return JSON.stringify({ total_customers: count ?? 0 })
    }

    if (query.includes('active_subscriptions')) {
      const { data } = await admin.from('subscriptions').select('tier').eq('status', 'active')
      const byTier = { essentials: 0, plus: 0, elite: 0 }
      data?.forEach(s => { if (s.tier in byTier) byTier[s.tier as keyof typeof byTier]++ })
      return JSON.stringify({ active_subscriptions: data?.length ?? 0, by_tier: byTier })
    }

    if (query.includes('pending_payments')) {
      const { data } = await admin.from('transactions').select('amount').eq('type', 'revenue').eq('payment_status', 'pending')
      const total = data?.reduce((sum, t) => sum + t.amount, 0) ?? 0
      return JSON.stringify({ pending_count: data?.length ?? 0, pending_total: total })
    }

    if (query.includes('inventory_low')) {
      const { data } = await admin.from('inventory').select('product_name, current_qty, min_threshold, unit')
      const low = data?.filter(i => i.current_qty < i.min_threshold) ?? []
      return JSON.stringify({ low_stock_items: low })
    }

    if (query.includes('top_customers')) {
      const { data } = await admin.from('transactions').select('customer_id, amount, customers(name, phone)').eq('type', 'revenue').eq('payment_status', 'confirmed')
      const byCustomer: Record<string, { name: string; total: number }> = {}
      data?.forEach(t => {
        const c = t.customer_id
        if (!c) return
        if (!byCustomer[c]) byCustomer[c] = { name: (t.customers as unknown as { name: string })?.name ?? 'Unknown', total: 0 }
        byCustomer[c].total += t.amount
      })
      const sorted = Object.values(byCustomer).sort((a, b) => b.total - a.total).slice(0, 10)
      return JSON.stringify({ top_customers: sorted })
    }

    if (query.includes('service_mix')) {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const { data } = await admin.from('jobs').select('booking:bookings(service_type)').gte('completed_at', startOfMonth).not('completed_at', 'is', null)
      const mix: Record<string, number> = {}
      data?.forEach(j => {
        const type = (j.booking as unknown as { service_type: string })?.service_type ?? 'unknown'
        mix[type] = (mix[type] ?? 0) + 1
      })
      return JSON.stringify({ service_mix: mix })
    }

    if (query.includes('expenses_this_month')) {
      const now = new Date()
      const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      const { data } = await admin.from('transactions').select('category, amount').eq('type', 'expense').gte('date', startOfMonth)
      const total = data?.reduce((sum, t) => sum + Math.abs(t.amount), 0) ?? 0
      const byCategory: Record<string, number> = {}
      data?.forEach(t => { byCategory[t.category] = (byCategory[t.category] ?? 0) + Math.abs(t.amount) })
      return JSON.stringify({ expenses_this_month: total, by_category: byCategory })
    }

    if (query.includes('avg_rating')) {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const { data } = await admin.from('jobs').select('customer_rating').gte('completed_at', startOfMonth).not('customer_rating', 'is', null)
      const ratings = data?.map(j => j.customer_rating).filter(Boolean) as number[] ?? []
      const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
      return JSON.stringify({ avg_rating: Math.round(avg * 10) / 10, total_rated: ratings.length })
    }

    if (query.includes('upsell_stats')) {
      const { data } = await admin.from('jobs').select('upsell_attempted, upsell_converted')
      const attempted = data?.filter(j => j.upsell_attempted).length ?? 0
      const converted = data?.filter(j => j.upsell_converted).length ?? 0
      return JSON.stringify({ upsell_attempted: attempted, upsell_converted: converted, rate: attempted > 0 ? Math.round(converted / attempted * 100) : 0 })
    }

    return JSON.stringify({ error: 'Unknown query type' })
  } catch (err) {
    return JSON.stringify({ error: 'Database query failed' })
  }
}

const tools: Anthropic.Tool[] = [
  {
    name: 'query_database',
    description: 'Query the Castudio business database. Available queries: services_this_month, revenue_this_month, customer_count, active_subscriptions, pending_payments, inventory_low, top_customers, service_mix, expenses_this_month, avg_rating, upsell_stats',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'The query identifier to run' }
      },
      required: ['query']
    }
  }
]

export async function POST(request: NextRequest) {
  const apiKey = process.env.CASTUDIO_API_KEY
  const authHeader = request.headers.get('authorization')
  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    // Allow from admin panel (chatbot calls without bearer token)
  }

  let body: { messages: Array<{ role: string; content: string }> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.messages || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: 'Messages array required' }, { status: 400 })
  }

  try {
    const anthropic = await getAnthropicClient()

    const messages: Anthropic.MessageParam[] = body.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))

    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    })

    // Handle tool use loops (max 3 iterations)
    let iterations = 0
    while (response.stop_reason === 'tool_use' && iterations < 3) {
      iterations++
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use')
      const toolResults: Anthropic.MessageParam = {
        role: 'user',
        content: await Promise.all(toolUseBlocks.map(async (block) => {
          if (block.type !== 'tool_use') return { type: 'text' as const, text: '' }
          const result = await queryDatabase((block.input as { query: string }).query)
          return {
            type: 'tool_result' as const,
            tool_use_id: block.id,
            content: result
          }
        }))
      }

      messages.push({ role: 'assistant', content: response.content })
      messages.push(toolResults)

      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools,
        messages,
      })
    }

    const textBlock = response.content.find(b => b.type === 'text')
    const reply = textBlock?.type === 'text' ? textBlock.text : 'I could not generate a response.'

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
