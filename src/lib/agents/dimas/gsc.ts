import { google } from 'googleapis'
import { DIMAS_CONFIG } from './config'

function getAuth() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!keyJson) throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_KEY')

  const credentials = JSON.parse(keyJson)
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/indexing',
    ],
  })
}

export async function querySearchAnalytics(options: {
  startDate: string
  endDate: string
  dimensions?: string[]
  rowLimit?: number
  filters?: Array<{ dimension: string; expression: string }>
}) {
  const auth = getAuth()
  const searchconsole = google.searchconsole({ version: 'v1', auth })

  const dimensionFilterGroups = options.filters?.length
    ? [{ filters: options.filters.map(f => ({ dimension: f.dimension, expression: f.expression, operator: 'contains' })) }]
    : undefined

  const response = await searchconsole.searchanalytics.query({
    siteUrl: DIMAS_CONFIG.siteUrl,
    requestBody: {
      startDate: options.startDate,
      endDate: options.endDate,
      dimensions: options.dimensions || ['query', 'page'],
      rowLimit: options.rowLimit || 1000,
      ...(dimensionFilterGroups ? { dimensionFilterGroups } : {}),
    },
  })

  return response.data.rows || []
}

export async function submitSitemap(sitemapUrl: string) {
  const auth = getAuth()
  const searchconsole = google.searchconsole({ version: 'v1', auth })

  await searchconsole.sitemaps.submit({
    siteUrl: DIMAS_CONFIG.siteUrl,
    feedpath: sitemapUrl,
  })
}

export async function pingIndexing(url: string) {
  try {
    const auth = getAuth()
    const indexing = google.indexing({ version: 'v3', auth })
    await indexing.urlNotifications.publish({
      requestBody: { url, type: 'URL_UPDATED' },
    })
  } catch {
    // Indexing API may not work for regular pages — that's fine
  }
}
