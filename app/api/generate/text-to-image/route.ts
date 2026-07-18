import { NextResponse } from 'next/server'
import { getRateLimitInfo, incrementUsage } from '@/lib/rate-limit'
import { getOrCreateSessionId } from '@/lib/session'
import { uploadObject } from '@/lib/storage'
import { appendMediaToGallery } from '@/lib/gallery'
import { getAdminSessionFromRequest } from '@/lib/admin-auth'
import { getRequestContext } from '@/lib/request-context'

console.log('[TextToImage] Module loaded')

async function pollAlibabaTask(apiKey: string, taskId: string): Promise<string> {
  for (let i = 0; i < 30; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const response = await fetch(`https://dashscope-intl.aliyuncs.com/api/v1/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!response.ok) continue
    const data = await response.json()
    const output = data.output || {}
    const url = output.results?.[0]?.url || output.images?.[0]?.url || output.image_url || output.url
    if (url) return url
    if (output.task_status === 'FAILED' || output.task_status === 'CANCELED') {
      throw new Error('Alibaba task failed')
    }
  }
  throw new Error('Alibaba task timeout')
}

async function generateWithQwen(prompt: string): Promise<string> {
  const apiKey = process.env.ALIBABA_API_KEY || process.env.DASHSCOPE_API_KEY || process.env.ALIBABA_DASHSCOPE_API_KEY
  if (!apiKey) throw new Error('Alibaba API key not configured')

  const candidateModels = [
    process.env.ALIBABA_IMAGE_MODEL,
    'wan2.2-t2i-plus',
    'wan2.2-t2i',
    'wanx2.1-t2i-turbo',
  ].filter((m): m is string => Boolean(m))

  let lastError = 'Alibaba text-to-image failed'

  for (const model of candidateModels) {
    const response = await fetch('https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model,
        input: { prompt: prompt.trim() },
        parameters: { size: '1024*1024' },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      lastError = `model=${model} status=${response.status} body=${errorText}`
      continue
    }

    const data = await response.json()
    const taskId = data.output?.task_id
    if (taskId) return pollAlibabaTask(apiKey, taskId)
    const directUrl = data.output?.results?.[0]?.url || data.output?.images?.[0]?.url || data.output?.image_url || data.output?.url
    if (directUrl) return directUrl
    lastError = `model=${model} returned no task_id/image URL`
  }

  throw new Error(lastError)
}

// Provider-specific generation functions
async function generateWithZyLabs(prompt: string): Promise<string> {
  const apiKey = process.env.ZYLABS_API_KEY
  if (!apiKey) throw new Error('ZyLabs API key not configured')

  const params = new URLSearchParams({
    prompt: prompt.trim(),
    width: '1024',
    height: '1024',
  })
  const apiUrl = `https://zylalabs.com/api/10640/ai+image+generator+nano+banana+api/20188/text+to+image?${params.toString()}`
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${apiKey}` },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('ZyLabs API error:', response.status, errorText)
    throw new Error('ZyLabs generation failed')
  }

  const data = await response.json()
  return extractImageUrl(data)
}

async function generateWithStability(prompt: string): Promise<string> {
  const apiKey = process.env.STABILITY_API_KEY
  if (!apiKey) throw new Error('Stability API key not configured')

  // Stability AI SD3 requires multipart/form-data
  const formData = new FormData()
  formData.append('prompt', prompt.trim())
  formData.append('output_format', 'png')
  formData.append('aspect_ratio', '1:1')
  formData.append('model', 'sd3-large')

  const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'image/*',
    },
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[Pictura] Stability API error:', response.status, errorText)
    throw new Error(`Stability generation failed: ${response.status}`)
  }

  // SD3 returns raw image bytes when Accept: image/*
  const imageBuffer = await response.arrayBuffer()
  const base64 = Buffer.from(imageBuffer).toString('base64')
  return `data:image/png;base64,${base64}`
}

async function generateWithLeonardo(prompt: string): Promise<string> {
  const apiKey = process.env.LEONARDO_API_KEY
  if (!apiKey) throw new Error('Leonardo API key not configured')

  // First, create a generation
  const createResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      modelId: '6b645e3a-d64f-4341-a6d8-7a3690fbf042', // Leonardo Phoenix
      width: 1024,
      height: 1024,
      num_images: 1,
    }),
  })

  if (!createResponse.ok) {
    const errorText = await createResponse.text()
    console.error('Leonardo API error:', createResponse.status, errorText)
    throw new Error('Leonardo generation failed')
  }

  const createData = await createResponse.json()
  const generationId = createData.sdGenerationJob?.generationId

  if (!generationId) throw new Error('No generation ID from Leonardo')

  // Poll for completion
  for (let i = 0; i < 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })

    if (!statusResponse.ok) continue

    const statusData = await statusResponse.json()
    const images = statusData.generations_by_pk?.generated_images

    if (images && images.length > 0) {
      return images[0].url
    }
  }

  throw new Error('Leonardo generation timed out')
}

// Mistral AI - Image generation via Agents API
async function generateWithMistral(prompt: string): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) throw new Error('Mistral API key not configured')

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'pixtral-large-latest',
      messages: [{ role: 'user', content: `Generate an image: ${prompt.trim()}` }],
      tools: [{ type: 'image_generation' }],
      tool_choice: 'auto',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Mistral API error:', response.status, errorText)
    throw new Error('Mistral generation failed')
  }

  const data = await response.json()
  // Extract image from tool call response
  const toolCalls = data.choices?.[0]?.message?.tool_calls
  if (toolCalls && toolCalls[0]?.function?.output) {
    return toolCalls[0].function.output
  }
  throw new Error('Could not extract image from Mistral response')
}

// OpenAI DALL-E 3
async function generateWithOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OpenAI API key not configured')

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt.trim(),
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('OpenAI API error:', response.status, errorText)
    throw new Error('OpenAI generation failed')
  }

  const data = await response.json()
  if (data.data?.[0]?.url) return data.data[0].url
  throw new Error('Could not extract image from OpenAI response')
}

// Replicate - Flux and other models
async function generateWithReplicate(prompt: string): Promise<string> {
  const apiKey = process.env.REPLICATE_API_TOKEN
  if (!apiKey) throw new Error('Replicate API key not configured')

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'black-forest-labs/flux-schnell',
      input: { prompt: prompt.trim(), aspect_ratio: '1:1' },
    }),
  })

  if (!response.ok) throw new Error('Replicate creation failed')
  
  const prediction = await response.json()
  
  // Poll for completion
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 1000))
    const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { 'Authorization': `Token ${apiKey}` },
    })
    const status = await statusRes.json()
    if (status.status === 'succeeded' && status.output) {
      return Array.isArray(status.output) ? status.output[0] : status.output
    }
    if (status.status === 'failed') throw new Error('Replicate generation failed')
  }
  throw new Error('Replicate generation timed out')
}

// Together AI
async function generateWithTogether(prompt: string): Promise<string> {
  const apiKey = process.env.TOGETHER_API_KEY
  if (!apiKey) throw new Error('Together API key not configured')

  const response = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell-Free',
      prompt: prompt.trim(),
      width: 1024,
      height: 1024,
      n: 1,
    }),
  })

  if (!response.ok) throw new Error('Together generation failed')
  const data = await response.json()
  if (data.data?.[0]?.url) return data.data[0].url
  throw new Error('Could not extract image from Together response')
}

// Fireworks AI
async function generateWithFireworks(prompt: string): Promise<string> {
  const apiKey = process.env.FIREWORKS_API_KEY
  if (!apiKey) throw new Error('Fireworks API key not configured')

  const response = await fetch('https://api.fireworks.ai/inference/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'accounts/fireworks/models/flux-1-schnell-fp8',
      prompt: prompt.trim(),
      n: 1,
      size: '1024x1024',
    }),
  })

  if (!response.ok) throw new Error('Fireworks generation failed')
  const data = await response.json()
  if (data.data?.[0]?.url) return data.data[0].url
  throw new Error('Could not extract image from Fireworks response')
}

// DeepInfra
async function generateWithDeepInfra(prompt: string): Promise<string> {
  const apiKey = process.env.DEEPINFRA_API_KEY
  if (!apiKey) throw new Error('DeepInfra API key not configured')

  const response = await fetch('https://api.deepinfra.com/v1/inference/black-forest-labs/FLUX-1-schnell', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      width: 1024,
      height: 1024,
    }),
  })

  if (!response.ok) throw new Error('DeepInfra generation failed')
  const data = await response.json()
  if (data.images?.[0]) return data.images[0]
  throw new Error('Could not extract image from DeepInfra response')
}

// Fal AI - High quality image generation
async function generateWithFal(prompt: string): Promise<string> {
  const apiKey = process.env.FAL_KEY
  if (!apiKey) throw new Error('Fal API key not configured')

  const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      image_size: 'square_hd',
      num_images: 1,
    }),
  })

  if (!response.ok) throw new Error('Fal generation failed')
  const data = await response.json()
  if (data.images?.[0]?.url) return data.images[0].url
  throw new Error('Could not extract image from Fal response')
}

// Hugging Face Inference API
async function generateWithHuggingFace(prompt: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  if (!apiKey) throw new Error('HuggingFace API key not configured')

  const response = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: prompt.trim() }),
  })

  if (!response.ok) throw new Error('HuggingFace generation failed')
  
  const imageBlob = await response.arrayBuffer()
  return `data:image/png;base64,${Buffer.from(imageBlob).toString('base64')}`
}

// BFL (Black Forest Labs) - Direct Flux API
async function generateWithBFL(prompt: string): Promise<string> {
  const apiKey = process.env.BFL_API_KEY
  if (!apiKey) throw new Error('BFL API key not configured')

  const response = await fetch('https://api.bfl.ml/v1/flux-pro-1.1', {
    method: 'POST',
    headers: {
      'X-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      width: 1024,
      height: 1024,
    }),
  })

  if (!response.ok) throw new Error('BFL creation failed')
  const { id } = await response.json()
  
  // Poll for result
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 1000))
    const resultRes = await fetch(`https://api.bfl.ml/v1/get_result?id=${id}`, {
      headers: { 'X-Key': apiKey },
    })
    const result = await resultRes.json()
    if (result.status === 'Ready' && result.result?.sample) {
      return result.result.sample
    }
  }
  throw new Error('BFL generation timed out')
}

function extractImageUrl(data: Record<string, unknown>): string {
  // Try all known fields
  if (data.image && typeof data.image === 'string') return data.image
  if (data.url && typeof data.url === 'string') return data.url
  if (data.output && typeof data.output === 'string') return data.output
  if (data.result && typeof data.result === 'string') return data.result
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    const img = data.images[0] as Record<string, unknown>
    return (img.url || img.src || img.image) as string
  }
  if (data.data && typeof data.data === 'object') {
    const d = data.data as Record<string, unknown>
    if (d.image) return d.image as string
    if (d.url) return d.url as string
    if (d.images && Array.isArray(d.images) && d.images.length > 0) {
      return (d.images[0] as Record<string, unknown>).url as string
    }
  }
  throw new Error('Could not extract image URL from response')
}

export async function POST(request: Request) {
  console.log('[TextToImage] POST request received')
  try {
    const body = await request.json()
    const prompt = typeof body.prompt === 'string' ? body.prompt : ''
    const model = typeof body.model === 'string' ? body.model : 'pi-1.0'
    const requestId = typeof body.requestId === 'string' ? body.requestId : null
    console.log('[TextToImage] Prompt:', prompt.slice(0, 50), 'Model:', model)

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'A text prompt is required' }, { status: 400 })
    }

    // Check rate limit using session ID
    const sessionId = await getOrCreateSessionId(request)
    const adminSession = getAdminSessionFromRequest(request)
    const requestContext = getRequestContext(request)
    console.log('[TextToImage] Session ID:', sessionId)
    const rateLimitInfo = await getRateLimitInfo(sessionId, { role: adminSession?.role, ...requestContext })
    console.log('[TextToImage] Rate limit before:', rateLimitInfo)

    if (rateLimitInfo.remaining <= 0) {
      console.log('[TextToImage] Rate limit reached!')
      return NextResponse.json(
        {
          error: `Daily limit reached. You can generate up to ${rateLimitInfo.limit} images per day.`,
          rateLimitInfo,
        },
        { status: 429 }
      )
    }

    // Generate based on selected model with automatic fallback
    // Model-specific provider pipelines
    let imageUrl: string
    const providers = model === 'pi-1.5-turbo'
      ? [
          generateWithQwen,      // Alibaba
          generateWithZyLabs,    // ZyLabs
          generateWithStability, // Stability
          generateWithMistral,   // Mistral
        ]
      : [
          generateWithLeonardo,  // Leonardo
          generateWithZyLabs,    // ZyLabs
          generateWithMistral,   // Mistral
        ]
    
    let lastError: Error | null = null
    for (const provider of providers) {
      try {
        imageUrl = await provider(prompt)
        break // Success, exit loop
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        console.log(`[Pictura] Provider failed, trying next: ${lastError.message}`)
        continue // Try next provider
      }
    }

    if (!imageUrl!) {
      console.error('All providers failed:', lastError)
      return NextResponse.json(
        { error: 'Image generation failed. Please try again.' },
        { status: 500 }
      )
    }

    // Handle base64 images (from Stability)
    let imageBuffer: ArrayBuffer | Buffer
    if (imageUrl.startsWith('data:')) {
      const base64Data = imageUrl.split(',')[1]
      imageBuffer = Buffer.from(base64Data, 'base64')
    } else {
      // Download the generated image
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to download generated image' },
          { status: 500 }
        )
      }
      imageBuffer = await imageResponse.arrayBuffer()
    }

    const timestamp = Date.now()
    const filename = `pictura/text-to-image/${timestamp}-${model}-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.png`

    // Upload to Vercel Blob
    const blob = await uploadObject(filename, imageBuffer, 'image/png')

    const createdAt = new Date().toISOString()
    await appendMediaToGallery(sessionId, {
      url: blob.url,
      prompt: prompt.trim(),
      type: 'text-to-image',
      mediaKind: 'image',
      requestId: requestId || undefined,
      createdAt,
    })

    // Increment usage after successful generation
    console.log('[TextToImage] Incrementing usage...')
    await incrementUsage(sessionId, { role: adminSession?.role, ...requestContext })
    const updatedRateLimitInfo = await getRateLimitInfo(sessionId, { role: adminSession?.role, ...requestContext })
    console.log('[TextToImage] Rate limit after:', updatedRateLimitInfo)

    return NextResponse.json({
      url: blob.url,
      prompt: prompt.trim(),
      model,
      type: 'text-to-image',
      requestId: requestId || undefined,
      createdAt,
      rateLimitInfo: updatedRateLimitInfo,
    })
  } catch (error) {
    console.error('Text-to-image generation error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
