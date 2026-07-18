import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    
    // Validate API key
    const keyResult = await sql`
      SELECT ak.id, ak.developer_id, d.credits, d.tier
      FROM api_keys ak
      JOIN developers d ON ak.developer_id = d.id
      WHERE ak.key = ${apiKey} AND ak.is_active = true
    `

    if (keyResult.length === 0) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { developer_id, credits, tier } = keyResult[0]
    const body = await request.json()
    const { prompts, model = 'pi-1.0', style_preset, width = 1024, height = 1024 } = body

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json({ error: 'Prompts array is required' }, { status: 400 })
    }

    // Limit batch size based on tier
    const maxBatchSize = tier === 'enterprise' ? 50 : tier === 'pro' ? 20 : 10
    if (prompts.length > maxBatchSize) {
      return NextResponse.json({ 
        error: `Batch size exceeds limit. Max ${maxBatchSize} for ${tier} tier` 
      }, { status: 400 })
    }

    // Check credits (estimate 1 credit per image)
    const estimatedCost = prompts.length
    if (credits < estimatedCost) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: estimatedCost,
        available: credits
      }, { status: 402 })
    }

    // Create batch job
    const batchResult = await sql`
      INSERT INTO batch_jobs (developer_id, total_images, prompts, model, style_preset, width, height, status)
      VALUES (${developer_id}, ${prompts.length}, ${JSON.stringify(prompts)}, ${model}, ${style_preset || null}, ${width}, ${height}, 'pending')
      RETURNING id
    `

    const batchId = batchResult[0].id

    // Start processing in background (in production, use a queue like Vercel KV or similar)
    processBatchJob(batchId, developer_id, prompts, model, style_preset, width, height)

    return NextResponse.json({
      success: true,
      batch_id: batchId,
      status: 'pending',
      total_images: prompts.length,
      estimated_time_seconds: prompts.length * 5,
      status_url: `/api/v1/batch/${batchId}`
    })

  } catch (error) {
    console.error('Batch API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Background batch processing
async function processBatchJob(
  batchId: number,
  developerId: string,
  prompts: string[],
  model: string,
  stylePreset: string | null,
  width: number,
  height: number
) {
  try {
    await sql`UPDATE batch_jobs SET status = 'processing', started_at = NOW() WHERE id = ${batchId}`

    const results: { prompt: string; url?: string; error?: string }[] = []
    let completedCount = 0
    let failedCount = 0
    let totalCredits = 0

    for (const prompt of prompts) {
      try {
        // Call the internal generate endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/generate/text-to-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, model, style: stylePreset, width, height, internal: true, developerId })
        })

        if (response.ok) {
          const data = await response.json()
          results.push({ prompt, url: data.url })
          completedCount++
          totalCredits += 1
        } else {
          results.push({ prompt, error: 'Generation failed' })
          failedCount++
        }
      } catch {
        results.push({ prompt, error: 'Generation failed' })
        failedCount++
      }

      // Update progress
      await sql`
        UPDATE batch_jobs 
        SET completed_images = ${completedCount}, failed_images = ${failedCount}, results = ${JSON.stringify(results)}
        WHERE id = ${batchId}
      `
    }

    // Deduct credits
    await sql`UPDATE developers SET credits = credits - ${totalCredits} WHERE id = ${developerId}`

    // Mark as completed
    await sql`
      UPDATE batch_jobs 
      SET status = 'completed', completed_at = NOW(), credits_used = ${totalCredits}
      WHERE id = ${batchId}
    `

  } catch (error) {
    console.error('Batch processing error:', error)
    await sql`UPDATE batch_jobs SET status = 'failed', error_message = ${String(error)} WHERE id = ${batchId}`
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    
    const keyResult = await sql`
      SELECT ak.developer_id FROM api_keys ak
      WHERE ak.key = ${apiKey} AND ak.is_active = true
    `

    if (keyResult.length === 0) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { developer_id } = keyResult[0]

    // Get recent batch jobs
    const jobs = await sql`
      SELECT id, status, total_images, completed_images, failed_images, model, 
             credits_used, created_at, started_at, completed_at
      FROM batch_jobs
      WHERE developer_id = ${developer_id}
      ORDER BY created_at DESC
      LIMIT 20
    `

    return NextResponse.json({ jobs })

  } catch (error) {
    console.error('Batch list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
