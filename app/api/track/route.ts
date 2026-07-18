import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { path, referrer, userAgent } = await request.json()

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 })
    }

    await sql`
      INSERT INTO page_visits (path, referrer, user_agent)
      VALUES (${path}, ${referrer || null}, ${userAgent || null})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Tracking error:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}
