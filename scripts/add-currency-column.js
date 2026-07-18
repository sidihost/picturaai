import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function addCurrencyColumn() {
  console.log('Adding missing columns to developers table...');
  
  try {
    // Add currency column if it doesn't exist
    await sql`
      ALTER TABLE developers 
      ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD'
    `;
    console.log('Added currency column');
    
    // Add any other potentially missing columns
    await sql`
      ALTER TABLE developers 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(30)
    `;
    console.log('Added phone column');
    
    await sql`
      ALTER TABLE developers 
      ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT 'US'
    `;
    console.log('Added country_code column');
    
    await sql`
      ALTER TABLE developers 
      ADD COLUMN IF NOT EXISTS referral_source VARCHAR(100)
    `;
    console.log('Added referral_source column');
    
    await sql`
      ALTER TABLE developers 
      ADD COLUMN IF NOT EXISTS promo_code VARCHAR(50)
    `;
    console.log('Added promo_code column');
    
    await sql`
      ALTER TABLE developers 
      ADD COLUMN IF NOT EXISTS bonus_credits INTEGER DEFAULT 0
    `;
    console.log('Added bonus_credits column');
    
    // Verify the table structure
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'developers'
      ORDER BY ordinal_position
    `;
    
    console.log('\nDevelopers table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\nAll columns added successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

addCurrencyColumn();
