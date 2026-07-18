const { neon } = require('@neondatabase/serverless')

async function updateCaptchaTables() {
  const sql = neon(process.env.DATABASE_URL)
  
  console.log('Updating CAPTCHA tables with analytics columns...')
  
  try {
    // Add analytics columns if they don't exist
    await sql`
      ALTER TABLE captcha_sites 
      ADD COLUMN IF NOT EXISTS challenges_solved INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS challenges_failed INTEGER DEFAULT 0
    `
    console.log('Added analytics columns')
    
    // Verify table structure
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'captcha_sites'
    `
    console.log('Table columns:', columns.map(c => c.column_name).join(', '))
    
    console.log('CAPTCHA tables updated successfully!')
  } catch (error) {
    console.error('Migration error:', error)
    throw error
  }
}

updateCaptchaTables()
