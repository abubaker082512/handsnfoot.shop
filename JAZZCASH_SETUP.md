# JazzCash Payment Gateway - Setup Guide

## 🚀 Quick Start

This guide will help you set up the JazzCash payment gateway integration for HandsnFoot e-commerce platform.

---

## 📋 Prerequisites

1. **JazzCash Merchant Account**
   - Sign up at: https://onlinepayments.jazzcash.com.pk/sandbox-frontend/
   - Obtain your credentials (Merchant ID, Password, Integrity Salt)

2. **Supabase Project**
   - Your existing Supabase project for HandsnFoot
   - Supabase CLI installed (for deploying Edge Functions)

---

## 🔧 Step 1: Database Setup

### Run the Migration Script

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Open the file `jazzcash-migration.sql`
4. Copy and paste the entire contents
5. Click **Run** to execute the migration

This will create:
- `payment_transactions` table
- `ipn_logs` table
- Update `orders` table with payment fields
- Set up RLS policies

### Verify Migration

Run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payment_transactions', 'ipn_logs');
```

You should see both tables listed.

---

## 🔐 Step 2: Configure Environment Variables

### Frontend (.env)

Update your `.env` file:

```env
# Existing Supabase variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# JazzCash Configuration
VITE_JAZZCASH_RETURN_URL=https://handsnfoot.shop/payment/callback
VITE_JAZZCASH_IPN_URL=https://your-project.supabase.co/functions/v1/jazzcash-ipn

# For local development:
# VITE_JAZZCASH_RETURN_URL=http://localhost:5173/payment/callback
```

### Supabase Edge Functions Secrets

You need to set these secrets for your Edge Functions:

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set JAZZCASH_MERCHANT_ID=your_merchant_id
supabase secrets set JAZZCASH_PASSWORD=your_password
supabase secrets set JAZZCASH_INTEGRITY_SALT=your_integrity_salt
supabase secrets set JAZZCASH_ENVIRONMENT=sandbox

# Set API endpoints
supabase secrets set JAZZCASH_CARD_PAYMENT_URL=https://onlinepayments.jazzcash.com.pk/payment-orchestrator/CustomerPortal/transactionmanagement/merchantform
supabase secrets set JAZZCASH_MWALLET_API_URL=https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v2/rest/payments/m-wallet
supabase secrets set JAZZCASH_STATUS_INQUIRY_URL=https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v2/rest/payments/status/inquiry
supabase secrets set JAZZCASH_RETURN_URL=https://handsnfoot.shop/payment/callback
supabase secrets set JAZZCASH_IPN_URL=https://your-project.supabase.co/functions/v1/jazzcash-ipn
```

---

## 📤 Step 3: Deploy Edge Functions

### Deploy All Functions

```bash
# Navigate to your project directory
cd d:\handnfoot.shop

# Deploy all Edge Functions
supabase functions deploy jazzcash-card-payment
supabase functions deploy jazzcash-mwallet-payment
supabase functions deploy jazzcash-callback
supabase functions deploy jazzcash-ipn
supabase functions deploy jazzcash-status-inquiry
```

### Verify Deployment

Check in Supabase Dashboard:
1. Go to **Edge Functions**
2. You should see all 5 functions listed
3. Click on each to verify they're deployed

---

## 🌐 Step 4: Configure JazzCash Portal

### Set Return URL

1. Login to JazzCash Merchant Portal
2. Go to **Integration > Credentials**
3. Set **Return URL**: `https://handsnfoot.shop/payment/callback`
4. Set **IPN URL**: `https://your-project.supabase.co/functions/v1/jazzcash-ipn`
5. Save changes

**Important**: The Return URL and IPN URL must match exactly what you configured in environment variables.

---

## ✅ Step 5: Test the Integration

### Test in Sandbox Mode

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Add products to cart**

3. **Go to checkout**

4. **Fill shipping information**

5. **Test Card Payment**:
   - Click "Continue to Payment"
   - Select "Credit/Debit Card"
   - You'll be redirected to JazzCash sandbox
   - Use test card details (provided by JazzCash)
   - Complete payment
   - Verify redirect back to your site

6. **Test MWallet Payment**:
   - Click "Continue to Payment"
   - Select "Mobile Wallet"
   - Enter test mobile number (03XXXXXXXXX)
   - Enter last 6 digits of CNIC
   - Click "Pay Now"
   - Verify payment response

### Verify in Database

Check the `payment_transactions` table:

```sql
SELECT * FROM payment_transactions 
ORDER BY created_at DESC 
LIMIT 10;
```

You should see your test transactions.

---

## 🔍 Step 6: Monitor and Debug

### Check Edge Function Logs

```bash
# View logs for a specific function
supabase functions logs jazzcash-card-payment
supabase functions logs jazzcash-mwallet-payment
supabase functions logs jazzcash-callback
supabase functions logs jazzcash-ipn
```

### Common Issues

#### 1. **Invalid Hash Error**
- **Cause**: Integrity Salt mismatch
- **Solution**: Verify your Integrity Salt in Supabase secrets matches JazzCash portal

#### 2. **Callback Not Working**
- **Cause**: Return URL mismatch
- **Solution**: Ensure Return URL in JazzCash portal matches your environment variable

#### 3. **IPN Not Received**
- **Cause**: IPN URL not accessible or incorrect
- **Solution**: Verify IPN URL is publicly accessible and matches JazzCash portal configuration

#### 4. **Payment Stuck in Pending**
- **Cause**: IPN not received or processed
- **Solution**: Use Status Inquiry API to check transaction status

---

## 🚀 Step 7: Go Live (Production)

### Switch to Production

1. **Update Environment Variables**:
   ```bash
   supabase secrets set JAZZCASH_ENVIRONMENT=production
   supabase secrets set JAZZCASH_MERCHANT_ID=your_production_merchant_id
   supabase secrets set JAZZCASH_PASSWORD=your_production_password
   supabase secrets set JAZZCASH_INTEGRITY_SALT=your_production_integrity_salt
   ```

2. **Update Frontend .env**:
   ```env
   VITE_JAZZCASH_RETURN_URL=https://handsnfoot.shop/payment/callback
   VITE_JAZZCASH_IPN_URL=https://your-project.supabase.co/functions/v1/jazzcash-ipn
   ```

3. **Update JazzCash Portal**:
   - Switch to production account
   - Configure Return URL and IPN URL with production domain

4. **Deploy**:
   ```bash
   # Redeploy Edge Functions with production secrets
   supabase functions deploy jazzcash-card-payment
   supabase functions deploy jazzcash-mwallet-payment
   supabase functions deploy jazzcash-callback
   supabase functions deploy jazzcash-ipn
   supabase functions deploy jazzcash-status-inquiry
   
   # Deploy frontend
   npm run build
   # Deploy to your hosting (Vercel, etc.)
   ```

5. **Test Production**:
   - Make a small test transaction with real card
   - Verify payment flow end-to-end
   - Check database for transaction record

---

## 📊 Monitoring

### Transaction Dashboard

Create a simple admin view to monitor transactions:

```sql
-- View recent transactions
SELECT 
  pt.txn_ref_no,
  pt.payment_method,
  pt.amount,
  pt.status,
  pt.response_code,
  pt.response_message,
  pt.created_at,
  o.id as order_id
FROM payment_transactions pt
LEFT JOIN orders o ON pt.order_id = o.id
ORDER BY pt.created_at DESC
LIMIT 50;
```

### Set Up Alerts

Monitor for:
- Failed payments (response_code != '121')
- Pending transactions > 10 minutes
- IPN failures

---

## 🔒 Security Checklist

- [ ] Integrity Salt is kept secret (never in frontend code)
- [ ] All API calls go through Edge Functions (not direct from frontend)
- [ ] HTTPS is enforced for all URLs
- [ ] RLS policies are enabled on all tables
- [ ] Environment variables are properly configured
- [ ] Return URL and IPN URL are whitelisted in JazzCash portal

---

## 📞 Support

### JazzCash Support
- Email: support@jazzcash.com.pk
- Portal: https://onlinepayments.jazzcash.com.pk

### Troubleshooting
1. Check Edge Function logs
2. Verify database records in `payment_transactions`
3. Check `ipn_logs` for IPN issues
4. Use Status Inquiry API for pending transactions

---

## 🎉 You're All Set!

Your JazzCash payment gateway is now integrated and ready to process payments!

**Next Steps**:
- Test thoroughly in sandbox
- Monitor first production transactions
- Set up automated reconciliation
- Configure email notifications for payment status
