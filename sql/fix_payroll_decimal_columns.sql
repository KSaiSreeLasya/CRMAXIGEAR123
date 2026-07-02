-- Fix employee_monthly_payroll columns to support decimal values for half days
-- This allows storing 0.5 for half days instead of truncating to 0 or 1

BEGIN;

-- Alter the columns to be numeric with 1 decimal place
ALTER TABLE public.employee_monthly_payroll
  ALTER COLUMN num_presents TYPE numeric(5,1) USING num_presents::numeric(5,1);

ALTER TABLE public.employee_monthly_payroll
  ALTER COLUMN num_weekly_offs TYPE numeric(5,1) USING num_weekly_offs::numeric(5,1);

ALTER TABLE public.employee_monthly_payroll
  ALTER COLUMN num_absents TYPE numeric(5,1) USING num_absents::numeric(5,1);

ALTER TABLE public.employee_monthly_payroll
  ALTER COLUMN num_leaves TYPE numeric(5,1) USING num_leaves::numeric(5,1);

ALTER TABLE public.employee_monthly_payroll
  ALTER COLUMN paid_days TYPE numeric(5,1) USING paid_days::numeric(5,1);

COMMIT;
