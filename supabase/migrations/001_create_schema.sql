-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  model_no TEXT,
  customer_name TEXT NOT NULL,
  contact_no TEXT NOT NULL,
  location TEXT NOT NULL,
  product_description TEXT NOT NULL,
  hsn_no TEXT NOT NULL,
  chassis_no TEXT NOT NULL,
  motor_no TEXT,
  battery_no TEXT,
  battery_warranty TEXT,
  battery_capacity TEXT,
  vehicle_warranty TEXT,
  invoice_date TEXT,
  amount NUMERIC NOT NULL,
  mode_of_payment TEXT DEFAULT 'Cash',
  lead_source TEXT,
  show_split_payment_details BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create estimations table
CREATE TABLE IF NOT EXISTS public.estimations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  estimation_slip_no TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  contact_no TEXT NOT NULL,
  address TEXT NOT NULL,
  estimation_date TEXT,
  model TEXT,
  amount NUMERIC NOT NULL,
  mode_of_payment TEXT DEFAULT 'Cash',
  lead_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  reference_type TEXT NOT NULL CHECK (reference_type IN ('estimation', 'service_invoice', 'project')),
  reference_id TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'partial' CHECK (status IN ('partial', 'complete')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reference_type, reference_id)
);

-- Create split_payments table
CREATE TABLE IF NOT EXISTS public.split_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  mode_of_payment TEXT,
  payment_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  model_no TEXT NOT NULL,
  chassis_no TEXT NOT NULL,
  motor_no TEXT,
  battery_no TEXT,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(model_no, chassis_no)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_chassis_no ON public.projects(chassis_no);
CREATE INDEX IF NOT EXISTS idx_estimations_user_id ON public.estimations(user_id);
CREATE INDEX IF NOT EXISTS idx_estimations_created_at ON public.estimations(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON public.transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_split_payments_transaction_id ON public.split_payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_chassis_no ON public.inventory(chassis_no);

-- Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects
CREATE POLICY "Users can view their own projects"
  ON public.projects
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects"
  ON public.projects
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects"
  ON public.projects
  FOR DELETE
  USING (user_id = auth.uid());

-- Create RLS policies for estimations
CREATE POLICY "Users can view their own estimations"
  ON public.estimations
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create estimations"
  ON public.estimations
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own estimations"
  ON public.estimations
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own estimations"
  ON public.estimations
  FOR DELETE
  USING (user_id = auth.uid());

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own transactions"
  ON public.transactions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions
  FOR DELETE
  USING (user_id = auth.uid());

-- Create RLS policies for split_payments (allow access through transactions)
CREATE POLICY "Users can view split payments for their transactions"
  ON public.split_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions
      WHERE transactions.id = split_payments.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create split payments for their transactions"
  ON public.split_payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions
      WHERE transactions.id = split_payments.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update split payments for their transactions"
  ON public.split_payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions
      WHERE transactions.id = split_payments.transaction_id
      AND transactions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions
      WHERE transactions.id = split_payments.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete split payments for their transactions"
  ON public.split_payments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions
      WHERE transactions.id = split_payments.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

-- Create RLS policies for inventory
CREATE POLICY "Users can view their own inventory"
  ON public.inventory
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create inventory"
  ON public.inventory
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own inventory"
  ON public.inventory
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own inventory"
  ON public.inventory
  FOR DELETE
  USING (user_id = auth.uid());
