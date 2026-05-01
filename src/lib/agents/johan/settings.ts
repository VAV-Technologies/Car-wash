import { createOpenAIClient, LLM_MODEL } from '@/lib/agents/openai-client'
import { getSupabaseAdmin } from '@/lib/supabase'

export interface JohanSettings {
  apiKey: string | null
  model: string
  maxTokens: number
  systemPrompt: string | null
}

export async function getJohanSettings(): Promise<JohanSettings> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('agent_settings')
    .select('api_key, model, max_tokens, system_prompt')
    .eq('agent_name', 'johan')
    .maybeSingle()

  let apiKey: string | null = null
  if (data?.api_key) {
    try {
      apiKey = Buffer.from(data.api_key, 'base64').toString('utf-8')
    } catch {}
  }
  return {
    apiKey,
    model: data?.model || process.env.JOHAN_CHAT_MODEL || LLM_MODEL,
    maxTokens: data?.max_tokens || 1024,
    systemPrompt: data?.system_prompt || null,
  }
}

export async function getJohanOpenAIClient() {
  const settings = await getJohanSettings()
  if (settings.apiKey) return createOpenAIClient(settings.apiKey)

  const admin = getSupabaseAdmin()
  const { data } = await admin
    .from('connectors')
    .select('encrypted_key')
    .eq('is_base_model', true)
    .maybeSingle()
  let apiKey: string | undefined
  if (data?.encrypted_key) {
    try {
      apiKey = Buffer.from(data.encrypted_key, 'base64').toString('utf-8')
    } catch {}
  }
  return createOpenAIClient(apiKey)
}
