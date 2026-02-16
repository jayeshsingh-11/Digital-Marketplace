# Supabase Setup Guide

Follow these steps to configure your Supabase project for the Digital Marketplace.

## 1. Create a Supabase Project
1.  Go to [database.new](https://database.new) and sign in with GitHub.
2.  Create a new organization (if needed) and a new project (e.g., "Digital Marketplace").
3.  Set a strong database password (and save it, though we mainly use API keys).
4.  Wait for the project to provision (takes ~1-2 minutes).

## 2. Get API Keys
1.  In your Supabase Dashboard, go to **Settings** (gear icon) -> **API**.
2.  Find the `Project URL` and `anon` / `public` key.
3.  Also find the `service_role` / `secret` key (reveal it).

## 3. Update Environment Variables
Open your `.env` file in VS Code and update/add these lines:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (needed for admin tasks/migration)
```

## 4. Run database Schema
1.  In the Supabase Dashboard, go to the **SQL Editor** (icon on the left requiring `Run`).
2.  Click **New query**.
3.  Copy the entire content of `supabase/schema.sql` from your project.
4.  Paste it into the SQL Editor.
5.  Click **Run** (bottom right).
    - *Success*: You should see "Success. No rows returned."

## 5. Verify Setup
1.  Go to **Table Editor**. You should see tables: `users`, `products`, `orders`, etc.
2.  Go to **Storage**. You should see buckets: `media` and `product_files`.
3.  Go to **Authentication** -> **Providers**. Ensure "Email" is enabled.

## Next Steps
Once this is done, let me know, and I will proceed with updating the application code to use these new credentials!
