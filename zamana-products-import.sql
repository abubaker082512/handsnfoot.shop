-- Create Products Table and Import Zamana.pk Products
-- Run this COMPLETE script in your Supabase SQL Editor

-- Step 1: Create the products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image TEXT,
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for products table
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can insert products"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
ON products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
ON products FOR DELETE
TO authenticated
USING (true);

-- Step 2: Insert Wallets
INSERT INTO products (name, description, price, category, image, stock, featured, rating) VALUES
(
  'The Vertical Vogue: A Bifold Leather Wallet - Brown',
  'Hand-stitched vertical bifold design made with genuine leather. Features two card slots and convenient cash pockets. Develops a unique patina over time, making each wallet one-of-a-kind. Perfect for those who appreciate craftsmanship and quality.',
  2250.00,
  'Accessories',
  'https://www.zamana.pk/cdn/shop/files/the-vertical-vogue-a-bifold-leather-wallet-brown-color-716913.webp?v=1719766381',
  15,
  true,
  4.5
),
(
  'The Futuristic: A Leather Bifold Wallet - Coffee',
  'Sleek and modern design made from premium quality leather. Bifold design with spacious compartments for cards and cash. Features a sophisticated coffee color that complements any style. Durable construction ensures long-lasting use.',
  2520.00,
  'Accessories',
  'https://www.zamana.pk/cdn/shop/files/the-futuristic-a-leather-bifold-wallet-coffee-color-751214.jpg?v=1719766378',
  12,
  true,
  4.7
),
(
  'The Artisan: Leather Cardholder Wallet - Coffee',
  'Unique hand-crafted leather cardholder. Slim and lightweight with multiple card slots. Hand-stitched construction for added character and durability. Perfect for minimalists who want to carry essentials only. Fits comfortably in any pocket.',
  1619.00,
  'Accessories',
  'https://www.zamana.pk/cdn/shop/files/the-artisan-a-leather-cardholder-wallet-coffee-color-244018.jpg?v=1719766380',
  20,
  false,
  4.3
);

-- Step 3: Insert Mens Watches
INSERT INTO products (name, description, price, category, image, stock, featured, rating) VALUES
(
  'Casio DB-360-1ADF Digital Databank Watch',
  '10-year battery life, 30-record telememo, LED backlight, and 50-meter water resistance. Supports 13 languages. Features calculator, alarm, stopwatch, and world time. Perfect for professionals and students. Durable resin case and comfortable band.',
  10500.00,
  'Watches',
  'https://www.zamana.pk/cdn/shop/files/casio-mens-db-360-1adf-digital-databank-watch-539893.jpg?v=1719776409',
  8,
  true,
  4.6
),
(
  'CASIO MTP-1374L-1A Enticer Mens Watch Black Dial',
  'Genuine leather band, ion-plated case, day and date indicator, and 50-meter water resistance. Mineral glass for durability. Classic black dial with silver accents. Perfect for formal and casual occasions. Japanese quartz movement ensures accuracy.',
  15800.00,
  'Watches',
  'https://www.zamana.pk/cdn/shop/files/casio-mtp-1374l-1avdf-enticer-mens-watch-black-dial-leather-strap-742772.jpg?v=1719776409',
  6,
  true,
  4.8
),
(
  'Casio Enticer Analog Black Dial - MTP-1314D-1AVDF',
  'Stainless steel band, large Arabic numerals for easy reading, and 50-meter water resistance. Date display at 3 o''clock position. Durable mineral crystal. Classic design suitable for everyday wear. Reliable Japanese quartz movement.',
  11271.00,
  'Watches',
  'https://www.zamana.pk/cdn/shop/files/casio-enticer-analog-black-dial-mens-watch-mtp-1314d-1avdf-792293.jpg?v=1719764061',
  10,
  false,
  4.4
),
(
  'Casio Enticer Analog Black Dial - MTP-VD01L-1E',
  'Precision-designed with 50-meter water resistance, date display, and durable leather band. 3-year battery life. Elegant black dial with luminous hands. Perfect for business professionals. Comfortable genuine leather strap.',
  10300.00,
  'Watches',
  'https://www.zamana.pk/cdn/shop/products/casio-enticer-men-analog-black-dial-mens-watch-mtp-vd01l-1evudf-409844.jpg?v=1719764061',
  12,
  true,
  4.5
);

-- Step 4: Insert Cosmetics
INSERT INTO products (name, description, price, category, image, stock, featured, rating) VALUES
(
  'Mekeyxecret Luminous Glow Highlighter',
  'Natural brightening highlighter with pearly light suitable for all skin tones. High pigment intensity and smooth application. Creates a radiant, luminous glow. Long-lasting formula that doesn''t fade. Perfect for highlighting cheekbones, brow bones, and cupid''s bow.',
  1375.00,
  'Beauty',
  'https://www.zamana.pk/cdn/shop/files/mekeyxecret-luminous-glow-highlighter-shine-bright-with-all-day-radiance-illuminating-makeup-170242.jpg?v=1719765483',
  25,
  false,
  4.2
),
(
  'Mekeyxecret Natural Long-Lasting Liquid Blush',
  'Silky smooth texture, easy to blend, and provides a natural, long-lasting radiance. Buildable formula for customizable color intensity. Lightweight and comfortable on skin. Available in flattering shades. Perfect for achieving a healthy, flushed look.',
  1700.00,
  'Beauty',
  'https://www.zamana.pk/cdn/shop/files/mekeyxecret-natural-long-lasting-liquid-blush-734412.jpg?v=1719767529',
  30,
  true,
  4.6
),
(
  'Mekeyxecret Waterproof Mascara',
  'Volumizing, lengthening, and defining. Waterproof formula that stands up to the elements. Smudge-proof and long-lasting. Creates dramatic, bold lashes. Easy to remove with makeup remover. Perfect for all-day wear and special occasions.',
  1399.00,
  'Beauty',
  'https://www.zamana.pk/cdn/shop/files/mekeyxecret-waterproof-mascara-enhance-your-lashes-233330.jpg?v=1719765477',
  35,
  false,
  4.4
);

-- Step 5: Verify insertion
SELECT 
  name, 
  price, 
  category, 
  stock,
  featured
FROM products 
ORDER BY category, price DESC;

-- Success message
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN category = 'Watches' THEN 1 END) as watches,
  COUNT(CASE WHEN category = 'Accessories' THEN 1 END) as accessories,
  COUNT(CASE WHEN category = 'Beauty' THEN 1 END) as beauty_products
FROM products;
