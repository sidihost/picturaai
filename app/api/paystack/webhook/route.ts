import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-paystack-signature')
    
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    }

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', paystackSecretKey)
      .update(body)
      .digest('hex')

    if (hash !== signature) {
      console.error('Invalid Paystack webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    
    if (event.event === 'charge.success') {
      const { reference, metadata, amount } = event.data
      const developerId = metadata?.developer_id
      const credits = metadata?.credits || 0
      const planName = metadata?.plan_name || 'Credit Purchase'

      if (developerId && credits > 0) {
        // Check if already processed
        const existing = await sql`
          SELECT id FROM credit_transactions 
          WHERE description LIKE ${`%${reference}%`}
          AND type = 'credit'
        `
        
        if (existing.length > 0) {
          return NextResponse.json({ message: 'Already processed' })
        }

        // Add credits to developer account
        await sql`
          UPDATE developers 
          SET credits_balance = credits_balance + ${credits}
          WHERE id = ${developerId}
        `

        // Record transaction
        await sql`
          INSERT INTO credit_transactions (developer_id, type, amount, description, balance_after)
          SELECT ${developerId}, 'credit', ${credits}, ${`${planName} - ${reference}`}, credits_balance
          FROM developers WHERE id = ${developerId}
        `

        // Remove pending transaction if exists
        await sql`
          DELETE FROM credit_transactions 
          WHERE developer_id = ${developerId} 
          AND type = 'pending'
          AND description LIKE ${`%${reference}%`}
        `.catch(() => {})

        console.log(`Credits added: ${credits} to developer ${developerId}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
