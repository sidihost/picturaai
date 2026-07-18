import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function migrate() {
  console.log('Fixing developer tables...')

  // Drop and recreate tables with correct types
  await sql`DROP TABLE IF EXISTS api_usage CASCADE`
  await sql`DROP TABLE IF EXISTS credit_transactions CASCADE`
  await sql`DROP TABLE IF EXISTS developer_sessions CASCADE`
  console.log('✓ Dropped dependent tables')

  // Create credit_transactions with UUID
  await sql`
    CREATE TABLE IF NOT EXISTS credit_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
      amount DECIMAL(10,2) NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit', 'refund', 'bonus')),
      description TEXT,
      balance_after DECIMAL(10,2) NOT NULL,
      reference_id VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `
  console.log('✓ credit_transactions table created')

  // Create api_usage with UUID
  await sql`
    CREATE TABLE IF NOT EXISTS api_usage (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
      api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
      endpoint VARCHAR(100) NOT NULL,
      request_params JSONB,
      response_status INTEGER NOT NULL,
      credits_used DECIMAL(10,4) NOT NULL DEFAULT 0,
      latency_ms INTEGER,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `
  console.log('✓ api_usage table created')

  // Create developer_sessions with UUID
  await sql`
    CREATE TABLE IF NOT EXISTS developer_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
      token VARCHAR(255) NOT NULL UNIQUE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `
  console.log('✓ developer_sessions table created')

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_credit_transactions_developer ON credit_transactions(developer_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_api_usage_developer ON api_usage(developer_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_api_usage_api_key ON api_usage(api_key_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_developer_sessions_token ON developer_sessions(token)`
  await sql`CREATE INDEX IF NOT EXISTS idx_developer_sessions_expires ON developer_sessions(expires_at)`
  console.log('✓ Indexes created')

  console.log('\n✅ All developer tables fixed successfully!')
}

migrate().catch(console.error)
