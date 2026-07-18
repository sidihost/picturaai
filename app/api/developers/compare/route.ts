import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const developerCookie = cookieStore.get('developer_session')
    
    if (!developerCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { prompt, model } = await request.json()

    if (!prompt || !model) {
      return NextResponse.json({ error: 'Prompt and model are required' }, { status: 400 })
    }

    // Call the internal generation API with specific model
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/generate/text-to-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        model: model === 'pi-1.5-turbo' || model === 'pi-1.0' ? model : 'pi-1.0',
        width: 1024,
        height: 1024,
        internal: true,
        developerId: developerCookie.value,
        forceProvider: model // Use this to force a specific provider for comparison
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.error || 'Generation failed' }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ url: data.url })

  } catch (error) {
    console.error('Compare error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
