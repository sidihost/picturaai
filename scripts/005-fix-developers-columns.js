import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function migrate() {
  console.log('Fixing developers table columns...')

  // Check if full_name column exists, if not add it or rename name to full_name
  try {
    // Try to add full_name column
    await sql`ALTER TABLE developers ADD COLUMN IF NOT EXISTS full_name VARCHAR(255)`
    console.log('✓ Added full_name column')
  } catch (e) {
    console.log('full_name column might already exist')
  }

  // If there's a 'name' column, copy data to full_name and drop it
  try {
    await sql`UPDATE developers SET full_name = name WHERE full_name IS NULL AND name IS NOT NULL`
    console.log('✓ Copied name data to full_name')
  } catch (e) {
    console.log('No name column to copy from')
  }

  // Make full_name NOT NULL with default
  try {
    await sql`ALTER TABLE developers ALTER COLUMN full_name SET DEFAULT ''`
    await sql`UPDATE developers SET full_name = '' WHERE full_name IS NULL`
    await sql`ALTER TABLE developers ALTER COLUMN full_name SET NOT NULL`
    console.log('✓ Made full_name NOT NULL')
  } catch (e) {
    console.log('Could not alter full_name constraints:', e.message)
  }

  // Ensure otp_verification has all needed columns
  try {
    await sql`ALTER TABLE otp_verification ADD COLUMN IF NOT EXISTS full_name VARCHAR(255)`
    await sql`ALTER TABLE otp_verification ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`
    await sql`ALTER TABLE otp_verification ADD COLUMN IF NOT EXISTS country_code VARCHAR(10)`
    await sql`ALTER TABLE otp_verification ADD COLUMN IF NOT EXISTS currency VARCHAR(10)`
    await sql`ALTER TABLE otp_verification ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`
    await sql`ALTER TABLE otp_verification ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false`
    console.log('✓ OTP verification columns ensured')
  } catch (e) {
    console.log('OTP columns error:', e.message)
  }

  console.log('Migration complete!')
}

migrate().catch(console.error)
