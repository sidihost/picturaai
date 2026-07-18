import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('Fixing api_keys table...')

  // Drop and recreate api_keys table with correct columns
  await sql`DROP TABLE IF EXISTS api_keys CASCADE`
  console.log('Dropped old api_keys table')

  await sql`
    CREATE TABLE api_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      key_prefix VARCHAR(20) NOT NULL,
      key_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      last_used TIMESTAMPTZ,
      is_active BOOLEAN DEFAULT true
    )
  `
  console.log('Created api_keys table with key_prefix and key_hash')

  await sql`CREATE INDEX idx_api_keys_developer ON api_keys(developer_id)`
  await sql`CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix)`
  await sql`CREATE INDEX idx_api_keys_active ON api_keys(is_active)`
  console.log('Created indexes')

  console.log('✅ api_keys table fixed!')
}

main().catch(console.error)
