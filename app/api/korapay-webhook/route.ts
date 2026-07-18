import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL || 'info@picturaai.sbs',
    pass: process.env.ZOHO_PASSWORD || '',
  },
})

function generateDonorEmailHtml(name: string, amount: number, reference: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #faf8f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #C87941 0%, #A0522D 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 28px;">Thank You!</h1>
    </div>
    <div style="background: #fff; border-radius: 0 0 16px 16px; padding: 32px; border: 1px solid #e5e5e5; border-top: none;">
      <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
        Dear ${name},
      </p>
      <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
        Thank you for your generous donation to Pictura! Your support means the world to us and helps us continue building amazing AI tools for creators worldwide.
      </p>
      <div style="background: #faf8f5; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="color: #666; font-size: 13px; margin: 0 0 8px;">Donation Amount</p>
        <p style="color: #C87941; font-size: 28px; font-weight: 700; margin: 0;">&#8358;${amount.toLocaleString()}</p>
        <p style="color: #999; font-size: 12px; margin: 8px 0 0;">Reference: ${reference}</p>
      </div>
      <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 24px 0 0;">
        With gratitude,<br>
        <strong style="color: #1a1a1a;">The Pictura Team</strong>
      </p>
    </div>
    <p style="color: #999; font-size: 12px; text-align: center; margin: 24px 0 0;">
      Pictura by Imoogle | info@picturaai.sbs
    </p>
  </div>
</body>
</html>
  `
}

function generateAdminEmailHtml(name: string, email: string, amount: number, reference: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: #1a1a1a; border-radius: 16px 16px 0 0; padding: 24px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 20px;">New Donation Received</h1>
    </div>
    <div style="background: #fff; border-radius: 0 0 16px 16px; padding: 24px; border: 1px solid #e5e5e5; border-top: none;">
      <div style="background: #C87941; color: #fff; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 14px;">Amount</p>
        <p style="margin: 4px 0 0; font-size: 32px; font-weight: 700;">&#8358;${amount.toLocaleString()}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Donor Name</td><td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right; font-weight: 600;">${name}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Email</td><td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${email}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Reference</td><td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right; font-family: monospace;">${reference}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Date</td><td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${new Date().toLocaleString()}</td></tr>
      </table>
    </div>
  </div>
</body>
</html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify webhook signature (Korapay sends X-Korapay-Signature header)
    const signature = request.headers.get('X-Korapay-Signature')
    const webhookSecret = process.env.KORAPAY_WEBHOOK_SECRET || ''

    if (webhookSecret && signature) {
      // In production, verify the HMAC signature
      const crypto = await import('crypto')
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(body))
        .digest('hex')
      
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const { event, data } = body

    // Handle successful payment
    if (event === 'charge.success') {
      const { reference, amount, currency, customer } = data
      const customerName = customer?.name || 'Pictura Supporter'
      const customerEmail = customer?.email || ''

      console.log('Payment successful:', { reference, amount, currency })

      // Send confirmation email to donor
      if (customerEmail && customerEmail !== 'supporter@picturaai.sbs') {
        try {
          await transporter.sendMail({
            from: `Pictura <${process.env.ZOHO_EMAIL || 'info@picturaai.sbs'}>`,
            to: customerEmail,
            subject: `Thank you for supporting Pictura!`,
            html: generateDonorEmailHtml(customerName, amount, reference),
          })
          console.log('Donor confirmation email sent to:', customerEmail)
        } catch (emailError) {
          console.error('Failed to send donor email:', emailError)
        }
      }

      // Send notification to admin
      try {
        await transporter.sendMail({
          from: `Pictura <${process.env.ZOHO_EMAIL || 'info@picturaai.sbs'}>`,
          to: 'info@picturaai.sbs',
          subject: `New Donation: NGN ${amount.toLocaleString()} from ${customerName}`,
          html: generateAdminEmailHtml(customerName, customerEmail, amount, reference),
        })
        console.log('Admin notification sent')
      } catch (emailError) {
        console.error('Failed to send admin email:', emailError)
      }

      return NextResponse.json({ success: true })
    }

    // Handle failed payment
    if (event === 'charge.failed') {
      console.log('Payment failed:', {
        reference: data.reference,
        reason: data.reason,
      })

      return NextResponse.json({ success: true })
    }

    console.log('Unhandled webhook event:', event)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
