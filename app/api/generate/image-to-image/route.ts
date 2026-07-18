import { NextResponse } from 'next/server'
import { getRateLimitInfo, incrementUsage } from '@/lib/rate-limit'
import { getOrCreateSessionId } from '@/lib/session'
import { uploadObject } from '@/lib/storage'
import { appendMediaToGallery } from '@/lib/gallery'
import { getAdminSessionFromRequest } from '@/lib/admin-auth'
import { getRequestContext } from '@/lib/request-context'

function getAlibabaKey(): string | null {
  return process.env.ALIBABA_API_KEY || process.env.DASHSCOPE_API_KEY || process.env.ALIBABA_DASHSCOPE_API_KEY || null
}

async function pollQwenTask(apiKey: string, taskId: string): Promise<string | null> {
  for (let i = 0; i < 40; i++) {
    if (i > 0) await new Promise((resolve) => setTimeout(resolve, 1500))
    const response = await fetch(`https://dashscope-intl.aliyuncs.com/api/v1/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!response.ok) continue
    const data = await response.json()
    const out = data.output || {}
    const url = extractAlibabaImageUrl(out)
    if (url) return url
    if (out.task_status === 'FAILED' || out.task_status === 'CANCELED') return null
  }
  return null
}

async function generateViaInternalEditRoute(request: Request, prompt: string, sourceImageUrl: string): Promise<string | null> {
  try {
    const endpoint = new URL('/api/edit-image', request.url)
    const response = await fetch(endpoint.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: sourceImageUrl, instruction: prompt.trim() }),
    })
    if (!response.ok) return null
    const data = await response.json()
    return typeof data?.url === 'string' ? data.url : null
  } catch {
    return null
  }
}

function extractAlibabaImageUrl(out: Record<string, unknown> | null | undefined): string | null {
  if (!out) return null
  const direct = (out as { results?: Array<{ url?: string; image?: string }>; images?: Array<{ url?: string; image?: string }>; image_url?: string; image?: string; url?: string })
  if (direct.results?.[0]?.url) return direct.results[0].url
  if (direct.results?.[0]?.image) return direct.results[0].image
  if (direct.images?.[0]?.url) return direct.images[0].url
  if (direct.images?.[0]?.image) return direct.images[0].image
  if (typeof direct.image_url === 'string') return direct.image_url
  if (typeof direct.image === 'string') return direct.image
  if (typeof direct.url === 'string') return direct.url

  const choices = (out as { choices?: Array<{ message?: { content?: Array<{ image?: string; image_url?: string; url?: string }> } }> }).choices
  const content = choices?.[0]?.message?.content || []
  for (const item of content) {
    if (item?.image) return item.image
    if (item?.image_url) return item.image_url
    if (item?.url) return item.url
  }

  return null
}

async function fetchSourceImageDataUrl(sourceImageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(sourceImageUrl)
    if (!response.ok) return null
    const contentType = response.headers.get('content-type') || 'image/png'
    const bytes = await response.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    return `data:${contentType};base64,${base64}`
  } catch {
    return null
  }
}

async function fileToDataUrl(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const contentType = file.type || 'image/png'
  return `data:${contentType};base64,${Buffer.from(bytes).toString('base64')}`
}

async function generateWithQwenImageGenEdit(prompt: string, sourceCandidates: string[]): Promise<string | null> {
  const apiKey = getAlibabaKey()
  if (!apiKey) return null

  const candidateModels = [
    process.env.ALIBABA_IMAGE_MODEL,
    'qwen-image-2.0-pro',
    'wan2.6-image',
  ].filter((m): m is string => Boolean(m))

  for (const model of candidateModels) {
    for (const sourceImage of sourceCandidates) {
      const response = await fetch('https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/image-generation/generation', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable',
        },
        body: JSON.stringify({
          model,
          input: {
            messages: [
              {
                role: 'user',
                content: [
                  { image: sourceImage },
                  { text: prompt.trim() },
                ],
              },
            ],
          },
          parameters: {
            n: 1,
            size: '1280*1280',
            enable_interleave: true,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        console.log(`[img2img:qwen-image] model=${model} failed`, response.status, errorText.slice(0, 300))
        continue
      }

      const data = await response.json()
      const taskId = data.output?.task_id
      if (taskId) {
        const polled = await pollQwenTask(apiKey, taskId)
        if (polled) return polled
        continue
      }

      const direct = extractAlibabaImageUrl(data.output)
      if (direct) return direct
    }
  }

  return null
}

async function generateWithQwenEdit(prompt: string, sourceCandidates: string[]): Promise<string | null> {
  const apiKey = getAlibabaKey()
  if (!apiKey) return null

  const candidateModels = [
    process.env.ALIBABA_IMAGE_EDIT_MODEL,
    'wan2.5-i2i-preview',
    'wan2.2-imageedit-plus',
    'wanx2.1-imageedit',
    'qwen-image-edit',
  ].filter((m): m is string => Boolean(m))

  for (const model of candidateModels) {
    for (const sourceImage of sourceCandidates) {
      const payloads = [
        { input: { prompt: prompt.trim(), image_url: sourceImage }, parameters: { size: '1024*1024' } },
        { input: { prompt: prompt.trim(), image: sourceImage }, parameters: { size: '1024*1024' } },
      ]

      for (const payload of payloads) {
        const response = await fetch('https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'X-DashScope-Async': 'enable',
          },
          body: JSON.stringify({
            model,
            ...payload,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text().catch(() => '')
          console.log(`[img2img:qwen] model=${model} failed`, response.status, errorText.slice(0, 300))
          continue
        }

        const data = await response.json()
        const taskId = data.output?.task_id
        if (taskId) {
          const polled = await pollQwenTask(apiKey, taskId)
          if (polled) return polled
          continue
        }

        const direct = extractAlibabaImageUrl(data.output)
        if (direct) return direct
      }
    }
  }

  return null
}

async function resolveGeneratedImageBuffer(imageValue: string): Promise<ArrayBuffer | null> {
  const trimmed = imageValue.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('data:image/')) {
    const base64Part = trimmed.split(',')[1]
    if (!base64Part) return null
    return Buffer.from(base64Part, 'base64')
  }

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && /^[A-Za-z0-9+/=\n\r]+$/.test(trimmed) && trimmed.length > 128) {
    try {
      return Buffer.from(trimmed, 'base64')
    } catch {
      return null
    }
  }

  const imageResponse = await fetch(trimmed)
  if (!imageResponse.ok) return null
  return imageResponse.arrayBuffer()
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const prompt = formData.get('prompt') as string
    const requestId = (formData.get('requestId') as string | null) || null
    const image = formData.get('image') as File | null
    const imageUrl = formData.get('imageUrl') as string | null
    const model = (formData.get('model') as string | null) || 'pi-1.0'

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'A text prompt is required' }, { status: 400 })
    }

    if (!image && !imageUrl) {
      return NextResponse.json({ error: 'An image file or URL is required' }, { status: 400 })
    }

    const sessionId = await getOrCreateSessionId(request)
    const adminSession = getAdminSessionFromRequest(request)
    const requestContext = getRequestContext(request)
    const rateLimitInfo = await getRateLimitInfo(sessionId, { role: adminSession?.role, ...requestContext })

    if (rateLimitInfo.remaining <= 0) {
      return NextResponse.json(
        { error: `Daily limit reached. You can generate up to ${rateLimitInfo.limit} images per day.`, rateLimitInfo },
        { status: 429 }
      )
    }

    const apiKey = process.env.ZYLABS_API_KEY
    const allowLegacyFallback = process.env.ENABLE_LEGACY_IMG2IMG_FALLBACK !== 'false'
    const hasAlibabaKey = Boolean(getAlibabaKey())

    let sourceImageUrl = imageUrl || ''
    if (image) {
      const uploadTimestamp = Date.now()
      const uploadFilename = `pictura/uploads/${uploadTimestamp}-${image.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const uploadBlob = await uploadObject(uploadFilename, image, image.type || 'application/octet-stream')
      sourceImageUrl = uploadBlob.url
    }

    const sourceCandidates = [sourceImageUrl]
    if (image) {
      try {
        sourceCandidates.push(await fileToDataUrl(image))
      } catch {
        // Ignore file conversion failure and continue with URL candidates
      }
    }
    const sourceDataUrl = await fetchSourceImageDataUrl(sourceImageUrl)
    if (sourceDataUrl) sourceCandidates.push(sourceDataUrl)

    console.log('[Pictura] img2img sourceImageUrl:', sourceImageUrl)
    console.log('[Pictura] img2img prompt:', prompt.trim())

    const shouldTryAlibabaFirst = true

    if (shouldTryAlibabaFirst) {
      const [imageGenResult, imageEditResult] = await Promise.all([
        generateWithQwenImageGenEdit(prompt, sourceCandidates),
        generateWithQwenEdit(prompt, sourceCandidates),
      ])
      const alibabaResults = [imageGenResult, imageEditResult].filter((url): url is string => Boolean(url))

      for (const transformedUrl of alibabaResults) {
        const imageBuffer = await resolveGeneratedImageBuffer(transformedUrl)
        if (!imageBuffer) {
          console.log('[Pictura] img2img transformed image could not be resolved:', transformedUrl.slice(0, 120))
          continue
        }

        const timestamp = Date.now()
        const filename = `pictura/image-to-image/${timestamp}-qwen-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.png`
        const blob = await uploadObject(filename, imageBuffer, 'image/png')
        const createdAt = new Date().toISOString()
        await appendMediaToGallery(sessionId, {
          url: blob.url,
          prompt: prompt.trim(),
          type: 'image-to-image',
          mediaKind: 'image',
          sourceImageUrl,
          requestId: requestId || undefined,
          createdAt,
        })
        await incrementUsage(sessionId, { role: adminSession?.role, ...requestContext })
        const updatedRateLimitInfo = await getRateLimitInfo(sessionId, { role: adminSession?.role, ...requestContext })
        return NextResponse.json({
          url: blob.url,
          prompt: prompt.trim(),
          model,
          type: 'image-to-image',
          sourceImageUrl,
          requestId: requestId || undefined,
          createdAt,
          rateLimitInfo: updatedRateLimitInfo,
        })
      }
    }

    const internalEditFallback = await generateViaInternalEditRoute(request, prompt, sourceDataUrl || sourceImageUrl)
    if (internalEditFallback) {
      const imageBuffer = await resolveGeneratedImageBuffer(internalEditFallback)
      if (imageBuffer) {
        const timestamp = Date.now()
        const filename = `pictura/image-to-image/${timestamp}-internal-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.png`
        const blob = await uploadObject(filename, imageBuffer, 'image/png')
        const createdAt = new Date().toISOString()
        await appendMediaToGallery(sessionId, {
          url: blob.url,
          prompt: prompt.trim(),
          type: 'image-to-image',
          mediaKind: 'image',
          sourceImageUrl,
          requestId: requestId || undefined,
          createdAt,
        })
        await incrementUsage(sessionId, { role: adminSession?.role, ...requestContext })
        const updatedRateLimitInfo = await getRateLimitInfo(sessionId, { role: adminSession?.role, ...requestContext })
        return NextResponse.json({
          url: blob.url,
          prompt: prompt.trim(),
          model,
          type: 'image-to-image',
          sourceImageUrl,
          requestId: requestId || undefined,
          createdAt,
          rateLimitInfo: updatedRateLimitInfo,
          provider: 'internal-edit-fallback',
        })
      }
    }

    if (!allowLegacyFallback) {
      const configHint = !hasAlibabaKey
        ? 'No Alibaba provider key found. Add ALIBABA_API_KEY/DASHSCOPE_API_KEY.'
        : 'Alibaba provider returned no usable image output and internal fallback also failed.'
      return NextResponse.json(
        { error: 'Image transformation failed. Please try a different prompt or source image.', details: configHint },
        { status: 500 }
      )
    }

    const params = new URLSearchParams({
      prompt: prompt.trim(),
      image_url: sourceImageUrl,
      width: '1024',
      height: '1024',
    })
    const apiUrl = `https://zylalabs.com/api/10640/ai+image+generator+nano+banana+api/20189/image+to+image?${params.toString()}`

    let data: Record<string, unknown> | null = null
    let generatedImageUrl: string | null = null

    let response: Response | null = null
    if (apiKey) {
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: { Authorization: `Bearer ${apiKey}` },
      })
    }

    if (response?.ok) {
      data = await response.json()
      console.log('[Pictura] img2img response:', JSON.stringify(data).slice(0, 500))
      generatedImageUrl = extractImageUrl(data)
    } else if (response) {
      console.log('[Pictura] img2img GET failed:', response.status, await response.text().catch(() => ''))
    }

    if (!generatedImageUrl) {
      const configHint = !apiKey && !hasAlibabaKey
        ? 'No provider key found. Add ZYLABS_API_KEY or ALIBABA_API_KEY/DASHSCOPE_API_KEY.'
        : 'Providers returned no usable image output. Please retry with a clearer prompt and a high-quality image. Edit-route fallback also returned no result.'
      return NextResponse.json(
        { error: 'Image transformation failed. Please try a different prompt or image.', details: configHint, fallbackUsed: allowLegacyFallback },
        { status: 500 }
      )
    }

    const imageBuffer = await resolveGeneratedImageBuffer(generatedImageUrl)
    if (!imageBuffer) {
      return NextResponse.json({ error: 'Failed to download generated image' }, { status: 500 })
    }

    const timestamp = Date.now()
    const filename = `pictura/image-to-image/${timestamp}-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.png`

    const blob = await uploadObject(filename, imageBuffer, 'image/png')
    const createdAt = new Date().toISOString()

    await appendMediaToGallery(sessionId, {
      url: blob.url,
      prompt: prompt.trim(),
      type: 'image-to-image',
      mediaKind: 'image',
      sourceImageUrl,
      requestId: requestId || undefined,
      createdAt,
    })

    await incrementUsage(sessionId, { role: adminSession?.role, ...requestContext })
    const updatedRateLimitInfo = await getRateLimitInfo(sessionId, { role: adminSession?.role, ...requestContext })

    return NextResponse.json({
      url: blob.url,
      prompt: prompt.trim(),
      model,
      type: 'image-to-image',
      sourceImageUrl,
      requestId: requestId || undefined,
      createdAt,
      rateLimitInfo: updatedRateLimitInfo,
    })
  } catch (error) {
    console.error('Image-to-image generation error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

function extractImageUrl(data: Record<string, unknown>): string | null {
  if (data.image && typeof data.image === 'string') return data.image
  if (data.url && typeof data.url === 'string') return data.url
  if (data.output && typeof data.output === 'string') return data.output
  if (data.result && typeof data.result === 'string') return data.result
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    const first = data.images[0] as Record<string, unknown>
    if (typeof first.url === 'string') return first.url
    if (typeof first.src === 'string') return first.src
    if (typeof first.image === 'string') return first.image
  }
  const nested = data.data as Record<string, unknown> | undefined
  if (nested?.image && typeof nested.image === 'string') return nested.image
  if (nested?.url && typeof nested.url === 'string') return nested.url
  const nestedImgs = (nested?.images as Array<Record<string, string>>) || []
  if (nestedImgs[0]?.url) return nestedImgs[0].url
  return null
}
