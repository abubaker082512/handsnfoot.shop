-- CMS Tables for Admin Content Management
-- Run this in Supabase SQL Editor

-- 1. Create site_settings table for homepage content
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  type VARCHAR(50) DEFAULT 'text', -- text, json, image
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 2. Create brand_logos table
CREATE TABLE IF NOT EXISTS brand_logos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Insert default site settings
INSERT INTO site_settings (key, value, type) VALUES
('announcement_bar_text', '🎉 Free Shipping on Orders Over Rs 10,000 | Easy Returns Within 7 Days', 'text'),
('hero_title', 'Premium Watches', 'text'),
('hero_subtitle', '& Accessories', 'text'),
('hero_description', 'Discover authentic timepieces and luxury accessories from top brands', 'text'),
('hero_cta_primary', 'Shop Now', 'text'),
('hero_cta_secondary', 'Learn More', 'text')
ON CONFLICT (key) DO NOTHING;

-- 4. Insert default brand logos
INSERT INTO brand_logos (name, display_order, is_active) VALUES
('CASIO', 1, true),
('TIMEX', 2, true),
('SEIKO', 3, true),
('CITIZEN', 4, true)
ON CONFLICT DO NOTHING;

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_brand_logos_order ON brand_logos(display_order);
CREATE INDEX IF NOT EXISTS idx_brand_logos_active ON brand_logos(is_active);

-- 6. Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_logos ENABLE ROW LEVEL SECURITY;

-- 7. Create policies for site_settings
CREATE POLICY "Site settings are viewable by everyone"
ON site_settings FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can update site settings"
ON site_settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can insert site settings"
ON site_settings FOR INSERT
TO authenticated
WITH CHECK (true);

-- 8. Create policies for brand_logos
CREATE POLICY "Brand logos are viewable by everyone"
ON brand_logos FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can manage brand logos"
ON brand_logos FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 9. Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create triggers
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brand_logos_updated_at ON brand_logos;
CREATE TRIGGER update_brand_logos_updated_at
    BEFORE UPDATE ON brand_logos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify tables
SELECT 'site_settings' as table_name, COUNT(*) as row_count FROM site_settings
UNION ALL
SELECT 'brand_logos' as table_name, COUNT(*) as row_count FROM brand_logos;
