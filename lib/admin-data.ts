import { neon } from '@neondatabase/serverless'

function getDb() {
  return neon(process.env.DATABASE_URL!)
}

export type SupportReportStatus = 'open' | 'in_progress' | 'resolved'

async function ensureSupportReportsTable() {
  const sql = getDb()
  await sql`
    CREATE TABLE IF NOT EXISTS support_reports (
      id BIGSERIAL PRIMARY KEY,
      ticket_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      type TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      assigned_to TEXT,
      internal_note TEXT,
      source TEXT NOT NULL DEFAULT 'website',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`ALTER TABLE support_reports ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open'`
  await sql`ALTER TABLE support_reports ADD COLUMN IF NOT EXISTS assigned_to TEXT`
  await sql`ALTER TABLE support_reports ADD COLUMN IF NOT EXISTS internal_note TEXT`
  await sql`ALTER TABLE support_reports ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'website'`
}

export async function insertSupportReport(input: {
  ticketId: string
  name: string
  email: string
  type: string
  subject: string
  description: string
  source?: string
}) {
  try {
    await ensureSupportReportsTable()
    const sql = getDb()
    await sql`
      INSERT INTO support_reports (ticket_id, name, email, type, subject, description, source)
      VALUES (${input.ticketId}, ${input.name}, ${input.email}, ${input.type}, ${input.subject}, ${input.description}, ${input.source || 'website'})
      ON CONFLICT (ticket_id) DO NOTHING
    `
  } catch (error) {
    console.error('[SupportReports] insert error:', error)
  }
}

export async function listSupportReports(search = '') {
  await ensureSupportReportsTable()
  const sql = getDb()
  const query = search.trim()
  if (query) {
    return sql`
      SELECT * FROM support_reports
      WHERE ticket_id ILIKE ${query + '%'}
        OR email ILIKE ${'%' + query + '%'}
        OR subject ILIKE ${'%' + query + '%'}
      ORDER BY created_at DESC
      LIMIT 250
    `
  }

  return sql`
    SELECT * FROM support_reports
    ORDER BY created_at DESC
    LIMIT 250
  `
}

export async function updateSupportReport(id: number, payload: { status?: SupportReportStatus; assignedTo?: string; internalNote?: string }) {
  await ensureSupportReportsTable()
  const sql = getDb()

  if (payload.status !== undefined) {
    await sql`UPDATE support_reports SET status = ${payload.status}, updated_at = NOW() WHERE id = ${id}`
  }
  if (payload.assignedTo !== undefined) {
    await sql`UPDATE support_reports SET assigned_to = ${payload.assignedTo || null}, updated_at = NOW() WHERE id = ${id}`
  }
  if (payload.internalNote !== undefined) {
    await sql`UPDATE support_reports SET internal_note = ${payload.internalNote || null}, updated_at = NOW() WHERE id = ${id}`
  }

  const updated = await sql`SELECT * FROM support_reports WHERE id = ${id} LIMIT 1`
  return updated[0] || null
}

export async function getAdminOverview() {
  const sql = getDb()
  await ensureSupportReportsTable()
  await sql`CREATE TABLE IF NOT EXISTS user_sessions (session_id TEXT PRIMARY KEY, created_at TIMESTAMPTZ DEFAULT NOW())`

  const [developers, anonymousSessions, openReports, allReports] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM developers`,
    sql`SELECT COUNT(*)::int AS count FROM user_sessions`,
    sql`SELECT COUNT(*)::int AS count FROM support_reports WHERE status <> 'resolved'`,
    sql`SELECT COUNT(*)::int AS count FROM support_reports`,
  ])

  const recentReports = await sql`
    SELECT id, ticket_id, type, subject, status, assigned_to, created_at
    FROM support_reports
    ORDER BY created_at DESC
    LIMIT 10
  `

  return {
    developers: developers[0]?.count || 0,
    anonymousSessions: anonymousSessions[0]?.count || 0,
    openReports: openReports[0]?.count || 0,
    totalReports: allReports[0]?.count || 0,
    recentReports,
  }
}
