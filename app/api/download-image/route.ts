import { NextResponse } from 'next/server'

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  return h === 'localhost' || h === '127.0.0.1' || h === '::1' || h.endsWith('.local')
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    let parsed: URL
    try {
      parsed = new URL(imageUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(parsed.protocol) || isPrivateHost(parsed.hostname)) {
      return NextResponse.json({ error: 'Unsupported url' }, { status: 400 })
    }

    const upstream = await fetch(parsed.toString(), { cache: 'no-store' })
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 })
    }

    const contentType = upstream.headers.get('content-type') || 'image/png'
    const bytes = await upstream.arrayBuffer()

    return new NextResponse(bytes, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[download-image] error:', error)
    return NextResponse.json({ error: 'Failed to download image' }, { status: 500 })
  }
}
