const { neon } = require('@neondatabase/serverless')

async function migrate() {
  const sql = neon(process.env.DATABASE_URL)
  
  console.log('Adding columns to captcha_sites...')
  
  try {
    // Add developer_id column without foreign key (simpler)
    await sql`
      ALTER TABLE captcha_sites 
      ADD COLUMN IF NOT EXISTS developer_id INTEGER
    `
    console.log('Added developer_id column')
    
    // Add site_name column
    await sql`
      ALTER TABLE captcha_sites 
      ADD COLUMN IF NOT EXISTS site_name TEXT
    `
    console.log('Added site_name column')
    
    // Create index for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_captcha_sites_developer_id 
      ON captcha_sites(developer_id)
    `
    console.log('Created developer_id index')
    
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration error:', error.message)
  }
}

migrate()
