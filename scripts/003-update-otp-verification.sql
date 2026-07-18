-- Drop and recreate otp_verification table with correct schema
DROP TABLE IF EXISTS otp_verification;

CREATE TABLE otp_verification (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  country_code VARCHAR(10) DEFAULT 'US',
  currency VARCHAR(10) DEFAULT 'USD',
  phone VARCHAR(50),
  referral_source VARCHAR(100),
  promo_code VARCHAR(50),
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_verification_email ON otp_verification(email);
CREATE INDEX IF NOT EXISTS idx_otp_verification_expires ON otp_verification(expires_at);
