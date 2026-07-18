import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('Creating newsletter_subscribers table...')
  
  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      unsubscribed_at TIMESTAMP WITH TIME ZONE,
      active BOOLEAN DEFAULT true
    )
  `
  
  console.log('Creating page_visits table for analytics...')
  
  await sql`
    CREATE TABLE IF NOT EXISTS page_visits (
      id SERIAL PRIMARY KEY,
      page_path VARCHAR(500) NOT NULL,
      visitor_id VARCHAR(100),
      user_agent TEXT,
      referrer TEXT,
      country VARCHAR(100),
      visited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `
  
  console.log('Creating index on page_visits...')
  
  await sql`
    CREATE INDEX IF NOT EXISTS idx_page_visits_path ON page_visits(page_path)
  `
  
  await sql`
    CREATE INDEX IF NOT EXISTS idx_page_visits_date ON page_visits(visited_at)
  `
  
  console.log('Done!')
}

main().catch(console.error)
