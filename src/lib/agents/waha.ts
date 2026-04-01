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

/** Send an image with optional caption */
export async function sendImage(chatId: string, imageUrl: string, caption?: string, session = 'default'): Promise<void> {
  await wahaFetch('/api/sendImage', {
    method: 'POST',
    body: JSON.stringify({
      session,
      chatId,
      file: { url: imageUrl, mimetype: 'image/jpeg' },
      caption: caption || '',
    }),
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

/** List all sessions */
export async function getSessions(): Promise<any[]> {
  const res = await wahaFetch('/api/sessions', { method: 'GET' })
  return res.json()
}

/** Stop a session */
export async function stopSession(session = 'default'): Promise<any> {
  const res = await wahaFetch(`/api/sessions/${session}/stop`, { method: 'POST' })
  return res.json()
}

/** Restart a session (stop + start) */
export async function restartSession(session = 'default'): Promise<any> {
  try { await wahaFetch(`/api/sessions/${session}/stop`, { method: 'POST' }) } catch {}
  await new Promise(r => setTimeout(r, 2000))
  const res = await wahaFetch(`/api/sessions/${session}/start`, { method: 'POST' })
  return res.json()
}

/** Logout from WhatsApp (unlink device) */
export async function logoutSession(session = 'default'): Promise<void> {
  await wahaFetch(`/api/sessions/${session}/logout`, { method: 'POST' })
}

/** Get screenshot (QR code page) as buffer */
export async function getScreenshot(session = 'default'): Promise<Buffer> {
  const res = await wahaFetch(`/api/screenshot?session=${session}`, { method: 'GET' })
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
