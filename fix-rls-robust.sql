-- Robust Fix for RLS Recursion
-- This script:
-- 1. Drops conflicting policies and functions
-- 2. recreates is_admin() with proper search_path and security definer
-- 3. Re-applies policies safely

begin;

-- Drop function first (cascade will handle policies depending on it, but better safe)
drop policy if exists "Admins can view all profiles" on public.users;
drop policy if exists "Admins manage all" on public.products;
drop policy if exists "Admins view all" on public.orders;

-- Re-define is_admin with robust security settings
create or replace function public.is_admin()
returns boolean 
language plpgsql 
security definer 
set search_path = public, auth, pg_temp
as $$
begin
  -- Check if the user has the 'admin' role in public.users table
  -- Since this is SECURITY DEFINER, it bypasses RLS on public.users
  return exists (
    select 1 
    from public.users 
    where id = auth.uid() 
    and role = 'admin'
  );
end;
$$;

-- Verify the function owner (optional, usually matches requestor)
-- alter function public.is_admin() owner to postgres; 

-- Re-create Policies
create policy "Admins can view all profiles" 
on public.users 
for select 
using (public.is_admin());

create policy "Admins manage all" 
on public.products 
for all 
using (public.is_admin());

create policy "Admins view all" 
on public.orders 
for select 
using (public.is_admin());

commit;
