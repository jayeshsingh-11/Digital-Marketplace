-- Add bio column to users table if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio text;
