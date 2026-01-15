# Supabase Setup Guide for HandsnFoot

This guide will walk you through setting up Supabase for your HandsnFoot e-commerce store.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: handsnfoot-shop
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be set up (this may take a few minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, click on the "Settings" icon (gear icon)
2. Navigate to "API" in the sidebar
3. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")
4. Add these to your `.env` file:
   ```
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 3: Create Database Tables

1. In your Supabase dashboard, click on the "SQL Editor" icon
2. Click "New Query"
3. Copy and paste the following SQL to create the `products` table:

```sql
-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  rating FLOAT,
  stock INTEGER NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  top_product BOOLEAN DEFAULT FALSE,
  image TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  order_items JSONB NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_top_product ON products(top_product);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

4. Click "Run" to execute the query

## Step 4: Set Up Row Level Security (RLS)

1. In the SQL Editor, create a new query
2. Copy and paste the following SQL:

```sql
-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, authenticated write)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Products are insertable by authenticated users"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Products are updatable by authenticated users"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Products are deletable by authenticated users"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

-- Orders policies (users can only see their own orders)
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id);
```

3. Click "Run" to execute the query

## Step 5: Insert Sample Products (Optional)

To get started quickly, you can insert some sample products:

```sql
INSERT INTO products (name, description, price, category, rating, stock, featured, top_product, image) VALUES
('Luxury Chronograph Watch', 'Premium Swiss-made automatic watch with sapphire crystal', 1299.99, 'Watches', 4.8, 15, true, true, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'),
('Designer Leather Sneakers', 'Handcrafted Italian leather sneakers with premium comfort', 349.99, 'Footwear', 4.6, 25, true, false, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80'),
('Classic Dress Watch', 'Elegant minimalist watch perfect for formal occasions', 899.99, 'Watches', 4.9, 10, true, true, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80'),
('Premium Running Shoes', 'High-performance running shoes with advanced cushioning', 199.99, 'Footwear', 4.7, 30, true, false, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80'),
('Smart Watch Pro', 'Advanced smartwatch with health tracking and GPS', 599.99, 'Watches', 4.9, 20, false, true, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80'),
('Oxford Dress Shoes', 'Classic leather Oxford shoes for the modern gentleman', 279.99, 'Footwear', 4.8, 18, false, true, 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=500&q=80'),
('Diver Watch', 'Professional diving watch with 300m water resistance', 1599.99, 'Watches', 4.9, 8, false, true, 'https://images.unsplash.com/photo-1606390104762-8e0f36f2c0e4?w=500&q=80'),
('Casual Canvas Sneakers', 'Comfortable everyday sneakers with timeless style', 89.99, 'Footwear', 4.7, 40, false, true, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&q=80');
```

## Step 6: Configure Authentication

1. In your Supabase dashboard, go to "Authentication" > "Providers"
2. Enable "Email" provider (it should be enabled by default)
3. Configure email templates if desired (optional)

## Step 7: Set Up Storage (Optional)

If you want to upload product images to Supabase Storage:

1. Go to "Storage" in your Supabase dashboard
2. Click "Create a new bucket"
3. Name it "product-images"
4. Set it to "Public bucket" if you want images to be publicly accessible
5. Click "Create bucket"

### Storage Policies

```sql
-- Allow public read access to product images
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

## Step 8: Test Your Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```
2. Navigate to your app at `http://localhost:5173`
3. The app should now be connected to Supabase!
4. Try signing up for an account
5. Browse products (they should load from Supabase if you inserted sample data)

## Troubleshooting

### Connection Issues
- Make sure your `.env` file is in the root directory
- Verify that your environment variables are correct
- Restart your development server after changing `.env`

### Authentication Issues
- Check that email authentication is enabled in Supabase
- Verify RLS policies are set up correctly
- Check browser console for error messages

### Database Issues
- Verify tables were created successfully in the Table Editor
- Check that RLS is enabled and policies are correct
- Look at the Supabase logs for error messages

## Next Steps

- Customize the database schema as needed
- Set up email templates for authentication
- Configure additional authentication providers (Google, GitHub, etc.)
- Set up database backups
- Monitor usage in the Supabase dashboard

## Support

For Supabase-specific issues, visit:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
