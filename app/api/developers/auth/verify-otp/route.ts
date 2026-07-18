import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { sendWelcomeEmail, generateToken, hashPassword } from '@/lib/email'

const sql = neon(process.env.DATABASE_URL!)

// Free credits for developers to start building
const CURRENCY_CREDITS: Record<string, number> = {
  NGN: 1000,   // ₦1,000 free credits
  USD: 2,      // $2 free credits
  GBP: 1.60,   // £1.60 free credits
  EUR: 1.80,   // €1.80 free credits
  CAD: 2.60,   // C$2.60 free credits
  AUD: 3,      // A$3 free credits
  INR: 168,    // ₹168 free credits
  ZAR: 38,     // R38 free credits
  KES: 258,    // KSh258 free credits
  GHS: 24,     // GH₵24 free credits
  JPY: 300,    // ¥300 free credits
  BRL: 10,     // R$10 free credits
}

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 })
    }

    // Verify OTP and get stored data
    const otpRecord = await sql`
      SELECT * FROM otp_verification 
      WHERE email = ${email.toLowerCase()} 
      AND otp_code = ${otp} 
      AND expires_at > NOW()
      AND verified = false
    `

    if (otpRecord.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 })
    }

    const record = otpRecord[0]

    // Check if email already registered
    const existing = await sql`SELECT id FROM developers WHERE email = ${email.toLowerCase()}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Get credits for currency (100 free images equivalent)
    const currency = record.currency || 'USD'
    const baseCredits = Number(CURRENCY_CREDITS[currency] || CURRENCY_CREDITS['USD'])
    const credits = Number.isFinite(baseCredits) ? baseCredits : Number(CURRENCY_CREDITS['USD'])
    let bonusCredits = 0
    let promoCodeUsed = ''

    // Check for promo code and apply bonus credits
    if (record.promo_code) {
      const promoColumns = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'promo_codes'
      `
      const promoColumnSet = new Set(promoColumns.map((column) => column.column_name))
      const hasUsesCountColumn = promoColumnSet.has('uses_count')
      const hasMaxUsesColumn = promoColumnSet.has('max_uses')
      const hasExpiresAtColumn = promoColumnSet.has('expires_at')

      let promoResult

      if (hasUsesCountColumn && hasMaxUsesColumn && hasExpiresAtColumn) {
        promoResult = await sql`
          SELECT * FROM promo_codes
          WHERE code = ${record.promo_code.toUpperCase()}
            AND is_active = true
            AND (max_uses IS NULL OR uses_count < max_uses)
            AND (expires_at IS NULL OR expires_at > NOW())
        `
      } else if (hasUsesCountColumn && hasMaxUsesColumn) {
        promoResult = await sql`
          SELECT * FROM promo_codes
          WHERE code = ${record.promo_code.toUpperCase()}
            AND is_active = true
            AND (max_uses IS NULL OR uses_count < max_uses)
        `
      } else if (hasExpiresAtColumn) {
        promoResult = await sql`
          SELECT * FROM promo_codes
          WHERE code = ${record.promo_code.toUpperCase()}
            AND is_active = true
            AND (expires_at IS NULL OR expires_at > NOW())
        `
      } else {
        promoResult = await sql`
          SELECT * FROM promo_codes
          WHERE code = ${record.promo_code.toUpperCase()}
            AND is_active = true
        `
      }
      
      if (promoResult.length > 0) {
        const promo = promoResult[0]
        const promoBonusValue = Number(promo.bonus_credits)

        if (Number.isFinite(promoBonusValue)) {
          bonusCredits = promoBonusValue
          promoCodeUsed = promo.code
        }
        
        // Increment promo code usage only when legacy DB has uses_count column
        if (hasUsesCountColumn) {
          await sql`UPDATE promo_codes SET uses_count = uses_count + 1 WHERE id = ${promo.id}`
        }
      }
    }

    const totalCredits = credits + bonusCredits

    // Create developer account (signup_method = 'pictura' for OTP signup)
    const developer = await sql`
      INSERT INTO developers (
        name,
        email,
        password_hash,
        phone,
        country_code,
        currency,
        credits_balance,
        email_verified,
        referral_source,
        promo_code_used,
        bonus_credits,
        signup_method
      )
      VALUES (
        ${record.full_name},
        ${email.toLowerCase()},
        ${record.password_hash},
        ${record.phone || ''},
        ${record.country_code || 'US'},
        ${currency},
        ${totalCredits},
        true,
        ${record.referral_source || ''},
        ${promoCodeUsed},
        ${bonusCredits},
        'pictura'
      )
      RETURNING id, email, name, credits_balance, currency
    `

    if (developer.length === 0) {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    const dev = developer[0]

    // Generate first API key automatically
    const apiKey = `pk_live_${generateToken(24)}`
    const keyHash = hashPassword(apiKey)
    
    const apiKeysColumns = await sql`
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'api_keys' AND column_name = 'secret_key'
      LIMIT 1
    `

    if (apiKeysColumns.length > 0) {
      await sql`
        INSERT INTO api_keys (developer_id, key_hash, key_prefix, name, secret_key)
        VALUES (${dev.id}, ${keyHash}, ${apiKey.slice(0, 12)}, 'Default Key', ${apiKey})
      `
    } else {
      await sql`
        INSERT INTO api_keys (developer_id, key_hash, key_prefix, name)
        VALUES (${dev.id}, ${keyHash}, ${apiKey.slice(0, 12)}, 'Default Key')
      `
    }

    // Log credit transaction for base credits
    await sql`
      INSERT INTO credit_transactions (
        developer_id,
        type,
        amount,
        description,
        balance_after
      )
      VALUES (
        ${dev.id},
        'signup_bonus',
        ${credits},
        'Welcome bonus - 100 free images to get started',
        ${credits}
      )
    `

    // Log bonus credits if promo code was used
    if (bonusCredits > 0) {
      await sql`
        INSERT INTO credit_transactions (
          developer_id,
          type,
          amount,
          description,
          balance_after
        )
        VALUES (
          ${dev.id},
          'promo',
          ${bonusCredits},
          ${`Promo code ${promoCodeUsed} - Bonus credits`},
          ${totalCredits}
        )
      `
    }

    // Mark OTP as verified and delete
    await sql`DELETE FROM otp_verification WHERE email = ${email.toLowerCase()}`

    // Send welcome email
    await sendWelcomeEmail(email.toLowerCase(), record.full_name, credits, currency)

    // Create session token
    const sessionToken = generateToken(32)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await sql`
      INSERT INTO developer_sessions (developer_id, session_token, expires_at)
      VALUES (${dev.id}, ${sessionToken}, ${expiresAt})
    `

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: bonusCredits > 0 
        ? `Account created! Welcome bonus + ${bonusCredits} promo credits applied!` 
        : 'Account created successfully! Welcome to Pictura.',
      sessionToken,
      apiKey, // Shown once - won't be displayed again
      bonusCredits: bonusCredits > 0 ? bonusCredits.toString() : null,
      promoCode: promoCodeUsed || null,
      developer: {
        id: dev.id,
        name: dev.name,
        email: dev.email,
        credits: dev.credits_balance,
        currency: dev.currency,
      },
    })

    // Set HTTP-only cookie for persistent auth (30 days)
    response.cookies.set('pictura_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    return response
  } catch (error: unknown) {
    console.error('OTP verification error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Something went wrong: ${errorMessage}` }, { status: 500 })
  }
}
