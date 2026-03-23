import { supabase } from '@/lib/supabase'

// ─── Types ─────────────────────────────────────────────────────────

export interface Automation {
  id: string
  name: string
  description: string | null
  status: 'active' | 'paused' | 'draft'
  workflow_json: WorkflowDefinition | null
  trigger_type: 'webhook' | 'schedule' | 'manual'
  schedule_cron: string | null
  total_runs: number
  last_run_at: string | null
  created_at: string
  updated_at: string
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export interface WorkflowNode {
  id: string
  type: 'trigger' | 'action' | 'condition'
  label: string
  config: Record<string, unknown>
  position: { x: number; y: number }
}

export interface WorkflowEdge {
  source: string
  target: string
  label?: string
}

export interface AutomationRun {
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

export interface AutomationKey {
  id: string
  automation_id: string
  service_name: string
  key_nickname: string
  encrypted_key: string
  created_at: string
}

// ─── Query Params ──────────────────────────────────────────────────

interface GetAutomationsParams {
  search?: string
  status?: 'active' | 'paused' | 'draft' | ''
  page: number
  limit: number
}

interface GetRunsParams {
  page: number
  limit: number
}

// ─── Automations CRUD ──────────────────────────────────────────────

export async function getAutomations({ search, status, page, limit }: GetAutomationsParams) {
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
  return { data: (data ?? []) as Automation[], count: count ?? 0 }
}

export async function getAutomationById(id: string) {
  const { data, error } = await supabase
    .from('automations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as Automation
}

export async function createAutomation(
  input: Omit<Automation, 'id' | 'total_runs' | 'last_run_at' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('automations')
    .insert(input)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Automation
}

export async function updateAutomation(
  id: string,
  input: Partial<Omit<Automation, 'id' | 'created_at' | 'updated_at'>>
) {
  const { data, error } = await supabase
    .from('automations')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Automation
}

export async function deleteAutomation(id: string) {
  const { error } = await supabase.from('automations').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function toggleAutomationStatus(id: string, newStatus: 'active' | 'paused') {
  const { data, error } = await supabase
    .from('automations')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Automation
}

// ─── Automation Runs ───────────────────────────────────────────────

export async function getAutomationRuns(automationId: string, { page, limit }: GetRunsParams) {
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('automation_runs')
    .select('*', { count: 'exact' })
    .eq('automation_id', automationId)
    .order('started_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error(error.message)
  return { data: (data ?? []) as AutomationRun[], count: count ?? 0 }
}

export async function getRunById(runId: string) {
  const { data, error } = await supabase
    .from('automation_runs')
    .select('*')
    .eq('id', runId)
    .single()

  if (error) throw new Error(error.message)
  return data as AutomationRun
}

// ─── API Keys ──────────────────────────────────────────────────────

export async function getAutomationKeys(automationId: string) {
  const { data, error } = await supabase
    .from('automation_keys')
    .select('*')
    .eq('automation_id', automationId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  // Mask encrypted keys — show only last 4 chars
  return ((data ?? []) as AutomationKey[]).map((key) => ({
    ...key,
    encrypted_key:
      key.encrypted_key.length > 4
        ? '••••' + key.encrypted_key.slice(-4)
        : '••••',
  }))
}

export async function addAutomationKey(input: {
  automation_id: string
  service_name: string
  key_nickname: string
  encrypted_key: string
}) {
  const { data, error } = await supabase
    .from('automation_keys')
    .insert(input)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as AutomationKey
}

export async function deleteAutomationKey(id: string) {
  const { error } = await supabase.from('automation_keys').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
