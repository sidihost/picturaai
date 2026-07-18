import { neon } from '@neondatabase/serverless'
import type { AdminRole } from '@/lib/admin-auth'

const DAILY_LIMIT = 999999
const DAILY_VIDEO_LIMIT = 2
const STAFF_LIMIT = 999999
const ADMIN_UNLIMITED = 999999

type SessionContext = {
  role?: AdminRole
  ip?: string | null
  userAgent?: string | null
  country?: string | null
  city?: string | null
  region?: string | null
  deviceType?: 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown' | null
}

function limitsByRole(role?: AdminRole) {
  if (role === 'admin') return { image: ADMIN_UNLIMITED, video: ADMIN_UNLIMITED }
  if (role === 'staff') return { image: STAFF_LIMIT, video: STAFF_LIMIT }
  return { image: DAILY_LIMIT, video: DAILY_VIDEO_LIMIT }
}

export function getDailyLimits() {
  return { image: DAILY_LIMIT, video: DAILY_VIDEO_LIMIT }
}

// Persistent rate limit storage using database
// Uses a separate table to avoid schema conflicts

function getDb() {
  const sql = neon(process.env.DATABASE_URL!)
  return sql
}

function getResetTime(): Date {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setUTCHours(24, 0, 0, 0)
  return tomorrow
}

async function ensureTable() {
  const sql = getDb()
  await sql`
    CREATE TABLE IF NOT EXISTS user_sessions (
      session_id TEXT PRIMARY KEY,
      credits_used INTEGER DEFAULT 0,
      credits_reset_at TIMESTAMPTZ,
      video_used INTEGER DEFAULT 0,
      video_reset_at TIMESTAMPTZ,
      tour_completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS video_used INTEGER DEFAULT 0`
  await sql`ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS video_reset_at TIMESTAMPTZ`
  await sql`ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS tour_completed BOOLEAN DEFAULT FALSE`
  await sql`ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS last_ip TEXT`
  await sql`ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS last_user_agent TEXT`
  await sql`ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS last_country TEXT`
  await sql`ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS last_city TEXT`
  await sql`ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS last_region TEXT`
  await sql`ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS last_device TEXT`
  await sql`ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ`
}

async function touchSessionMetadata(identifier: string, context?: SessionContext) {
  if (!context) return
  const sql = getDb()
  await sql`
    UPDATE user_sessions
    SET last_ip = COALESCE(${context.ip || null}, last_ip),
        last_user_agent = COALESCE(${context.userAgent || null}, last_user_agent),
        last_country = COALESCE(${context.country || null}, last_country),
        last_city = COALESCE(${context.city || null}, last_city),
        last_region = COALESCE(${context.region || null}, last_region),
        last_device = COALESCE(${context.deviceType || null}, last_device),
        last_seen_at = NOW()
    WHERE session_id = ${identifier}
  `
}

export async function getRateLimitInfo(identifier: string, context?: SessionContext): Promise<{
  limit: number
  remaining: number
  used: number
  resetAt: string
}> {
  try {
    await ensureTable()
    const sql = getDb()
    const now = new Date()
    const limits = limitsByRole(context?.role)

    const result = await sql`
      SELECT credits_used, credits_reset_at FROM user_sessions
      WHERE session_id = ${identifier}
    `

    if (result.length === 0) {
      const resetAt = getResetTime()
      await sql`
        INSERT INTO user_sessions (session_id, credits_used, credits_reset_at)
        VALUES (${identifier}, 0, ${resetAt.toISOString()})
      `
      await touchSessionMetadata(identifier, context)
      return { limit: limits.image, remaining: limits.image, used: 0, resetAt: resetAt.toISOString() }
    }

    const session = result[0]
    const resetAt = new Date(session.credits_reset_at)

    if (resetAt <= now) {
      const newResetAt = getResetTime()
      await sql`
        UPDATE user_sessions
        SET credits_used = 0, credits_reset_at = ${newResetAt.toISOString()}
        WHERE session_id = ${identifier}
      `
      await touchSessionMetadata(identifier, context)
      return { limit: limits.image, remaining: limits.image, used: 0, resetAt: newResetAt.toISOString() }
    }

    await touchSessionMetadata(identifier, context)
    const used = context?.role === 'admin' ? 0 : session.credits_used
    return {
      limit: limits.image,
      remaining: Math.max(0, limits.image - used),
      used,
      resetAt: resetAt.toISOString(),
    }
  } catch (error) {
    console.error('[RateLimit] Error:', error)
    const limits = limitsByRole(context?.role)
    return {
      limit: limits.image,
      remaining: limits.image,
      used: 0,
      resetAt: getResetTime().toISOString(),
    }
  }
}

export async function getVideoRateLimitInfo(identifier: string, context?: SessionContext): Promise<{
  limit: number
  remaining: number
  used: number
  resetAt: string
}> {
  try {
    await ensureTable()
    const sql = getDb()
    const now = new Date()
    const limits = limitsByRole(context?.role)

    const result = await sql`
      SELECT video_used, video_reset_at FROM user_sessions
      WHERE session_id = ${identifier}
    `

    if (result.length === 0) {
      const resetAt = getResetTime()
      await sql`
        INSERT INTO user_sessions (session_id, video_used, video_reset_at)
        VALUES (${identifier}, 0, ${resetAt.toISOString()})
      `
      await touchSessionMetadata(identifier, context)
      return { limit: limits.video, remaining: limits.video, used: 0, resetAt: resetAt.toISOString() }
    }

    const session = result[0]
    const resetAt = session.video_reset_at ? new Date(session.video_reset_at) : getResetTime()

    if (resetAt <= now) {
      const newResetAt = getResetTime()
      await sql`
        UPDATE user_sessions
        SET video_used = 0, video_reset_at = ${newResetAt.toISOString()}
        WHERE session_id = ${identifier}
      `
      await touchSessionMetadata(identifier, context)
      return { limit: limits.video, remaining: limits.video, used: 0, resetAt: newResetAt.toISOString() }
    }

    await touchSessionMetadata(identifier, context)
    const used = context?.role === 'admin' ? 0 : (session.video_used || 0)
    return {
      limit: limits.video,
      remaining: Math.max(0, limits.video - used),
      used,
      resetAt: resetAt.toISOString(),
    }
  } catch (error) {
    console.error('[VideoRateLimit] Error:', error)
    const limits = limitsByRole(context?.role)
    return { limit: limits.video, remaining: limits.video, used: 0, resetAt: getResetTime().toISOString() }
  }
}

export async function incrementVideoUsage(identifier: string, context?: SessionContext): Promise<void> {
  if (context?.role === 'admin') return

  try {
    await ensureTable()
    const sql = getDb()
    const now = new Date()
    const resetAt = getResetTime()

    const result = await sql`
      SELECT video_used, video_reset_at FROM user_sessions
      WHERE session_id = ${identifier}
    `

    if (result.length === 0) {
      await sql`
        INSERT INTO user_sessions (session_id, video_used, video_reset_at)
        VALUES (${identifier}, 1, ${resetAt.toISOString()})
      `
    } else {
      const session = result[0]
      const sessionResetAt = session.video_reset_at ? new Date(session.video_reset_at) : now
      if (sessionResetAt <= now) {
        await sql`
          UPDATE user_sessions
          SET video_used = 1, video_reset_at = ${resetAt.toISOString()}
          WHERE session_id = ${identifier}
        `
      } else {
        await sql`
          UPDATE user_sessions
          SET video_used = COALESCE(video_used, 0) + 1
          WHERE session_id = ${identifier}
        `
      }
    }

    await touchSessionMetadata(identifier, context)
  } catch (error) {
    console.error('[VideoRateLimit] Increment error:', error)
  }
}

export async function incrementUsage(identifier: string, context?: SessionContext): Promise<void> {
  if (context?.role === 'admin') return

  try {
    await ensureTable()
    const sql = getDb()
    const now = new Date()
    const resetAt = getResetTime()

    const result = await sql`
      SELECT credits_used, credits_reset_at FROM user_sessions
      WHERE session_id = ${identifier}
    `

    if (result.length === 0) {
      await sql`
        INSERT INTO user_sessions (session_id, credits_used, credits_reset_at)
        VALUES (${identifier}, 1, ${resetAt.toISOString()})
      `
    } else {
      const session = result[0]
      const sessionResetAt = new Date(session.credits_reset_at)

      if (sessionResetAt <= now) {
        await sql`
          UPDATE user_sessions
          SET credits_used = 1, credits_reset_at = ${resetAt.toISOString()}
          WHERE session_id = ${identifier}
        `
      } else {
        await sql`
          UPDATE user_sessions
          SET credits_used = credits_used + 1
          WHERE session_id = ${identifier}
        `
      }
    }

    await touchSessionMetadata(identifier, context)
  } catch (error) {
    console.error('[RateLimit] Increment error:', error)
  }
}

export async function getTourPreference(identifier: string): Promise<{ completed: boolean }> {
  try {
    await ensureTable()
    const sql = getDb()
    const result = await sql`
      SELECT tour_completed FROM user_sessions
      WHERE session_id = ${identifier}
    `

    if (result.length === 0) {
      const resetAt = getResetTime()
      await sql`
        INSERT INTO user_sessions (session_id, credits_used, credits_reset_at, video_used, video_reset_at, tour_completed)
        VALUES (${identifier}, 0, ${resetAt.toISOString()}, 0, ${resetAt.toISOString()}, FALSE)
      `
      return { completed: false }
    }

    return { completed: Boolean(result[0].tour_completed) }
  } catch (error) {
    console.error('[TourPreference] Error:', error)
    return { completed: false }
  }
}

export async function setTourPreference(identifier: string, completed: boolean): Promise<void> {
  try {
    await ensureTable()
    const sql = getDb()
    const resetAt = getResetTime()
    await sql`
      INSERT INTO user_sessions (session_id, credits_used, credits_reset_at, video_used, video_reset_at, tour_completed)
      VALUES (${identifier}, 0, ${resetAt.toISOString()}, 0, ${resetAt.toISOString()}, ${completed})
      ON CONFLICT (session_id)
      DO UPDATE SET tour_completed = ${completed}
    `
  } catch (error) {
    console.error('[TourPreference] Set error:', error)
  }
}


type AdminSessionRecord = {
  session_id: string
  credits_used: number
  credits_reset_at: string | Date | null
  video_used: number
  video_reset_at: string | Date | null
  tour_completed: boolean
  last_ip: string | null
  last_country: string | null
  last_region: string | null
  last_city: string | null
  last_device: string | null
  last_seen_at: string | Date | null
  created_at: string | Date
}

export async function listSessionsForAdmin(search?: string): Promise<AdminSessionRecord[]> {
  await ensureTable()
  const sql = getDb()
  const query = (search || '').trim()

  if (query) {
    return await sql`
      SELECT session_id, credits_used, credits_reset_at, video_used, video_reset_at, tour_completed,
             last_ip, last_country, last_region, last_city, last_device, last_seen_at, created_at
      FROM user_sessions
      WHERE session_id ILIKE ${query + '%'}
      ORDER BY created_at DESC
      LIMIT 100
    ` as AdminSessionRecord[]
  }

  return await sql`
    SELECT session_id, credits_used, credits_reset_at, video_used, video_reset_at, tour_completed,
           last_ip, last_country, last_region, last_city, last_device, last_seen_at, created_at
    FROM user_sessions
    ORDER BY created_at DESC
    LIMIT 100
  ` as AdminSessionRecord[]
}

export async function updateSessionCreditsForAdmin(input: {
  sessionId: string
  imageDelta?: number
  videoDelta?: number
  imageRemaining?: number
  videoRemaining?: number
  reset?: boolean
}): Promise<AdminSessionRecord | null> {
  await ensureTable()
  const sql = getDb()
  const sessionId = input.sessionId.trim()
  if (!sessionId) return null

  const resetAt = getResetTime().toISOString()

  await sql`
    INSERT INTO user_sessions (session_id, credits_used, credits_reset_at, video_used, video_reset_at, tour_completed)
    VALUES (${sessionId}, 0, ${resetAt}, 0, ${resetAt}, FALSE)
    ON CONFLICT (session_id) DO NOTHING
  `

  if (input.reset) {
    await sql`
      UPDATE user_sessions
      SET credits_used = 0,
          video_used = 0,
          credits_reset_at = ${resetAt},
          video_reset_at = ${resetAt}
      WHERE session_id = ${sessionId}
    `
  }

  if (typeof input.imageDelta === 'number' && Number.isFinite(input.imageDelta) && input.imageDelta !== 0) {
    await sql`
      UPDATE user_sessions
      SET credits_used = COALESCE(credits_used, 0) - ${Math.trunc(input.imageDelta)}
      WHERE session_id = ${sessionId}
    `
  }

  if (typeof input.videoDelta === 'number' && Number.isFinite(input.videoDelta) && input.videoDelta !== 0) {
    await sql`
      UPDATE user_sessions
      SET video_used = COALESCE(video_used, 0) - ${Math.trunc(input.videoDelta)}
      WHERE session_id = ${sessionId}
    `
  }

  if (typeof input.imageRemaining === 'number' && Number.isFinite(input.imageRemaining)) {
    const capped = Math.max(0, Math.trunc(input.imageRemaining))
    await sql`
      UPDATE user_sessions
      SET credits_used = ${DAILY_LIMIT - capped}
      WHERE session_id = ${sessionId}
    `
  }

  if (typeof input.videoRemaining === 'number' && Number.isFinite(input.videoRemaining)) {
    const capped = Math.max(0, Math.trunc(input.videoRemaining))
    await sql`
      UPDATE user_sessions
      SET video_used = ${DAILY_VIDEO_LIMIT - capped}
      WHERE session_id = ${sessionId}
    `
  }

  const rows = await sql`
    SELECT session_id, credits_used, credits_reset_at, video_used, video_reset_at, tour_completed,
           last_ip, last_country, last_region, last_city, last_device, last_seen_at, created_at
    FROM user_sessions
    WHERE session_id = ${sessionId}
    LIMIT 1
  ` as AdminSessionRecord[]

  return rows[0] || null
}
