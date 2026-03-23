import { supabase } from '@/lib/supabase'

export interface Connector {
  id: string
  service_name: string
  key_nickname: string
  encrypted_key: string
  description: string | null
  ai_analysis: ConnectorAnalysis | null
  is_base_model: boolean
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface ConnectorAnalysis {
  scope: string
  capabilities: string[]
  auth_method: string
  base_url: string
  functions: { name: string; description: string; params?: string[] }[]
  notes: string
}

export async function getConnectors(): Promise<Connector[]> {
  const { data, error } = await supabase
    .from('connectors')
    .select('*')
    .order('is_base_model', { ascending: false })
    .order('service_name', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map(c => ({
    ...c,
    encrypted_key: maskKey(c.encrypted_key),
  })) as Connector[]
}

export async function getBaseModelKey(): Promise<string | null> {
  const { data, error } = await supabase
    .from('connectors')
    .select('encrypted_key')
    .eq('is_base_model', true)
    .single()

  if (error || !data) return null
  try {
    return atob(data.encrypted_key)
  } catch {
    return data.encrypted_key
  }
}

export async function getConnectorById(id: string): Promise<Connector | null> {
  const { data, error } = await supabase
    .from('connectors')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Connector
}

export async function getConnectorByService(serviceName: string): Promise<Connector | null> {
  const { data, error } = await supabase
    .from('connectors')
    .select('*')
    .eq('service_name', serviceName)
    .eq('status', 'active')
    .single()

  if (error || !data) return null
  return data as Connector
}

export async function getActiveConnectorsWithAnalysis(): Promise<Connector[]> {
  const { data, error } = await supabase
    .from('connectors')
    .select('*')
    .eq('status', 'active')
    .eq('is_base_model', false)
    .not('ai_analysis', 'is', null)

  if (error) return []
  return (data ?? []) as Connector[]
}

export async function saveConnector(input: {
  id?: string
  service_name: string
  key_nickname: string
  raw_key: string
  description?: string
  is_base_model?: boolean
}): Promise<Connector> {
  const encrypted_key = btoa(input.raw_key)

  if (input.id) {
    const { data, error } = await supabase
      .from('connectors')
      .update({
        service_name: input.service_name,
        key_nickname: input.key_nickname,
        encrypted_key,
        description: input.description || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Connector
  }

  // For base model, check if one already exists and update it
  if (input.is_base_model) {
    const { data: existing } = await supabase
      .from('connectors')
      .select('id')
      .eq('is_base_model', true)
      .single()

    if (existing) {
      const { data, error } = await supabase
        .from('connectors')
        .update({
          encrypted_key,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data as Connector
    }
  }

  const { data, error } = await supabase
    .from('connectors')
    .insert({
      service_name: input.service_name,
      key_nickname: input.key_nickname,
      encrypted_key,
      description: input.description || null,
      is_base_model: input.is_base_model || false,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Connector
}

export async function updateConnectorAnalysis(id: string, analysis: ConnectorAnalysis): Promise<void> {
  const { error } = await supabase
    .from('connectors')
    .update({ ai_analysis: analysis, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function deleteConnector(id: string): Promise<void> {
  // Prevent deleting base model
  const { data } = await supabase
    .from('connectors')
    .select('is_base_model')
    .eq('id', id)
    .single()

  if (data?.is_base_model) throw new Error('Cannot delete the base model key')

  const { error } = await supabase.from('connectors').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

function maskKey(encrypted: string): string {
  try {
    const decoded = atob(encrypted)
    if (decoded.length <= 4) return '••••'
    return '••••' + decoded.slice(-4)
  } catch {
    return '••••'
  }
}
