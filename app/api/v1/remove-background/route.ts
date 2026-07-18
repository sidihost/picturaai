import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { put } from '@vercel/blob'

const sql = neon(process.env.DATABASE_URL!)

// Remove.bg API
async function removeWithRemoveBg(imageUrl: string): Promise<string> {
  const apiKey = process.env.REMOVE_BG_API_KEY
  if (!apiKey) throw new Error('Remove.bg not configured')

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      size: 'auto',
      format: 'png',
    }),
  })

  if (!response.ok) throw new Error('Remove.bg failed')
  
  const imageBuffer = await response.arrayBuffer()
  return `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`
}

// Replicate rembg model
async function removeWithReplicate(imageUrl: string): Promise<string> {
  const apiKey = process.env.REPLICATE_API_TOKEN
  if (!apiKey) throw new Error('Replicate not configured')

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
      input: { image: imageUrl },
    }),
  })

  if (!response.ok) throw new Error('Replicate creation failed')
  const prediction = await response.json()
  
  // Poll for result
  for (let i = 0; i < 60; i++) {
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

// Fal AI background removal
async function removeWithFal(imageUrl: string): Promise<string> {
  const apiKey = process.env.FAL_KEY
  if (!apiKey) throw new Error('Fal not configured')

  const response = await fetch('https://fal.run/fal-ai/birefnet', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image_url: imageUrl }),
  })

  if (!response.ok) throw new Error('Fal failed')
  const data = await response.json()
  if (data.image?.url) return data.image.url
  throw new Error('No result from Fal')
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
    const creditCost = 0.5 // Half credit for background removal

    if (credits < creditCost) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    }

    const body = await request.json()
    const { image_url } = body

    if (!image_url) {
      return NextResponse.json({ error: 'image_url is required' }, { status: 400 })
    }

    const startTime = Date.now()
    let resultUrl: string | null = null
    const providers = [removeWithFal, removeWithReplicate, removeWithRemoveBg]

    for (const provider of providers) {
      try {
        resultUrl = await provider(image_url)
        break
      } catch (err) {
        console.error('Background removal provider failed:', err)
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
      const blob = await put(`pictura/bg-removed/${Date.now()}.png`, imageBuffer, {
        access: 'public',
        contentType: 'image/png',
      })
      finalUrl = blob.url
    }

    const generationTime = Date.now() - startTime

    // Deduct credits and log
    await sql`UPDATE developers SET credits = credits - ${creditCost} WHERE id = ${developer_id}`
    await sql`
      INSERT INTO usage_analytics (developer_id, endpoint, generation_time_ms, credits_used, status)
      VALUES (${developer_id}, '/v1/remove-background', ${generationTime}, ${creditCost}, 'success')
    `

    return NextResponse.json({
      success: true,
      url: finalUrl,
      credits_used: creditCost,
      generation_time_ms: generationTime
    })

  } catch (error) {
    console.error('Background removal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
