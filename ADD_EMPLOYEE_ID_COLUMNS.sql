-- Add employee_id columns to support employee-specific data filtering
-- Run this in Supabase SQL Editor

-- Add employee_id to estimations table (for Sales module)
ALTER TABLE IF EXISTS public.estimations 
  ADD COLUMN IF NOT EXISTS employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_estimations_employee_id ON public.estimations(employee_id);

-- Add employee_id to inventory_items table (for Inventory module)
-- Note: inventory_items already has user_id for admin tracking
-- employee_id allows employees to see/edit their assigned inventory
ALTER TABLE IF EXISTS public.inventory_items 
  ADD COLUMN IF NOT EXISTS employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_items_employee_id ON public.inventory_items(employee_id);

-- Add employee_id to spares_inventory table
ALTER TABLE IF EXISTS public.spares_inventory 
  ADD COLUMN IF NOT EXISTS employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_spares_inventory_employee_id ON public.spares_inventory(employee_id);

-- Add employee_id to service_invoices table
ALTER TABLE IF EXISTS public.service_invoices 
  ADD COLUMN IF NOT EXISTS employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_service_invoices_employee_id ON public.service_invoices(employee_id);

-- Add employee_id to projects table (for Admin module)
ALTER TABLE IF EXISTS public.projects 
  ADD COLUMN IF NOT EXISTS employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_projects_employee_id ON public.projects(employee_id);

-- attendance table already has employee_id from MODULES_SQL_SETUP
