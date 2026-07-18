import { NextResponse } from 'next/server'
import { getVideoRateLimitInfo } from '@/lib/rate-limit'
import { getOrCreateSessionId } from '@/lib/session'
import { getAdminSessionFromRequest } from '@/lib/admin-auth'
import { getRequestContext } from '@/lib/request-context'

export async function GET(request: Request) {
  const sessionId = await getOrCreateSessionId(request)
  const adminSession = getAdminSessionFromRequest(request)
  const context = getRequestContext(request)

  const rateLimitInfo = await getVideoRateLimitInfo(sessionId, {
    role: adminSession?.role,
    ...context,
  })

  return NextResponse.json(rateLimitInfo)
}
