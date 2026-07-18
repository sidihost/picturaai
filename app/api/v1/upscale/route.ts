import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { put } from '@vercel/blob'

const sql = neon(process.env.DATABASE_URL!)

// Replicate Real-ESRGAN
async function upscaleWithReplicate(imageUrl: string, scale: number): Promise<string> {
  const apiKey = process.env.REPLICATE_API_TOKEN
  if (!apiKey) throw new Error('Replicate not configured')

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
      input: { 
        image: imageUrl,
        scale: Math.min(scale, 4),
        face_enhance: true
      },
    }),
  })

  if (!response.ok) throw new Error('Replicate creation failed')
  const prediction = await response.json()
  
  for (let i = 0; i < 120; i++) {
    await new Promise(r => setTimeout(r, 1000))
    const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { 'Authorization': `Token ${apiKey}` },
    })
    const status = await statusRes.json()
    if (status.status === 'succeeded' && status.output) {
      return status.output
    }
    if (status.status === 'failed') throw new Error('Replicate failed')
  }
  throw new Error('Replicate timed out')
}

// Fal AI upscaler
async function upscaleWithFal(imageUrl: string, scale: number): Promise<string> {
  const apiKey = process.env.FAL_KEY
  if (!apiKey) throw new Error('Fal not configured')

  const response = await fetch('https://fal.run/fal-ai/clarity-upscaler', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      scale: Math.min(scale, 4),
    }),
  })

  if (!response.ok) throw new Error('Fal failed')
  const data = await response.json()
  if (data.image?.url) return data.image.url
  throw new Error('No result from Fal')
}

// DeepAI Super Resolution
async function upscaleWithDeepAI(imageUrl: string): Promise<string> {
  const apiKey = process.env.DEEPAI_API_KEY
  if (!apiKey) throw new Error('DeepAI not configured')

  const response = await fetch('https://api.deepai.org/api/torch-srgan', {
    method: 'POST',
    headers: { 'api-key': apiKey },
    body: new URLSearchParams({ image: imageUrl }),
  })

  if (!response.ok) throw new Error('DeepAI failed')
  const data = await response.json()
  if (data.output_url) return data.output_url
  throw new Error('No result from DeepAI')
}

// Stability AI upscaler
async function upscaleWithStability(imageUrl: string): Promise<string> {
  const apiKey = process.env.STABILITY_API_KEY
  if (!apiKey) throw new Error('Stability not configured')

  // Download image first
  const imageResponse = await fetch(imageUrl)
  const imageBuffer = await imageResponse.arrayBuffer()

  const formData = new FormData()
  formData.append('image', new Blob([imageBuffer]), 'image.png')
  formData.append('width', '2048')

  const response = await fetch('https://api.stability.ai/v1/generation/esrgan-v1-x2plus/image-to-image/upscale', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
    body: formData,
  })

  if (!response.ok) throw new Error('Stability failed')
  const data = await response.json()
  if (data.artifacts?.[0]?.base64) {
    return `data:image/png;base64,${data.artifacts[0].base64}`
  }
  throw new Error('No result from Stability')
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    
    const keyResult = await sql`
      SELECT ak.id, ak.developer_id, d.credits
      FROM api_keys ak
      JOIN developers d ON ak.developer_id = d.id
      WHERE ak.key = ${apiKey} AND ak.is_active = true
    `

    if (keyResult.length === 0) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { developer_id, credits } = keyResult[0]
    const creditCost = 0.5

    if (credits < creditCost) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    }

    const body = await request.json()
    const { image_url, scale = 2 } = body

    if (!image_url) {
      return NextResponse.json({ error: 'image_url is required' }, { status: 400 })
    }

    if (scale < 2 || scale > 4) {
      return NextResponse.json({ error: 'Scale must be between 2 and 4' }, { status: 400 })
    }

    const startTime = Date.now()
    let resultUrl: string | null = null
    const providers = [
      (url: string) => upscaleWithFal(url, scale),
      (url: string) => upscaleWithReplicate(url, scale),
      upscaleWithStability,
      upscaleWithDeepAI,
    ]

    for (const provider of providers) {
      try {
        resultUrl = await provider(image_url)
        break
      } catch (err) {
        console.error('Upscale provider failed:', err)
        continue
      }
    }

    if (!resultUrl) {
      return NextResponse.json({ error: 'All providers failed' }, { status: 500 })
    }

    // Upload to blob if base64
    let finalUrl = resultUrl
    if (resultUrl.startsWith('data:')) {
      const base64Data = resultUrl.split(',')[1]
      const imageBuffer = Buffer.from(base64Data, 'base64')
      const blob = await put(`pictura/upscaled/${Date.now()}.png`, imageBuffer, {
        access: 'public',
        contentType: 'image/png',
      })
      finalUrl = blob.url
    }

    const generationTime = Date.now() - startTime

    await sql`UPDATE developers SET credits = credits - ${creditCost} WHERE id = ${developer_id}`
    await sql`
      INSERT INTO usage_analytics (developer_id, endpoint, generation_time_ms, credits_used, status)
      VALUES (${developer_id}, '/v1/upscale', ${generationTime}, ${creditCost}, 'success')
    `

    return NextResponse.json({
      success: true,
      url: finalUrl,
      scale,
      credits_used: creditCost,
      generation_time_ms: generationTime
    })

  } catch (error) {
    console.error('Upscale error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
