# 🚀 Quick Setup Guide - Database Configuration

Your Supabase credentials have been configured! Follow these steps to complete the setup.

---

## ✅ Step 1: Environment Variables (DONE)

Your `.env` file has been updated with:
- ✅ Supabase URL: `https://aubsziylchmffozzvrgu.supabase.co`
- ✅ Anon Key: Configured

---

## 📊 Step 2: Set Up Database Tables

### Option A: Using Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor**:
   - Go to https://supabase.com/dashboard
   - Select your project
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

2. **Run the Setup Script**:
   - Open the file: `d:\handnfoot.shop\supabase-setup.sql`
   - Copy ALL the contents
   - Paste into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - Wait for completion (should see "Success" message)

3. **Verify Tables Created**:
   - Click **Table Editor** in the left sidebar
   - You should see two tables: `products` and `orders`

---

## 🖼️ Step 3: Create Storage Bucket for Images

1. **Go to Storage**:
   - Click **Storage** in the left sidebar
   - Click **Create a new bucket**

2. **Configure Bucket**:
   - **Name**: `product-images` (exactly this name)
   - **Public bucket**: Toggle ON (make it public)
   - Click **Create bucket**

3. **Verify**:
   - You should see `product-images` in your buckets list
   - The bucket should show as "Public"

---

## 📦 Step 4: Load Sample Data (Optional)

If you want to start with sample products:

1. **Open SQL Editor** again
2. **Open the file**: `d:\handnfoot.shop\seed-data.sql`
3. **Copy and paste** the contents
4. **Click Run**
5. You should see 12 products added (6 watches, 6 footwear)

---

## 🔄 Step 5: Restart Your Dev Server

Your dev server needs to restart to pick up the new environment variables:

1. **Stop the current server**:
   - Go to your terminal running `npm run dev`
   - Press `Ctrl+C`

2. **Start it again**:
   ```bash
   npm run dev
   ```

3. **The app will now connect to your real Supabase database!**

---

## ✅ Step 6: Test the Connection

### Test 1: View Products
1. Open http://localhost:5173
2. Go to the **Products** page
3. If you loaded sample data, you should see 12 products
4. If not, the page will be empty (ready for you to add products)

### Test 2: Admin Dashboard
1. Go to http://localhost:5173/login
2. Sign up with email: `admin@handsnfoot.shop`
3. Create a password
4. After signup, click **Admin** in the navigation
5. You should see the admin dashboard

### Test 3: Add a Product with Image Upload
1. In the admin dashboard, click **Add New Product**
2. Fill in the form
3. Try uploading an image (drag and drop or click)
4. The image should upload to Supabase Storage
5. Click **Add Product**
6. Product should appear in the table

---

## 🎯 Quick Checklist

- [ ] `.env` file updated with Supabase credentials ✅ (Done)
- [ ] Ran `supabase-setup.sql` in SQL Editor
- [ ] Created `product-images` storage bucket (set to Public)
- [ ] (Optional) Ran `seed-data.sql` for sample products
- [ ] Restarted dev server (`npm run dev`)
- [ ] Tested viewing products page
- [ ] Tested admin login and dashboard
- [ ] Tested adding a product with image upload

---

## 🆘 Troubleshooting

### "Error fetching products"
- Make sure you ran `supabase-setup.sql`
- Check that tables exist in Table Editor
- Verify `.env` credentials are correct

### "Failed to upload image"
- Make sure `product-images` bucket exists
- Verify bucket is set to **Public**
- Check Storage policies were created by the SQL script

### "Can't access admin dashboard"
- Sign up with `admin@handsnfoot.shop` email
- Or modify `AuthContext.jsx` to use your email

---

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for errors (F12)
2. Review the [SUPABASE_SETUP.md](file:///d:/handnfoot.shop/SUPABASE_SETUP.md) for detailed instructions
3. Verify all SQL scripts ran successfully
4. Make sure storage bucket is created and public

---

**You're almost there! Just run the SQL scripts and restart your server!** 🚀
