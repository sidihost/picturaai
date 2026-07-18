import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check if already subscribed
    const existing = await sql`
      SELECT id FROM newsletter_subscribers WHERE email = ${email.toLowerCase()}
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: 'You are already subscribed!' }, { status: 409 })
    }

    // Insert new subscriber
    await sql`
      INSERT INTO newsletter_subscribers (email) VALUES (${email.toLowerCase()})
    `

    return NextResponse.json({ success: true, message: 'Successfully subscribed!' })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    )
  }
}
