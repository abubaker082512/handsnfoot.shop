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
    res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust this in production if needed
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
        const { orderId, amount, mobileNumber, cnic, description, billReference } = req.body;

        // Credentials
        const MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID;
        const PASSWORD = process.env.JAZZCASH_PASSWORD;
        const INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT;
        const MWALLET_API_URL = process.env.JAZZCASH_MWALLET_API_URL ||
            'https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v2/rest/payments/m-wallet';

        if (!MERCHANT_ID || !PASSWORD || !INTEGRITY_SALT) {
            console.error('Missing JazzCash environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Supabase Client
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.VITE_SUPABASE_ANON_KEY
        );

        // --- Transaction Logic ---

        const now = new Date();
        // Generate TxnRef: TYYYYMMDDHHMMSSmmm
        const txnRefNo = 'T' + now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0') +
            String(now.getMilliseconds()).padStart(3, '0');

        // JazzCash Date: YYYYMMDDHHMMSS (PKT)
        // Simple approximate: Usage UTC+5 manually or just use server time if server is configured, 
        // essentially we just need it to be consistent with expiry.
        // Let's stick to UTC for consistency + 5 hours.
        const pktDate = new Date(now.getTime() + (5 * 60 * 60 * 1000));

        const formatJazzDate = (d) => {
            return d.toISOString().replace(/[-:T]/g, '').split('.')[0];
        };

        const pp_TxnDateTime = formatJazzDate(pktDate);

        // Expiry = +1 day
        const expiryDate = new Date(pktDate.getTime() + (24 * 60 * 60 * 1000));
        const pp_TxnExpiryDateTime = formatJazzDate(expiryDate);

        const pp_Amount = String(Math.round(amount * 100)); // Last 2 digits are decimal
        const pp_BillReference = billReference || txnRefNo;

        const params = {
            pp_Amount,
            pp_BankID: '',
            pp_BillReference,
            pp_CNIC: cnic,
            pp_Description: description || `Order ${orderId}`,
            pp_Language: 'EN',
            pp_MerchantID: MERCHANT_ID,
            pp_MobileNumber: mobileNumber,
            pp_Password: PASSWORD,
            pp_ProductID: '',
            pp_SubMerchantID: '',
            pp_TxnCurrency: 'PKR',
            pp_TxnDateTime,
            pp_TxnExpiryDateTime,
            pp_TxnRefNo: txnRefNo,
            ppmpf_1: '',
            ppmpf_2: '',
            ppmpf_3: '',
            ppmpf_4: '',
            ppmpf_5: ''
        };

        const secureHash = generateHash(params, INTEGRITY_SALT);
        params.pp_SecureHash = secureHash;

        // Log to Supabase (Optional but recommended)
        // We'll skip complex DB logging here to keep it simple and robust for this check, 
        // or just fire and forget.
        // For now, let's just make the call.

        console.log('Sending request to JazzCash:', MWALLET_API_URL, params);

        const jazzResponse = await fetch(MWALLET_API_URL, {
            method: 'POST',
            body: JSON.stringify(params),
            headers: { 'Content-Type': 'application/json' }
        });

        const jazzData = await jazzResponse.json();
        console.log('JazzCash Response:', jazzData);

        // Check response
        const { pp_ResponseCode, pp_ResponseMessage } = jazzData;

        // '000' is usually success, '121' might be success waiting for OTP in some flows, 
        // but for MWallet standard is often '000'.
        const success = pp_ResponseCode === '000';

        if (success) {
            // Update order status in Supabase
            await supabase
                .from('orders')
                .update({
                    payment_status: 'completed',
                    payment_method: 'mwallet',
                    jazzcash_txn_ref_no: txnRefNo
                })
                .eq('id', orderId);
        }

        return res.status(200).json({
            success,
            responseMessage: pp_ResponseMessage,
            pp_ResponseCode,
            data: jazzData
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
}
