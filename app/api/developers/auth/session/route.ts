import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Try cookie first
    const cookieStore = await cookies()
    let sessionToken = cookieStore.get('pictura_session')?.value
    
    // Fallback to Authorization header
    if (!sessionToken) {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7)
      }
    }

    if (!sessionToken) {
      return NextResponse.json({ 
        authenticated: false, 
        developer: null 
      })
    }

    // Verify session token and get developer info
    const sessions = await sql`
      SELECT s.*, d.id as developer_id, d.name, d.email, d.credits_balance, d.currency
      FROM developer_sessions s
      JOIN developers d ON s.developer_id = d.id
      WHERE s.session_token = ${sessionToken} 
      AND s.expires_at > NOW()
    `

    if (sessions.length === 0) {
      // Invalid or expired session
      return NextResponse.json({ 
        authenticated: false, 
        developer: null 
      })
    }

    const session = sessions[0]

    return NextResponse.json({
      authenticated: true,
      developer: {
        id: session.developer_id,
        name: session.name,
        email: session.email,
        credits: session.credits_balance,
        currency: session.currency
      }
    })

  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ 
      authenticated: false, 
      developer: null,
      error: 'Failed to verify session'
    })
  }
}
