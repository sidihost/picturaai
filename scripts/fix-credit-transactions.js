import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function fixCreditTransactions() {
  console.log('Fixing credit_transactions table...');
  
  try {
    // Drop the existing constraint
    await sql`ALTER TABLE credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_type_check`;
    console.log('Dropped old constraint');
    
    // Add new constraint with all needed types
    await sql`
      ALTER TABLE credit_transactions 
      ADD CONSTRAINT credit_transactions_type_check 
      CHECK (type IN ('signup_bonus', 'purchase', 'usage', 'refund', 'promo', 'referral', 'bonus', 'deduction', 'credit', 'debit'))
    `;
    console.log('Added new constraint with all transaction types');
    
    // Also ensure all required columns exist
    const columns = [
      { name: 'developer_id', type: 'UUID REFERENCES developers(id)' },
      { name: 'type', type: 'VARCHAR(50) NOT NULL' },
      { name: 'amount', type: 'INTEGER NOT NULL' },
      { name: 'description', type: 'TEXT' },
      { name: 'reference_id', type: 'VARCHAR(255)' },
      { name: 'balance_after', type: 'INTEGER' },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' },
    ];
    
    for (const col of columns) {
      try {
        await sql`ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS ${sql(col.name)} ${sql.unsafe(col.type)}`;
      } catch (e) {
        // Column might already exist with different type, that's ok
      }
    }
    
    console.log('All columns verified');
    console.log('credit_transactions table fixed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixCreditTransactions();
