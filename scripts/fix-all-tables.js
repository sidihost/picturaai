import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function fixAllTables() {
  console.log('Starting complete database fix...')
  
  try {
    // 1. Drop and recreate otp_verification with ALL required columns
    console.log('1. Fixing otp_verification table...')
    await sql`DROP TABLE IF EXISTS otp_verification CASCADE`
    await sql`
      CREATE TABLE otp_verification (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        country_code VARCHAR(10) DEFAULT 'US',
        currency VARCHAR(10) DEFAULT 'USD',
        phone VARCHAR(50),
        referral_source VARCHAR(255),
        promo_code VARCHAR(50),
        otp_code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('   otp_verification table created successfully')

    // 2. Ensure developers table has all required columns
    console.log('2. Checking developers table...')
    const devTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'developers'
      )
    `
    
    if (!devTableExists[0].exists) {
      console.log('   Creating developers table...')
      await sql`
        CREATE TABLE developers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          country_code VARCHAR(10) DEFAULT 'US',
          currency VARCHAR(10) DEFAULT 'USD',
          credits_balance DECIMAL(10,2) DEFAULT 0,
          email_verified BOOLEAN DEFAULT false,
          referral_source VARCHAR(255),
          promo_code_used VARCHAR(50),
          bonus_credits DECIMAL(10,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    } else {
      // Add missing columns if they don't exist
      const columns = ['currency', 'country_code', 'credits_balance', 'referral_source', 'promo_code_used', 'bonus_credits']
      for (const col of columns) {
        try {
          if (col === 'currency' || col === 'country_code') {
            await sql`ALTER TABLE developers ADD COLUMN IF NOT EXISTS ${sql(col)} VARCHAR(10) DEFAULT 'USD'`
          } else if (col === 'credits_balance' || col === 'bonus_credits') {
            await sql`ALTER TABLE developers ADD COLUMN IF NOT EXISTS ${sql(col)} DECIMAL(10,2) DEFAULT 0`
          } else {
            await sql`ALTER TABLE developers ADD COLUMN IF NOT EXISTS ${sql(col)} VARCHAR(255)`
          }
        } catch (e) {
          // Column might already exist, ignore
        }
      }
    }
    console.log('   developers table ready')

    // 3. Ensure api_keys table exists
    console.log('3. Checking api_keys table...')
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
    console.log('   api_keys table ready')

    // 4. Ensure credit_transactions table exists
    console.log('4. Checking credit_transactions table...')
    await sql`
      CREATE TABLE IF NOT EXISTS credit_transactions (
        id SERIAL PRIMARY KEY,
        developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        balance_after DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('   credit_transactions table ready')

    // 5. Ensure developer_sessions table exists
    console.log('5. Checking developer_sessions table...')
    await sql`
      CREATE TABLE IF NOT EXISTS developer_sessions (
        id SERIAL PRIMARY KEY,
        developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('   developer_sessions table ready')

    // 6. Ensure promo_codes table exists
    console.log('6. Checking promo_codes table...')
    await sql`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        bonus_credits DECIMAL(10,2) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        max_uses INTEGER,
        uses_count INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('   promo_codes table ready')

    // 7. Ensure rate_limits table exists
    console.log('7. Checking rate_limits table...')
    await sql`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        count INTEGER DEFAULT 0,
        reset_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('   rate_limits table ready')

    console.log('\nAll tables fixed successfully!')
    
  } catch (error) {
    console.error('Error fixing tables:', error)
    throw error
  }
}

fixAllTables()
