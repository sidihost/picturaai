import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { hashPassword } from '@/lib/email'

const sql = neon(process.env.DATABASE_URL!)

// Alibaba Cloud Model Studio (DashScope) - Text to Image
async function generateWithAlibaba(prompt: string, width: number, height: number): Promise<string> {
  const apiKey = process.env.ALIBABA_API_KEY || process.env.DASHSCOPE_API_KEY
  if (!apiKey) throw new Error('Alibaba/DashScope not configured')

  // Use Alibaba's image generation model
  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-to-image/generation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable', // Use async for better results
    },
    body: JSON.stringify({
      model: 'image-generation', // Alibaba's image generation model
      input: {
        prompt: prompt.trim(),
      },
      parameters: {
        size: `${width}x${height}`,
        n: 1,
        steps: 30,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Alibaba generation failed: ${response.status} - ${error}`)
  }

  const data = await response.json()
  
  // Handle async response
  if (data.request_id) {
    // Poll for result
    const result = await pollAlibabaGeneration(apiKey, data.request_id)
    return result
  }

  // Handle sync response
  if (data.output?.images?.[0]?.url) {
    return data.output.images[0].url
  }
  
  throw new Error('No image from Alibaba')
}

async function pollAlibabaGeneration(apiKey: string, requestId: string): Promise<string> {
  const maxAttempts = 30
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const response = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/services/aigc/text-to-image/generation/${requestId}`,
      {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      }
    )
    
    const data = await response.json()
    
    if (data.output?.images?.[0]?.url) {
      return data.output.images[0].url
    }
    
    if (data.code === 'Failed' || data.message?.includes('failed')) {
      throw new Error('Alibaba generation failed')
    }
  }
  
  throw new Error('Alibaba generation timeout')
}

// Mistral AI - Primary provider for Pictura 1.5
async function generateWithMistral(prompt: string, width: number, height: number): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) throw new Error('Mistral not configured')

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'pixtral-large-latest',
      messages: [{ role: 'user', content: `Generate an image (${width}x${height}): ${prompt.trim()}` }],
      tools: [{ type: 'image_generation' }],
      tool_choice: 'auto',
    }),
  })

  if (!response.ok) throw new Error('Mistral generation failed')
  const data = await response.json()
  const toolCalls = data.choices?.[0]?.message?.tool_calls
  if (toolCalls?.[0]?.function?.output) return toolCalls[0].function.output
  throw new Error('No image from Mistral')
}

// OpenAI DALL-E 3
async function generateWithOpenAI(prompt: string, width: number, height: number): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OpenAI not configured')

  const size = width === height ? '1024x1024' : width > height ? '1792x1024' : '1024x1792'
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'dall-e-3', prompt: prompt.trim(), n: 1, size }),
  })

  if (!response.ok) throw new Error('OpenAI generation failed')
  const data = await response.json()
  if (data.data?.[0]?.url) return data.data[0].url
  throw new Error('No image from OpenAI')
}

// Replicate
async function generateWithReplicate(prompt: string, width: number, height: number): Promise<string> {
  const apiKey = process.env.REPLICATE_API_TOKEN
  if (!apiKey) throw new Error('Replicate not configured')

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: { 'Authorization': `Token ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ version: 'black-forest-labs/flux-schnell', input: { prompt: prompt.trim(), width, height } }),
  })
  if (!response.ok) throw new Error('Replicate failed')
  const prediction = await response.json()
  
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 1000))
    const res = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, { headers: { 'Authorization': `Token ${apiKey}` } })
    const s = await res.json()
    if (s.status === 'succeeded' && s.output) return Array.isArray(s.output) ? s.output[0] : s.output
    if (s.status === 'failed') throw new Error('Replicate failed')
  }
  throw new Error('Replicate timed out')
}

// Together AI
async function generateWithTogether(prompt: string, width: number, height: number): Promise<string> {
  const apiKey = process.env.TOGETHER_API_KEY
  if (!apiKey) throw new Error('Together not configured')

  const response = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'black-forest-labs/FLUX.1-schnell-Free', prompt: prompt.trim(), width, height, n: 1 }),
  })
  if (!response.ok) throw new Error('Together failed')
  const data = await response.json()
  if (data.data?.[0]?.url) return data.data[0].url
  throw new Error('No image from Together')
}

// Fireworks AI
async function generateWithFireworks(prompt: string, width: number, height: number): Promise<string> {
  const apiKey = process.env.FIREWORKS_API_KEY
  if (!apiKey) throw new Error('Fireworks not configured')

  const response = await fetch('https://api.fireworks.ai/inference/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'accounts/fireworks/models/flux-1-schnell-fp8', prompt: prompt.trim(), n: 1, size: `${width}x${height}` }),
  })
  if (!response.ok) throw new Error('Fireworks failed')
  const data = await response.json()
  if (data.data?.[0]?.url) return data.data[0].url
  throw new Error('No image from Fireworks')
}

// DeepInfra
async function generateWithDeepInfra(prompt: string, width: number, height: number): Promise<string> {
  const apiKey = process.env.DEEPINFRA_API_KEY
  if (!apiKey) throw new Error('DeepInfra not configured')

  const response = await fetch('https://api.deepinfra.com/v1/inference/black-forest-labs/FLUX-1-schnell', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: prompt.trim(), width, height }),
  })
  if (!response.ok) throw new Error('DeepInfra failed')
  const data = await response.json()
  if (data.images?.[0]) return data.images[0]
  throw new Error('No image from DeepInfra')
}

// Fal AI
async function generateWithFal(prompt: string, width: number, height: number): Promise<string> {
  const apiKey = process.env.FAL_KEY
  if (!apiKey) throw new Error('Fal not configured')

  const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
    method: 'POST',
    headers: { 'Authorization': `Key ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: prompt.trim(), image_size: { width, height }, num_images: 1 }),
  })
  if (!response.ok) throw new Error('Fal failed')
  const data = await response.json()
  if (data.images?.[0]?.url) return data.images[0].url
  throw new Error('No image from Fal')
}

// HuggingFace
async function generateWithHuggingFace(prompt: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  if (!apiKey) throw new Error('HuggingFace not configured')

  const response = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: prompt.trim() }),
  })
  if (!response.ok) throw new Error('HuggingFace failed')
  const imageBlob = await response.arrayBuffer()
  return `data:image/png;base64,${Buffer.from(imageBlob).toString('base64')}`
}

// BFL (Black Forest Labs)
async function generateWithBFL(prompt: string, width: number, height: number): Promise<string> {
  const apiKey = process.env.BFL_API_KEY
  if (!apiKey) throw new Error('BFL not configured')

  const response = await fetch('https://api.bfl.ml/v1/flux-pro-1.1', {
    method: 'POST',
    headers: { 'X-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: prompt.trim(), width, height }),
  })
  if (!response.ok) throw new Error('BFL failed')
  const { id } = await response.json()
  
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 1000))
    const res = await fetch(`https://api.bfl.ml/v1/get_result?id=${id}`, { headers: { 'X-Key': apiKey } })
    const result = await res.json()
    if (result.status === 'Ready' && result.result?.sample) return result.result.sample
  }
  throw new Error('BFL timed out')
}

// Pictura AI Image Generation Engine (Internal)
// Uses all providers with automatic failover - Alibaba first for best quality
async function generateWithPicturaEngine(prompt: string, width: number, height: number, model?: string): Promise<string> {
  
  // If specific model requested, try that first
  if (model === 'qwen-image-2.0-pro') {
    try {
      return await generateWithQwen(prompt, width, height)
    } catch (err) {
      console.error('Qwen failed, trying other providers:', err)
    }
  }
  
  if (model === 'alibaba') {
    try {
      return await generateWithAlibaba(prompt, width, height)
    } catch (err) {
      console.error('Alibaba failed, trying other providers:', err)
    }
  }
  
  const providers = model === 'pi-1.5-turbo'
    ? [
        generateWithAlibaba,   // Alibaba
        generateWithZyLabs,    // ZyLabs
        generateWithStability, // Stability
        generateWithMistral,   // Mistral
      ]
    : model === 'pi-1.0'
      ? [
          generateWithLeonardo, // Leonardo
          generateWithZyLabs,   // ZyLabs
          generateWithMistral,  // Mistral
        ]
      : [
          generateWithStability,
          generateWithAlibaba,
          generateWithMistral,
          generateWithOpenAI,
          generateWithBFL,
          generateWithReplicate,
          generateWithLeonardo,
          generateWithFal,
          generateWithTogether,
          generateWithFireworks,
          generateWithDeepInfra,
          (p: string) => generateWithHuggingFace(p),
          generateWithZyLabs,
        ]
  
  for (const provider of providers) {
    try {
      return await provider(prompt, width, height)
    } catch (err) {
      console.error('Provider failed, trying next:', err)
      continue
    }
  }
  
  throw new Error('All generation providers failed')
}

// Stability AI
async function generateWithStability(prompt: string, width: number, height: number): Promise<string> {
  const apiKey = process.env.STABILITY_API_KEY
  if (!apiKey) throw new Error('Stability not configured')

  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt, weight: 1 }],
      cfg_scale: 7,
      width: Math.min(width, 1024),
      height: Math.min(height, 1024),
      samples: 1,
      steps: 30,
    }),
  })

  if (!response.ok) throw new Error('Stability generation failed')

  const data = await response.json()
  if (data.artifacts?.[0]?.base64) {
    return `data:image/png;base64,${data.artifacts[0].base64}`
  }
  throw new Error('No image from Stability')
}

// Leonardo AI
async function generateWithLeonardo(prompt: string, width: number, height: number): Promise<string> {
  const apiKey = process.env.LEONARDO_API_KEY
  if (!apiKey) throw new Error('Leonardo not configured')

  const createResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      modelId: '6b645e3a-d64f-4341-a6d8-7a3690fbf042',
      width: Math.min(width, 1024),
      height: Math.min(height, 1024),
      num_images: 1,
    }),
  })

  if (!createResponse.ok) throw new Error('Leonardo creation failed')

  const createData = await createResponse.json()
  const generationId = createData.sdGenerationJob?.generationId
  if (!generationId) throw new Error('No generation ID')

  // Poll for completion
  for (let i = 0; i < 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })
    if (!statusResponse.ok) continue
    const statusData = await statusResponse.json()
    const images = statusData.generations_by_pk?.generated_images
    if (images?.[0]?.url) return images[0].url
  }
  throw new Error('Leonardo timed out')
}

// ZyLabs
async function generateWithZyLabs(prompt: string, width: number, height: number): Promise<string> {
  const apiKey = process.env.ZYLABS_API_KEY
  if (!apiKey) throw new Error('ZyLabs not configured')

  const response = await fetch('https://api.zylabs.io/v1/image/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      width,
      height,
      model: 'stable-diffusion-xl',
    }),
  })

  if (!response.ok) throw new Error('ZyLabs generation failed')

  const data = await response.json()
  if (data.url || data.image_url) return data.url || data.image_url
  if (data.base64) return `data:image/png;base64,${data.base64}`
  throw new Error('No image from ZyLabs')
}

// Qwen Image 2.0 Pro via Alibaba Cloud Model Studio
async function generateWithQwen(prompt: string, width: number, height: number): Promise<string> {
  const apiKey = process.env.ALIBABA_API_KEY || process.env.DASHSCOPE_API_KEY
  if (!apiKey) throw new Error('Alibaba API not configured for Qwen')

  // Use Qwen's image generation model via Alibaba DashScope
  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-to-image/generation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: 'qwen-vl-plus', // Qwen vision model for image generation
      input: {
        prompt: prompt.trim(),
      },
      parameters: {
        size: `${width}x${height}`,
        n: 1,
        steps: 30,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Qwen failed: ${response.status} - ${error}`)
  }

  const data = await response.json()
  
  // Handle async response
  if (data.request_id) {
    return await pollQwenGeneration(apiKey, data.request_id)
  }

  // Handle sync response
  if (data.output?.images?.[0]?.url) {
    return data.output.images[0].url
  }
  
  throw new Error('No image from Qwen')
}

async function pollQwenGeneration(apiKey: string, requestId: string): Promise<string> {
  const maxAttempts = 30
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const response = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/services/aigc/text-to-image/generation/${requestId}`,
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    )
    
    const data = await response.json()
    
    if (data.output?.images?.[0]?.url) {
      return data.output.images[0].url
    }
    
    if (data.code === 'Failed') {
      throw new Error('Qwen generation failed')
    }
  }
  
  throw new Error('Qwen generation timeout')
}

// Cost per image in USD - very affordable!
const COST_PER_IMAGE_USD = 0.01

// Currency conversion rates (approximate)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  NGN: 1600,  // $0.01 = ~16 NGN, but we charge 5 NGN to be competitive
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.35,
  AUD: 1.53,
  ZAR: 19,
  KES: 129,
  GHS: 12.4,
  INR: 84,
  JPY: 150,
  BRL: 5,
}

// Price per image in local currency (keeping it affordable)
const LOCAL_PRICES: Record<string, number> = {
  USD: 0.01,
  NGN: 5,      // Very affordable - 5 naira per image
  GBP: 0.008,
  EUR: 0.009,
  CAD: 0.013,
  AUD: 0.015,
  ZAR: 0.19,
  KES: 1.29,
  GHS: 0.12,
  INR: 0.84,
  JPY: 1.5,
  BRL: 0.05,
}


function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Missing or invalid API key',
        code: 'unauthorized' 
      }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    const keyPrefix = apiKey.slice(0, 12)
    const keyHash = hashPassword(apiKey)
    
    // Find developer by API key
    const keyRecords = await sql`
      SELECT ak.id as key_id, ak.name as key_name, d.id as developer_id, d.full_name, d.credits_balance, d.currency
      FROM api_keys ak
      JOIN developers d ON ak.developer_id = d.id
      WHERE ak.key_prefix = ${keyPrefix} AND ak.key_hash = ${keyHash} AND ak.is_active = true
    `
    
    if (keyRecords.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid API key',
        code: 'invalid_key' 
      }, { status: 401 })
    }

    const { developer_id, full_name, credits_balance, currency } = keyRecords[0]

    // Parse request body
    const body = await request.json()
    const { prompt, model = 'pi-1.5-turbo', size = '1024x1024', negative_prompt } = body

    if (!prompt) {
      return NextResponse.json({ 
        error: 'Missing prompt parameter',
        code: 'missing_prompt' 
      }, { status: 400 })
    }

    // Calculate cost in user's currency
    const costInLocalCurrency = LOCAL_PRICES[currency] || COST_PER_IMAGE_USD
    
    if (credits_balance < costInLocalCurrency) {
      return NextResponse.json({ 
        error: 'Insufficient credits', 
        code: 'insufficient_credits',
        required: costInLocalCurrency,
        available: credits_balance,
        currency: currency
      }, { status: 402 })
    }

    // Parse size
    const [width, height] = size.split('x').map(Number)

    // Keep pi-1.5-turbo fast and intentionally pace pi-1.0 for product differentiation
    if (model === 'pi-1.0') {
      await sleep(2200)
    }

    // Generate image using Pictura AI Engine
    let imageUrl: string
    try {
      imageUrl = await generateWithPicturaEngine(prompt, width || 1024, height || 1024, model)
    } catch {
      return NextResponse.json({ 
        error: 'Image generation failed. Please try again.',
        code: 'generation_failed'
      }, { status: 500 })
    }

    const imageData = { url: imageUrl, id: `img_${Date.now()}` }

    // Deduct credits
    await sql`
      UPDATE developers 
      SET credits_balance = credits_balance - ${costInLocalCurrency},
          updated_at = NOW()
      WHERE id = ${developer_id}
    `

    // Log the API usage
    await sql`
      INSERT INTO api_usage (developer_id, endpoint, model, credits_used, request_data, response_status)
      VALUES (${developer_id}, '/v1/generate', ${model}, ${costInLocalCurrency}, ${JSON.stringify({ prompt, model, size })}, 'success')
    `

    // Get updated balance
    const updatedDev = await sql`SELECT credits_balance FROM developers WHERE id = ${developer_id}`
    const newBalance = updatedDev[0]?.credits_balance || 0

    // Log transaction
    await sql`
      INSERT INTO credit_transactions (developer_id, type, amount, usd_equivalent, description)
      VALUES (${developer_id}, 'api_usage', ${-costInLocalCurrency}, ${-COST_PER_IMAGE_USD}, ${'API generation: ' + prompt.slice(0, 50)})
    `

    return NextResponse.json({
      success: true,
      data: {
        id: imageData.id,
        url: imageUrl,
        prompt: prompt,
        model: model,
        size: size,
        created_at: new Date().toISOString(),
      },
      usage: {
        credits_used: costInLocalCurrency,
        credits_remaining: newBalance,
        currency: currency,
      }
    })

  } catch (error) {
    console.error('[Pictura] API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'internal_error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Also support GET for checking API status
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Pictura AI',
    version: 'v1',
    engine: 'Pictura Image Engine 1.5',
    endpoints: [
      { method: 'POST', path: '/v1/generate', description: 'Generate an image using Pictura AI' },
    ],
    models: [
      { id: 'pi-1.5-turbo', name: 'Pictura 1.5 Turbo', description: 'Fast, high-quality image generation' },
      { id: 'pi-1.0', name: 'Pictura 1.0', description: 'Balanced quality and speed' },
      { id: 'qwen-image-2.0-pro', name: 'Qwen Image 2.0 Pro', description: 'Advanced image generation with Qwen 2.0' },
      { id: 'alibaba', name: 'Alibaba Cloud', description: 'Alibaba Model Studio image generation' },
    ],
    pricing: {
      per_image_usd: COST_PER_IMAGE_USD,
      local_prices: LOCAL_PRICES,
    }
  })
}
