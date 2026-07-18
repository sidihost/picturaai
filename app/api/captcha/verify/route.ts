import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not configured')
  return neon(url)
}

function corsHeaders(origin: string | null) {
  return {
    'access-control-allow-origin': origin || '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'Content-Type, Authorization',
    Vary: 'Origin',
  }
}

function parseHostname(input: string | null): string | null {
  if (!input) return null
  try {
    return new URL(input).hostname.toLowerCase()
  } catch {
    return input.toLowerCase().replace(/^https?:\/\//, '').split('/')[0]
  }
}

function domainMatches(allowedDomainRaw: string, requestOrigin: string | null, referer: string | null): boolean {
  if (!allowedDomainRaw) return true

  const requestHost = parseHostname(requestOrigin) || parseHostname(referer)
  if (!requestHost) return true

  const allowedDomains = allowedDomainRaw
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean)
    .map((d) => d.replace(/^https?:\/\//, '').replace(/\/$/, ''))

  if (allowedDomains.length === 0) return true

  return allowedDomains.some((allowed) => requestHost === allowed || requestHost.endsWith(`.${allowed}`))
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) })
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  const referer = req.headers.get('referer')
  const headers = corsHeaders(origin)

  try {
    const sql = getDb()
    const { token, secret } = await req.json()

    if (!token || !secret) {
      return NextResponse.json(
        { success: false, error: 'Token and secret are required' },
        { status: 400, headers }
      )
    }

    const secretHash = crypto.createHash('sha256').update(secret).digest('hex')

    try {
      await sql`
        CREATE TABLE IF NOT EXISTS captcha_sites (
          id SERIAL PRIMARY KEY,
          developer_id INTEGER,
          email VARCHAR(255),
          site_name VARCHAR(255) NOT NULL,
          domain VARCHAR(255) NOT NULL,
          site_key VARCHAR(64) UNIQUE NOT NULL,
          secret_key VARCHAR(64),
          secret_hash VARCHAR(64) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          challenges_solved INTEGER DEFAULT 0,
          challenges_failed INTEGER DEFAULT 0
        )
      `
    } catch {
      // table exists
    }

    let site
    try {
      site = await sql`
        SELECT id, domain, is_active FROM captcha_sites
        WHERE secret_key = ${secret} OR secret_hash = ${secretHash}
      `
    } catch {
      site = await sql`
        SELECT id, domain, is_active FROM captcha_sites
        WHERE secret_hash = ${secretHash}
      `
    }

    if (site.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid secret key' }, { status: 401, headers })
    }

    if (!site[0].is_active) {
      return NextResponse.json({ success: false, error: 'This CAPTCHA site is inactive' }, { status: 403, headers })
    }

    if (!domainMatches(site[0].domain, origin, referer)) {
      return NextResponse.json({ success: false, error: 'Domain mismatch for this CAPTCHA secret' }, { status: 403, headers })
    }

    try {
      let decoded: { t: number; s?: string; v: boolean; i?: number; steps?: number; r?: string }

      try {
        decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      } catch {
        if (token.startsWith('pictura_') && token.endsWith('_verified')) {
          const parts = token.split('_')
          decoded = { t: parseInt(parts[1], 10), s: parts[2], v: true }
        } else {
          throw new Error('Invalid token format')
        }
      }

      const tokenAge = Date.now() - decoded.t
      if (tokenAge > 5 * 60 * 1000) {
        await sql`
          UPDATE captcha_sites
          SET challenges_failed = COALESCE(challenges_failed, 0) + 1
          WHERE id = ${site[0].id}
        `

        return NextResponse.json({ success: false, error: 'Token expired' }, { status: 400, headers })
      }

      if (!decoded.v) {
        await sql`
          UPDATE captcha_sites
          SET challenges_failed = COALESCE(challenges_failed, 0) + 1
          WHERE id = ${site[0].id}
        `

        return NextResponse.json({ success: false, error: 'Verification not completed' }, { status: 400, headers })
      }

      await sql`
        UPDATE captcha_sites
        SET challenges_solved = COALESCE(challenges_solved, 0) + 1
        WHERE id = ${site[0].id}
      `

      return NextResponse.json(
        {
          success: true,
          hostname: site[0].domain,
          challenge_ts: new Date(decoded.t).toISOString(),
          interactions: decoded.i || 0,
          steps_completed: decoded.steps || 1,
        },
        { headers }
      )
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid token format' }, { status: 400, headers })
    }
  } catch (error) {
    console.error('CAPTCHA verification error:', error)
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500, headers })
  }
}
