# AXIGEAR CRM - Authentication Setup Guide

## Overview
The app now has a complete login system that redirects unauthenticated users to a login page. After login, users are taken directly to the Projects page.

## Features Implemented

1. **Login Page** - Email and password authentication
2. **Sign Up Page** - Create new accounts
3. **Protected Routes** - Projects and Invoice pages require authentication
4. **Session Management** - Auth tokens stored in localStorage
5. **Logout Functionality** - Logout button in navigation
6. **Database Schema** - User management and project isolation

## Setup Instructions

### Step 1: Run SQL Queries in Supabase

1. Go to your Supabase dashboard: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire content from `SUPABASE_SQL_SETUP.sql`
5. Paste it into the SQL editor
6. Click **Run**

This will create:
- `users` table - Store user profile information
- `projects` table - Store customer projects (linked to users)
- `invoices` table - Store invoices (linked to projects)
- Row Level Security (RLS) policies - Ensure users only see their own data
- Indexes - For better performance
- Trigger - Auto-create user profiles on signup

### Step 2: Enable Authentication in Supabase

1. In Supabase dashboard, go to **Authentication > Providers**
2. Ensure **Email** provider is enabled
3. (Optional) Configure email confirmation settings
4. Copy your **Supabase URL** and **Anon Key** (already configured in `.env`)

### Step 3: Update Projects Table Schema

When users create projects, the app now needs to include `user_id`. The Projects table is already set up to filter by the logged-in user's ID.

## How It Works

### Login Flow
1. User opens the app → redirected to `/login`
2. User enters email and password
3. Supabase authenticates the user
4. Auth token stored in localStorage
5. User automatically redirected to `/projects`

### Protected Routes
- All routes except `/login` require authentication
- If unauthenticated, users are redirected to login page
- The `ProtectedRoute` component handles this

### Data Isolation
- Users only see their own projects via Row Level Security
- Database queries automatically filter by `user_id`
- No user can access another user's data

## Test Credentials

You can:
1. **Sign Up** - Create a new account via the sign-up form
2. **Sign In** - Use the email and password you created
3. Use test email formats like: `test@example.com`, `demo@example.com`

## Logout

Click the **Logout** button in the top navigation to:
- Clear auth token from localStorage
- Sign out from Supabase
- Redirect to login page

## File Changes

### New Files
- `client/pages/Login.tsx` - Login/Sign-up page component
- `client/lib/auth.ts` - Authentication utility functions

### Modified Files
- `client/App.tsx` - Added route protection and login redirect
- `client/components/Layout.tsx` - Added logout button
- `.env` - Supabase credentials (already added)

## Database Schema

### users table
```
id (UUID) - Primary key, linked to auth.users
email (TEXT) - User email
full_name (TEXT) - User's full name
company_name (TEXT) - User's company
created_at (TIMESTAMP) - Account creation date
updated_at (TIMESTAMP) - Last update date
```

### projects table
```
id (UUID) - Primary key
user_id (UUID) - Link to users table
customer_name (TEXT) - Customer name
contact_no (TEXT) - Contact number
location (TEXT) - Project location
product_description (TEXT) - Product details
hsn_no (TEXT) - HSN number
chassis_no (TEXT) - Chassis number
amount (DECIMAL) - Project amount
created_at (TIMESTAMP) - Creation date
updated_at (TIMESTAMP) - Update date
```

### invoices table
```
id (UUID) - Primary key
project_id (UUID) - Link to projects table
user_id (UUID) - Link to users table
invoice_number (TEXT) - Unique invoice number
invoice_date (DATE) - Invoice date
due_date (DATE) - Payment due date
total_amount (DECIMAL) - Invoice total
status (TEXT) - draft, sent, paid, cancelled
created_at (TIMESTAMP) - Creation date
updated_at (TIMESTAMP) - Update date
```

## Row Level Security (RLS)

All tables have RLS enabled with policies:
- Users can only **view** their own records
- Users can only **create** records for themselves
- Users can only **update** their own records
- Users can only **delete** their own records

This is enforced at the database level, ensuring no data leaks.

## Troubleshooting

### "Supabase client not initialized"
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env`
- Restart the dev server

### Users see empty projects
- Make sure SQL queries were run successfully
- Check Row Level Security policies are enabled
- Verify user_id is being passed correctly when creating projects

### Can't sign up
- Check email confirmation settings in Supabase
- Verify auth provider (Email) is enabled
- Check browser console for error messages

## Next Steps

1. ✅ Run SQL queries in Supabase
2. ✅ Test login/sign-up
3. ✅ Create a project (will be linked to your account)
4. ✅ Generate invoices from projects
5. ✅ Deploy to production (update env vars in Netlify/Vercel)
