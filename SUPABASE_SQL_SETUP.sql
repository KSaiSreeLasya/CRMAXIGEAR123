-- ============================================
-- SUPABASE SQL SETUP FOR AXIGEAR CRM
-- ============================================
-- Run these SQL queries in your Supabase dashboard:
-- Go to SQL Editor → New Query → Copy & Paste → Run

-- ============================================
-- 1. CREATE USERS TABLE (for additional user info)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. CREATE PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  contact_no TEXT NOT NULL,
  location TEXT NOT NULL,
  product_description TEXT NOT NULL,
  hsn_no TEXT NOT NULL,
  chassis_no TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. CREATE INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  total_amount DECIMAL(12, 2) NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, sent, paid, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects(created_at);
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices(user_id);
CREATE INDEX IF NOT EXISTS invoices_project_id_idx ON invoices(project_id);

-- ============================================
-- 5. CREATE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Projects table policies
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Invoices table policies
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" ON invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices" ON invoices
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 6. SETUP AUTHENTICATION
-- ============================================
-- Supabase Auth is already set up automatically
-- Users can sign up/sign in via the app
-- Email confirmation can be configured in Supabase settings

-- ============================================
-- 7. CREATE TRIGGER FOR USERS TABLE
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
