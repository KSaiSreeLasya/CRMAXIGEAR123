-- Create transactions table (one per invoice/project)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference_type TEXT NOT NULL, -- 'estimation', 'service_invoice', 'project'
  reference_id UUID NOT NULL, -- ID of the estimation/service_invoice/project
  total_amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  status TEXT DEFAULT 'partial', -- 'partial' or 'complete'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create split_payments table (one entry per payment method)
CREATE TABLE IF NOT EXISTS public.split_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  mode_of_payment TEXT NOT NULL, -- 'Cash', 'Card', 'UPI', 'Cheque', 'Other'
  payment_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON public.transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_split_payments_transaction_id ON public.split_payments(transaction_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for transactions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own transactions') THEN
    CREATE POLICY "Users can view their own transactions"
      ON public.transactions
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own transactions') THEN
    CREATE POLICY "Users can insert their own transactions"
      ON public.transactions
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own transactions') THEN
    CREATE POLICY "Users can update their own transactions"
      ON public.transactions
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own transactions') THEN
    CREATE POLICY "Users can delete their own transactions"
      ON public.transactions
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS policies for split_payments (via transaction ownership)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view split payments for their transactions') THEN
    CREATE POLICY "Users can view split payments for their transactions"
      ON public.split_payments
      FOR SELECT
      USING (transaction_id IN (
        SELECT id FROM public.transactions WHERE user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert split payments for their transactions') THEN
    CREATE POLICY "Users can insert split payments for their transactions"
      ON public.split_payments
      FOR INSERT
      WITH CHECK (transaction_id IN (
        SELECT id FROM public.transactions WHERE user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update split payments for their transactions') THEN
    CREATE POLICY "Users can update split payments for their transactions"
      ON public.split_payments
      FOR UPDATE
      USING (transaction_id IN (
        SELECT id FROM public.transactions WHERE user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete split payments for their transactions') THEN
    CREATE POLICY "Users can delete split payments for their transactions"
      ON public.split_payments
      FOR DELETE
      USING (transaction_id IN (
        SELECT id FROM public.transactions WHERE user_id = auth.uid()
      ));
  END IF;
END $$;
