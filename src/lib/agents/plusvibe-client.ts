const BASE_URL = 'https://api.plusvibe.ai/api/v1'

function getConfig() {
  const apiKey = process.env.PLUSVIBE_API_KEY
  const workspaceId = process.env.PLUSVIBE_WORKSPACE_ID
  if (!apiKey || !workspaceId) throw new Error('Missing PLUSVIBE_API_KEY or PLUSVIBE_WORKSPACE_ID')
  return { apiKey, workspaceId }
}

async function pvFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const { apiKey, workspaceId } = getConfig()
  const separator = path.includes('?') ? '&' : '?'
  const url = `${BASE_URL}${path}${separator}workspace_id=${workspaceId}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`[plusvibe] ${res.status} ${path}:`, body)
    throw new Error(`Plusvibe API error: ${res.status}`)
  }
  return res
}

export async function replyToEmail(replyToId: string, subject: string, from: string, to: string, body: string) {
  await pvFetch('/unibox/emails/reply', {
    method: 'POST',
    body: JSON.stringify({ reply_to_id: replyToId, subject, from, to, body }),
  })
}

export async function getEmailThread(emailId: string): Promise<any[]> {
  const res = await pvFetch(`/unibox/emails?email_id=${emailId}`)
  return res.json()
}

export async function updateLeadStatus(leadId: string, status: string) {
  await pvFetch('/leads/status', {
    method: 'POST',
    body: JSON.stringify({ lead_id: leadId, status }),
  })
}

export async function createWebhook(url: string, events: string[]) {
  await pvFetch('/webhooks', {
    method: 'POST',
    body: JSON.stringify({ name: 'AI Reply Agent', url, events }),
  })
}
