import nodemailer from 'nodemailer'
import { NextRequest, NextResponse } from 'next/server'
import { insertSupportReport } from '@/lib/admin-data'

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL || 'info@picturaai.sbs',
    pass: process.env.ZOHO_PASSWORD || '',
  },
})

interface ReportData {
  name: string
  email: string
  type: 'bug' | 'complaint' | 'feedback'
  subject: string
  description: string
  captchaToken?: string
}

// PicturaCAPTCHA token validation - supports both new base64 JSON and legacy string format
function verifyCaptchaToken(token: string): boolean {
  if (!token) return false
  
  // Try base64 JSON format first (new format)
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
    // Check timestamp (5 minute validity)
    if (!decoded.t || Date.now() - decoded.t > 5 * 60 * 1000) {
      return false
    }
    // Check verification flag
    return decoded.v === true
  } catch {
    // Legacy format: pictura_timestamp_sitekey_random_verified
    if (!token.startsWith('pictura_')) return false
    
    const parts = token.split('_')
    if (parts.length < 4) return false
    
    const timestamp = parseInt(parts[1], 10)
    if (isNaN(timestamp) || Date.now() - timestamp > 5 * 60 * 1000) {
      return false
    }
    
    return token.endsWith('_verified') || token.includes('step')
  }
}

function generateTicketId(): string {
  return `PIC-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

function generateUserEmailHtml(ticketId: string, name: string, type: string): string {
  const typeLabel = type === 'bug' ? 'Bug Report' : type === 'complaint' ? 'Complaint' : 'Feedback'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #c87941 0%, #d4905f 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .header p { margin: 8px 0 0 0; opacity: 0.95; }
    .content { background: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .ticket-box { background: white; border-left: 4px solid #c87941; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
    .ticket-label { color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .ticket-id { color: #c87941; font-size: 20px; font-weight: bold; font-family: monospace; margin-top: 5px; }
    .type-badge { display: inline-block; background: #e8e8e8; color: #333; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 15px; }
    .footer { color: #666; font-size: 13px; }
    .footer-link { color: #c87941; text-decoration: none; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Pictura</h1>
      <p>Thank you for helping us improve</p>
    </div>

    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>

      <p>We received your ${typeLabel.toLowerCase()} and we're grateful for your feedback. Our team will review it shortly and get back to you if needed.</p>

      <div class="ticket-box">
        <div class="ticket-label">Ticket Number</div>
        <div class="ticket-id">${ticketId}</div>
      </div>

      <div style="background: white; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <div class="type-badge">${typeLabel}</div>
        <p style="margin: 0; color: #666; font-size: 12px;">Keep this ticket number handy if you need to follow up with us.</p>
      </div>

      <p style="color: #666; font-size: 14px;">We typically respond within 24-48 hours during business days.</p>
    </div>

    <div class="footer">
      <p>If you have additional information to share, please reply to this email with your ticket number.</p>
      <p>
        <strong>Pictura Team</strong><br>
        <a href="mailto:info@picturaai.sbs" class="footer-link">info@picturaai.sbs</a>
      </p>
    </div>
  </div>
</body>
</html>
  `
}

function generateAdminEmailHtml(data: ReportData, ticketId: string): string {
  const typeEmoji = data.type === 'bug' ? '🐛' : data.type === 'complaint' ? '⚠️' : '💭'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: #f0f0f0; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #c87941; }
    .field { margin-bottom: 15px; }
    .label { color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { color: #1a1a1a; font-size: 14px; margin-top: 4px; }
    .description { background: #f8f8f8; padding: 15px; border-radius: 4px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0; font-size: 20px;">${typeEmoji} New ${data.type.toUpperCase()} Report</h2>
      <p style="margin: 8px 0 0 0; color: #666;">Ticket: <strong>${ticketId}</strong></p>
    </div>

    <div class="field">
      <div class="label">From</div>
      <div class="value"><strong>${data.name}</strong> (${data.email})</div>
    </div>

    <div class="field">
      <div class="label">Type</div>
      <div class="value">${data.type.charAt(0).toUpperCase() + data.type.slice(1)}</div>
    </div>

    <div class="field">
      <div class="label">Subject</div>
      <div class="value">${data.subject}</div>
    </div>

    <div class="description">
      <div class="label">Message</div>
      <div class="value" style="margin-top: 10px; white-space: pre-wrap; word-wrap: break-word;">${data.description}</div>
    </div>

    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    <p style="color: #666; font-size: 12px;">
      Submitted at: ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC
    </p>
  </div>
</body>
</html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body: ReportData = await request.json()

    // Validate input
    if (!body.name || !body.email || !body.type || !body.subject || !body.description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['bug', 'complaint', 'feedback'].includes(body.type)) {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    // Verify PicturaCAPTCHA token
    if (!body.captchaToken) {
      return NextResponse.json({ error: 'CAPTCHA verification required' }, { status: 400 })
    }

    const isValidToken = verifyCaptchaToken(body.captchaToken)
    if (!isValidToken) {
      return NextResponse.json({ error: 'CAPTCHA verification failed. Please try again.' }, { status: 403 })
    }

    const ticketId = generateTicketId()
    const context = getRequestContext(request)

    await insertSupportReport({
      ticketId,
      name: body.name,
      email: body.email,
      type: body.type,
      subject: body.subject,
      description: body.description,
      source: 'website',
      ip: context.ip || undefined,
      userAgent: context.userAgent || undefined,
      country: context.country || undefined,
      city: context.city || undefined,
      region: context.region || undefined,
      deviceType: context.deviceType,
    })

    await insertSupportReport({
      ticketId,
      name: body.name,
      email: body.email,
      type: body.type,
      subject: body.subject,
      description: body.description,
      source: 'website',
    })

    // Send user confirmation email
    await transporter.sendMail({
      from: `Pictura <${process.env.ZOHO_EMAIL || 'info@picturaai.sbs'}>`,
      to: body.email,
      subject: `Ticket Confirmed: ${ticketId}`,
      html: generateUserEmailHtml(ticketId, body.name, body.type),
    })

    // Send admin notification email
    await transporter.sendMail({
      from: `Pictura <${process.env.ZOHO_EMAIL || 'info@picturaai.sbs'}>`,
      to: 'info@picturaai.sbs',
      subject: `[${body.type.toUpperCase()}] ${body.subject} - ${ticketId}`,
      html: generateAdminEmailHtml(body, ticketId),
    })

    return NextResponse.json(
      {
        success: true,
        ticketId,
        message: 'Report submitted successfully. Check your email for confirmation.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Report submission error:', error)
    return NextResponse.json(
      {
        error: 'Failed to submit report. Please try again later.',
      },
      { status: 500 }
    )
  }
}
