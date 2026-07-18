import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function setupRateLimits() {
  try {
    console.log('Creating rate_limits table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS rate_limits (
        session_id TEXT PRIMARY KEY,
        count INTEGER DEFAULT 0,
        reset_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('rate_limits table created successfully!');
    
    // Create index for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_date ON rate_limits(reset_date)
    `;
    
    console.log('Index created successfully!');
    
  } catch (error) {
    console.error('Error setting up rate_limits table:', error);
    process.exit(1);
  }
}

setupRateLimits();
