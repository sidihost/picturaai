import nodemailer from 'nodemailer'
import { emailTemplates } from './email-templates'
import crypto from 'crypto'

const transporter = nodemailer.createTransport({
  host: 'smtp.zeptomail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.ZEPTO_MAIL_USERNAME || 'emailapikey',
    pass: process.env.ZEPTO_MAIL_PASSWORD || '',
  },
})

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: SendEmailOptions) {
  try {
    const result = await transporter.sendMail({
      from: options.from || `Pictura Developer <developer@picturaai.sbs>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: String(error) }
  }
}

export function generateOTP(): string {
  return Math.random().toString().slice(2, 8)
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

export async function sendOTPEmail(email: string, name: string, otp: string) {
  const html = emailTemplates.otp(name, otp)
  return sendEmail({
    to: email,
    subject: 'Verify Your Email - Pictura AI',
    html,
  })
}

export async function sendWelcomeEmail(email: string, name: string, credits: number, currency: string) {
  const html = emailTemplates.welcomeCredits(name, credits, currency)
  return sendEmail({
    to: email,
    subject: 'Welcome to Pictura AI - Developer Platform',
    html,
  })
}

export async function sendLowCreditsAlert(email: string, name: string, creditsRemaining: number, currency: string) {
  const html = emailTemplates.lowCreditsAlert(name, creditsRemaining, currency)
  return sendEmail({
    to: email,
    subject: 'Low Credits Alert - Pictura AI',
    html,
  })
}

export async function sendInvoiceEmail(email: string, name: string, invoiceId: string, amount: number, currency: string, items: any[], date: string) {
  const html = emailTemplates.invoice(name, invoiceId, amount, currency, items, date)
  return sendEmail({
    to: email,
    subject: `Invoice ${invoiceId} - Pictura AI`,
    html,
  })
}

export async function sendCaptchaWelcomeEmail(email: string, name: string) {
  const html = emailTemplates.captchaWelcome(name)
  return sendEmail({
    to: email,
    subject: 'Welcome to PicturaCAPTCHA - Your Account is Ready',
    html,
  })
}
