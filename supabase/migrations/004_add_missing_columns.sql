-- Add missing show_split_payment_details column to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS show_split_payment_details BOOLEAN DEFAULT FALSE;
