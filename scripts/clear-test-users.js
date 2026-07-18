import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function clearTestUsers() {
  console.log('Clearing all test users and related data...\n');

  try {
    // Clear in correct order due to foreign key constraints
    
    // 1. Clear API usage logs
    const usageLogs = await sql`DELETE FROM api_usage RETURNING id`;
    console.log(`Deleted ${usageLogs.length} API usage logs`);

    // 2. Clear credit transactions
    const transactions = await sql`DELETE FROM credit_transactions RETURNING id`;
    console.log(`Deleted ${transactions.length} credit transactions`);

    // 3. Clear API keys
    const apiKeys = await sql`DELETE FROM api_keys RETURNING id`;
    console.log(`Deleted ${apiKeys.length} API keys`);

    // 4. Clear developer sessions
    const sessions = await sql`DELETE FROM developer_sessions RETURNING id`;
    console.log(`Deleted ${sessions.length} developer sessions`);

    // 5. Clear OTP verification records
    const otpRecords = await sql`DELETE FROM otp_verification RETURNING id`;
    console.log(`Deleted ${otpRecords.length} OTP verification records`);

    // 6. Clear all developers
    const developers = await sql`DELETE FROM developers RETURNING id, email`;
    console.log(`Deleted ${developers.length} developers:`);
    developers.forEach(dev => console.log(`  - ${dev.email}`));

    console.log('\n✓ All test data cleared successfully!');
    console.log('You can now re-test the signup flow.');

  } catch (error) {
    console.error('Error clearing data:', error.message);
  }
}

clearTestUsers();
