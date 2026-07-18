import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Auto-migrate database schema - add columns if they don't exist
async function migrateSchema() {
  try {
    // Add signup_method column to developers table if it doesn't exist
    await sql`ALTER TABLE developers ADD COLUMN IF NOT EXISTS signup_method VARCHAR(50) DEFAULT 'pictura'`
  } catch (e) {
    // Column might already exist, ignore
  }
}

// Run migration on module load
migrateSchema()

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify session token and get developer info
    const sessions = await sql`
      SELECT s.developer_id, d.id, d.name, d.email, d.full_name, d.credits_balance, d.currency, d.signup_method
      FROM developer_sessions s
      JOIN developers d ON s.developer_id = d.id
      WHERE s.session_token = ${sessionToken} 
      AND s.expires_at > NOW()
    `

    if (sessions.length === 0) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    const dev = sessions[0]

    return NextResponse.json({
      developer: {
        id: dev.id,
        name: dev.name || dev.full_name,
        email: dev.email,
        credits: dev.credits_balance,
        currency: dev.currency,
        signupMethod: dev.signup_method || 'pictura'
      }
    })

  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
  }
}
