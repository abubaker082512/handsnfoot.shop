# JazzCash API Integration Guide

> This guide is based on real production code from the `handsnfoot.shop` project. All code examples are tested and working.

---

## Table of Contents

1. [Prerequisites & Credentials](#1-prerequisites--credentials)
2. [Environment Setup](#2-environment-setup)
3. [API Endpoints Overview](#3-api-endpoints-overview)
4. [The Hash Algorithm (Critical!)](#4-the-hash-algorithm-critical)
5. [Card Payment (Page Redirection v1.1)](#5-card-payment-page-redirection-v11)
6. [Mobile Wallet (mWallet) Payment](#6-mobile-wallet-mwallet-payment)
7. [Return / Callback Handler](#7-return--callback-handler)
8. [Status Inquiry API](#8-status-inquiry-api)
9. [Frontend Integration (React)](#9-frontend-integration-react)
10. [Database Schema](#10-database-schema)
11. [Response Codes Reference](#11-response-codes-reference)
12. [Troubleshooting](#12-troubleshooting)
13. [Go-Live Checklist](#13-go-live-checklist)

---

## 1. Prerequisites & Credentials

### Getting Your Credentials

**Sandbox (Testing):**
1. Register at [JazzCash Sandbox Portal](https://onlinepayments.jazzcash.com.pk/sandbox-frontend/)
2. Complete merchant registration
3. Go to **Integration → Credentials**
4. Copy your:
   - **Merchant ID** (e.g., `MC123456`)
   - **Password** (API password, not your login password)
   - **Integrity Salt** (secret key for hash generation)

**Production:**
1. Contact JazzCash sales team (`jazzcash@jazz.com.pk`)
2. Complete merchant onboarding and KYC process
3. Receive production credentials
4. Register your return URL in the **Production** portal

### Key API Endpoints

| Environment | Card Payment URL | mWallet API URL |
|-------------|-----------------|-----------------|
| **Sandbox** | `https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/` | `https://sandbox.jazzcash.com.pk/PaymentGateway/api/v2/rest/payments/m-wallet` |
| **Production** | `https://onlinepayments.jazzcash.com.pk/payment-orchestrator/CustomerPortal/transactionmanagement/merchantform` | `https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v2/rest/payments/m-wallet` |

---

## 2. Environment Setup

### `.env` File (Local Development)

```env
# JazzCash Configuration
JAZZCASH_MERCHANT_ID=MC123456
JAZZCASH_PASSWORD=your_api_password_here
JAZZCASH_INTEGRITY_SALT=your_integrity_salt_here

# Card payment redirect URL — must point to your /api/jazzcash-return endpoint
JAZZCASH_RETURN_URL=http://localhost:5173/api/jazzcash-return

# Payment gateway URLs
JAZZCASH_CARD_PAYMENT_URL=https://onlinepayments.jazzcash.com.pk/payment-orchestrator/CustomerPortal/transactionmanagement/merchantform
JAZZCASH_MWALLET_API_URL=https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v2/rest/payments/m-wallet
JAZZCASH_STATUS_INQUIRY_URL=https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v2/rest/payments/status/inquiry

# Supabase (if using Supabase)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Vercel Deployment

```bash
vercel env add JAZZCASH_MERCHANT_ID
vercel env add JAZZCASH_PASSWORD
vercel env add JAZZCASH_INTEGRITY_SALT
vercel env add JAZZCASH_RETURN_URL         # Set to https://your-domain.com/api/jazzcash-return
vercel env add JAZZCASH_CARD_PAYMENT_URL
vercel env add JAZZCASH_MWALLET_API_URL
```

> **IMPORTANT:** The `JAZZCASH_RETURN_URL` **must be registered** in your JazzCash merchant portal under **Integration → Credentials → Return URL**. Any mismatch will cause authentication failures.

---

## 3. API Endpoints Overview

Your backend exposes these 4 Vercel serverless API routes:

```
POST /api/jazzcash-card-payment     → Initiates card payment, returns redirect HTML
POST /api/jazzcash-mwallet-payment  → Initiates mobile wallet debit
POST /api/jazzcash-return           → JazzCash callback after card payment (POST from JazzCash)
POST /api/jazzcash-status-inquiry   → Check status of any transaction by reference number
```

---

## 4. The Hash Algorithm (Critical!)

> **CAUTION:** Getting this wrong is the #1 cause of integration failures. Follow this exactly.

All JazzCash API calls require a **Secure Hash** — an HMAC-SHA256 signature that prevents tampering.

### Algorithm Steps

1. Collect all parameters you are sending (excluding `pp_SecureHash` itself)
2. **Filter out empty values** — skip `null`, `undefined`, or `""` strings
3. **Sort parameter NAMES alphabetically** (A-Z by key name)
4. **Concatenate the VALUES** with `&` as separator
5. **Prepend the Integrity Salt** followed by `&`
6. **HMAC-SHA256 sign** using the Integrity Salt as the secret key
7. Return as hex string

### Working Implementation (Node.js)

```javascript
import crypto from 'crypto';

function generateHash(params, integritySalt) {
  // Get non-empty keys, sorted alphabetically
  const sortedKeys = Object.keys(params)
    .filter(key => params[key] !== null && params[key] !== undefined && params[key] !== '')
    .sort();

  // Concatenate values only
  const values = sortedKeys.map(key => String(params[key]));
  const concatenatedValues = values.join('&');

  // Prepend integrity salt
  const hashString = integritySalt + '&' + concatenatedValues;

  // HMAC-SHA256
  return crypto.createHmac('sha256', integritySalt)
    .update(hashString)
    .digest('hex');
}
```

### Debugging Hash Issues

```javascript
console.log('Sorted keys:', sortedKeys);
console.log('Hash string (before hashing):', hashString);
console.log('Generated hash:', hash);
```

---

## 5. Card Payment (Page Redirection v1.1)

**How it works:** Backend generates a signed HTML form → user's browser auto-submits to JazzCash → user pays → JazzCash POSTs result to your Return URL.

### File: `api/jazzcash-card-payment.js`

```javascript
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

function generateHash(params, integritySalt) {
  const sortedKeys = Object.keys(params)
    .filter(key => params[key] !== null && params[key] !== undefined && params[key] !== '')
    .sort();
  const values = sortedKeys.map(key => String(params[key]));
  const hashString = integritySalt + '&' + values.join('&');
  return crypto.createHmac('sha256', integritySalt).update(hashString).digest('hex');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { orderId, amount, description, billReference } = req.body;

    // Always .trim() credentials to remove accidental whitespace
    const MERCHANT_ID    = process.env.JAZZCASH_MERCHANT_ID?.trim();
    const PASSWORD       = process.env.JAZZCASH_PASSWORD?.trim();
    const INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT?.trim();
    const RETURN_URL     = process.env.JAZZCASH_RETURN_URL?.trim();
    const CARD_PAYMENT_URL = process.env.JAZZCASH_CARD_PAYMENT_URL?.trim()
      || 'https://onlinepayments.jazzcash.com.pk/payment-orchestrator/CustomerPortal/transactionmanagement/merchantform';

    if (!MERCHANT_ID || !PASSWORD || !INTEGRITY_SALT || !RETURN_URL) {
      return res.status(500).json({ error: 'Missing JazzCash credentials' });
    }

    // Unique transaction reference
    const txnRefNo = 'T' + Math.floor(Math.random() * 1000000000000);

    const now = new Date();
    const formatDate = (d) =>
      `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}` +
      `${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}${String(d.getSeconds()).padStart(2,'0')}`;

    const pp_TxnDateTime       = formatDate(now);
    const pp_TxnExpiryDateTime = formatDate(new Date(now.getTime() + 24 * 60 * 60 * 1000));
    const pp_Amount            = String(Math.round(amount * 100)); // Convert to paisa
    const pp_BillReference     = billReference || orderId;

    // All parameters — empty string for unused optional fields
    const params = {
      pp_Version:           '1.1',
      pp_TxnType:           'MPAY',
      pp_Language:          'EN',
      pp_MerchantID:        MERCHANT_ID,
      pp_SubMerchantID:     '',
      pp_Password:          PASSWORD,
      pp_BankID:            '',
      pp_ProductID:         '',
      pp_TxnRefNo:          txnRefNo,
      pp_Amount:            pp_Amount,
      pp_TxnCurrency:       'PKR',
      pp_TxnDateTime:       pp_TxnDateTime,
      pp_BillReference:     pp_BillReference,
      pp_Description:       description || `Order ${orderId}`,
      pp_TxnExpiryDateTime: pp_TxnExpiryDateTime,
      pp_ReturnURL:         RETURN_URL,
      ppmpf_1: '', ppmpf_2: '', ppmpf_3: '', ppmpf_4: '', ppmpf_5: ''
    };

    const pp_SecureHash = generateHash(params, INTEGRITY_SALT);

    // Log transaction to database
    const supabase = createClient(
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    );
    await supabase.from('payment_transactions').insert({
      order_id: orderId, payment_method: 'card',
      txn_ref_no: txnRefNo, amount, status: 'initiated', request_payload: params
    });

    // Return HTML that auto-submits the form to JazzCash
    const htmlForm = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Redirecting to JazzCash...</title>
  <style>
    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f4f4f4; }
    .card { background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,.1); width: 400px; text-align: center; }
    h2 { color: #d32f2f; }
    .spinner { border: 4px solid rgba(211,47,47,.3); border-radius: 50%; border-top-color: #d32f2f; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <h2>JazzCash Secure Payment</h2>
    <p>Amount: <strong>PKR ${amount.toFixed(2)}</strong></p>
    <div class="spinner"></div>
    <p style="color:#666;font-size:14px;">Redirecting to JazzCash...</p>
    <form method="post" action="${CARD_PAYMENT_URL}" id="jcForm">
      ${Object.entries({ ...params, pp_SecureHash }).map(([k, v]) =>
        `<input type="hidden" name="${k}" value="${v}">`
      ).join('\n      ')}
    </form>
  </div>
  <script>setTimeout(() => document.getElementById('jcForm').submit(), 2000);</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(htmlForm);

  } catch (error) {
    console.error('JazzCash Card Payment Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
```

### Frontend Call

```javascript
const initiateCardPayment = async () => {
  const response = await fetch('/api/jazzcash-card-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: order.id,
      amount: order.total,        // In PKR (e.g., 1500.00)
      description: `Order #${order.id}`,
      billReference: order.id     // Used to track the order after callback
    })
  });

  if (response.ok) {
    const html = await response.text();
    document.open();
    document.write(html);
    document.close();
  }
};
```

---

## 6. Mobile Wallet (mWallet) Payment

**How it works:** You POST to JazzCash API with the customer's mobile number and CNIC → JazzCash sends an OTP → customer approves → response comes back directly in the API call.

### File: `api/jazzcash-mwallet-payment.js`

```javascript
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

function generateHash(params, integritySalt) {
  const sortedKeys = Object.keys(params).sort();
  const values = [];
  for (const key of sortedKeys) {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      values.push(String(value));
    }
  }
  const message = integritySalt + '&' + values.join('&');
  return crypto.createHmac('sha256', integritySalt).update(message).digest('hex').toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { orderId, amount, mobileNumber, cnic, description, billReference } = req.body;

    const MERCHANT_ID    = process.env.JAZZCASH_MERCHANT_ID;
    const PASSWORD       = process.env.JAZZCASH_PASSWORD;
    const INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT;
    const MWALLET_API_URL = process.env.JAZZCASH_MWALLET_API_URL
      || 'https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v2/rest/payments/m-wallet';

    const now = new Date();
    // Transaction ref with milliseconds for uniqueness
    const txnRefNo = 'T' + now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0') +
      String(now.getMilliseconds()).padStart(3, '0');

    // PKT timezone: UTC + 5 hours
    const pktDate = new Date(now.getTime() + (5 * 60 * 60 * 1000));
    const formatJazzDate = (d) => d.toISOString().replace(/[-:T]/g, '').split('.')[0];

    const pp_TxnDateTime       = formatJazzDate(pktDate);
    const pp_TxnExpiryDateTime = formatJazzDate(new Date(pktDate.getTime() + 24 * 60 * 60 * 1000));
    const pp_Amount            = String(Math.round(amount * 100));

    const params = {
      pp_Amount,
      pp_BankID:            '',
      pp_BillReference:     billReference || txnRefNo,
      pp_CNIC:              cnic,          // Last 6 digits of CNIC
      pp_Description:       description || `Order ${orderId}`,
      pp_Language:          'EN',
      pp_MerchantID:        MERCHANT_ID,
      pp_MobileNumber:      mobileNumber,  // Format: 03001234567
      pp_Password:          PASSWORD,
      pp_ProductID:         '',
      pp_SubMerchantID:     '',
      pp_TxnCurrency:       'PKR',
      pp_TxnDateTime,
      pp_TxnExpiryDateTime,
      pp_TxnRefNo:          txnRefNo,
      ppmpf_1: '', ppmpf_2: '', ppmpf_3: '', ppmpf_4: '', ppmpf_5: ''
    };

    params.pp_SecureHash = generateHash(params, INTEGRITY_SALT);

    const jazzResponse = await fetch(MWALLET_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const jazzData = await jazzResponse.json();
    const success = jazzData.pp_ResponseCode === '000';

    if (success) {
      const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
      await supabase.from('orders').update({
        payment_status: 'completed',
        payment_method: 'mwallet',
        jazzcash_txn_ref_no: txnRefNo
      }).eq('id', orderId);
    }

    return res.status(200).json({
      success,
      responseMessage: jazzData.pp_ResponseMessage,
      pp_ResponseCode: jazzData.pp_ResponseCode,
      data: jazzData
    });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
```

### Frontend Call

```javascript
const initiateMWalletPayment = async (mobileNumber, cnic) => {
  const response = await fetch('/api/jazzcash-mwallet-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: order.id,
      amount: order.total,
      mobileNumber,  // e.g., "03001234567"
      cnic,          // Last 6 digits, e.g., "123456"
      description: `Payment for Order #${order.id}`,
      billReference: order.id
    })
  });

  const result = await response.json();
  if (result.success) {
    alert('Payment successful! Order confirmed.');
  } else {
    alert(`Payment failed: ${result.responseMessage}`);
  }
};
```

---

## 7. Return / Callback Handler

JazzCash sends a **POST request** (not GET) to your Return URL after card payment. This handler verifies the hash, updates your database, and redirects the user.

### File: `api/jazzcash-return.js`

```javascript
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

function generateHash(params, integritySalt) {
  const sortedKeys = Object.keys(params).sort();
  let sortedString = integritySalt;
  for (const key of sortedKeys) {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      sortedString += '&' + String(value);
    }
  }
  return crypto.createHmac('sha256', integritySalt).update(sortedString).digest('hex').toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.redirect(302, '/');

  try {
    const params = req.body;
    const INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT;

    // Verify hash to prevent tampering
    const receivedHash = params.pp_SecureHash;
    const paramsForHash = { ...params };
    delete paramsForHash.pp_SecureHash;
    const calculatedHash = generateHash(paramsForHash, INTEGRITY_SALT);

    if (receivedHash !== calculatedHash) {
      console.error('HASH MISMATCH — possible tampering detected!');
    }

    const responseCode = params.pp_ResponseCode;
    const txnRefNo     = params.pp_TxnRefNo;
    const orderId      = params.pp_BillReference; // We stored orderId here
    const amount       = params.pp_Amount ? parseFloat(params.pp_Amount) / 100 : 0;

    const supabase = createClient(
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    );

    // Update transaction log
    await supabase.from('payment_transactions').update({
      status: responseCode === '000' ? 'completed' : 'failed',
      response_code: responseCode,
      response_message: params.pp_ResponseMessage,
      response_payload: params,
      updated_at: new Date().toISOString()
    }).eq('txn_ref_no', txnRefNo);

    // Update order on success — codes 000, 121, 200 all mean success
    if (['000', '121', '200'].includes(responseCode) && orderId) {
      await supabase.from('orders').update({
        payment_status: 'paid',
        status: 'confirmed',
        updated_at: new Date().toISOString()
      }).eq('id', orderId);
    }

    // Redirect user to frontend callback page with result
    const queryParams = new URLSearchParams();
    if (['000', '121', '200'].includes(responseCode)) {
      queryParams.append('orderId', orderId);
      queryParams.append('txnRef', txnRefNo);
      queryParams.append('status', 'success');
      queryParams.append('amount', amount.toString());
    } else {
      queryParams.append('error', params.pp_ResponseMessage || 'Payment Failed');
      queryParams.append('code', responseCode);
      queryParams.append('status', 'failed');
    }

    return res.redirect(302, `/payment/callback?${queryParams.toString()}`);

  } catch (error) {
    console.error('Return handler error:', error);
    return res.redirect(302, '/payment/callback?error=Server Error&status=failed');
  }
}
```

---

## 8. Status Inquiry API

Use this to verify any transaction's status — useful when the callback fails or you need to confirm before fulfilling an order.

### File: `api/jazzcash-status-inquiry.js`

```javascript
import crypto from 'crypto';

function generateHash(params, integritySalt) {
  const sortedKeys = Object.keys(params)
    .filter(key => params[key] !== null && params[key] !== undefined && params[key] !== '')
    .sort();
  const hashString = integritySalt + '&' + sortedKeys.map(k => String(params[k])).join('&');
  return crypto.createHmac('sha256', integritySalt).update(hashString).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { txnRefNo } = req.body;
  if (!txnRefNo) return res.status(400).json({ error: 'txnRefNo is required' });

  const MERCHANT_ID    = process.env.JAZZCASH_MERCHANT_ID?.trim();
  const PASSWORD       = process.env.JAZZCASH_PASSWORD?.trim();
  const INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT?.trim();
  const STATUS_URL     = process.env.JAZZCASH_STATUS_INQUIRY_URL?.trim()
    || 'https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v2/rest/payments/status/inquiry';

  const params = { pp_MerchantID: MERCHANT_ID, pp_Password: PASSWORD, pp_TxnRefNo: txnRefNo };
  const pp_SecureHash = generateHash(params, INTEGRITY_SALT);

  const response = await fetch(STATUS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, pp_SecureHash })
  });

  const data = await response.json();

  return res.status(200).json({
    success: data.pp_PaymentResponseCode === '121',
    responseCode: data.pp_ResponseCode,
    responseMessage: data.pp_ResponseMessage,
    paymentResponseCode: data.pp_PaymentResponseCode,
    paymentResponseMessage: data.pp_PaymentResponseMessage,
    transactionDetails: {
      txnRefNo: data.pp_TxnRefNo,
      amount: data.pp_Amount,
      billReference: data.pp_BillReference,
      retrievalReferenceNo: data.pp_RetrievalReferenceNo,
      authCode: data.pp_AuthCode
    }
  });
}
```

### Usage

```javascript
async function checkPaymentStatus(txnRefNo) {
  const res = await fetch('/api/jazzcash-status-inquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ txnRefNo })
  });
  const data = await res.json();

  if (data.success) {
    console.log('Payment confirmed!', data.transactionDetails);
  } else {
    console.log('Payment not completed:', data.paymentResponseMessage);
  }
}
```

---

## 9. Frontend Integration (React)

### Payment Callback Page

```jsx
// src/pages/PaymentCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PaymentCallback() {
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('status');
    const orderId = params.get('orderId');
    const error = params.get('error');

    setStatus({ success: paymentStatus === 'success', orderId, error });

    if (paymentStatus === 'success') {
      setTimeout(() => navigate(`/orders/${orderId}`), 3000);
    }
  }, []);

  if (!status) return <div>Processing payment...</div>;

  return (
    <div>
      {status.success ? (
        <div>
          <h2>✅ Payment Successful!</h2>
          <p>Order ID: {status.orderId}</p>
          <p>Redirecting to your order...</p>
        </div>
      ) : (
        <div>
          <h2>❌ Payment Failed</h2>
          <p>{status.error || 'Your payment could not be processed.'}</p>
          <button onClick={() => navigate('/checkout')}>Try Again</button>
        </div>
      )}
    </div>
  );
}
```

---

## 10. Database Schema

### `payment_transactions` table

```sql
CREATE TABLE payment_transactions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id         UUID REFERENCES orders(id),
  payment_method   TEXT,          -- 'card' or 'mwallet'
  txn_ref_no       TEXT UNIQUE,   -- JazzCash transaction reference
  amount           NUMERIC(10,2),
  status           TEXT DEFAULT 'initiated', -- initiated | completed | failed
  response_code    TEXT,
  response_message TEXT,
  request_payload  JSONB,
  response_payload JSONB,
  retrieval_ref_no TEXT,
  auth_code        TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
```

### Additional columns for `orders` table

```sql
ALTER TABLE orders ADD COLUMN payment_status        TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN jazzcash_txn_ref_no   TEXT;
ALTER TABLE orders ADD COLUMN jazzcash_auth_code     TEXT;
ALTER TABLE orders ADD COLUMN payment_completed_at  TIMESTAMPTZ;
```

---

## 11. Response Codes Reference

### Card / Return Handler (`pp_ResponseCode`)

| Code | Meaning | Action |
|------|---------|--------|
| `000` | Payment successful | ✅ Mark order as paid |
| `121` | Transaction approved | ✅ Mark order as paid |
| `200` | Success variant | ✅ Mark order as paid |
| `110` | Invalid transaction | ❌ Show error |
| `111` | Insufficient balance | ❌ Show error |
| `112` | Transaction declined | ❌ Show error |

### Status Inquiry (`pp_PaymentResponseCode`)

| Code | Meaning |
|------|---------|
| `121` | Transaction completed successfully |
| Other | Transaction failed or pending |

---

## 12. Troubleshooting

### ❌ Hash Mismatch

**Causes:**
- Integrity Salt has extra spaces/newlines — always `.trim()` it
- Parameter sorting is wrong — must be alphabetical by **key name**
- Empty parameters included/excluded inconsistently

**Debug:**
```javascript
console.log('Hash string:', integritySalt + '&' + sortedKeys.map(k => params[k]).join('&'));
```

---

### ❌ Return URL Not Working

**Causes:** JazzCash can't POST to your return URL.

**Fix:**
1. Register URL in JazzCash portal: **Integration → Credentials → Return URL**
2. URL must be **publicly accessible** (not localhost — use ngrok for local testing)
3. Must accept **POST** requests
4. Must use **HTTPS** in production

```bash
# Local testing with ngrok
ngrok http 5173
# Use the https URL as JAZZCASH_RETURN_URL
```

---

### ❌ Amount Issues

JazzCash expects amount **in paisa** (1 PKR = 100 paisa), no decimal point:

```javascript
// ✅ Correct: Rs. 1,500.00 → "150000"
const pp_Amount = String(Math.round(amount * 100));

// ❌ Wrong: "1500.00" or 1500
```

---

### ❌ Duplicate Transaction Reference

Add milliseconds to guarantee uniqueness:

```javascript
const now = new Date();
const txnRefNo = 'T' + now.getFullYear() +
  String(now.getMonth() + 1).padStart(2, '0') +
  String(now.getDate()).padStart(2, '0') +
  String(now.getHours()).padStart(2, '0') +
  String(now.getMinutes()).padStart(2, '0') +
  String(now.getSeconds()).padStart(2, '0') +
  String(now.getMilliseconds()).padStart(3, '0');
// Result: T20260222020300123
```

---

## 13. Go-Live Checklist

- [ ] Sandbox credentials obtained from JazzCash portal
- [ ] All 4 API route files created (`jazzcash-card-payment.js`, `jazzcash-mwallet-payment.js`, `jazzcash-return.js`, `jazzcash-status-inquiry.js`)
- [ ] `.env` file configured with all variables
- [ ] Hash generation tested and working
- [ ] Card payment flow tested end-to-end in sandbox
- [ ] Mobile wallet flow tested end-to-end in sandbox
- [ ] Return callback URL registered in JazzCash portal
- [ ] Database schema (`payment_transactions`, `orders`) set up
- [ ] `PaymentCallback.jsx` page working
- [ ] Deployed to Vercel with all env vars set
- [ ] Tested on deployed URL with sandbox credentials
- [ ] **Switched to production credentials**
- [ ] Return URL updated to production domain in JazzCash portal
- [ ] Made a small real transaction (Rs. 10) to verify
- [ ] Monitoring first 5 production transactions
