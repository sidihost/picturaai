import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'

const sql = neon(process.env.DATABASE_URL!)

// Get all alerts for the developer
export async function GET() {
  try {
    const cookieStore = await cookies()
    const developerCookie = cookieStore.get('developer_session')
    
    if (!developerCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const developerId = developerCookie.value

    const alerts = await sql`
      SELECT * FROM credit_alerts
      WHERE developer_id = ${developerId}
      ORDER BY threshold_amount DESC
    `

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Alerts fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create a new alert
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const developerCookie = cookieStore.get('developer_session')
    
    if (!developerCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const developerId = developerCookie.value
    const { threshold_amount, alert_type = 'email', webhook_url } = await request.json()

    if (!threshold_amount || threshold_amount <= 0) {
      return NextResponse.json({ error: 'Invalid threshold amount' }, { status: 400 })
    }

    if (alert_type === 'webhook' && !webhook_url) {
      return NextResponse.json({ error: 'Webhook URL required for webhook alerts' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO credit_alerts (developer_id, threshold_amount, alert_type, webhook_url)
      VALUES (${developerId}, ${threshold_amount}, ${alert_type}, ${webhook_url || null})
      ON CONFLICT (developer_id, threshold_amount) DO UPDATE
      SET alert_type = ${alert_type}, webhook_url = ${webhook_url || null}, is_active = true
      RETURNING *
    `

    return NextResponse.json({ alert: result[0] })
  } catch (error) {
    console.error('Alert create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete an alert
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const developerCookie = cookieStore.get('developer_session')
    
    if (!developerCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const developerId = developerCookie.value
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('id')

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 })
    }

    await sql`
      DELETE FROM credit_alerts
      WHERE id = ${alertId} AND developer_id = ${developerId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Alert delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Check and trigger alerts (called after credit deduction)
export async function checkAndTriggerAlerts(developerId: string, currentCredits: number) {
  try {
    // Find alerts that should be triggered
    const alertsToTrigger = await sql`
      SELECT * FROM credit_alerts
      WHERE developer_id = ${developerId}
        AND is_active = true
        AND threshold_amount >= ${currentCredits}
        AND (last_triggered_at IS NULL OR last_triggered_at < NOW() - INTERVAL '24 hours')
    `

    for (const alert of alertsToTrigger) {
      // Log the webhook
      await sql`
        INSERT INTO webhook_logs (developer_id, event_type, payload, status)
        VALUES (
          ${developerId}, 
          'credit_alert', 
          ${JSON.stringify({ threshold: alert.threshold_amount, current_credits: currentCredits })},
          'pending'
        )
      `

      // If webhook type, send webhook
      if ((alert.alert_type === 'webhook' || alert.alert_type === 'both') && alert.webhook_url) {
        try {
          const response = await fetch(alert.webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'credit_alert',
              threshold: alert.threshold_amount,
              current_credits: currentCredits,
              timestamp: new Date().toISOString()
            })
          })

          await sql`
            UPDATE webhook_logs
            SET status = ${response.ok ? 'sent' : 'failed'}, 
                response_status = ${response.status},
                sent_at = NOW()
            WHERE developer_id = ${developerId} 
              AND event_type = 'credit_alert'
              AND status = 'pending'
            ORDER BY created_at DESC
            LIMIT 1
          `
        } catch {
          // Webhook failed silently
        }
      }

      // Update last triggered
      await sql`
        UPDATE credit_alerts
        SET last_triggered_at = NOW()
        WHERE id = ${alert.id}
      `
    }
  } catch (error) {
    console.error('Alert check error:', error)
  }
}
