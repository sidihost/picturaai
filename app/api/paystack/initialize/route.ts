import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Verify session helper
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

    const { amount, credits, planName, email, name } = await req.json()

    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Minimum amount is 100 NGN' }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
    }

    const reference = `PICTURA-${session.developerId.substring(0, 8)}-${Date.now()}-${Math.random().toString(36).substring(7)}`

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${paystackSecretKey}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // Paystack uses kobo (1 NGN = 100 kobo)
        email: email,
        reference: reference,
        currency: 'NGN',
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://picturaai.sbs'}/developers/dashboard?payment=success`,
        metadata: {
          developer_id: session.developerId,
          credits: credits,
          plan_name: planName,
          custom_fields: [
            { display_name: 'Plan', variable_name: 'plan', value: planName },
            { display_name: 'Credits', variable_name: 'credits', value: credits.toString() },
            { display_name: 'Customer', variable_name: 'customer', value: name || email },
          ]
        }
      }),
    })

    const data = await response.json()

    if (data.status && data.data?.authorization_url) {
      // Store pending transaction
      await sql`
        INSERT INTO credit_transactions (developer_id, type, amount, description, balance_after)
        SELECT ${session.developerId}, 'pending', ${credits}, ${`Pending: ${planName} (${reference})`}, credits_balance
        FROM developers WHERE id = ${session.developerId}
      `.catch(() => {})

      return NextResponse.json({
        success: true,
        authorizationUrl: data.data.authorization_url,
        reference: data.data.reference,
        accessCode: data.data.access_code,
      })
    } else {
      console.error('Paystack error:', data)
      return NextResponse.json(
        { error: data.message || 'Payment initialization failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { error: 'An error occurred while initializing payment' },
      { status: 500 }
    )
  }
}
