import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function fixApiKeysColumns() {
  console.log('Adding missing columns to api_keys table...')
  
  // Add last_used_at column if missing
  try {
    await sql`ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP`
    console.log('Added last_used_at column')
  } catch (e) {
    console.log('last_used_at column may already exist:', e.message)
  }
  
  // Add requests_count column if missing
  try {
    await sql`ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS requests_count INTEGER DEFAULT 0`
    console.log('Added requests_count column')
  } catch (e) {
    console.log('requests_count column may already exist:', e.message)
  }
  
  // Add is_active column if missing
  try {
    await sql`ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`
    console.log('Added is_active column')
  } catch (e) {
    console.log('is_active column may already exist:', e.message)
  }
  
  console.log('Done fixing api_keys table!')
}

fixApiKeysColumns()
