import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { getDailyLimits, listSessionsForAdmin, updateSessionCreditsForAdmin } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const session = await requireAdminSession('staff')
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const sessions = await listSessionsForAdmin(search)
    return NextResponse.json({ sessions, limits: getDailyLimits() })
  } catch (error) {
    console.error('[AdminSessions] GET error:', error)
    return NextResponse.json({ error: 'Failed to load sessions' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession('admin')
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''

    if (!sessionId.trim()) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    const updated = await updateSessionCreditsForAdmin({
      sessionId,
      imageDelta: typeof body.imageDelta === 'number' ? body.imageDelta : undefined,
      videoDelta: typeof body.videoDelta === 'number' ? body.videoDelta : undefined,
      imageRemaining: typeof body.imageRemaining === 'number' ? body.imageRemaining : undefined,
      videoRemaining: typeof body.videoRemaining === 'number' ? body.videoRemaining : undefined,
      reset: Boolean(body.reset),
    })

    if (!updated) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, session: updated, limits: getDailyLimits() })
  } catch (error) {
    console.error('[AdminSessions] PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}
