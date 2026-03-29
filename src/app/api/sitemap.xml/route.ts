import { NextResponse } from 'next/server'
import { generateSitemapXml } from '@/lib/agents/dimas/sitemap'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const xml = await generateSitemapXml()
    return new NextResponse(xml, {
      headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' },
    })
  } catch (err: any) {
    return new NextResponse('<error>Failed to generate sitemap</error>', {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    })
  }
}
