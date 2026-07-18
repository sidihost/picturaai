import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { sendOTPEmail, generateOTP, hashPassword } from '@/lib/email'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password, country, currency, phoneNumber, referralSource, promoCode } = await request.json()

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const emailLower = email.toLowerCase().trim()

    // Check if developer already exists
    const existing = await sql`
      SELECT id FROM developers WHERE email = ${emailLower}
    `
    
    if (existing.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists. Please sign in instead.' }, { status: 400 })
    }

    // Generate OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Hash password
    const hashedPassword = hashPassword(password)

    // Store in otp_verification table
    try {
      await sql`
        INSERT INTO otp_verification (
          email, full_name, password_hash, country_code, currency, phone,
          referral_source, promo_code, otp_code, expires_at, verified
        ) VALUES (
          ${emailLower}, ${fullName}, ${hashedPassword}, ${country || 'US'},
          ${currency || 'USD'}, ${phoneNumber || null}, ${referralSource || null},
          ${promoCode ? promoCode.toUpperCase() : null}, ${otp}, ${otpExpiry}, false
        )
        ON CONFLICT (email) DO UPDATE SET
          full_name = ${fullName},
          password_hash = ${hashedPassword},
          country_code = ${country || 'US'},
          currency = ${currency || 'USD'},
          phone = ${phoneNumber || null},
          referral_source = ${referralSource || null},
          promo_code = ${promoCode ? promoCode.toUpperCase() : null},
          otp_code = ${otp},
          expires_at = ${otpExpiry},
          verified = false
      `
    } catch {
      return NextResponse.json({ error: 'Database error. Please try again.' }, { status: 500 })
    }

    // Send OTP email
    const emailResult = await sendOTPEmail(emailLower, fullName.split(' ')[0], otp)
    
    if (!emailResult.success) {
      return NextResponse.json({ error: 'Failed to send verification email. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Verification code sent to your email' })
  } catch (error) {
    console.error('Request OTP error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
