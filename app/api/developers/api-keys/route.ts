import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'
import { hashPassword } from '@/lib/email'

const sql = neon(process.env.DATABASE_URL!)

async function verifySession(token: string): Promise<{ developerId: string } | null> {
  try {
    const sessions = await sql`
      SELECT developer_id FROM developer_sessions
      WHERE session_token = ${token} AND expires_at > now()
    `
    if (sessions.length === 0) return null
    return { developerId: sessions[0].developer_id }
  } catch {
    return null
  }
}

function getTokenFromRequest(req: NextRequest): string | null {
  // First try cookie
  const cookieToken = req.cookies.get('pictura_session')?.value
  if (cookieToken) return cookieToken
  
  // Then try Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}

function generateApiKey(): string {
  return 'pic_' + crypto.randomBytes(32).toString('hex')
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await verifySession(token)
    if (!session) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    const { name } = await req.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Generate API key
    const apiKey = generateApiKey()
    const keyPrefix = apiKey.slice(0, 12)
    const keyHash = hashPassword(apiKey)

    // Store the full key (secret_key) in database for display
    const keys = await sql`
      INSERT INTO api_keys (developer_id, name, key_prefix, key_hash, secret_key, is_active)
      VALUES (${session.developerId}, ${name}, ${keyPrefix}, ${keyHash}, ${apiKey}, true)
      RETURNING id, name, created_at
    `

    if (keys.length === 0) {
      return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
    }

    const key = keys[0]

    // Return the full API key only once - it cannot be retrieved later
    return NextResponse.json({
      success: true,
      id: key.id,
      name: key.name,
      key: apiKey, // Full key - only shown once!
      keyPreview: keyPrefix + '••••••••••••••••',
      createdAt: key.created_at,
      message: 'Save this key securely - it will not be shown again'
    })
  } catch (error) {
    console.error('API key creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await verifySession(token)
    if (!session) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    const keys = await sql`
      SELECT id, name, key_prefix, created_at, last_used_at, requests_count, is_active
      FROM api_keys
      WHERE developer_id = ${session.developerId}
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      keys: keys.map(k => ({
        id: k.id,
        name: k.name,
        keyPreview: k.key_prefix + '••••••••••••••••',
        createdAt: k.created_at,
        lastUsed: k.last_used_at,
        requestsCount: k.requests_count || 0,
        isActive: k.is_active !== false,
      }))
    })
  } catch (error) {
    console.error('API keys list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await verifySession(token)
    if (!session) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 })
    }

    // Actually delete the key (not just deactivate)
    const result = await sql`
      DELETE FROM api_keys 
      WHERE id = ${keyId} AND developer_id = ${session.developerId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'API key deleted' })
  } catch (error) {
    console.error('API key deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
