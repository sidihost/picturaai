import { NextResponse } from 'next/server'
import { getOrCreateSessionId } from '@/lib/session'
import { getTourPreference, setTourPreference } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const sessionId = await getOrCreateSessionId(request)
  const preference = await getTourPreference(sessionId)
  return NextResponse.json(preference)
}

export async function POST(request: Request) {
  const sessionId = await getOrCreateSessionId(request)
  const body = await request.json().catch(() => ({}))
  const completed = Boolean(body?.completed)
  await setTourPreference(sessionId, completed)
  return NextResponse.json({ success: true })
}
