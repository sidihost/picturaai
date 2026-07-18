import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function fixDeveloperSessions() {
  console.log('Fixing developer_sessions table...')
  
  // Drop and recreate with correct schema
  await sql`DROP TABLE IF EXISTS developer_sessions CASCADE`
  
  await sql`
    CREATE TABLE developer_sessions (
      id SERIAL PRIMARY KEY,
      developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
      session_token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  
  await sql`CREATE INDEX idx_sessions_token ON developer_sessions(session_token)`
  await sql`CREATE INDEX idx_sessions_developer ON developer_sessions(developer_id)`
  await sql`CREATE INDEX idx_sessions_expires ON developer_sessions(expires_at)`
  
  console.log('developer_sessions table fixed!')
}

fixDeveloperSessions()
