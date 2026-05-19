-- Create service_invoices table
CREATE TABLE IF NOT EXISTS public.service_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_invoice_no TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  contact_no TEXT,
  location TEXT,
  product TEXT,
  product_description TEXT,
  invoice_date DATE,
  amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX idx_service_invoices_user_id ON public.service_invoices(user_id);
CREATE INDEX idx_service_invoices_created_at ON public.service_invoices(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.service_invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow users to only see their own records
CREATE POLICY "Users can view their own service invoices"
  ON public.service_invoices
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own service invoices"
  ON public.service_invoices
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service invoices"
  ON public.service_invoices
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service invoices"
  ON public.service_invoices
  FOR DELETE
  USING (auth.uid() = user_id);
