
-- Drop existing policies on users table to fix recursion
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Admins can view all profiles" on public.users;

-- Re-create policies with recursion checks
-- 1. Users can view their own profile (simple check)
create policy "Users can view their own profile" 
on public.users 
for select 
using (auth.uid() = id);

-- 2. Admins can view all profiles. 
-- The recursion likely happens because to check if someone is an admin, we query the public.users table (role = 'admin').
-- But querying public.users triggers RLS, which checks if they are admin... infinite loop.
-- Fix: To check admin status, use auth.jwt() or a separate admin table, OR use a security definer function that bypasses RLS to check role.
-- For now, let's try using auth.jwt() -> app_metadata or simply trusting the `role` column but ensuring the policy doesn't self-reference in a loop.
-- Safest way: Bypass RLS for the role check function.

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 
    from public.users 
    where id = auth.uid() 
    and role = 'admin'
  );
$$ language sql security definer; -- SECURITY DEFINER breaks the RLS loop

create policy "Admins can view all profiles" 
on public.users 
for select 
using (public.is_admin());
