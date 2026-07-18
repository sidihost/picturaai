import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'

const sql = neon(process.env.DATABASE_URL!)

function generateKey(prefix: string, length: number = 32): string {
  return `${prefix}_${crypto.randomBytes(length).toString('hex').slice(0, length)}`
}

export async function POST(req: NextRequest) {
  try {
    const { email, siteName, domain } = await req.json()

    if (!email || !siteName || !domain) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Clean domain (remove protocol and trailing slashes)
    const cleanDomain = domain.toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .replace(/^www\./, '')

    // Generate keys with pic_ prefix
    const siteKey = generateKey('pic', 24)
    const secretKey = generateKey('pic', 32)
    const secretHash = crypto.createHash('sha256').update(secretKey).digest('hex')

    // Store in database (both secret_key and secret_hash)
    await sql`
      INSERT INTO captcha_sites (
        email,
        site_name,
        domain,
        site_key,
        secret_key,
        secret_hash,
        created_at
      ) VALUES (
        ${email.toLowerCase()},
        ${siteName},
        ${cleanDomain},
        ${siteKey},
        ${secretKey},
        ${secretHash},
        NOW()
      )
    `

    return NextResponse.json({
      success: true,
      siteKey,
      secretKey,
      domain: cleanDomain
    })
  } catch (error) {
    console.error('CAPTCHA site creation error:', error)
    return NextResponse.json({ error: 'Failed to create site' }, { status: 500 })
  }
}
