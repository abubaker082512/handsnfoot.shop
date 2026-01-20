import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  generateHash,
  jsonResponse,
  errorResponse,
  formatAmount,
  generateTxnRef,
  formatDateTime,
  getExpiryDateTime,
  logTransaction,
  cors Headers
} from '../_shared/jazzcash-utils.ts'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    // Get environment variables
    const MERCHANT_ID = Deno.env.get('JAZZCASH_MERCHANT_ID')
    const PASSWORD = Deno.env.get('JAZZCASH_PASSWORD')
    const INTEGRITY_SALT = Deno.env.get('JAZZCASH_INTEGRITY_SALT')
    const RETURN_URL = Deno.env.get('JAZZCASH_RETURN_URL')
    const CARD_PAYMENT_URL = Deno.env.get('JAZZCASH_CARD_PAYMENT_URL') ||
      'https://onlinepayments.jazzcash.com.pk/payment-orchestrator/CustomerPortal/transactionmanagement/merchantform'

    if (!MERCHANT_ID || !PASSWORD || !INTEGRITY_SALT || !RETURN_URL) {
      return errorResponse('JazzCash credentials not configured', 500)
    }

    // Parse request body
    const { orderId, amount, description, billReference } = await req.json()

    if (!orderId || !amount) {
      return errorResponse('Missing required fields: orderId, amount')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate transaction reference
    const txnRefNo = generateTxnRef()
    const txnDateTime = formatDateTime()
    const expiryDateTime = getExpiryDateTime()
    const formattedAmount = formatAmount(amount)
    const finalBillRef = billReference || txnRefNo

    // Build parameters for JazzCash
    const params = {
      pp_Version: '1.1',
      pp_TxnType: 'MPAY', // MPAY for card payments
      pp_Language: 'EN',
      pp_MerchantID: MERCHANT_ID,
      pp_Password: PASSWORD,
      pp_TxnRefNo: txnRefNo,
      pp_Amount: formattedAmount,
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: finalBillRef,
      pp_Description: (description || `HandsnFoot_Order_${orderId.substring(0, 8)}`).replace(/ /g, '_'), // Replace spaces with underscores
      pp_TxnExpiryDateTime: expiryDateTime,
      pp_ReturnURL: RETURN_URL,
      pp_SubMerchantID: '',
      pp_BankID: '',
      pp_ProductID: '',
      ppmpf_1: '',
      ppmpf_2: '',
      ppmpf_3: '',
      ppmpf_4: '',
      ppmpf_5: ''
    }

    // Generate secure hash
    const secureHash = await generateHash(params, INTEGRITY_SALT)
    params.pp_SecureHash = secureHash

    // Log transaction to database
    await logTransaction(supabaseClient, {
      order_id: orderId,
      payment_method: 'card',
      txn_ref_no: txnRefNo,
      bill_reference: finalBillRef,
      amount: amount,
      currency: 'PKR',
      request_payload: params,
      request_hash: secureHash,
      status: 'initiated'
    })

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
`

    return new Response(htmlForm, {
      headers: {
        ...corsHeaders(),
        'Content-Type': 'text/html',
      },
    })

  } catch (error) {
    console.error('Error in jazzcash-card-payment:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
})
