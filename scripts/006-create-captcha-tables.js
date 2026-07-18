import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function migrate() {
  console.log('Creating CAPTCHA tables...')
  
  // Create captcha_sites table
  await sql`
    CREATE TABLE IF NOT EXISTS captcha_sites (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      site_name VARCHAR(255) NOT NULL,
      domain VARCHAR(255) NOT NULL,
      site_key VARCHAR(64) UNIQUE NOT NULL,
      secret_hash VARCHAR(64) NOT NULL,
      verifications INTEGER DEFAULT 0,
      last_verification TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('Created captcha_sites table')
  
  // Create index on site_key for fast lookups
  await sql`
    CREATE INDEX IF NOT EXISTS idx_captcha_site_key ON captcha_sites(site_key)
  `
  console.log('Created index on site_key')
  
  // Create index on secret_hash for verification
  await sql`
    CREATE INDEX IF NOT EXISTS idx_captcha_secret_hash ON captcha_sites(secret_hash)
  `
  console.log('Created index on secret_hash')
  
  console.log('CAPTCHA tables created successfully!')
}

migrate().catch(console.error)
