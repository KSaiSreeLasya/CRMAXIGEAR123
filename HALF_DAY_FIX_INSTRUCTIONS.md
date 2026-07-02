# Fix: Half-Day Attendance Count Display

## Problem
When marking an employee as "Half Day", the total number of presents was showing as "1" instead of "0.5" days.

## Root Cause
The database columns `num_presents`, `num_weekly_offs`, `num_absents`, `num_leaves`, and `paid_days` in the `employee_monthly_payroll` table were defined as `INTEGER`, which truncates decimal values. Since half days = 0.5, they were being stored as integers and losing the decimal precision.

## Solution Applied

### Code Changes (Already Done)
1. **Display formatting** - Updated `client/pages/Attendance.tsx` to display decimal values with 1 decimal place:
   - `numPresents` now displays as "0.5" for half days
   - `paidDays` also displays decimals properly
   
2. **Data loading** - Ensured numeric conversion when loading from database:
   - Added `Number()` conversion for all payroll fields when fetching from Supabase

### Database Migration (Manual - You Need to Run This)

You need to run the following SQL in your Supabase SQL Editor to convert the columns:

```sql
-- Fix employee_monthly_payroll columns to support decimal values for half days
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
```

**Location:** `sql/fix_payroll_decimal_columns.sql` (already created)

## Steps to Complete

1. **Open Supabase Console**
   - Go to https://app.supabase.com
   - Navigate to your project

2. **Run the Migration**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"
   - Copy the SQL from `sql/fix_payroll_decimal_columns.sql`
   - Paste it into the editor
   - Click "Run"

3. **Test the Fix**
   - Go to the Attendance page
   - Select an employee
   - Mark them as "Half Day"
   - Save the attendance
   - Refresh the page
   - The total presents should now show as "0.5" instead of "1"

## Verification
After running the migration and saving new attendance records:
- Half day entries should show 0.5 in the presents count
- Full day entries should show 1.0
- Paid days should also reflect decimal values correctly

## Notes
- Existing data in the database will not be affected by this change
- Only new attendance entries will benefit from the decimal precision
- You may want to run a manual payroll recalculation for previous months to correct historical data
