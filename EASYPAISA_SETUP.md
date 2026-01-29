# Easypaisa Payment Gateway Setup Guide

This guide will help you integrate Easypaisa payment gateway into your HandsnFoot e-commerce application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting API Credentials](#getting-api-credentials)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Testing in Sandbox](#testing-in-sandbox)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- A registered business in Pakistan
- Active Easypaisa merchant account
- Access to Easypaisa API Developer Portal
- Supabase project set up
- Node.js and npm installed

## Getting API Credentials

### Step 1: Register with Easypaisa

1. Visit the [Easypaisa Merchant Portal](https://easypaisa.com.pk/merchant)
2. Click on "Register as Merchant"
3. Fill in your business details:
   - Business name
   - Business registration number
   - Contact information
   - Bank account details
4. Submit required documents:
   - CNIC/NTN
   - Business registration certificate
   - Bank account statement

### Step 2: Access API Developer Portal

1. Once your merchant account is approved, log in to the [Easypaisa API Developer Portal](https://easypaisa.com.pk/developer)
2. Navigate to "API Credentials" section
3. Request API access for:
   - Mobile Account (MA) Transactions
   - Over-the-Counter (OTC) Transactions
   - Transaction Inquiry

### Step 3: Obtain Credentials

You will receive the following credentials:

- **Store ID**: Your unique merchant store identifier
- **Username**: API authentication username
- **Password**: API authentication password
- **Merchant Hash Key**: Used for signature generation

**Important**: Keep these credentials secure and never commit them to version control.

## Environment Configuration

### Step 1: Update .env File

Open your `.env` file and add the Easypaisa configuration:

```env
# Easypaisa Payment Gateway Configuration
EASYPAISA_STORE_ID=your_store_id_here
EASYPAISA_USERNAME=HandsnFoot
EASYPAISA_PASSWORD=b0c0c9e7dea2c69232cb608230ba24f6
EASYPAISA_HASH_KEY=PBYUY9IX5TZ840KB

# Easypaisa API URLs (Sandbox)
EASYPAISA_MA_API_URL=https://easypaisa.com.pk/easypay/ma-transaction
EASYPAISA_OTC_API_URL=https://easypaisa.com.pk/easypay/otc-transaction
EASYPAISA_INQUIRY_API_URL=https://easypaisa.com.pk/easypay/transaction-inquiry

# Configuration
EASYPAISA_TOKEN_EXPIRY_HOURS=24
EASYPAISA_ENVIRONMENT=sandbox
```

**Note**: Replace placeholder values with your actual credentials.

### Step 2: Update Vercel Environment Variables

If deploying to Vercel:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add all Easypaisa environment variables
4. Redeploy your application

## Database Setup

### Step 1: Run Migration Script

Execute the Easypaisa migration script in your Supabase SQL editor:

```bash
# Copy the migration file content
cat easypaisa-migration.sql

# Or run directly in Supabase dashboard
```

1. Open your Supabase project
2. Go to SQL Editor
3. Paste the contents of `easypaisa-migration.sql`
4. Click "Run"

### Step 2: Verify Tables

Check that the following were created:

```sql
-- Check easypaisa_transactions table
SELECT * FROM easypaisa_transactions LIMIT 1;

-- Check view
SELECT * FROM easypaisa_transaction_summary LIMIT 1;

-- Verify orders table columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name LIKE 'easypaisa%';
```

### Step 3: Set Up Row Level Security (Optional)

If using RLS, add policies:

```sql
-- Allow authenticated users to view their own transactions
CREATE POLICY "Users can view own easypaisa transactions"
ON easypaisa_transactions
FOR SELECT
USING (
  order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  )
);

-- Allow service role to insert transactions
CREATE POLICY "Service role can insert easypaisa transactions"
ON easypaisa_transactions
FOR INSERT
WITH CHECK (true);
```

## Testing in Sandbox

### Step 1: Verify Sandbox Configuration

Ensure `EASYPAISA_ENVIRONMENT=sandbox` in your `.env` file.

### Step 2: Test Mobile Account Payment

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Add items to cart and proceed to checkout
3. Fill in shipping information
4. Select "Easypaisa" as payment gateway
5. Choose "Mobile Account" payment method
6. Enter test mobile number: `03001234567`
7. Submit payment

**Expected Result**: Payment should be processed instantly (in sandbox mode).

### Step 3: Test OTC Payment

1. Select "Shop Payment" (OTC) method
2. Enter test mobile number
3. Submit to generate payment token

**Expected Result**: You should receive a payment token and instructions.

### Step 4: Test Status Inquiry

Test the status inquiry endpoint:

```bash
curl -X POST http://localhost:3000/api/easypaisa-status-inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "your-order-id",
    "storeId": "your-store-id"
  }'
```

## Production Deployment

### Step 1: Update API URLs

Replace sandbox URLs with production endpoints:

```env
# Production URLs
EASYPAISA_MA_API_URL=https://easypaisa.com.pk/easypay-api/ma-transaction
EASYPAISA_OTC_API_URL=https://easypaisa.com.pk/easypay-api/otc-transaction
EASYPAISA_INQUIRY_API_URL=https://easypaisa.com.pk/easypay-api/transaction-inquiry
EASYPAISA_ENVIRONMENT=production
```

**Note**: Confirm actual production URLs with Easypaisa support.

### Step 2: Update Credentials

Replace sandbox credentials with production credentials provided by Easypaisa.

### Step 3: Test with Small Transactions

Before going live:

1. Test with minimum transaction amounts (PKR 10-50)
2. Verify payment flow end-to-end
3. Check transaction logging in database
4. Test refund process (if applicable)

### Step 4: Monitor Transactions

Set up monitoring:

```sql
-- View recent transactions
SELECT * FROM easypaisa_transaction_summary 
ORDER BY created_at DESC 
LIMIT 20;

-- Check failed transactions
SELECT * FROM easypaisa_transactions 
WHERE transaction_status = 'failed' 
ORDER BY created_at DESC;

-- Monitor expired tokens
SELECT * FROM easypaisa_transactions 
WHERE transaction_status = 'pending' 
AND token_expiry_datetime < NOW();
```

## Troubleshooting

### Issue: "Server configuration error"

**Cause**: Missing environment variables

**Solution**: 
- Verify all required env vars are set
- Check for typos in variable names
- Restart development server after changes

### Issue: "Signature verification failed"

**Cause**: Incorrect hash key or signature generation

**Solution**:
- Verify `EASYPAISA_HASH_KEY` is correct
- Check signature string format: `amount#storeid#orderId#hashKey`
- Ensure amount is in paisa (multiply by 100)

### Issue: "Authentication failed"

**Cause**: Invalid username/password

**Solution**:
- Verify credentials with Easypaisa support
- Check Basic Auth header generation
- Ensure credentials are Base64 encoded correctly

### Issue: "Payment token expired"

**Cause**: Token validity period exceeded

**Solution**:
- Check `EASYPAISA_TOKEN_EXPIRY_HOURS` setting
- Inform customers to complete payment within validity period
- Implement automatic status checks

### Issue: Database connection error

**Cause**: Supabase credentials missing or incorrect

**Solution**:
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check Supabase project status
- Verify API routes have access to env vars

## Support

For additional help:

- **Easypaisa Merchant Support**: merchant.support@easypaisa.com.pk
- **Technical Documentation**: Check `EASYPAISA_API_REFERENCE.md`
- **Developer Portal**: https://easypaisa.com.pk/developer

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Implement rate limiting** on payment endpoints
4. **Log all transactions** for audit trail
5. **Validate all inputs** before API calls
6. **Use HTTPS** in production
7. **Regularly rotate** API credentials
8. **Monitor for suspicious** transaction patterns

## Next Steps

After successful setup:

1. ✅ Test thoroughly in sandbox
2. ✅ Update to production credentials
3. ✅ Monitor initial transactions
4. ✅ Set up automated status checks
5. ✅ Implement webhook handlers (if available)
6. ✅ Add transaction reporting
7. ✅ Train support staff on payment flow
