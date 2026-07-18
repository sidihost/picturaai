import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function fixDevelopersTable() {
  console.log('Fixing developers table with ALL required columns...')
  
  // Add all potentially missing columns
  const columnsToAdd = [
    { name: 'currency', type: 'VARCHAR(10) DEFAULT \'USD\'' },
    { name: 'phone', type: 'VARCHAR(50)' },
    { name: 'country_code', type: 'VARCHAR(10) DEFAULT \'US\'' },
    { name: 'referral_source', type: 'VARCHAR(100)' },
    { name: 'promo_code', type: 'VARCHAR(50)' },
    { name: 'bonus_credits', type: 'INTEGER DEFAULT 0' },
    { name: 'credits_balance', type: 'INTEGER DEFAULT 100' },
    { name: 'credits_used', type: 'INTEGER DEFAULT 0' },
    { name: 'tier', type: 'VARCHAR(20) DEFAULT \'free\'' },
    { name: 'is_active', type: 'BOOLEAN DEFAULT true' },
    { name: 'email_verified', type: 'BOOLEAN DEFAULT false' },
    { name: 'last_login', type: 'TIMESTAMP' },
  ]

  for (const col of columnsToAdd) {
    try {
      await sql`ALTER TABLE developers ADD COLUMN IF NOT EXISTS ${sql.unsafe(col.name)} ${sql.unsafe(col.type)}`
      console.log(`Added/verified column: ${col.name}`)
    } catch (err) {
      console.log(`Column ${col.name} might already exist or error:`, err.message)
    }
  }

  // Verify table structure
  const columns = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'developers'
    ORDER BY ordinal_position
  `
  
  console.log('\nDevelopers table columns:')
  columns.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`))
  
  console.log('\nDevelopers table fixed successfully!')
}

fixDevelopersTable().catch(console.error)
