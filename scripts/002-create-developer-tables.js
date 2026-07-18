import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function migrate() {
  console.log('Creating developer tables...')

  // Developers table
  await sql`
    CREATE TABLE IF NOT EXISTS developers (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      country_code VARCHAR(10) NOT NULL DEFAULT 'US',
      currency VARCHAR(10) NOT NULL DEFAULT 'USD',
      password_hash VARCHAR(255) NOT NULL,
      credits_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
      email_verified BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✓ developers table created')

  // OTP verification table
  await sql`
    CREATE TABLE IF NOT EXISTS otp_verification (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      otp_code VARCHAR(10) NOT NULL,
      full_name VARCHAR(255),
      phone VARCHAR(50),
      country_code VARCHAR(10),
      currency VARCHAR(10),
      password_hash VARCHAR(255),
      expires_at TIMESTAMP NOT NULL,
      verified BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✓ otp_verification table created')

  // API keys table
  await sql`
    CREATE TABLE IF NOT EXISTS api_keys (
      id SERIAL PRIMARY KEY,
      developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
      key_hash VARCHAR(255) NOT NULL,
      key_prefix VARCHAR(20) NOT NULL,
      name VARCHAR(100) DEFAULT 'Default Key',
      is_active BOOLEAN DEFAULT true,
      last_used_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✓ api_keys table created')

  // Credit transactions table
  await sql`
    CREATE TABLE IF NOT EXISTS credit_transactions (
      id SERIAL PRIMARY KEY,
      developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
      amount DECIMAL(12, 2) NOT NULL,
      type VARCHAR(50) NOT NULL,
      description TEXT,
      reference_id VARCHAR(100),
      balance_after DECIMAL(12, 2),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✓ credit_transactions table created')

  // API usage table
  await sql`
    CREATE TABLE IF NOT EXISTS api_usage (
      id SERIAL PRIMARY KEY,
      developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
      api_key_id INTEGER REFERENCES api_keys(id) ON DELETE SET NULL,
      endpoint VARCHAR(100) NOT NULL,
      model VARCHAR(50),
      prompt TEXT,
      credits_used DECIMAL(10, 4) NOT NULL,
      response_time_ms INTEGER,
      status VARCHAR(20) DEFAULT 'success',
      error_message TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✓ api_usage table created')

  // Developer sessions table
  await sql`
    CREATE TABLE IF NOT EXISTS developer_sessions (
      id SERIAL PRIMARY KEY,
      developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
      session_token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✓ developer_sessions table created')

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_developers_email ON developers(email)`
  await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_developer ON api_keys(developer_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix)`
  await sql`CREATE INDEX IF NOT EXISTS idx_api_usage_developer ON api_usage(developer_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage(created_at)`
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON developer_sessions(session_token)`
  await sql`CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verification(email)`
  console.log('✓ indexes created')

  console.log('Migration completed successfully!')
}

migrate().catch(console.error)
