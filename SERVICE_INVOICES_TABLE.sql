-- Create Service Invoices Table
CREATE TABLE IF NOT EXISTS service_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_invoice_no VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  contact_no VARCHAR(20),
  location VARCHAR(255),
  product VARCHAR(255) NOT NULL,
  product_description TEXT,
  invoice_date DATE,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  unit INTEGER NOT NULL DEFAULT 1,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_invoices_user_id ON service_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_service_invoices_product ON service_invoices(product);
CREATE INDEX IF NOT EXISTS idx_service_invoices_created_at ON service_invoices(created_at DESC);

-- Enable Row Level Security
ALTER TABLE service_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own service invoices"
  ON service_invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own service invoices"
  ON service_invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service invoices"
  ON service_invoices FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service invoices"
  ON service_invoices FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON service_invoices TO authenticated;

-- Create trigger to auto-update timestamp
CREATE OR REPLACE FUNCTION update_service_invoices_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS service_invoices_update_timestamp ON service_invoices;
CREATE TRIGGER service_invoices_update_timestamp
BEFORE UPDATE ON service_invoices
FOR EACH ROW
EXECUTE FUNCTION update_service_invoices_timestamp();
