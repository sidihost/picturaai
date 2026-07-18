import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function setupOtpTable() {
  console.log('Setting up otp_verification table...');
  
  try {
    // Drop existing table if it has wrong schema
    await sql`DROP TABLE IF EXISTS otp_verification CASCADE`;
    console.log('Dropped existing otp_verification table');
    
    // Create with correct schema
    await sql`
      CREATE TABLE otp_verification (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        country_code VARCHAR(10) DEFAULT 'US',
        currency VARCHAR(10) DEFAULT 'USD',
        phone VARCHAR(50),
        referral_source VARCHAR(100),
        promo_code VARCHAR(50),
        otp_code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Created otp_verification table with correct schema');
    
    // Create index for faster lookups
    await sql`CREATE INDEX IF NOT EXISTS idx_otp_verification_email ON otp_verification(email)`;
    console.log('Created index on email column');
    
    console.log('OTP verification table setup complete!');
  } catch (error) {
    console.error('Error setting up table:', error);
    throw error;
  }
}

setupOtpTable();
