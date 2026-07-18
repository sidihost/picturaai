import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const developerCookie = cookieStore.get('developer_session')
    
    if (!developerCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const developerId = developerCookie.value
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'

    // Calculate date range
    const now = new Date()
    let startDate: Date
    switch (range) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Overview stats
    const overviewResult = await sql`
      SELECT 
        COUNT(*)::int as total_requests,
        COALESCE(SUM(credits_used), 0)::float as total_credits_used,
        COALESCE(AVG(generation_time_ms), 0)::float as avg_generation_time,
        COALESCE(
          COUNT(CASE WHEN status = 'success' THEN 1 END)::float / 
          NULLIF(COUNT(*)::float, 0) * 100, 
          0
        )::float as success_rate
      FROM usage_analytics
      WHERE developer_id = ${developerId}
        AND created_at >= ${startDate.toISOString()}
    `

    // Daily usage
    const dailyUsage = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*)::int as requests,
        COALESCE(SUM(credits_used), 0)::float as credits
      FROM usage_analytics
      WHERE developer_id = ${developerId}
        AND created_at >= ${startDate.toISOString()}
      GROUP BY DATE(created_at)
      ORDER BY date
    `

    // Endpoint breakdown
    const endpointBreakdown = await sql`
      SELECT 
        endpoint,
        COUNT(*)::int as count,
        COALESCE(SUM(credits_used), 0)::float as credits
      FROM usage_analytics
      WHERE developer_id = ${developerId}
        AND created_at >= ${startDate.toISOString()}
      GROUP BY endpoint
      ORDER BY count DESC
      LIMIT 10
    `

    // Model usage
    const modelUsage = await sql`
      SELECT 
        COALESCE(model, 'unknown') as model,
        COUNT(*)::int as count
      FROM usage_analytics
      WHERE developer_id = ${developerId}
        AND created_at >= ${startDate.toISOString()}
      GROUP BY model
      ORDER BY count DESC
    `

    // Hourly distribution
    const hourlyDistribution = await sql`
      SELECT 
        EXTRACT(HOUR FROM created_at)::int as hour,
        COUNT(*)::int as count
      FROM usage_analytics
      WHERE developer_id = ${developerId}
        AND created_at >= ${startDate.toISOString()}
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour
    `

    // Recent requests
    const recentRequests = await sql`
      SELECT endpoint, status, credits_used, generation_time_ms, created_at
      FROM usage_analytics
      WHERE developer_id = ${developerId}
      ORDER BY created_at DESC
      LIMIT 20
    `

    return NextResponse.json({
      overview: overviewResult[0] || {
        total_requests: 0,
        total_credits_used: 0,
        avg_generation_time: 0,
        success_rate: 0
      },
      daily_usage: dailyUsage,
      endpoint_breakdown: endpointBreakdown,
      model_usage: modelUsage,
      hourly_distribution: hourlyDistribution,
      recent_requests: recentRequests
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
