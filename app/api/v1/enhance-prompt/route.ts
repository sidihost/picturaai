import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Use Mistral for prompt enhancement
async function enhanceWithMistral(prompt: string, style?: string): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) throw new Error('Mistral not configured')

  const systemPrompt = `You are an expert at enhancing image generation prompts. Your task is to take a simple prompt and expand it into a detailed, high-quality prompt that will produce amazing images.

Rules:
- Keep the original intent and subject
- Add specific details about lighting, composition, style, and quality
- Include technical terms that improve image quality (8k, detailed, professional, etc.)
- If a style is specified, incorporate it naturally
- Keep the enhanced prompt under 200 words
- Return ONLY the enhanced prompt, no explanations`

  const userPrompt = style 
    ? `Enhance this prompt for ${style} style: "${prompt}"`
    : `Enhance this prompt: "${prompt}"`

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  })

  if (!response.ok) throw new Error('Mistral failed')
  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() || prompt
}

// Use OpenAI for prompt enhancement
async function enhanceWithOpenAI(prompt: string, style?: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OpenAI not configured')

  const systemPrompt = `You are an expert at enhancing image generation prompts. Take simple prompts and expand them into detailed, high-quality prompts. Add specific details about lighting, composition, style, and quality. Keep enhanced prompts under 200 words. Return ONLY the enhanced prompt.`

  const userPrompt = style 
    ? `Enhance this prompt for ${style} style: "${prompt}"`
    : `Enhance this prompt: "${prompt}"`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  })

  if (!response.ok) throw new Error('OpenAI failed')
  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() || prompt
}

// Use Groq for fast prompt enhancement
async function enhanceWithGroq(prompt: string, style?: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('Groq not configured')

  const systemPrompt = `You are an expert at enhancing image generation prompts. Expand simple prompts into detailed, high-quality prompts with specific details about lighting, composition, and style. Keep it under 200 words. Return ONLY the enhanced prompt.`

  const userPrompt = style 
    ? `Enhance for ${style} style: "${prompt}"`
    : `Enhance: "${prompt}"`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  })

  if (!response.ok) throw new Error('Groq failed')
  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() || prompt
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
    const creditCost = 0.1 // Small cost for prompt enhancement

    if (credits < creditCost) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    }

    const body = await request.json()
    const { prompt, style } = body

    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    const startTime = Date.now()
    let enhancedPrompt: string | null = null
    const providers = [enhanceWithMistral, enhanceWithGroq, enhanceWithOpenAI]

    for (const provider of providers) {
      try {
        enhancedPrompt = await provider(prompt, style)
        break
      } catch (err) {
        console.error('Prompt enhancement provider failed:', err)
        continue
      }
    }

    if (!enhancedPrompt) {
      return NextResponse.json({ error: 'All providers failed' }, { status: 500 })
    }

    const generationTime = Date.now() - startTime

    await sql`UPDATE developers SET credits = credits - ${creditCost} WHERE id = ${developer_id}`
    await sql`
      INSERT INTO usage_analytics (developer_id, endpoint, prompt_length, generation_time_ms, credits_used, status)
      VALUES (${developer_id}, '/v1/enhance-prompt', ${prompt.length}, ${generationTime}, ${creditCost}, 'success')
    `

    return NextResponse.json({
      success: true,
      original_prompt: prompt,
      enhanced_prompt: enhancedPrompt,
      style: style || null,
      credits_used: creditCost,
      generation_time_ms: generationTime
    })

  } catch (error) {
    console.error('Prompt enhancement error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
