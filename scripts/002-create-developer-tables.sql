-- Create developers table
CREATE TABLE IF NOT EXISTS developers (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50),
  country VARCHAR(10) DEFAULT 'US',
  currency VARCHAR(10) DEFAULT 'USD',
  credits_balance DECIMAL(15, 2) DEFAULT 0,
  credits_usd_equivalent DECIMAL(10, 2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create OTP verification table
CREATE TABLE IF NOT EXISTS otp_verification (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,
  name VARCHAR(100) DEFAULT 'Default Key',
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id SERIAL PRIMARY KEY,
  developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'signup_bonus', 'purchase', 'api_usage', 'refund'
  amount DECIMAL(15, 2) NOT NULL,
  usd_equivalent DECIMAL(10, 2),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create API usage logs table
CREATE TABLE IF NOT EXISTS api_usage (
  id SERIAL PRIMARY KEY,
  developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
  endpoint VARCHAR(100) NOT NULL,
  model VARCHAR(50),
  credits_used DECIMAL(10, 4),
  request_data JSONB,
  response_status VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create developer sessions table
CREATE TABLE IF NOT EXISTS developer_sessions (
  id SERIAL PRIMARY KEY,
  developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_developers_email ON developers(email);
CREATE INDEX IF NOT EXISTS idx_api_keys_developer ON api_keys(developer_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_developer ON credit_transactions(developer_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_developer ON api_usage(developer_id);
CREATE INDEX IF NOT EXISTS idx_developer_sessions_token ON developer_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_otp_verification_email ON otp_verification(email);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_developers_updated_at ON developers;
CREATE TRIGGER update_developers_updated_at
    BEFORE UPDATE ON developers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
