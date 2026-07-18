import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function verifySession(token: string): Promise<{ developerId: string } | null> {
  try {
    const sessions = await sql`
      SELECT developer_id, expires_at FROM developer_sessions
      WHERE session_token = ${token}
    `

    if (sessions.length === 0) return null
    const session = sessions[0]
    if (new Date(session.expires_at) <= new Date()) return null
    return { developerId: session.developer_id }
  } catch {
    return null
  }
}

function getTokenFromRequest(req: NextRequest): string | null {
  const cookieToken = req.cookies.get('pictura_session')?.value
  if (cookieToken) return cookieToken

  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.substring(7)

  return null
}

async function getAuthenticatedDeveloperId(req: NextRequest): Promise<string | null> {
  const token = getTokenFromRequest(req)
  if (!token) return null

  const session = await verifySession(token)
  if (!session) return null

  return session.developerId
}

export async function PATCH(req: NextRequest) {
  try {
    const developerId = await getAuthenticatedDeveloperId(req)
    if (!developerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name } = await req.json()
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const safeName = name.trim().slice(0, 80)

    await sql`
      UPDATE developers
      SET name = ${safeName}, full_name = ${safeName}
      WHERE id = ${developerId}
    `

    return NextResponse.json({ success: true, name: safeName })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const developerId = await getAuthenticatedDeveloperId(req)
    if (!developerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const deletedEmail = `deleted+${developerId.slice(0, 8)}-${Date.now()}@pictura.local`

    await sql`DELETE FROM developer_sessions WHERE developer_id = ${developerId}`
    await sql`UPDATE api_keys SET is_active = false WHERE developer_id = ${developerId}`
    await sql`
      UPDATE developers
      SET
        name = 'Deleted User',
        full_name = 'Deleted User',
        email = ${deletedEmail},
        credits = 0,
        credits_balance = 0,
        tier = 'free'
      WHERE id = ${developerId}
    `

    const response = NextResponse.json({ success: true })
    response.cookies.delete('pictura_session')
    return response
  } catch (error) {
    console.error('Delete profile error:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
