import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function migrate() {
  console.log('Adding referral source and promo code columns...')

  // Add referral_source column to developers table
  await sql`
    ALTER TABLE developers 
    ADD COLUMN IF NOT EXISTS referral_source VARCHAR(100),
    ADD COLUMN IF NOT EXISTS promo_code_used VARCHAR(50),
    ADD COLUMN IF NOT EXISTS bonus_credits DECIMAL(10,2) DEFAULT 0
  `

  // Create promo_codes table
  await sql`
    CREATE TABLE IF NOT EXISTS promo_codes (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      bonus_credits_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
      bonus_multiplier DECIMAL(5,2) DEFAULT 1,
      max_uses INTEGER DEFAULT NULL,
      current_uses INTEGER DEFAULT 0,
      valid_from TIMESTAMP DEFAULT NOW(),
      valid_until TIMESTAMP DEFAULT NULL,
      referral_source VARCHAR(100),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  // Create index on code
  await sql`
    CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code)
  `

  // Insert default promo codes
  await sql`
    INSERT INTO promo_codes (code, description, bonus_credits_usd, referral_source, is_active)
    VALUES 
      ('LABLAB', 'LabLab.ai community bonus - $10 extra credits', 10, 'lablab', true),
      ('LABLAB2026', 'LabLab.ai hackathon special - $20 extra credits', 20, 'lablab', true),
      ('WELCOME10', 'Welcome bonus - $10 extra credits', 10, NULL, true),
      ('DEVHUNT', 'DevHunt launch special - $5 extra credits', 5, 'devhunt', true),
      ('PRODUCTHUNT', 'Product Hunt launch - $15 extra credits', 15, 'producthunt', true)
    ON CONFLICT (code) DO NOTHING
  `

  console.log('Migration completed successfully!')
}

migrate().catch(console.error)
