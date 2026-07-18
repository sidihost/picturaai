import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, email, name, captchaToken } = body

    if (!amount || amount < 1000) {
      return NextResponse.json(
        { error: 'Minimum donation amount is 1,000 NGN' },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    if (!captchaToken) {
      return NextResponse.json(
        { error: 'Please complete the CAPTCHA verification' },
        { status: 400 }
      )
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      )
    }

    const reference = `PICTURA-DONATE-${Date.now()}-${Math.random().toString(36).substring(7)}`

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${paystackSecretKey}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // Paystack uses kobo
        currency: 'NGN',
        email: email,
        reference: reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://picturaai.sbs'}/support?status=success`,
        metadata: {
          type: 'donation',
          donor_name: name || 'Pictura Supporter',
          custom_fields: [
            { display_name: 'Donation Type', variable_name: 'type', value: 'Support Pictura' },
            { display_name: 'Donor', variable_name: 'donor', value: name || email },
          ]
        }
      }),
    })

    const data = await response.json()

    if (data.status && data.data?.authorization_url) {
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
