import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Helper function to generate HMAC-SHA256 hash according to JazzCash v1.1 specification
function generateHash(params, integritySalt) {
    const sortedKeys = Object.keys(params).sort();
    const values = [];

    for (const key of sortedKeys) {
        if (key === 'pp_SecureHash') continue;
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
        const { orderId, amount, mobileNumber, description } = req.body;

        // JazzCash Live Credentials
        const MERCHANT_ID = (process.env.JAZZCASH_MERCHANT_ID || '74584985').trim();
        const PASSWORD = (process.env.JAZZCASH_PASSWORD || 'qo38057jbm').trim();
        const INTEGRITY_SALT = (process.env.JAZZCASH_INTEGRITY_SALT || 'z35f76uo0m').trim();

        // JazzCash MWallet REST API v1.1 Endpoint
        const MWALLET_API_URL = process.env.JAZZCASH_MWALLET_API_URL ||
            'https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v1/rest/payments/m-wallet';

        const BASE_URL = process.env.BASE_URL || 'https://handsnfoot.shop';
        const RETURN_URL = process.env.JAZZCASH_RETURN_URL || `${BASE_URL}/api/jazzcash-return`;

        // Format dates in PKT (UTC+5)
        const now = new Date();
        const pktDate = new Date(now.getTime() + (5 * 60 * 60 * 1000));

        const formatJazzDate = (d) => {
            const year = d.getUTCFullYear();
            const month = String(d.getUTCMonth() + 1).padStart(2, '0');
            const day = String(d.getUTCDate()).padStart(2, '0');
            const hours = String(d.getUTCHours()).padStart(2, '0');
            const mins = String(d.getUTCMinutes()).padStart(2, '0');
            const secs = String(d.getUTCSeconds()).padStart(2, '0');
            return `${year}${month}${day}${hours}${mins}${secs}`;
        };

        const pp_TxnDateTime = formatJazzDate(pktDate);
        const expiryDate = new Date(pktDate.getTime() + (24 * 60 * 60 * 1000));
        const pp_TxnExpiryDateTime = formatJazzDate(expiryDate);

        // TxnRefNo: Unique alphanumeric max 20 chars
        const cleanOrderId = (orderId || 'ORD').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
        const timeStampStr = pp_TxnDateTime.slice(2); // YYMMDDHHMMSS (12 chars)
        const txnRefNo = `T${cleanOrderId}${timeStampStr}`.slice(0, 20);

        // BillReference: Alphanumeric only, no spaces
        const billRef = (orderId || txnRefNo).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);

        // Amount in Paisa (multiplied by 100)
        const pp_Amount = String(Math.round((parseFloat(amount) || 0) * 100));

        // Format mobile number (must be 11 digits starting with 03 e.g. 03185954599)
        let formattedMobile = (mobileNumber || '').replace(/\D/g, '');
        if (formattedMobile.startsWith('92')) {
            formattedMobile = '0' + formattedMobile.slice(2);
        }

        // JazzCash MWallet REST API v1.1 Payload
        const params = {
            pp_Amount,
            pp_BillReference: billRef,
            pp_Description: description || `Order ${cleanOrderId}`,
            pp_Language: 'EN',
            pp_MerchantID: MERCHANT_ID,
            pp_Password: PASSWORD,
            pp_ReturnURL: RETURN_URL,
            pp_TxnCurrency: 'PKR',
            pp_TxnDateTime,
            pp_TxnExpiryDateTime,
            pp_TxnRefNo: txnRefNo,
            pp_TxnType: 'MWALLET',
            pp_Version: '1.1',
            ppmpf_1: formattedMobile,
            ppmpf_2: '',
            ppmpf_3: '',
            ppmpf_4: '',
            ppmpf_5: ''
        };

        // Generate Secure Hash
        const secureHash = generateHash(params, INTEGRITY_SALT);
        params.pp_SecureHash = secureHash;

        console.log('Sending JazzCash MWallet v1.1 request:', MWALLET_API_URL, {
            ...params,
            pp_Password: '***'
        });

        // Submit request to JazzCash API
        const jazzResponse = await fetch(MWALLET_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });

        const jazzData = await jazzResponse.json();
        console.log('JazzCash v1.1 Response:', jazzData);

        const { pp_ResponseCode, pp_ResponseMessage } = jazzData;
        const success = pp_ResponseCode === '000';

        // Update database if Supabase is configured
        try {
            const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
            if (supabaseUrl && supabaseKey) {
                const supabase = createClient(supabaseUrl, supabaseKey);
                await supabase
                    .from('orders')
                    .update({
                        payment_status: success ? 'paid' : 'failed',
                        payment_method: 'mwallet',
                        jazzcash_txn_ref_no: txnRefNo,
                        jazzcash_response_code: pp_ResponseCode,
                        jazzcash_response_message: pp_ResponseMessage,
                        jazzcash_full_response: jazzData
                    })
                    .eq('id', orderId);
            }
        } catch (dbErr) {
            console.error('Supabase update error:', dbErr);
        }

        return res.status(200).json({
            success,
            pp_ResponseCode,
            responseMessage: pp_ResponseMessage || 'Transaction processed',
            txnRefNo,
            data: jazzData
        });

    } catch (error) {
        console.error('JazzCash MWallet API Error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
}
