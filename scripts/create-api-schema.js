import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function createSchema() {
  try {
    console.log('Creating API schema...');

    // Developers table
    await sql`
      CREATE TABLE IF NOT EXISTS developers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        country_code VARCHAR(5),
        country VARCHAR(100),
        company_name VARCHAR(255),
        website VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        otp_code VARCHAR(6),
        otp_expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ developers table created');

    // API Keys table
    await sql`
      CREATE TABLE IF NOT EXISTS api_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
        key_hash VARCHAR(255) UNIQUE NOT NULL,
        key_preview VARCHAR(20) NOT NULL,
        name VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        last_used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ api_keys table created');

    // Credits table
    await sql`
      CREATE TABLE IF NOT EXISTS credits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        developer_id UUID NOT NULL UNIQUE REFERENCES developers(id) ON DELETE CASCADE,
        balance DECIMAL(10, 2) DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'USD',
        total_purchased DECIMAL(10, 2) DEFAULT 0,
        total_used DECIMAL(10, 2) DEFAULT 0,
        low_balance_notified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ credits table created');

    // API Usage table
    await sql`
      CREATE TABLE IF NOT EXISTS api_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
        api_key_id UUID REFERENCES api_keys(id),
        endpoint VARCHAR(255),
        method VARCHAR(10),
        model VARCHAR(100),
        tokens_used INTEGER DEFAULT 0,
        cost DECIMAL(10, 6),
        response_status INTEGER,
        request_ip VARCHAR(45),
        user_agent VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ api_usage table created');

    // Transactions/Invoices table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        description VARCHAR(255),
        payment_method VARCHAR(50),
        transaction_reference VARCHAR(255) UNIQUE,
        status VARCHAR(50) DEFAULT 'pending',
        metadata JSONB,
        invoice_number VARCHAR(50) UNIQUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ transactions table created');

    // Emails Log table (for tracking sent emails)
    await sql`
      CREATE TABLE IF NOT EXISTS email_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        developer_id UUID REFERENCES developers(id) ON DELETE SET NULL,
        recipient_email VARCHAR(255) NOT NULL,
        email_type VARCHAR(50),
        subject VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        zepto_message_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        sent_at TIMESTAMP
      )
    `;
    console.log('✓ email_logs table created');

    // Funding/Donations table
    await sql`
      CREATE TABLE IF NOT EXISTS funding (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
        amount_naira DECIMAL(10, 2) NOT NULL,
        amount_usd DECIMAL(10, 2),
        currency VARCHAR(3) DEFAULT 'NGN',
        payment_reference VARCHAR(255) UNIQUE,
        payment_method VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        provider_response JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      )
    `;
    console.log('✓ funding table created');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_developers_email ON developers(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_developer ON api_keys(developer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_api_usage_developer ON api_usage(developer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_developer ON transactions(developer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_logs_developer ON email_logs(developer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_funding_developer ON funding(developer_id)`;
    
    console.log('✓ All indexes created');
    console.log('✓ API schema setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating schema:', error);
    process.exit(1);
  }
}

createSchema();
