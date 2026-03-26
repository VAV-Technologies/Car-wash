import { supabase } from '@/lib/supabase'

// ─── Types ─────────────────────────────────────────────────────────

export interface Agent {
  id: string
  name: string
  description: string | null
  status: 'active' | 'paused' | 'draft'
  content: string
  file_type: string
  connector_ids: string[]
  version: number
  trigger_type: 'webhook' | 'schedule' | 'manual'
  schedule_cron: string | null
  total_runs: number
  last_run_at: string | null
  created_at: string
  updated_at: string
}

export interface AgentRun {
  id: string
  automation_id: string
  status: 'success' | 'failed' | 'running'
  started_at: string
  finished_at: string | null
  trigger: string | null
  trace_json: TraceStep[] | null
  created_at: string
}

export interface TraceStep {
  node_id: string
  node_label: string
  input: unknown
  output: unknown
  status: 'success' | 'failed'
  duration_ms: number
}

// ─── Query Params ──────────────────────────────────────────────────

interface GetAgentsParams {
  search?: string
  status?: 'active' | 'paused' | 'draft' | ''
  page: number
  limit: number
}

interface GetRunsParams {
  page: number
  limit: number
}

// ─── Agents CRUD ──────────────────────────────────────────────────

export async function getAgents({ search, status, page, limit }: GetAgentsParams) {
  let query = supabase
    .from('automations')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) throw new Error(error.message)
  return { data: (data ?? []) as Agent[], count: count ?? 0 }
}

export async function getAgentById(id: string) {
  const { data, error } = await supabase
    .from('automations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as Agent
}

export async function createAgent(
  input: {
    name: string
    description?: string | null
    status?: 'active' | 'paused' | 'draft'
    content?: string
    file_type?: string
    connector_ids?: string[]
    trigger_type?: 'webhook' | 'schedule' | 'manual'
    schedule_cron?: string | null
  }
) {
  const { data, error } = await supabase
    .from('automations')
    .insert({
      name: input.name,
      description: input.description || null,
      status: input.status || 'draft',
      content: input.content || '',
      file_type: input.file_type || 'typescript',
      connector_ids: input.connector_ids || [],
      trigger_type: input.trigger_type || 'manual',
      schedule_cron: input.schedule_cron || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Agent
}

export async function updateAgent(
  id: string,
  input: Partial<{
    name: string
    description: string | null
    status: 'active' | 'paused' | 'draft'
    content: string
    file_type: string
    connector_ids: string[]
    trigger_type: 'webhook' | 'schedule' | 'manual'
    schedule_cron: string | null
  }>
) {
  // Auto-increment version when content changes
  const updates: Record<string, unknown> = { ...input }
  if ('content' in input) {
    const current = await getAgentById(id)
    updates.version = (current.version || 0) + 1
  }

  const { data, error } = await supabase
    .from('automations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Agent
}

export async function deleteAgent(id: string) {
  const { error } = await supabase.from('automations').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function toggleAgentStatus(id: string, newStatus: 'active' | 'paused') {
  const { data, error } = await supabase
    .from('automations')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Agent
}

// ─── Agent Runs ───────────────────────────────────────────────────

export async function getAgentRuns(agentId: string, { page, limit }: GetRunsParams) {
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('automation_runs')
    .select('*', { count: 'exact' })
    .eq('automation_id', agentId)
    .order('started_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error(error.message)
  return { data: (data ?? []) as AgentRun[], count: count ?? 0 }
}

export async function getRunById(runId: string) {
  const { data, error } = await supabase
    .from('automation_runs')
    .select('*')
    .eq('id', runId)
    .single()

  if (error) throw new Error(error.message)
  return data as AgentRun
}

// ─── Agent with Connectors ────────────────────────────────────────

export async function getAgentWithConnectors(id: string) {
  const agent = await getAgentById(id)
  if (!agent.connector_ids || agent.connector_ids.length === 0) {
    return { agent, connectors: [] }
  }
  const { data } = await supabase
    .from('connectors')
    .select('id, service_name, status, ai_analysis, description')
    .in('id', agent.connector_ids)

  return { agent, connectors: data ?? [] }
}
