import { NextResponse } from 'next/server'

// The base URL for the open access ExchangeRate-API
const API_URL = 'https://open.er-api.com/v6/latest/USD'

export async function GET() {
  try {
    const response = await fetch(API_URL, {
      // Revalidate every 4 hours to get fresh data without hitting the API too often
      next: { revalidate: 14400 },
    })

    if (!response.ok) {
      // Log the error for debugging on the server
      console.error(`[CURRENCY_API] Error fetching rates: ${response.statusText}`)
      return NextResponse.json(
        { error: 'Failed to fetch exchange rates.' },
        { status: 500 }
      )
    }

    const data = await response.json()

    if (data.result === 'error') {
      console.error(`[CURRENCY_API] API returned an error: ${data['error-type']}`)
      return NextResponse.json(
        { error: `An error occurred with the currency API: ${data['error-type']}` },
        { status: 500 }
      )
    }

    // Return the rates object to the client
    return NextResponse.json(data.rates)
  } catch (error) {
    console.error('[CURRENCY_API] Internal server error:', error)
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    )
  }
}
