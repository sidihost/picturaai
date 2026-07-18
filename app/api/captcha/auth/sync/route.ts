import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'
import { sendCaptchaWelcomeEmail } from '@/lib/email'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { developerId } = await request.json()

    if (!developerId) {
      return NextResponse.json({ error: 'Developer ID required' }, { status: 400 })
    }

    // Verify developer exists
    const developers = await sql`
      SELECT id, name, email FROM developers WHERE id = ${developerId}
    `

    if (developers.length === 0) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    const developer = developers[0]

    // Set CAPTCHA session cookie
    const cookieStore = await cookies()
    cookieStore.set('captcha_session', JSON.stringify({
      developerId: developer.id,
      email: developer.email,
      name: developer.name,
      connectedAt: new Date().toISOString()
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    // Send welcome email to CAPTCHA (async, don't block response)
    sendCaptchaWelcomeEmail(developer.email, developer.name).catch(err => {
      console.error('Failed to send CAPTCHA welcome email:', err)
    })

    return NextResponse.json({
      success: true,
      developer: {
        id: developer.id,
        name: developer.name,
        email: developer.email
      }
    })
  } catch (error) {
    console.error('CAPTCHA auth sync error:', error)
    return NextResponse.json({ error: 'Failed to sync account' }, { status: 500 })
  }
}
