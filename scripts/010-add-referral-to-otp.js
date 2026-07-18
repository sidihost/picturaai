import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function migrate() {
  console.log('Adding referral and promo columns to otp_verification...')
  
  try {
    // Add referral_source column
    await sql`
      ALTER TABLE otp_verification 
      ADD COLUMN IF NOT EXISTS referral_source VARCHAR(50)
    `
    
    // Add promo_code column
    await sql`
      ALTER TABLE otp_verification 
      ADD COLUMN IF NOT EXISTS promo_code VARCHAR(50)
    `
    
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration error:', error.message)
    // Columns might already exist
    if (!error.message.includes('already exists')) {
      throw error
    }
    console.log('Columns already exist, skipping...')
  }
}

migrate()
