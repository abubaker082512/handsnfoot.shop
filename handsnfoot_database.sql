-- =============================================================================
--  HANDSNFOOT SHOP — COMPLETE SUPABASE DATABASE SCRIPT
--  Run this ONCE in a fresh Supabase project via: SQL Editor → New query → Run
--  Safe to re-run on existing projects (uses IF NOT EXISTS / ON CONFLICT)
-- =============================================================================

-- =============================================================================
-- SECTION 1 — EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================================
-- SECTION 2 — TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 2.1  DASHBOARD USERS  (admin roles linked to Supabase Auth)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dashboard_users (
    id          UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT    NOT NULL,
    role        TEXT    NOT NULL DEFAULT 'user'
                        CHECK (role IN ('user', 'admin', 'superadmin')),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2.2  PRODUCTS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT            NOT NULL,
    description TEXT,
    price       NUMERIC(10,2)   NOT NULL CHECK (price >= 0),
    category    TEXT            NOT NULL
                                CHECK (category IN ('Watches','Footwear','Accessories','Beauty')),
    image       TEXT            NOT NULL,
    stock       INTEGER         NOT NULL DEFAULT 0 CHECK (stock >= 0),
    featured    BOOLEAN         DEFAULT FALSE,
    top_product BOOLEAN         DEFAULT FALSE,
    rating      NUMERIC(2,1)    DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    created_at  TIMESTAMPTZ     DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2.3  ORDERS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id                          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                     UUID            REFERENCES auth.users(id) ON DELETE SET NULL,
    order_items                 JSONB           NOT NULL,
    total_price                 NUMERIC(10,2)   NOT NULL CHECK (total_price >= 0),
    status                      TEXT            DEFAULT 'pending'
                                                CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
    shipping_address            JSONB,

    -- Generic payment fields
    payment_method              VARCHAR(50)     DEFAULT 'pending',
    payment_status              VARCHAR(50)     DEFAULT 'pending',
    amount_paid                 DECIMAL(10,2),
    payment_completed_at        TIMESTAMP,

    -- JazzCash specific fields
    jazzcash_txn_ref_no         VARCHAR(255),
    jazzcash_retrieval_ref_no   VARCHAR(255),
    jazzcash_auth_code          VARCHAR(255),
    jazzcash_response_code      VARCHAR(10),
    jazzcash_response_message   TEXT,
    jazzcash_full_response      JSONB,

    -- Easypaisa specific fields
    easypaisa_payment_token     VARCHAR(255),
    easypaisa_transaction_type  VARCHAR(10),

    created_at  TIMESTAMPTZ     DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2.4  PAYMENT TRANSACTIONS  (JazzCash / DirectPay / RapidGateway logs)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_transactions (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id            UUID            REFERENCES orders(id) ON DELETE CASCADE,
    payment_method      VARCHAR(50)     NOT NULL,
    txn_ref_no          VARCHAR(255)    NOT NULL UNIQUE,
    bill_reference      VARCHAR(255)    NOT NULL,
    amount              DECIMAL(10,2)   NOT NULL,
    currency            VARCHAR(3)      DEFAULT 'PKR',

    -- Customer info
    mobile_number       VARCHAR(20),
    cnic_last_6         VARCHAR(6),

    -- Request snapshot
    request_payload     JSONB,
    request_hash        VARCHAR(255),
    request_timestamp   TIMESTAMP       DEFAULT NOW(),

    -- Response snapshot
    response_code       VARCHAR(10),
    response_message    TEXT,
    response_payload    JSONB,
    response_hash       VARCHAR(255),
    response_timestamp  TIMESTAMP,

    -- JazzCash extras
    retrieval_ref_no    VARCHAR(255),
    auth_code           VARCHAR(255),
    settlement_date     VARCHAR(50),

    -- Status
    status              VARCHAR(50)     DEFAULT 'initiated',
    ipn_received        BOOLEAN         DEFAULT FALSE,
    ipn_timestamp       TIMESTAMP,

    created_at          TIMESTAMP       DEFAULT NOW(),
    updated_at          TIMESTAMP       DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2.5  EASYPAISA TRANSACTIONS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS easypaisa_transactions (
    id                      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id                UUID            REFERENCES orders(id) ON DELETE CASCADE,
    store_id                VARCHAR(50)     NOT NULL,
    payment_token           VARCHAR(255),
    transaction_type        VARCHAR(10)     NOT NULL CHECK (transaction_type IN ('MA','OTC')),
    transaction_amount      DECIMAL(10,2)   NOT NULL,
    mobile_number           VARCHAR(15),
    email_address           VARCHAR(255),
    transaction_datetime    TIMESTAMPTZ,
    token_expiry_datetime   TIMESTAMPTZ,
    response_code           VARCHAR(10),
    response_desc           TEXT,
    transaction_status      VARCHAR(20)     DEFAULT 'pending'
                                            CHECK (transaction_status IN ('pending','success','failed','expired')),
    created_at              TIMESTAMPTZ     DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2.6  IPN LOGS  (JazzCash Instant Payment Notifications)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ipn_logs (
    id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    txn_ref_no      VARCHAR(255),
    ipn_payload     JSONB   NOT NULL,
    ipn_hash        VARCHAR(255),
    hash_verified   BOOLEAN,
    response_sent   JSONB,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2.7  CMS — SITE SETTINGS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    key         VARCHAR(255) UNIQUE NOT NULL,
    value       TEXT,
    type        VARCHAR(50)  DEFAULT 'text',
    updated_at  TIMESTAMP    DEFAULT NOW(),
    updated_by  UUID         REFERENCES auth.users(id)
);

-- ---------------------------------------------------------------------------
-- 2.8  CMS — BRAND LOGOS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_logos (
    id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    logo_url        TEXT,
    display_order   INTEGER      DEFAULT 0,
    is_active       BOOLEAN      DEFAULT TRUE,
    created_at      TIMESTAMP    DEFAULT NOW(),
    updated_at      TIMESTAMP    DEFAULT NOW()
);


-- =============================================================================
-- SECTION 3 — INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_products_category        ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured        ON products(featured)    WHERE featured    = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_top_product     ON products(top_product) WHERE top_product = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_created_at      ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price           ON products(price);

CREATE INDEX IF NOT EXISTS idx_orders_user_id           ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status            ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status    ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method    ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_jazzcash_txn_ref  ON orders(jazzcash_txn_ref_no);
CREATE INDEX IF NOT EXISTS idx_orders_created_at        ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_txn_ref          ON payment_transactions(txn_ref_no);
CREATE INDEX IF NOT EXISTS idx_payment_order_id         ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_status           ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_created_at       ON payment_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_easypaisa_order_id       ON easypaisa_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_easypaisa_payment_token  ON easypaisa_transactions(payment_token);
CREATE INDEX IF NOT EXISTS idx_easypaisa_status         ON easypaisa_transactions(transaction_status);
CREATE INDEX IF NOT EXISTS idx_easypaisa_created_at     ON easypaisa_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ipn_txn_ref              ON ipn_logs(txn_ref_no);
CREATE INDEX IF NOT EXISTS idx_ipn_created_at           ON ipn_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_site_settings_key        ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_brand_logos_order        ON brand_logos(display_order);
CREATE INDEX IF NOT EXISTS idx_brand_logos_active       ON brand_logos(is_active);


-- =============================================================================
-- SECTION 4 — FUNCTIONS & TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at              ON products;
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_orders_updated_at                ON orders;
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_payment_transactions_updated_at  ON payment_transactions;
CREATE TRIGGER trg_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_easypaisa_updated_at             ON easypaisa_transactions;
CREATE TRIGGER trg_easypaisa_updated_at
    BEFORE UPDATE ON easypaisa_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_site_settings_updated_at         ON site_settings;
CREATE TRIGGER trg_site_settings_updated_at
    BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_brand_logos_updated_at           ON brand_logos;
CREATE TRIGGER trg_brand_logos_updated_at
    BEFORE UPDATE ON brand_logos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_dashboard_users_updated_at       ON dashboard_users;
CREATE TRIGGER trg_dashboard_users_updated_at
    BEFORE UPDATE ON dashboard_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper functions
CREATE OR REPLACE FUNCTION get_product_count_by_category()
RETURNS TABLE (category TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT p.category, COUNT(*)::BIGINT FROM products p GROUP BY p.category;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_low_stock_products(threshold INTEGER DEFAULT 10)
RETURNS TABLE (id UUID, name TEXT, stock INTEGER, category TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.stock, p.category
    FROM products p WHERE p.stock <= threshold ORDER BY p.stock ASC;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- SECTION 5 — ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE products               ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE easypaisa_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipn_logs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_logos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_users        ENABLE ROW LEVEL SECURITY;

-- Products
DROP POLICY IF EXISTS "products_select_public"  ON products;
DROP POLICY IF EXISTS "products_insert_auth"    ON products;
DROP POLICY IF EXISTS "products_update_auth"    ON products;
DROP POLICY IF EXISTS "products_delete_auth"    ON products;

CREATE POLICY "products_select_public"
    ON products FOR SELECT USING (true);
CREATE POLICY "products_insert_auth"
    ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "products_update_auth"
    ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "products_delete_auth"
    ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Orders
DROP POLICY IF EXISTS "orders_select_own"  ON orders;
DROP POLICY IF EXISTS "orders_insert_any"  ON orders;
DROP POLICY IF EXISTS "orders_update_own"  ON orders;

CREATE POLICY "orders_select_own"
    ON orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "orders_insert_any"
    ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_own"
    ON orders FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Payment Transactions
DROP POLICY IF EXISTS "payment_txn_select_own"   ON payment_transactions;
DROP POLICY IF EXISTS "payment_txn_service_all"  ON payment_transactions;

CREATE POLICY "payment_txn_select_own"
    ON payment_transactions FOR SELECT TO authenticated
    USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "payment_txn_service_all"
    ON payment_transactions FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- Easypaisa Transactions
DROP POLICY IF EXISTS "easypaisa_select_own"   ON easypaisa_transactions;
DROP POLICY IF EXISTS "easypaisa_service_all"  ON easypaisa_transactions;

CREATE POLICY "easypaisa_select_own"
    ON easypaisa_transactions FOR SELECT TO authenticated
    USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "easypaisa_service_all"
    ON easypaisa_transactions FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- IPN Logs
DROP POLICY IF EXISTS "ipn_logs_service_all" ON ipn_logs;
CREATE POLICY "ipn_logs_service_all"
    ON ipn_logs FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- Site Settings
DROP POLICY IF EXISTS "site_settings_select_public"  ON site_settings;
DROP POLICY IF EXISTS "site_settings_insert_auth"    ON site_settings;
DROP POLICY IF EXISTS "site_settings_update_auth"    ON site_settings;

CREATE POLICY "site_settings_select_public"
    ON site_settings FOR SELECT TO public USING (true);
CREATE POLICY "site_settings_insert_auth"
    ON site_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "site_settings_update_auth"
    ON site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Brand Logos
DROP POLICY IF EXISTS "brand_logos_select_public"  ON brand_logos;
DROP POLICY IF EXISTS "brand_logos_manage_auth"    ON brand_logos;

CREATE POLICY "brand_logos_select_public"
    ON brand_logos FOR SELECT TO public USING (true);
CREATE POLICY "brand_logos_manage_auth"
    ON brand_logos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Dashboard Users — NON-RECURSIVE: each user reads only their own row
DROP POLICY IF EXISTS "dashboard_users_select_own"         ON dashboard_users;
DROP POLICY IF EXISTS "dashboard_users_select_superadmin"  ON dashboard_users;
DROP POLICY IF EXISTS "Superadmins can view all profiles"  ON dashboard_users;
DROP POLICY IF EXISTS "Users can view their own profile"   ON dashboard_users;

CREATE POLICY "dashboard_users_select_own"
    ON dashboard_users FOR SELECT USING (auth.uid() = id);


-- =============================================================================
-- SECTION 6 — STORAGE BUCKET
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "storage_product_images_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "storage_product_images_auth_insert"   ON storage.objects;
DROP POLICY IF EXISTS "storage_product_images_auth_update"   ON storage.objects;
DROP POLICY IF EXISTS "storage_product_images_auth_delete"   ON storage.objects;

CREATE POLICY "storage_product_images_public_read"
    ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "storage_product_images_auth_insert"
    ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "storage_product_images_auth_update"
    ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "storage_product_images_auth_delete"
    ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');


-- =============================================================================
-- SECTION 7 — MONITORING VIEW (Easypaisa)
-- =============================================================================

CREATE OR REPLACE VIEW easypaisa_transaction_summary AS
SELECT
    et.id,
    et.order_id,
    et.payment_token,
    et.transaction_type,
    et.transaction_amount,
    et.mobile_number,
    et.transaction_status,
    et.response_code,
    et.response_desc,
    et.created_at,
    et.token_expiry_datetime,
    CASE
        WHEN et.token_expiry_datetime < NOW() AND et.transaction_status = 'pending'
        THEN true ELSE false
    END AS is_expired
FROM easypaisa_transactions et
ORDER BY et.created_at DESC;


-- =============================================================================
-- SECTION 8 — GRANTS
-- =============================================================================

GRANT ALL ON payment_transactions   TO authenticated;
GRANT ALL ON payment_transactions   TO service_role;
GRANT ALL ON easypaisa_transactions TO authenticated;
GRANT ALL ON easypaisa_transactions TO service_role;
GRANT ALL ON ipn_logs               TO service_role;


-- =============================================================================
-- SECTION 9 — SEED DATA
-- =============================================================================

INSERT INTO site_settings (key, value, type) VALUES
('announcement_bar_text', '🎉 Free Shipping on Orders Over Rs 10,000 | Easy Returns Within 7 Days', 'text'),
('hero_title',            'Premium Watches',                                                          'text'),
('hero_subtitle',         '& Accessories',                                                            'text'),
('hero_description',      'Discover authentic timepieces and luxury accessories from top brands',     'text'),
('hero_cta_primary',      'Shop Now',                                                                 'text'),
('hero_cta_secondary',    'Learn More',                                                               'text')
ON CONFLICT (key) DO NOTHING;

INSERT INTO brand_logos (name, display_order, is_active) VALUES
('CASIO',   1, true),
('TIMEX',   2, true),
('SEIKO',   3, true),
('CITIZEN', 4, true)
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, category, image, stock, featured, rating, top_product) VALUES
('Casio DB-360-1ADF Digital Databank Watch',
 '10-year battery life, 30-record telememo. Classic digital style.',
 10500.00, 'Watches',
 'https://www.zamana.pk/cdn/shop/files/casio-mens-db-360-1adf-digital-databank-watch-539893.jpg?v=1719776409',
 8, true, 4.6, true),

('CASIO MTP-1374L-1A Enticer Mens Watch',
 'Genuine leather band, ion-plated case, precise quartz movement.',
 15800.00, 'Watches',
 'https://www.zamana.pk/cdn/shop/files/casio-mtp-1374l-1avdf-enticer-mens-watch-black-dial-leather-strap-742772.jpg?v=1719776409',
 6, true, 4.8, true),

('Casio Enticer Analog Black Dial MTP-1314D-1AVDF',
 'Elegant stainless steel bracelet, mineral crystal glass, water-resistant.',
 11271.00, 'Watches',
 'https://www.zamana.pk/cdn/shop/files/casio-enticer-analog-black-dial-mens-watch-mtp-1314d-1avdf-792293.jpg?v=1719764061',
 10, false, 4.4, false),

('Luxury Chronograph Automatic Watch',
 'Premium Swiss-inspired design. Sapphire crystal, 50m water resistance.',
 129999.00, 'Watches',
 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
 5, true, 4.9, true),

('The Vertical Vogue Bifold Leather Wallet — Brown',
 'Hand-stitched genuine leather bifold. Multiple card slots, centre note compartment.',
 2250.00, 'Accessories',
 'https://www.zamana.pk/cdn/shop/files/the-vertical-vogue-a-bifold-leather-wallet-brown-color-716913.webp?v=1719766381',
 15, true, 4.5, false),

('The Futuristic Leather Bifold Wallet — Coffee',
 'Sleek modern profile. RFID-blocking interior lining.',
 2520.00, 'Accessories',
 'https://www.zamana.pk/cdn/shop/files/the-futuristic-a-leather-bifold-wallet-coffee-color-751214.jpg?v=1719766378',
 12, true, 4.7, false),

('The Artisan Leather Cardholder Wallet — Coffee',
 'Ultra-slim hand-crafted genuine leather cardholder.',
 1619.00, 'Accessories',
 'https://www.zamana.pk/cdn/shop/files/the-artisan-a-leather-cardholder-wallet-coffee-color-244018.jpg?v=1719766380',
 20, false, 4.3, false),

('Designer Leather Sneakers',
 'Handcrafted leather upper. Cushioned insole, durable rubber outsole.',
 34999.99, 'Footwear',
 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
 25, true, 4.6, false),

('Premium Running Shoes',
 'High-performance mesh upper. Responsive foam midsole, anti-slip grip.',
 19999.99, 'Footwear',
 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
 30, true, 4.7, false),

('Mekeyxecret Luminous Glow Highlighter',
 'Natural brightening formula. Buildable shimmer, all-day radiance.',
 1375.00, 'Beauty',
 'https://www.zamana.pk/cdn/shop/files/mekeyxecret-luminous-glow-highlighter-shine-bright-with-all-day-radiance-illuminating-makeup-170242.jpg?v=1719765483',
 25, false, 4.2, false),

('Mekeyxecret Natural Long-Lasting Liquid Blush',
 'Silky smooth texture. Long-lasting pigment, blends seamlessly.',
 1700.00, 'Beauty',
 'https://www.zamana.pk/cdn/shop/files/mekeyxecret-natural-long-lasting-liquid-blush-734412.jpg?v=1719767529',
 30, true, 4.6, false)

ON CONFLICT DO NOTHING;


-- =============================================================================
-- SECTION 10 — SUPERADMIN ACCOUNT
-- Admin login: handsnfoot@gmail.com / admin0817
-- =============================================================================

DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users
    WHERE email = 'handsnfoot@gmail.com' LIMIT 1;

    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, recovery_sent_at, last_sign_in_at,
            raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at,
            confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_user_id, 'authenticated', 'authenticated',
            'handsnfoot@gmail.com',
            crypt('admin0817', gen_salt('bf')),
            NOW(), NOW(), NOW(),
            '{"provider":"email","providers":["email"]}', '{}',
            NOW(), NOW(), '', '', '', ''
        );
        RAISE NOTICE 'Created new superadmin: handsnfoot@gmail.com (id=%)', v_user_id;
    ELSE
        RAISE NOTICE 'Superadmin already exists: handsnfoot@gmail.com (id=%)', v_user_id;
    END IF;

    INSERT INTO dashboard_users (id, email, role)
    VALUES (v_user_id, 'handsnfoot@gmail.com', 'superadmin')
    ON CONFLICT (id) DO UPDATE SET role = 'superadmin', updated_at = NOW();

    RAISE NOTICE 'Superadmin role confirmed for handsnfoot@gmail.com';
END $$;


-- =============================================================================
-- SECTION 11 — VERIFICATION QUERY
-- =============================================================================

SELECT
    t.table_name,
    (SELECT COUNT(*) FROM information_schema.columns c
     WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS columns,
    (SELECT rowsecurity FROM pg_tables pt
     WHERE pt.schemaname = 'public' AND pt.tablename = t.table_name) AS rls_enabled
FROM (VALUES
    ('products'),('orders'),('payment_transactions'),
    ('easypaisa_transactions'),('ipn_logs'),
    ('site_settings'),('brand_logos'),('dashboard_users')
) AS t(table_name)
ORDER BY t.table_name;

-- =============================================================================
-- DONE. All 8 tables created with indexes, triggers, RLS, storage + seed data.
-- =============================================================================
