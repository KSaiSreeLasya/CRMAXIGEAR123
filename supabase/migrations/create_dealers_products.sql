-- Create Dealers Table
CREATE TABLE public.dealers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_no VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Products Table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_no VARCHAR(100) NOT NULL,
  dealer_id UUID REFERENCES public.dealers(id) ON DELETE CASCADE,
  dealer_name VARCHAR(255) NOT NULL,
  dealer_code VARCHAR(100),
  contact_no VARCHAR(20),
  location VARCHAR(255),
  product_description TEXT,
  hsn_no VARCHAR(50),
  no_of_vehicles INTEGER,
  chassis_no VARCHAR(100),
  motor_no VARCHAR(100),
  battery_no VARCHAR(100),
  battery_vehicle_specs TEXT,
  battery_warranty VARCHAR(100),
  battery_capacity VARCHAR(50),
  vehicle_warranty VARCHAR(100),
  invoice_date DATE,
  amount DECIMAL(12, 2),
  mode_of_payment VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_products_dealer_id ON public.products(dealer_id);
CREATE INDEX idx_products_dealer_name ON public.products(dealer_name);
CREATE INDEX idx_products_invoice_date ON public.products(invoice_date);
CREATE INDEX idx_dealers_name ON public.dealers(name);

-- Enable Row Level Security (RLS)
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dealers
CREATE POLICY "Allow authenticated users to view dealers" ON public.dealers
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to insert dealers" ON public.dealers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update dealers" ON public.dealers
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow authenticated users to delete dealers" ON public.dealers
  FOR DELETE
  USING (true);

-- Create RLS policies for products
CREATE POLICY "Allow authenticated users to view products" ON public.products
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to insert products" ON public.products
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update products" ON public.products
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow authenticated users to delete products" ON public.products
  FOR DELETE
  USING (true);
