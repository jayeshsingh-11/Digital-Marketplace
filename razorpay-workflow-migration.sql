-- Razorpay Secure Purchase Workflow: Database Migration
-- Run this in your Supabase SQL Editor

-- Step 1: Add razorpay_payment_id to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- Step 2: Add admin_commission to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_commission NUMERIC DEFAULT 0;

-- Step 3: Add seller_earnings to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS seller_earnings NUMERIC DEFAULT 0;

-- Step 4: Create seller_wallets table
CREATE TABLE IF NOT EXISTS public.seller_wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- Step 5: Create purchased_products table
CREATE TABLE IF NOT EXISTS public.purchased_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  purchased_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Step 6: Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  buyer_email TEXT,
  product_name TEXT,
  amount NUMERIC NOT NULL,
  admin_commission NUMERIC DEFAULT 0,
  seller_earnings NUMERIC DEFAULT 0,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- Step 7: Enable RLS
ALTER TABLE public.seller_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchased_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Step 8: RLS Policies
DROP POLICY IF EXISTS "Users view own wallet" ON public.seller_wallets;
CREATE POLICY "Users view own wallet" ON public.seller_wallets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own purchases" ON public.purchased_products;
CREATE POLICY "Users view own purchases" ON public.purchased_products FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own invoices" ON public.invoices;
CREATE POLICY "Users view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Admins view all invoices" ON public.invoices;
CREATE POLICY "Admins view all invoices" ON public.invoices FOR SELECT USING (public.is_admin());

-- Step 9: Grant permissions
GRANT ALL ON public.seller_wallets TO authenticated;
GRANT ALL ON public.purchased_products TO authenticated;
GRANT ALL ON public.invoices TO authenticated;
