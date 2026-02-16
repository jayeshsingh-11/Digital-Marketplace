-- 1. Add approved column safely (if not exists)
do $$ 
begin 
    if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'approved') then 
        alter table public.products add column approved boolean default true; 
    end if; 
end $$;

-- 2. Backfill existing products to be approved
update public.products set approved = true where approved is null;

-- 3. Create secure admin check function to prevent recursion
create or replace function public.is_admin()
returns boolean 
language plpgsql 
security definer 
as $$
begin
  return exists (
    select 1 
    from public.users 
    where id = auth.uid() 
    and role = 'admin'
  );
end;
$$;

-- 4. Drop problematic recursive policies
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Admins can view all profiles" on public.users;
drop policy if exists "Admins manage all" on public.products;
drop policy if exists "Admins view all" on public.orders;

-- 5. Re-create Users policies
create policy "Users can view their own profile" 
on public.users 
for select 
using (auth.uid() = id);

create policy "Admins can view all profiles" 
on public.users 
for select 
using (public.is_admin());

-- 6. Re-create Admin policies using the non-recursive function
create policy "Admins manage all" 
on public.products 
for all 
using (public.is_admin());

create policy "Admins view all" 
on public.orders 
for select 
using (public.is_admin());
