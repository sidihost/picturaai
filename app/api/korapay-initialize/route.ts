import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, email, name } = body

    if (!amount || amount < 2000) {
      return NextResponse.json(
        { error: 'Minimum donation amount is 2,000 NGN' },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    const response = await fetch('https://api.korapay.com/merchant/api/v1/charges/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KORAPAY_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'NGN',
        reference: `PICTURA-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        narration: `Support Pictura - NGN ${amount.toLocaleString()} donation`,
        channels: ['card', 'bank_transfer', 'mobile_money'],
        default_channel: 'card',
        customer: {
          name: name || 'Pictura Supporter',
          email: email,
        },
        metadata: {
          campaign: 'pictura-support',
          source: 'website',
        },
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://picturaai.sbs'}/api/korapay-webhook`,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://picturaai.sbs'}/support?status=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://picturaai.sbs'}/support?status=cancelled`,
      }),
    })

    const data = await response.json()

    if (data.status && data.data?.checkout_url) {
      return NextResponse.json({
        success: true,
        checkoutUrl: data.data.checkout_url,
        reference: data.data.reference,
      })
    } else {
      console.error('Korapay error:', data)
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
