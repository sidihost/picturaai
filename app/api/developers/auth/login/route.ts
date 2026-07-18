import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { verifyPassword, generateToken } from '@/lib/email'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Please enter both email and password' }, { status: 400 })
    }

    const developers = await sql`
      SELECT id, email, password_hash, full_name, name, credits_balance, currency
      FROM developers
      WHERE email = ${email.toLowerCase()}
    `

    if (developers.length === 0) {
      return NextResponse.json({ error: 'No account found with this email. Please sign up first.' }, { status: 401 })
    }

    const developer = developers[0]

    if (!developer.password_hash) {
      return NextResponse.json({ error: 'Please complete your registration first' }, { status: 401 })
    }

    const passwordMatch = verifyPassword(password, developer.password_hash)

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 })
    }

    const token = generateToken(32)
    
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)
    
    await sql`
      INSERT INTO developer_sessions (developer_id, session_token, expires_at)
      VALUES (${developer.id}, ${token}, ${expiresAt.toISOString()})
    `

    // Update last login
    await sql`UPDATE developers SET last_login = NOW() WHERE id = ${developer.id}`

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      token,
      developer: {
        id: developer.id,
        email: developer.email,
        name: developer.full_name || developer.name,
        creditsBalance: parseFloat(developer.credits_balance) || 0,
        currency: developer.currency || 'USD',
      },
    })

    // Set HTTP-only cookie for persistent auth (30 days)
    response.cookies.set('pictura_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
