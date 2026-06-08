# Supabase Setup Guide - Dealers & Products Module

## Project Credentials

- **Supabase Project ID**: `pevjxmhzulmmdidvlbsu`
- **Supabase URL**: `https://pevjxmhzulmmdidvlbsu.supabase.co`
- **Anon Key**: Already configured in `.env`

## Steps to Set Up Tables

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **pevjxmhzulmmdidvlbsu**
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy and paste the SQL code below:

```sql
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
```

6. Click **Run** to execute the query
7. You should see "Success" message

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push
```

## Verify Setup

After running the SQL:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see two new tables:
   - `dealers` - with columns: id, name, contact_no, address, created_at, updated_at
   - `products` - with columns: id, model_no, dealer_id, dealer_name, dealer_code, contact_no, location, product_description, hsn_no, no_of_vehicles, chassis_no, motor_no, battery_no, battery_vehicle_specs, battery_warranty, battery_capacity, vehicle_warranty, invoice_date, amount, mode_of_payment, created_at, updated_at

## Database Schema

### Dealers Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Dealer name |
| contact_no | VARCHAR(20) | Contact number |
| address | TEXT | Address |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record update timestamp |

### Products Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| model_no | VARCHAR(100) | Model number |
| dealer_id | UUID | Foreign key to dealers.id |
| dealer_name | VARCHAR(255) | Dealer name (denormalized) |
| dealer_code | VARCHAR(100) | Dealer code |
| contact_no | VARCHAR(20) | Contact number |
| location | VARCHAR(255) | Location |
| product_description | TEXT | Product description |
| hsn_no | VARCHAR(50) | HSN number |
| no_of_vehicles | INTEGER | Number of vehicles |
| chassis_no | VARCHAR(100) | Chassis number |
| motor_no | VARCHAR(100) | Motor number |
| battery_no | VARCHAR(100) | Battery number |
| battery_vehicle_specs | TEXT | Battery and vehicle specifications |
| battery_warranty | VARCHAR(100) | Battery warranty |
| battery_capacity | VARCHAR(50) | Battery capacity |
| vehicle_warranty | VARCHAR(100) | Vehicle warranty |
| invoice_date | DATE | Invoice date |
| amount | DECIMAL(12, 2) | Invoice amount |
| mode_of_payment | VARCHAR(50) | Mode of payment |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record update timestamp |

## Frontend Integration

The frontend is already configured to use Supabase:

- **Environment Variables**: `.env` file contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **Database Service**: `client/lib/dealers.ts` handles all database operations
- **Components**: 
  - `client/pages/Dealers.tsx` - Main page
  - `client/components/dealers/DealersTab.tsx` - Dealers form and list
  - `client/components/dealers/ProductsTab.tsx` - Products form and list

## Features

✅ **Dealers Management**
- Add dealers with name, contact number, and address
- View all dealers in a table
- Delete dealers (cascades to products)

✅ **Products Management**
- Add products with comprehensive details
- Select dealer from dropdown
- Store all vehicle and battery specifications
- Track invoice information and payment details
- Delete products

✅ **Data Persistence**
- All data is stored in Supabase PostgreSQL database
- Real-time updates reflected in UI
- Automatic timestamps for audit trail

## Testing

1. Navigate to `/dealers` page
2. Add a dealer using the "Add New Dealer" form
3. Switch to "Products" tab
4. Add a product and select the dealer from dropdown
5. Data should persist even after page refresh
6. Check Supabase dashboard to verify data was stored

## Troubleshooting

### Tables not showing data
- Verify RLS policies are enabled
- Check console for API errors
- Ensure credentials in `.env` are correct

### Foreign key errors
- Make sure dealer is added before adding products
- When deleting dealers, products will be automatically deleted

### Connection errors
- Verify internet connection
- Check Supabase project status
- Confirm API keys in `.env` are correct
