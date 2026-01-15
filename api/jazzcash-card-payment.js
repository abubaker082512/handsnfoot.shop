import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Helper function to generate HMAC-SHA256 hash
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
    const hmac = crypto.createHmac('sha256', integritySalt);
    hmac.update(message);
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

        // Credentials
        const MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID;
        const PASSWORD = process.env.JAZZCASH_PASSWORD;
        const INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT;
        const RETURN_URL = process.env.JAZZCASH_RETURN_URL;
        const CARD_PAYMENT_URL = process.env.JAZZCASH_CARD_PAYMENT_URL ||
            'https://onlinepayments.jazzcash.com.pk/payment-orchestrator/CustomerPortal/transactionmanagement/merchantform';

        if (!MERCHANT_ID || !PASSWORD || !INTEGRITY_SALT || !RETURN_URL) {
            console.error('Missing JazzCash environment variables', { MERCHANT_ID: !!MERCHANT_ID, RETURN_URL: !!RETURN_URL });
            return res.status(500).json({ error: 'Server configuration error: Missing credentials' });
        }

        // Supabase Client
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.VITE_SUPABASE_ANON_KEY
        );

        // --- Transaction Logic ---

        const now = new Date();
        const txnRefNo = 'T' + now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0') +
            String(now.getMilliseconds()).padStart(3, '0');

        // JazzCash Date: YYYYMMDDHHMMSS (PKT -> UTC+5)
        const pktDate = new Date(now.getTime() + (5 * 60 * 60 * 1000));

        const formatJazzDate = (d) => {
            return d.toISOString().replace(/[-:T]/g, '').split('.')[0];
        };

        const pp_TxnDateTime = formatJazzDate(pktDate);

        // Expiry = +1 day
        const expiryDate = new Date(pktDate.getTime() + (24 * 60 * 60 * 1000));
        const pp_TxnExpiryDateTime = formatJazzDate(expiryDate);

        const pp_Amount = String(Math.round(amount * 100));
        const pp_BillReference = billReference || txnRefNo;

        const params = {
            pp_Version: '1.1',
            pp_TxnType: 'MPAY', // MPAY for card payments
            pp_Language: 'EN',
            pp_MerchantID: MERCHANT_ID,
            pp_Password: PASSWORD,
            pp_TxnRefNo: txnRefNo,
            pp_Amount,
            pp_TxnCurrency: 'PKR',
            pp_TxnDateTime,
            pp_BillReference: pp_BillReference,
            pp_Description: description || `Order ${orderId}`,
            pp_TxnExpiryDateTime,
            pp_ReturnURL: RETURN_URL,
            pp_SubMerchantID: '',
            pp_BankID: '',
            pp_ProductID: '',
            ppmpf_1: '',
            ppmpf_2: '',
            ppmpf_3: '',
            ppmpf_4: '',
            ppmpf_5: ''
        };

        const secureHash = generateHash(params, INTEGRITY_SALT);
        params.pp_SecureHash = secureHash;

        // Log transaction to DB (Basic)
        // Ignoring error for non-critical logging to prevent payment block
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
            .then(() => console.log('Transaction logged'))
            .catch(err => console.error('Log error', err));

        // Generate HTML form that auto-submits to JazzCash
        const htmlForm = `
<!DOCTYPE html>
<html>
<head>
  <title>Redirecting to JazzCash...</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .loader {
      text-align: center;
      color: white;
    }
    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top: 4px solid white;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h2 { margin: 0 0 10px; font-size: 24px; }
    p { margin: 0; opacity: 0.9; font-size: 14px; }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <h2>Redirecting to JazzCash</h2>
    <p>Please wait while we redirect you to the secure payment page...</p>
  </div>
  <form id="jazzcashForm" method="POST" action="${CARD_PAYMENT_URL}">
    ${Object.entries(params).map(([key, value]) =>
            `<input type="hidden" name="${key}" value="${value}" />`
        ).join('\n    ')}
  </form>
  <script>
    // Auto-submit form after 1 second
    setTimeout(() => {
      document.getElementById('jazzcashForm').submit();
    }, 1000);
  </script>
</body>
</html>
`;

        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(htmlForm);

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
}
