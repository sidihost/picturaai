-- Create promo codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  bonus_credits DECIMAL(15, 2) NOT NULL DEFAULT 0,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Add promo_code column to otp_verification if not exists
ALTER TABLE otp_verification ADD COLUMN IF NOT EXISTS promo_code VARCHAR(50);

-- Insert some default promo codes for testing
INSERT INTO promo_codes (code, description, bonus_credits, max_uses) VALUES
  ('WELCOME10', 'Welcome bonus - 10 free credits', 10, 1000),
  ('LAUNCH50', 'Launch special - 50 free credits', 50, 100)
ON CONFLICT (code) DO NOTHING;
