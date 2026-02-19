-- Razorpay Secure Purchase Workflow: Database Migration
-- Run this in your Supabase SQL Editor

-- 1. Add new columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_commission NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS seller_earnings NUMERIC DEFAULT 0;

-- 2. Seller Wallets (internal earnings balance)
CREATE TABLE IF NOT EXISTS public.seller_wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Purchased Products (buyer access control for downloads)
CREATE TABLE IF NOT EXISTS public.purchased_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  purchased_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- 4. Invoices
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
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable RLS on new tables
ALTER TABLE public.seller_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchased_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Seller Wallets: sellers can view their own wallet
DROP POLICY IF EXISTS "Users view own wallet" ON public.seller_wallets;
CREATE POLICY "Users view own wallet" ON public.seller_wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Purchased Products: buyers can view their own purchases
DROP POLICY IF EXISTS "Users view own purchases" ON public.purchased_products;
CREATE POLICY "Users view own purchases" ON public.purchased_products
  FOR SELECT USING (auth.uid() = user_id);

-- Invoices: buyers can view their own invoices
DROP POLICY IF EXISTS "Users view own invoices" ON public.invoices;
CREATE POLICY "Users view own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = buyer_id);

-- Admins can view all invoices
DROP POLICY IF EXISTS "Admins view all invoices" ON public.invoices;
CREATE POLICY "Admins view all invoices" ON public.invoices
  FOR SELECT USING (public.is_admin());

-- 7. Grant permissions
GRANT ALL ON public.seller_wallets TO authenticated;
GRANT ALL ON public.purchased_products TO authenticated;
GRANT ALL ON public.invoices TO authenticated;
