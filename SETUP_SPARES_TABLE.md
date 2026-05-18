# Setup Instructions for Spares Inventory

## Summary of Changes

The Inventory page now has three tabs:
1. **Sales Vehicles Inventory** - Existing vehicle inventory
2. **Spares Inventory** - NEW: Parts/spares with PARTNAME, PRICE, QTY, and auto-calculated TOTAL
3. **Estimation Cost** - Estimation records

## Database Setup

The app will work with or without the Supabase table, falling back to localStorage automatically.

### To Create the Spares Inventory Table in Supabase:

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the SQL from `SQL_SCHEMA.sql` in your project root
3. Click **Run** to create the table

### SQL to Execute:

```sql
-- Spares Inventory Table
CREATE TABLE IF NOT EXISTS spares_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  part_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  qty INTEGER NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0 GENERATED ALWAYS AS (price * qty) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_spares_inventory_user_id ON spares_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_spares_inventory_created_at ON spares_inventory(created_at DESC);

-- Row Level Security
ALTER TABLE spares_inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own spares"
  ON spares_inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spares"
  ON spares_inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spares"
  ON spares_inventory FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spares"
  ON spares_inventory FOR DELETE
  USING (auth.uid() = user_id);

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON spares_inventory TO authenticated;
```

## Features

### Spares Inventory Tab:
- **Part Name**: Name of the spare part
- **Price**: Cost per unit
- **Quantity**: Number of units
- **Total**: Automatically calculated (Price × Quantity)
- Full CRUD operations (Create, Read, Update, Delete)

### Error Handling:
✅ Improved error handling - if the table doesn't exist, the app falls back to localStorage
✅ All three tabs work offline with localStorage
✅ Data syncs to Supabase when the table exists

## Testing Without Database

You can test the Spares Inventory tab immediately:
1. Click the "Spares Inventory" tab in the Inventory page
2. Add a spare item (Part Name, Price, Quantity)
3. Click "Save Spare"
4. The TOTAL will auto-calculate
5. Data is saved to browser localStorage

Once you create the table in Supabase, data will sync there too!

## Troubleshooting

**Q: Getting "Error loading spares" message?**
A: This is now fixed with improved error handling. The app will use localStorage as fallback.

**Q: Data not appearing in Supabase?**
A: Check that the `spares_inventory` table exists in your Supabase dashboard under **Tables**.

**Q: Can't insert new records?**
A: Make sure Row Level Security (RLS) policies are enabled on the table. The SQL above includes all necessary policies.
