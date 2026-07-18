import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

const SESSION_ID_LENGTH = 32
const SESSION_EPOCH = (process.env.SESSION_EPOCH || 'v1').trim()
const SESSION_COOKIE_NAME = SESSION_EPOCH === 'v1' ? 'pictura_session_id' : `pictura_session_id_${SESSION_EPOCH}`
const STABLE_COOKIE_NAME = SESSION_EPOCH === 'v1' ? 'pictura_stable_id' : `pictura_stable_id_${SESSION_EPOCH}`
const LEGACY_SESSION_COOKIE_NAME = 'pictura_session_id'
const LEGACY_STABLE_COOKIE_NAME = 'pictura_stable_id'
const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

type RequestLike = Request | { headers: Headers }

export function generateSessionId(): string {
  const raw = randomBytes(SESSION_ID_LENGTH).toString('hex')
  return SESSION_EPOCH === 'v1' ? raw : `${SESSION_EPOCH}_${raw}`
}

function applySessionEpoch(value: string): string {
  if (SESSION_EPOCH === 'v1') return value
  return value.startsWith(`${SESSION_EPOCH}_`) ? value : `${SESSION_EPOCH}_${value}`
}

function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split('=')
    if (!key) return acc
    acc[key] = decodeURIComponent(rest.join('='))
    return acc
  }, {})
}

export function getSessionIdFromRequest(request: RequestLike): string | undefined {
  const cookiesMap = parseCookieHeader(request.headers.get('cookie'))
  return cookiesMap[SESSION_COOKIE_NAME] || cookiesMap[LEGACY_SESSION_COOKIE_NAME] || undefined
}

export async function getOrCreateSessionId(_request?: RequestLike): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    // Prefer an existing stable cookie if the session cookie was wiped, otherwise
    // ALWAYS create a fresh random session id. We deliberately do NOT fall back to
    // a network/browser fingerprint here: many users share an IP + user agent
    // (school / office / family WiFi, mobile carrier NAT, same browser version),
    // and reusing a fingerprint as a session id caused different visitors to share
    // the same gallery storage bucket. Each browser must get its own session.
    const stableCookie = cookieStore.get(STABLE_COOKIE_NAME)?.value
    const baseSessionId = stableCookie || generateSessionId()
    sessionId = applySessionEpoch(baseSessionId)

    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_COOKIE_MAX_AGE,
      path: '/',
    })

    cookieStore.set(STABLE_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_COOKIE_MAX_AGE,
      path: '/',
    })

    console.log('[Session] Creating stable session:', sessionId)
  } else {
    console.log('[Session] Using existing session:', sessionId)
  }

  return sessionId
}

export async function getSessionId(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value
}

export async function clearSessionId(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  cookieStore.delete(STABLE_COOKIE_NAME)
  cookieStore.delete(LEGACY_SESSION_COOKIE_NAME)
  cookieStore.delete(LEGACY_STABLE_COOKIE_NAME)
}
