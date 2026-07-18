import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function createApiUsageTable() {
  console.log('Creating api_usage table...')
  
  await sql`
    CREATE TABLE IF NOT EXISTS api_usage (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
      endpoint VARCHAR(255) NOT NULL,
      model VARCHAR(100),
      credits_used DECIMAL(10, 4) DEFAULT 0,
      request_data JSONB,
      response_status VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  
  console.log('Created api_usage table successfully!')
  
  // Create index for faster lookups
  await sql`
    CREATE INDEX IF NOT EXISTS idx_api_usage_developer ON api_usage(developer_id)
  `
  
  await sql`
    CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage(created_at)
  `
  
  console.log('Created indexes successfully!')
}

createApiUsageTable()
  .then(() => console.log('Done!'))
  .catch(err => console.error('Error:', err))
