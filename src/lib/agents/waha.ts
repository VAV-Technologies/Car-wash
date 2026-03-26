const WAHA_API_URL = process.env.WAHA_API_URL!
const WAHA_API_KEY = process.env.WAHA_API_KEY!

async function wahaFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${WAHA_API_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': WAHA_API_KEY,
      ...options.headers,
    },
  })

  if (!res.ok) {
    let errorMessage: string
    try {
      const body = await res.json()
      errorMessage = body.message || body.error || JSON.stringify(body)
    } catch {
      errorMessage = `HTTP ${res.status} ${res.statusText}`
    }
    console.error(`WAHA error [${res.status}] ${path}:`, errorMessage)
    throw new Error(errorMessage)
  }

  return res
}

/** Send a text message */
export async function sendText(chatId: string, text: string, session = 'default'): Promise<void> {
  await wahaFetch('/api/sendText', {
    method: 'POST',
    body: JSON.stringify({ session, chatId, text }),
  })
}

/** Send "typing" / seen indicator */
export async function sendSeen(chatId: string, session = 'default'): Promise<void> {
  await wahaFetch('/api/sendSeen', {
    method: 'POST',
    body: JSON.stringify({ session, chatId }),
  })
}

/** Start a session with webhook config */
export async function startSession(webhookUrl: string, session = 'default'): Promise<any> {
  const res = await wahaFetch('/api/sessions', {
    method: 'POST',
    body: JSON.stringify({
      name: session,
      config: {
        webhooks: [{ url: webhookUrl, events: ['message'] }],
      },
    }),
  })
  return res.json()
}

/** Get session status */
export async function getSessionStatus(session = 'default'): Promise<any> {
  const res = await wahaFetch(`/api/sessions/${session}`, { method: 'GET' })
  return res.json()
}

/** Get QR code for scanning */
export async function getQR(session = 'default'): Promise<string> {
  const res = await wahaFetch(`/api/sessions/${session}/auth/qr`, { method: 'GET' })
  const data = await res.json()
  return data.value
}
