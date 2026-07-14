-- ============================================
-- HandsnFoot E-Commerce Database Setup
-- Complete Supabase SQL Script
-- ============================================

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL CHECK (category IN ('Watches', 'Footwear')),
  rating FLOAT CHECK (rating >= 0 AND rating <= 5),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  featured BOOLEAN DEFAULT FALSE,
  top_product BOOLEAN DEFAULT FALSE,
  image TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_items JSONB NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  payment_status VARCHAR(50) DEFAULT 'pending',
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_top_product ON products(top_product) WHERE top_product = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- 3. CREATE UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to products table
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CREATE RLS POLICIES FOR PRODUCTS
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are insertable by authenticated users" ON products;
DROP POLICY IF EXISTS "Products are updatable by authenticated users" ON products;
DROP POLICY IF EXISTS "Products are deletable by authenticated users" ON products;

-- Public can view all products
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- Authenticated users can insert products
CREATE POLICY "Products are insertable by authenticated users"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update products
CREATE POLICY "Products are updatable by authenticated users"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Authenticated users can delete products
CREATE POLICY "Products are deletable by authenticated users"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- 6. CREATE RLS POLICIES FOR ORDERS
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;

-- Users can view their own orders (or all if no user_id)
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Anyone can create orders (for guest checkout)
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Users can update their own orders
CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. CREATE STORAGE BUCKET FOR PRODUCT IMAGES
-- ============================================

-- Note: This needs to be run in the Supabase Storage section
-- Go to Storage > Create Bucket > Name: "product-images" > Public: Yes

-- After creating the bucket, run these policies in the SQL Editor:

-- Allow public read access to product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================
-- 8. CREATE STORAGE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- Allow public read access
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- ============================================
-- 9. CREATE HELPER FUNCTIONS
-- ============================================

-- Function to get product count by category
CREATE OR REPLACE FUNCTION get_product_count_by_category()
RETURNS TABLE (category TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT p.category, COUNT(*)::BIGINT
  FROM products p
  GROUP BY p.category;
END;
$$ LANGUAGE plpgsql;

-- Function to get low stock products
CREATE OR REPLACE FUNCTION get_low_stock_products(threshold INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  stock INTEGER,
  category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.stock, p.category
  FROM products p
  WHERE p.stock <= threshold
  ORDER BY p.stock ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'orders');

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'orders');
