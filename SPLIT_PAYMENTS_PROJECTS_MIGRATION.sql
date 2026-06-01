-- This migration adds split_payments functionality for projects
-- The split_payments table already exists and supports multiple reference types

-- First, ensure the transactions table has correct structure
ALTER TABLE IF EXISTS transactions
ADD COLUMN IF NOT EXISTS reference_type TEXT NOT NULL DEFAULT 'project',
ADD COLUMN IF NOT EXISTS reference_id UUID,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'partial';

-- Ensure split_payments table exists with correct structure
CREATE TABLE IF NOT EXISTS split_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  mode_of_payment TEXT NOT NULL,
  payment_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_split_payments_transaction_id ON split_payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference_type, reference_id);

-- Add payment mode enum if it doesn't exist (optional, for better data integrity)
DO $$ 
BEGIN
    CREATE TYPE payment_mode AS ENUM ('Cash', 'Card', 'UPI', 'Cheque', 'Other');
EXCEPTION 
    WHEN duplicate_object THEN NULL;
END $$;

-- Sample queries to retrieve split payment data:
-- SELECT 
--   t.id as transaction_id,
--   t.reference_type,
--   t.reference_id,
--   t.total_amount,
--   t.paid_amount,
--   sp.mode_of_payment,
--   sp.amount,
--   sp.payment_date
-- FROM transactions t
-- LEFT JOIN split_payments sp ON t.id = sp.transaction_id
-- WHERE t.reference_type = 'project'
-- ORDER BY t.created_at DESC;
