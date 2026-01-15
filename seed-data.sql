-- ============================================
-- Sample Product Data for HandsnFoot
-- Run this after supabase-setup.sql
-- ============================================

-- Insert sample watches
INSERT INTO products (name, description, price, category, rating, stock, featured, top_product, image) VALUES
('Luxury Chronograph Watch', 'Premium Swiss-made automatic watch with sapphire crystal. Features include chronograph function, date display, and water resistance up to 100m. The stainless steel case and leather strap combine durability with elegance.', 1299.99, 'Watches', 4.8, 15, true, true, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'),

('Classic Dress Watch', 'Elegant minimalist watch perfect for formal occasions. Japanese quartz movement ensures precision timekeeping. Features a slim profile, sapphire crystal, and genuine leather strap.', 899.99, 'Watches', 4.9, 10, true, true, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80'),

('Smart Watch Pro', 'Advanced smartwatch with health tracking and GPS. Features include heart rate monitoring, sleep tracking, workout modes, and smartphone notifications. Water resistant up to 50m.', 599.99, 'Watches', 4.9, 20, false, true, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80'),

('Diver Watch', 'Professional diving watch with 300m water resistance. Unidirectional rotating bezel, luminous hands and markers, and automatic movement. Built for underwater adventures.', 1599.99, 'Watches', 4.9, 8, false, true, 'https://images.unsplash.com/photo-1606390104762-8e0f36f2c0e4?w=800&q=80'),

('Aviator Chronograph', 'Pilot-inspired watch with multiple time zones. Features chronograph function, tachymeter scale, and date display. Stainless steel case with leather strap.', 749.99, 'Watches', 4.6, 12, false, false, 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&q=80'),

('Minimalist Watch', 'Ultra-thin design with Japanese quartz movement. Clean dial with simple hour markers. Perfect for everyday wear with any outfit.', 299.99, 'Watches', 4.5, 28, false, false, 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800&q=80');

-- Insert sample footwear
INSERT INTO products (name, description, price, category, rating, stock, featured, top_product, image) VALUES
('Designer Leather Sneakers', 'Handcrafted Italian leather sneakers with premium comfort. Made from full-grain leather with a cushioned insole and rubber outsole for superior grip. Perfect for both casual and semi-formal occasions.', 349.99, 'Footwear', 4.6, 25, true, false, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80'),

('Premium Running Shoes', 'High-performance running shoes with advanced cushioning. Features breathable mesh upper, responsive midsole, and durable rubber outsole. Designed for long-distance comfort.', 199.99, 'Footwear', 4.7, 30, true, false, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'),

('Oxford Dress Shoes', 'Classic leather Oxford shoes for the modern gentleman. Handcrafted from premium leather with leather sole. Perfect for business and formal occasions.', 279.99, 'Footwear', 4.8, 18, false, true, 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&q=80'),

('Casual Canvas Sneakers', 'Comfortable everyday sneakers with timeless style. Canvas upper with rubber sole. Versatile design works with jeans, shorts, or casual pants.', 89.99, 'Footwear', 4.7, 40, false, true, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80'),

('Hiking Boots', 'Durable waterproof boots for outdoor adventures. Features ankle support, aggressive tread pattern, and waterproof membrane. Built to handle any terrain.', 229.99, 'Footwear', 4.8, 22, false, false, 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80'),

('Loafers', 'Comfortable slip-on loafers for casual elegance. Premium leather construction with cushioned insole. Easy to wear and perfect for smart-casual occasions.', 159.99, 'Footwear', 4.4, 35, false, false, 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80');

-- Verify data was inserted
SELECT category, COUNT(*) as count, AVG(price) as avg_price
FROM products
GROUP BY category;

-- Show all products
SELECT id, name, category, price, stock, featured, top_product
FROM products
ORDER BY category, name;
