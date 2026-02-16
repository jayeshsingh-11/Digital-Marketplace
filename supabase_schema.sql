-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Media Table (Images)
CREATE TABLE IF NOT EXISTS mediamedia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename TEXT,
  mime_type TEXT,
  filesize INTEGER,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Product Files Table (Digital Downloads)
CREATE TABLE IF NOT EXISTS product_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename TEXT,
  mime_type TEXT,
  filesize INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Stored in smallest currency unit (e.g., cents/paise) or just integer
  category TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  price_id TEXT, -- Stripe Price ID (Legacy/Optional)
  stripe_id TEXT, -- Stripe Product ID (Legacy/Optional)
  product_file_id UUID REFERENCES product_files(id), -- Main download file (Legacy relation, but kept for compatibility)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Product Images (Relation Table)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_id UUID REFERENCES media(id) ON DELETE CASCADE,
  "order" INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Order Products (Relation Table)
CREATE TABLE IF NOT EXISTS order_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies

-- Media: Public Read, Auth Insert/Update/Delete (Own)
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Media" ON media FOR SELECT USING (true);
CREATE POLICY "Users can insert own media" ON media FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own media" ON media FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own media" ON media FOR DELETE USING (auth.uid() = user_id);

-- Product Files: Auth Read (If purchased/owned?), Auth Insert (Own)
-- For simplicity: Owners can read/write. Buyers need logic (via valid order). 
-- For now, allow Owners. Public read might be risky for paid files.
ALTER TABLE product_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own files" ON product_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own files" ON product_files FOR SELECT USING (auth.uid() = user_id);
-- Allow read if user bought it? Complex RLS. 
-- Usually download links are signed URLs or proxied. 
-- If we assume direct access, we need a policy checking orders.
-- SKIP complicated read policy for now, rely on signed URLs or backend checks.

-- Products: Public Read (Approved), Auth Read (Own), Auth Insert/Update (Own)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read approved products" ON products FOR SELECT USING (approved = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own products" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products" ON products FOR DELETE USING (auth.uid() = user_id);

-- Product Images: Public Read
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Users can insert product images" ON product_images FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM products WHERE id = product_id AND user_id = auth.uid())
);

-- Orders: Owner Read/Insert
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Admin read? (Supabase Admin client needed for backend updates of status)

-- Order Products: Owner Read
ALTER TABLE order_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own order products" ON order_products FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM products WHERE id = product_id AND user_id = auth.uid()) -- Sellers can see?
);
