import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    // Get token from cookie or header
    const cookieToken = req.cookies.get('pictura_session')?.value
    const authHeader = req.headers.get('authorization')
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    const token = cookieToken || headerToken

    if (token) {
      // Delete the session from database
      await sql`DELETE FROM developer_sessions WHERE session_token = ${token}`
    }

    // Clear the cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set('pictura_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
