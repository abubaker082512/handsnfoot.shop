import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Helper function to generate HMAC-SHA256 hash (EXACTLY matching testing.html)
function generateHash(params, integritySalt) {
  // Build hash string in the EXACT order from testing.html CalculateHash() function
  let hashString = integritySalt + '&';

  // Add parameters in the exact order from testing.html (lines 455-517)
  if (params.pp_Amount != '') {
    hashString += params.pp_Amount + '&';
  }
  if (params.pp_BankID != '') {
    hashString += params.pp_BankID + '&';
  }
  if (params.pp_BillReference != '') {
    hashString += params.pp_BillReference + '&';
  }
  if (params.pp_Description != '') {
    hashString += params.pp_Description + '&';
  }
  if (params.pp_Language != '') {
    hashString += params.pp_Language + '&';
  }
  if (params.pp_MerchantID != '') {
    hashString += params.pp_MerchantID + '&';
  }
  if (params.pp_Password != '') {
    hashString += params.pp_Password + '&';
  }
  if (params.pp_ProductID != '') {
    hashString += params.pp_ProductID + '&';
  }
  if (params.pp_ReturnURL != '') {
    hashString += params.pp_ReturnURL + '&';
  }
  if (params.pp_SubMerchantID != '') {
    hashString += params.pp_SubMerchantID + '&';
  }
  if (params.pp_TxnCurrency != '') {
    hashString += params.pp_TxnCurrency + '&';
  }
  if (params.pp_TxnDateTime != '') {
    hashString += params.pp_TxnDateTime + '&';
  }
  if (params.pp_TxnExpiryDateTime != '') {
    hashString += params.pp_TxnExpiryDateTime + '&';
  }
  if (params.pp_TxnRefNo != '') {
    hashString += params.pp_TxnRefNo + '&';
  }
  if (params.pp_TxnType != '') {
    hashString += params.pp_TxnType + '&';
  }
  if (params.pp_Version != '') {
    hashString += params.pp_Version + '&';
  }
  if (params.ppmpf_1 != '') {
    hashString += params.ppmpf_1 + '&';
  }
  if (params.ppmpf_2 != '') {
    hashString += params.ppmpf_2 + '&';
  }
  if (params.ppmpf_3 != '') {
    hashString += params.ppmpf_3 + '&';
  }
  if (params.ppmpf_4 != '') {
    hashString += params.ppmpf_4 + '&';
  }
  if (params.ppmpf_5 != '') {
    hashString += params.ppmpf_5 + '&';
  }

  // Remove trailing '&' (line 519 in testing.html)
  hashString = hashString.slice(0, -1);

  // Debug: log the hash string
  console.log('Hash String (before hashing):', hashString);

  // Generate HMAC-SHA256 hash (lines 533-536 in testing.html)
  const hash = crypto.createHmac('sha256', integritySalt)
    .update(hashString)
    .digest('hex');

  return hash.toUpperCase();
}

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, amount, description, billReference } = req.body;

    // JazzCash Credentials
    const MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID;
    const PASSWORD = process.env.JAZZCASH_PASSWORD;
    const INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT;
    const RETURN_URL = process.env.JAZZCASH_RETURN_URL;
    const CARD_PAYMENT_URL = process.env.JAZZCASH_CARD_PAYMENT_URL ||
      'https://onlinepayments.jazzcash.com.pk/payment-orchestrator/CustomerPortal/transactionmanagement/merchantform';

    if (!MERCHANT_ID || !PASSWORD || !INTEGRITY_SALT || !RETURN_URL) {
      console.error('Missing JazzCash environment variables');
      return res.status(500).json({ error: 'Server configuration error: Missing credentials' });
    }

    // Supabase Client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    // Generate transaction reference (matching testing.html line 62)
    const txnRefNo = 'T' + Math.floor(Math.random() * 1000000000000);

    // Format date for JazzCash: YYYYMMDDHHmmss (matching testing.html lines 65-69)
    const now = new Date();
    const formatJazzCashDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}${month}${day}${hours}${minutes}${seconds}`;
    };

    const pp_TxnDateTime = formatJazzCashDate(now);

    // Expiry date/time: +1 day from now
    const expiryDate = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    const pp_TxnExpiryDateTime = formatJazzCashDate(expiryDate);

    // Amount: multiply by 100 (last two digits are decimal)
    const pp_Amount = String(Math.round(amount * 100));

    // Bill Reference
    const pp_BillReference = billReference || orderId;

    // --- Parameters Object (EXACTLY matching testing.html form fields) ---
    const params = {
      pp_Version: '1.1',
      pp_TxnType: 'MPAY', // MPAY for card payments
      pp_Language: 'EN',
      pp_MerchantID: MERCHANT_ID,
      pp_SubMerchantID: '',
      pp_Password: PASSWORD,
      pp_BankID: '',
      pp_ProductID: '',
      pp_TxnRefNo: txnRefNo,
      pp_Amount: pp_Amount,
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: pp_TxnDateTime,
      pp_BillReference: pp_BillReference,
      pp_Description: description || `Order ${orderId}`,
      pp_TxnExpiryDateTime: pp_TxnExpiryDateTime,
      pp_ReturnURL: RETURN_URL,
      ppmpf_1: '',
      ppmpf_2: '',
      ppmpf_3: '',
      ppmpf_4: '',
      ppmpf_5: ''
    };

    // --- Generate Secure Hash (matching testing.html submitForm function) ---
    const pp_SecureHash = generateHash(params, INTEGRITY_SALT);

    console.log('\n========== JAZZCASH CARD PAYMENT DEBUG ==========');
    console.log('Return URL:', RETURN_URL);
    console.log('\nPayload Parameters:');
    console.log(JSON.stringify(params, null, 2));
    console.log('\nSecure Hash:', pp_SecureHash);
    console.log('=================================================\n');

    // Log transaction to database
    await supabase
      .from('payment_transactions')
      .insert({
        order_id: orderId,
        payment_method: 'card',
        txn_ref_no: txnRefNo,
        amount: amount,
        status: 'initiated',
        request_payload: params
      })
      .then(() => console.log('Transaction logged to database'))
      .catch(err => console.error('Database log error:', err));

    // --- Generate HTML Form for Redirection (matching testing.html form structure) ---
    const htmlForm = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Checkout | JazzCash Payment</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .checkout-card {
      background: #fff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      width: 600px;
      text-align: center;
    }
    .checkout-card h2 {
      color: #d32f2f;
      margin-bottom: 20px;
    }
    .details {
      text-align: left;
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;
      padding-bottom: 15px;
    }
    .details p {
      margin: 5px 0;
      font-size: 14px;
      color: #555;
    }
    .details b {
      color: #000;
    }
    .spinner {
      border: 4px solid rgba(211, 47, 47, 0.3);
      border-radius: 50%;
      border-top: 4px solid #d32f2f;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="checkout-card">
    <h2>Card Payment - Page Redirection/Checkout v1.1</h2>
    <h3>Order Summary</h3>
    
    <div class="details">
      <p>Transaction Reference: <b>${txnRefNo}</b></p>
      <p>Amount: <b>PKR ${(amount).toFixed(2)}</b></p>
      <p>Description: <b>${params.pp_Description}</b></p>
      <p>Bill Reference: <b>${pp_BillReference}</b></p>
      <p>TxnDateTime: <b>${pp_TxnDateTime}</b></p>
    </div>

    <form method="post" action="${CARD_PAYMENT_URL}" id="jazzcashForm">
      <input type="hidden" name="pp_Version" value="${params.pp_Version}">
      <input type="hidden" name="pp_TxnType" value="${params.pp_TxnType}">
      <input type="hidden" name="pp_Language" value="${params.pp_Language}">
      <input type="hidden" name="pp_MerchantID" value="${params.pp_MerchantID}">
      <input type="hidden" name="pp_SubMerchantID" value="${params.pp_SubMerchantID}">
      <input type="hidden" name="pp_Password" value="${params.pp_Password}">
      <input type="hidden" name="pp_BankID" value="${params.pp_BankID}">
      <input type="hidden" name="pp_ProductID" value="${params.pp_ProductID}">
      <input type="hidden" name="pp_TxnRefNo" value="${params.pp_TxnRefNo}">
      <input type="hidden" name="pp_Amount" value="${params.pp_Amount}">
      <input type="hidden" name="pp_TxnCurrency" value="${params.pp_TxnCurrency}">
      <input type="hidden" name="pp_TxnDateTime" value="${params.pp_TxnDateTime}">
      <input type="hidden" name="pp_BillReference" value="${params.pp_BillReference}">
      <input type="hidden" name="pp_Description" value="${params.pp_Description}">
      <input type="hidden" name="pp_TxnExpiryDateTime" value="${params.pp_TxnExpiryDateTime}">
      <input type="hidden" name="pp_ReturnURL" value="${params.pp_ReturnURL}">
      <input type="hidden" name="pp_SecureHash" value="${pp_SecureHash}">
      <input type="hidden" name="ppmpf_1" value="${params.ppmpf_1}">
      <input type="hidden" name="ppmpf_2" value="${params.ppmpf_2}">
      <input type="hidden" name="ppmpf_3" value="${params.ppmpf_3}">
      <input type="hidden" name="ppmpf_4" value="${params.ppmpf_4}">
      <input type="hidden" name="ppmpf_5" value="${params.ppmpf_5}">
      
      <div class="spinner"></div>
      <p style="font-size: 14px; color: #666; margin-top: 15px;">
        Redirecting to JazzCash secure payment page...
      </p>
    </form>

    <p style="font-size: 12px; color: #999; margin-top: 15px;">
      You will be redirected to JazzCash secure payment page.
    </p>
  </div>

  <script>
    // Auto-submit form after 2 seconds
    setTimeout(() => {
      document.getElementById('jazzcashForm').submit();
    }, 2000);
  </script>
</body>
</html>
`;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(htmlForm);

  } catch (error) {
    console.error('JazzCash Card Payment API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      details: error.message
    });
  }
}
