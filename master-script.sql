-- ==============================================================================
-- HANDSNFOOT MASTER SQL SCRIPT
-- ==============================================================================
-- This script consolidates all previous SQL files into a single, comprehensive setup.
-- Includes:
-- 1. Products, Orders, User Roles Tables
-- 2. CMS (Site Settings, Brand Logos)
-- 3. JazzCash Payment Integration
-- 4. RLS Policies & Triggers
-- 5. Helper Functions
-- 6. Storage Bucket Configuration
-- 7. Seed Data (Zamana Products + Generic)
-- 8. Superadmin Creation (handsnfoot@gmail.com)
-- ==============================================================================

-- 1. EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- 2.1 DASHBOARD USERS (Admin/Roles)
-- Links to auth.users to store roles like 'superadmin'
CREATE TABLE IF NOT EXISTS dashboard_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL CHECK (category IN ('Watches', 'Footwear', 'Accessories', 'Beauty')), -- Extended categories
    image TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    featured BOOLEAN DEFAULT FALSE,
    top_product BOOLEAN DEFAULT FALSE,
    rating NUMERIC(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3 ORDERS (Including JazzCash fields)
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_items JSONB NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
    shipping_address JSONB,
    -- Payment Fields
    payment_method VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    jazzcash_txn_ref_no VARCHAR(255),
    jazzcash_retrieval_ref_no VARCHAR(255),
    jazzcash_auth_code VARCHAR(255),
    jazzcash_response_code VARCHAR(10),
    jazzcash_response_message TEXT,
    jazzcash_full_response JSONB,
    payment_completed_at TIMESTAMP,
    amount_paid DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 CMS - SITE SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50) DEFAULT 'text', -- text, json, image
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- 2.5 CMS - BRAND LOGOS
CREATE TABLE IF NOT EXISTS brand_logos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2.6 PAYMENT TRANSACTIONS (JazzCash)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL, -- 'card' or 'mwallet'
    txn_ref_no VARCHAR(255) NOT NULL UNIQUE,
    bill_reference VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR',
    -- Customer info
    mobile_number VARCHAR(20),
    cnic_last_6 VARCHAR(6),
    -- Request data
    request_payload JSONB,
    request_hash VARCHAR(255),
    request_timestamp TIMESTAMP DEFAULT NOW(),
    -- Response data
    response_code VARCHAR(10),
    response_message TEXT,
    response_payload JSONB,
    response_hash VARCHAR(255),
    response_timestamp TIMESTAMP,
    -- JazzCash specific
    retrieval_ref_no VARCHAR(255),
    auth_code VARCHAR(255),
    settlement_date VARCHAR(50),
    -- Status tracking
    status VARCHAR(50) DEFAULT 'initiated',
    ipn_received BOOLEAN DEFAULT FALSE,
    ipn_timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2.7 IPN LOGS
CREATE TABLE IF NOT EXISTS ipn_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    txn_ref_no VARCHAR(255),
    ipn_payload JSONB NOT NULL,
    ipn_hash VARCHAR(255),
    hash_verified BOOLEAN,
    response_sent JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. INDEXES
-- ==============================================================================
-- Products
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_top_product ON products(top_product) WHERE top_product = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_jazzcash_txn_ref ON orders(jazzcash_txn_ref_no);
-- CMS
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_brand_logos_order ON brand_logos(display_order);
-- Payments
CREATE INDEX IF NOT EXISTS idx_payment_txn_ref ON payment_transactions(txn_ref_no);
CREATE INDEX IF NOT EXISTS idx_payment_order_id ON payment_transactions(order_id);

-- 4. FUNCTIONS & TRIGGERS
-- ==============================================================================

-- 4.1 Update Timestamp Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Triggers
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brand_logos_updated_at ON brand_logos;
CREATE TRIGGER update_brand_logos_updated_at BEFORE UPDATE ON brand_logos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4.2 Helper Functions
CREATE OR REPLACE FUNCTION get_product_count_by_category()
RETURNS TABLE (category TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY SELECT p.category, COUNT(*)::BIGINT FROM products p GROUP BY p.category;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_low_stock_products(threshold INTEGER DEFAULT 10)
RETURNS TABLE (id UUID, name TEXT, stock INTEGER, category TEXT) AS $$
BEGIN
    RETURN QUERY SELECT p.id, p.name, p.stock, p.category FROM products p WHERE p.stock <= threshold ORDER BY p.stock ASC;
END;
$$ LANGUAGE plpgsql;

-- 5. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipn_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_users ENABLE ROW LEVEL SECURITY;

-- Products Policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Products are insertable by authenticated users" ON products;
CREATE POLICY "Products are insertable by authenticated users" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Products are updatable by authenticated users" ON products;
CREATE POLICY "Products are updatable by authenticated users" ON products FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Products are deletable by authenticated users" ON products;
CREATE POLICY "Products are deletable by authenticated users" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Orders Policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
CREATE POLICY "Users can update their own orders" ON orders FOR UPDATE USING (auth.uid() = user_id);

-- CMS Policies
DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON site_settings;
CREATE POLICY "Site settings are viewable by everyone" ON site_settings FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Brand logos are viewable by everyone" ON brand_logos;
CREATE POLICY "Brand logos are viewable by everyone" ON brand_logos FOR SELECT TO public USING (true);

-- Payment Transactions Policies
DROP POLICY IF EXISTS "Users can view their own payment transactions" ON payment_transactions;
CREATE POLICY "Users can view their own payment transactions" ON payment_transactions FOR SELECT TO authenticated USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Service role can do everything on payment_transactions" ON payment_transactions;
CREATE POLICY "Service role can do everything on payment_transactions" ON payment_transactions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- IPN Logs Policies
DROP POLICY IF EXISTS "Service role can do everything on ipn_logs" ON ipn_logs;
CREATE POLICY "Service role can do everything on ipn_logs" ON ipn_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Dashboard Users Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON dashboard_users;
CREATE POLICY "Users can view their own profile" ON dashboard_users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Superadmins can view all profiles" ON dashboard_users;
CREATE POLICY "Superadmins can view all profiles" ON dashboard_users FOR SELECT USING (EXISTS (SELECT 1 FROM dashboard_users WHERE id = auth.uid() AND role = 'superadmin'));

-- 6. STORAGE BUCKETS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
CREATE POLICY "Product images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
CREATE POLICY "Authenticated users can update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
CREATE POLICY "Authenticated users can delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- 7. SEED DATA
-- ==============================================================================

-- Site Settings
INSERT INTO site_settings (key, value, type) VALUES
('announcement_bar_text', '🎉 Free Shipping on Orders Over Rs 10,000 | Easy Returns Within 7 Days', 'text'),
('hero_title', 'Premium Watches', 'text'),
('hero_subtitle', '& Accessories', 'text'),
('hero_description', 'Discover authentic timepieces and luxury accessories from top brands', 'text'),
('hero_cta_primary', 'Shop Now', 'text'),
('hero_cta_secondary', 'Learn More', 'text')
ON CONFLICT (key) DO NOTHING;

-- Brand Logos
INSERT INTO brand_logos (name, display_order, is_active) VALUES
('CASIO', 1, true),
('TIMEX', 2, true),
('SEIKO', 3, true),
('CITIZEN', 4, true)
ON CONFLICT DO NOTHING;

-- Products (Zamana + Generic)
-- (Truncate text to fit if necessary, but TEXT type handles it)
INSERT INTO products (name, description, price, category, image, stock, featured, rating, top_product) VALUES
-- Zamana Wallets
('The Vertical Vogue: A Bifold Leather Wallet - Brown', 'Hand-stitched vertical bifold.', 2250.00, 'Accessories', 'https://www.zamana.pk/cdn/shop/files/the-vertical-vogue-a-bifold-leather-wallet-brown-color-716913.webp?v=1719766381', 15, true, 4.5, false),
('The Futuristic: A Leather Bifold Wallet - Coffee', 'Sleek and modern design.', 2520.00, 'Accessories', 'https://www.zamana.pk/cdn/shop/files/the-futuristic-a-leather-bifold-wallet-coffee-color-751214.jpg?v=1719766378', 12, true, 4.7, false),
('The Artisan: Leather Cardholder Wallet - Coffee', 'Unique hand-crafted leather cardholder.', 1619.00, 'Accessories', 'https://www.zamana.pk/cdn/shop/files/the-artisan-a-leather-cardholder-wallet-coffee-color-244018.jpg?v=1719766380', 20, false, 4.3, false),
-- Zamana Watches
('Casio DB-360-1ADF Digital Databank Watch', '10-year battery life, 30-record telememo.', 10500.00, 'Watches', 'https://www.zamana.pk/cdn/shop/files/casio-mens-db-360-1adf-digital-databank-watch-539893.jpg?v=1719776409', 8, true, 4.6, true),
('CASIO MTP-1374L-1A Enticer Mens Watch', 'Genuine leather band, ion-plated case.', 15800.00, 'Watches', 'https://www.zamana.pk/cdn/shop/files/casio-mtp-1374l-1avdf-enticer-mens-watch-black-dial-leather-strap-742772.jpg?v=1719776409', 6, true, 4.8, true),
('Casio Enticer Analog Black Dial - MTP-1314D-1AVDF', 'Stainless steel band.', 11271.00, 'Watches', 'https://www.zamana.pk/cdn/shop/files/casio-enticer-analog-black-dial-mens-watch-mtp-1314d-1avdf-792293.jpg?v=1719764061', 10, false, 4.4, false),
-- Zamana Beauty
('Mekeyxecret Luminous Glow Highlighter', 'Natural brightening highlighter.', 1375.00, 'Beauty', 'https://www.zamana.pk/cdn/shop/files/mekeyxecret-luminous-glow-highlighter-shine-bright-with-all-day-radiance-illuminating-makeup-170242.jpg?v=1719765483', 25, false, 4.2, false),
('Mekeyxecret Natural Long-Lasting Liquid Blush', 'Silky smooth texture.', 1700.00, 'Beauty', 'https://www.zamana.pk/cdn/shop/files/mekeyxecret-natural-long-lasting-liquid-blush-734412.jpg?v=1719767529', 30, true, 4.6, false),
-- Generic Seed Data
('Designer Leather Sneakers', 'Handcrafted Italian leather sneakers.', 34999.99, 'Footwear', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80', 25, true, 4.6, false),
('Premium Running Shoes', 'High-performance running shoes.', 19999.99, 'Footwear', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 30, true, 4.7, false),
('Luxury Chronograph Watch', 'Premium Swiss-made automatic watch.', 129999.00, 'Watches', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 15, true, 4.8, true);

-- 8. SUPERADMIN CREATION
-- ==============================================================================
-- 8.1 Create the user in auth.users
-- Password is 'admin0817' hashed with bcrypt
DO $$
DECLARE
    new_user_id UUID := gen_random_uuid();
BEGIN
    -- Only insert if not exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'handsnfoot@gmail.com') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_user_id,
            'authenticated',
            'authenticated',
            'handsnfoot@gmail.com',
            crypt('admin0817', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );

        -- 8.2 Assign Superadmin Role in dashboard_users
        INSERT INTO dashboard_users (id, email, role)
        VALUES (new_user_id, 'handsnfoot@gmail.com', 'superadmin');
    ELSE
        -- If user exists, ensure they are superadmin
        UPDATE dashboard_users 
        SET role = 'superadmin' 
        WHERE email = 'handsnfoot@gmail.com';
    END IF;
END $$;

-- ==============================================================================
-- END OF MASTER SCRIPT
-- ==============================================================================
