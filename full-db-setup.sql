-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Tables setup (Safe creation if missing)
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  role text check (role in ('admin', 'user')) default 'user',
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.media (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  url text not null,
  filename text not null,
  mime_type text,
  filesize integer,
  width integer,
  height integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.product_files (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  url text not null,
  filename text not null,
  mime_type text,
  filesize integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric not null,
  category text not null,
  approved boolean default false,
  price_id text,
  stripe_id text,
  product_file_id uuid references public.product_files(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  image_id uuid references public.media(id) on delete cascade not null,
  "order" integer default 0
);

create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete set null,
  is_paid boolean default false,
  amount numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.order_products (
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  primary key (order_id, product_id)
);

-- 3. Enable RLS on all tables
alter table public.users enable row level security;
alter table public.media enable row level security;
alter table public.product_files enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_products enable row level security;

-- 4. Triggers and Functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, role)
  values (new.id, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid error
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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

-- 5. Storage Buckets (Safe Insert)
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('product_files', 'product_files', false) on conflict do nothing;

-- 6. DROP ALL EXISTING POLICIES (Clean Slate)
-- This prevents "policy already exists" errors
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Admins can view all profiles" on public.users;
drop policy if exists "Public read access" on public.media;
drop policy if exists "Users manage own media" on public.media;
drop policy if exists "Users manage own files" on public.product_files;
drop policy if exists "Public read approved products" on public.products;
drop policy if exists "Users manage own products" on public.products;
drop policy if exists "Admins manage all" on public.products;
drop policy if exists "Public read" on public.product_images;
drop policy if exists "Users manage own" on public.product_images;
drop policy if exists "Users view own orders" on public.orders;
drop policy if exists "Admins view all" on public.orders;
drop policy if exists "Users can create their own orders" on public.orders;
drop policy if exists "Users view own order items" on public.order_products;
drop policy if exists "Users can add items to their orders" on public.order_products;
drop policy if exists "Media Public Read" on storage.objects;
drop policy if exists "Media Auth Upload" on storage.objects;
drop policy if exists "Product Files Auth Upload" on storage.objects;


-- 7. RE-CREATE ALL POLICIES

-- Users
create policy "Users can view their own profile" on public.users for select using (auth.uid() = id);
create policy "Admins can view all profiles" on public.users for select using (public.is_admin());

-- Media
create policy "Public read access" on public.media for select using (true);
create policy "Users manage own media" on public.media for all using (auth.uid() = user_id);

-- Product Files
create policy "Users manage own files" on public.product_files for all using (auth.uid() = user_id);

-- Products
create policy "Public read approved products" on public.products for select using (approved = true);
create policy "Users manage own products" on public.products for all using (auth.uid() = user_id);
create policy "Admins manage all" on public.products for all using (public.is_admin());

-- Product Images
create policy "Public read" on public.product_images for select using (true);
create policy "Users manage own" on public.product_images for all using (
  exists (select 1 from public.products where id = product_images.product_id and user_id = auth.uid())
);

-- Orders
create policy "Users view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Admins view all" on public.orders for select using (public.is_admin());

-- *** CHECKOUT FIX: INSERT POLICIES ***
-- Allow users to create orders linked to themselves
create policy "Users can create their own orders" on public.orders 
for insert 
with check (auth.uid() = user_id);

-- Order Products
create policy "Users view own order items" on public.order_products for select using (
  exists (select 1 from public.orders where id = order_products.order_id and user_id = auth.uid())
);

-- *** CHECKOUT FIX: INSERT POLICIES ***
-- Allow users to add items to orders they own
create policy "Users can add items to their orders" on public.order_products 
for insert 
with check (
  exists (
    select 1 from public.orders 
    where id = order_products.order_id 
    and user_id = auth.uid()
  )
);

-- Storage Policies
create policy "Media Public Read" on storage.objects for select using (bucket_id = 'media');
create policy "Media Auth Upload" on storage.objects for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "Product Files Auth Upload" on storage.objects for insert with check (bucket_id = 'product_files' and auth.role() = 'authenticated');

-- 8. GRANT USAGE (Permissions)
grant usage on schema public to authenticated;
grant all on public.users to authenticated;
grant all on public.products to authenticated;
grant all on public.product_images to authenticated;
grant all on public.orders to authenticated;
grant all on public.order_products to authenticated;
grant all on public.media to authenticated;
grant all on public.product_files to authenticated;
