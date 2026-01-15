# Admin Dashboard User Guide

Complete guide for managing products on HandsnFoot.shop

---

## 📋 Table of Contents

1. [Accessing the Admin Dashboard](#accessing-the-admin-dashboard)
2. [Adding Products](#adding-products)
3. [Uploading Product Images](#uploading-product-images)
4. [Managing Pricing](#managing-pricing)
5. [Editing Products](#editing-products)
6. [Deleting Products](#deleting-products)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🔐 Accessing the Admin Dashboard

### Requirements
- You must be logged in with an admin account
- Admin email: `admin@handsnfoot.shop` (or configure your own in `AuthContext.jsx`)

### Steps
1. Navigate to your website
2. Click **Login** in the top navigation
3. Enter your admin credentials
4. Once logged in, click **Admin** in the navigation menu
5. You'll see the Admin Dashboard with all products

---

## ➕ Adding Products

### Step-by-Step Guide

1. **Click "Add New Product"** button in the top right
2. **Fill in the product form:**

   **Required Fields:**
   - **Product Name**: Enter the product name (e.g., "Luxury Chronograph Watch")
   - **Category**: Select either "Watches" or "Footwear"
   - **Description**: Write a detailed product description
   - **Price**: Enter the price in dollars (e.g., 1299.99)
   - **Stock**: Enter the available quantity
   - **Product Image**: Upload an image (see next section)

   **Optional Fields:**
   - **Rating**: Enter a rating from 0-5 (e.g., 4.8)
   - **Featured Product**: Check to display on homepage featured section
   - **Top Product**: Check to display on homepage top products section

3. **Click "Add Product"** to save

---

## 📸 Uploading Product Images

### Using the Image Upload Component

The admin dashboard features a drag-and-drop image uploader that automatically uploads to Supabase Storage.

#### Method 1: Drag and Drop
1. Drag an image file from your computer
2. Drop it onto the upload area
3. Wait for the upload to complete
4. The image URL will be automatically populated

#### Method 2: Click to Upload
1. Click anywhere in the upload area
2. Select an image from your computer
3. Wait for the upload to complete

### Image Requirements
- **Supported Formats**: JPG, PNG, WEBP
- **Maximum Size**: 5MB
- **Recommended**: Square images (1:1 aspect ratio) for best display
- **Resolution**: At least 800x800 pixels for quality

### Image Upload Process
1. Select or drag your image
2. The system validates the file type and size
3. Image is uploaded to Supabase Storage bucket `product-images`
4. A public URL is generated automatically
5. Preview appears showing the uploaded image
6. URL is saved with the product

---

## 💰 Managing Pricing

### Setting Product Prices

1. **Enter Price**: Input the price in the "Price" field
   - Use decimal format: `1299.99`
   - Minimum value: `0.00`
   - No currency symbol needed ($ is added automatically)

2. **Price Display**:
   - Prices are displayed with 2 decimal places
   - Currency symbol ($) is added automatically
   - Prices are shown in the product table and on the storefront

### Updating Prices

1. Click **Edit** on the product you want to update
2. Change the price in the form
3. Click **Update Product**
4. The new price will be reflected immediately

---

## ✏️ Editing Products

### How to Edit a Product

1. **Locate the Product**: Find the product in the products table
2. **Click "Edit"**: Click the Edit button in the Actions column
3. **Modify Fields**: Update any fields you want to change
   - Product name
   - Description
   - Price
   - Stock quantity
   - Category
   - Rating
   - Image (upload a new one or keep existing)
   - Featured/Top Product status
4. **Save Changes**: Click "Update Product"
5. **Cancel**: Click "Cancel Edit" to discard changes

### Changing Product Images

When editing a product:
1. The current image is displayed in the preview
2. Upload a new image to replace it
3. The old image URL will be replaced with the new one
4. Click "Update Product" to save

---

## 🗑️ Deleting Products

### How to Delete a Product

1. **Locate the Product**: Find the product in the products table
2. **Click "Delete"**: Click the Delete button in the Actions column
3. **Confirm**: A confirmation dialog will appear
4. **Confirm Deletion**: Click "OK" to permanently delete
5. **Product Removed**: The product is removed from the database

> **⚠️ Warning**: Deletion is permanent and cannot be undone!

---

## 💡 Best Practices

### Product Images
- ✅ Use high-quality, professional product photos
- ✅ Maintain consistent image dimensions (square format recommended)
- ✅ Use white or neutral backgrounds for product shots
- ✅ Show products from multiple angles when possible
- ✅ Compress images before upload to reduce file size
- ❌ Don't use watermarked or copyrighted images

### Product Descriptions
- ✅ Write detailed, accurate descriptions
- ✅ Include key features and specifications
- ✅ Mention materials, dimensions, and care instructions
- ✅ Use proper grammar and formatting
- ❌ Don't use ALL CAPS or excessive punctuation

### Pricing
- ✅ Research competitor pricing
- ✅ Include all costs in the price
- ✅ Use psychological pricing (e.g., $299.99 vs $300.00)
- ✅ Update prices regularly based on market conditions

### Stock Management
- ✅ Keep stock quantities accurate
- ✅ Update stock after sales (if not automated)
- ✅ Set products to 0 stock when out of stock
- ✅ Monitor low stock products regularly

### Featured & Top Products
- ✅ Feature your best-selling or newest products
- ✅ Limit featured products to 4-6 items
- ✅ Update featured products regularly (monthly recommended)
- ✅ Use high-quality images for featured items

---

## 🔧 Troubleshooting

### Image Upload Issues

**Problem**: "Failed to upload image"
- **Solution**: Check your Supabase configuration
- Verify the `product-images` bucket exists
- Ensure storage policies are set up correctly
- Check your internet connection

**Problem**: "Image size too large"
- **Solution**: Compress your image
- Use online tools like TinyPNG or Squoosh
- Resize to maximum 2000x2000 pixels
- Convert to WebP format for smaller file sizes

**Problem**: "Invalid file type"
- **Solution**: Use supported formats
- Convert your image to JPG, PNG, or WEBP
- Check the file extension matches the actual format

### Product Save Issues

**Problem**: "Error saving product"
- **Solution**: Check Supabase connection
- Verify you're logged in as admin
- Check all required fields are filled
- Ensure price and stock are valid numbers

**Problem**: "Products not loading"
- **Solution**: 
- Check Supabase configuration in `.env`
- Verify database tables are created
- Check browser console for errors
- Try refreshing the page

### Access Issues

**Problem**: "Can't access admin dashboard"
- **Solution**:
- Ensure you're logged in
- Verify your account has admin privileges
- Check `isAdmin()` function in `AuthContext.jsx`
- Clear browser cache and cookies

---

## 📊 Product Table Columns

The admin dashboard displays products in a table with these columns:

| Column | Description |
|--------|-------------|
| **Product** | Product name and thumbnail image |
| **Category** | Watches or Footwear |
| **Price** | Current price in USD |
| **Stock** | Available quantity |
| **Status** | Featured/Top product badges |
| **Actions** | Edit and Delete buttons |

---

## 🎯 Quick Tips

1. **Bulk Operations**: To update multiple products, edit them one at a time
2. **Image Naming**: Images are automatically renamed with timestamps
3. **Preview Before Save**: Always review your changes before clicking save
4. **Regular Backups**: Export your product data regularly from Supabase
5. **Test Changes**: View products on the storefront to verify changes

---

## 📞 Need Help?

If you encounter issues not covered in this guide:

1. Check the [Supabase Setup Guide](file:///d:/handnfoot.shop/SUPABASE_SETUP.md)
2. Review the [Main README](file:///d:/handnfoot.shop/README.md)
3. Check browser console for error messages
4. Verify your Supabase configuration
5. Ensure all database tables and policies are set up correctly

---

## 🔄 Regular Maintenance

### Daily
- Check for low stock products
- Review and respond to orders

### Weekly
- Update featured products
- Add new inventory
- Review pricing strategy

### Monthly
- Analyze best-selling products
- Update product descriptions
- Refresh product images
- Review and update categories

---

**Happy Managing! 🎉**

Your admin dashboard is designed to make product management simple and efficient. If you have suggestions for improvements, feel free to customize the code!
