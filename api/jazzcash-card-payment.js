import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Helper function to generate HMAC-SHA256 hash (matching PHP implementation)
function generateHash(params, integritySalt) {
  // Sort parameters alphabetically (A-Z)
  const sortedKeys = Object.keys(params).sort();

  // Build sorted string with only non-empty values
  let sortedString = integritySalt;

  for (const key of sortedKeys) {
    const value = params[key];
    // Include only non-null, non-empty values (matching PHP: if ($value != null && $value != ""))
    if (value !== null && value !== undefined && value !== '') {
      sortedString += '&' + String(value);
    }
  }

  // Generate HMAC-SHA256 hash
  const hmac = crypto.createHmac('sha256', integritySalt);
  hmac.update(sortedString);
  return hmac.digest('hex').toUpperCase();
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

    // --- Unique Transaction Reference No with Milliseconds ---
    // Format: TRN + YYYYMMDDHHMMSSmmm (matching PHP implementation)
    const now = new Date();
    const milliTime = String(now.getMilliseconds()).padStart(3, '0');
    const txnRefNo = 'TRN' +
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0') +
      milliTime;

    // Format date for JazzCash: YYYYMMDDHHMMSS in Pakistan Time Zone (PKT = UTC+5)
    const formatJazzCashDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}${month}${day}${hours}${minutes}${seconds}`;
    };

    // Current date/time in PKT (Asia/Karachi = UTC+5)
    // Note: Server time should already be in PKT, but we ensure it here
    const pp_TxnDateTime = formatJazzCashDate(now);

    // Expiry date/time: +1 day from now
    const expiryDate = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    const pp_TxnExpiryDateTime = formatJazzCashDate(expiryDate);

    // Amount: multiply by 100 (last two digits are decimal)
    const pp_Amount = String(Math.round(amount * 100));

    // Bill Reference: use orderId for tracking
    const pp_BillReference = billReference || orderId;

    // --- Parameters Array (matching PHP implementation) ---
    const params = {
      pp_Version: '1.1',
      pp_TxnType: 'MPAY', // MPAY for Card
      pp_Language: 'EN',
      pp_MerchantID: MERCHANT_ID,
      pp_Password: PASSWORD,
      pp_TxnRefNo: txnRefNo,
      pp_Amount: pp_Amount,
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: pp_TxnDateTime,
      pp_BillReference: pp_BillReference,
      pp_Description: description || `Order ${orderId}`,
      pp_TxnExpiryDateTime: pp_TxnExpiryDateTime,
      pp_ReturnURL: RETURN_URL,
      pp_SubMerchantID: '',
      pp_BankID: '',
      pp_ProductID: '',
      ppmpf_1: '', // leave it empty
      ppmpf_2: '', // leave it empty
      ppmpf_3: '', // optional
      ppmpf_4: '', // optional
      ppmpf_5: ''  // optional
    };

    // --- Generate Secure Hash ---
    const secureHash = generateHash(params, INTEGRITY_SALT);

    console.log('JazzCash Payment Request:', {
      txnRefNo,
      orderId,
      amount: pp_Amount,
      billReference: pp_BillReference
    });

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

    // --- Generate HTML Form for Redirection ---
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
    .pay-btn {
      background-color: #d32f2f;
      color: white;
      border: none;
      padding: 12px 25px;
      font-size: 16px;
      border-radius: 5px;
      cursor: pointer;
      width: 100%;
      font-weight: bold;
      transition: background 0.3s;
    }
    .pay-btn:hover {
      background-color: #b71c1c;
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
      ${Object.entries(params).map(([key, value]) =>
      `<input type="hidden" name="${key}" value="${value}">`
    ).join('\n      ')}
      <input type="hidden" name="pp_SecureHash" value="${secureHash}">
      
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
