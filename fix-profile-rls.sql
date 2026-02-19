-- Allow users to update their own profile
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);

-- Allow users to insert their own profile (needed for upsert if row is missing)
create policy "Users can insert their own profile" on public.users for insert with check (auth.uid() = id);
