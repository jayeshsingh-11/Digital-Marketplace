-- Allow authenticated users to create their own orders
create policy "Users can create their own orders" on public.orders 
for insert 
with check (auth.uid() = user_id);

-- Allow authenticated users to add items to their *own* orders
create policy "Users can add items to their orders" on public.order_products 
for insert 
with check (
  exists (
    select 1 from public.orders 
    where id = order_products.order_id 
    and user_id = auth.uid()
  )
);
