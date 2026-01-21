import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Helper function to generate HMAC-SHA256 hash for status inquiry
function generateStatusInquiryHash(params, integritySalt) {
    // Sort by parameter NAMES alphabetically
    const sortedKeys = Object.keys(params)
        .filter(key => params[key] !== null && params[key] !== undefined && params[key] !== '')
        .sort();

    // Concatenate values only
    const values = sortedKeys.map(key => String(params[key]));
    const concatenatedValues = values.join('&');

    // Prepend integrity salt
    const hashString = integritySalt + '&' + concatenatedValues;

    console.log('Status Inquiry Hash String:', hashString);

    // Generate HMAC-SHA256 hash
    const hash = crypto.createHmac('sha256', integritySalt)
        .update(hashString)
        .digest('hex');

    return hash; // lowercase
}

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { txnRefNo } = req.body;

        if (!txnRefNo) {
            return res.status(400).json({ error: 'Transaction reference number is required' });
        }

        // JazzCash Credentials (trim to remove any trailing whitespace/newlines)
        const MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID?.trim();
        const PASSWORD = process.env.JAZZCASH_PASSWORD?.trim();
        const INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT?.trim();
        const STATUS_INQUIRY_URL = process.env.JAZZCASH_STATUS_INQUIRY_URL?.trim() ||
            'https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v2/rest/payments/status/inquiry';

        if (!MERCHANT_ID || !PASSWORD || !INTEGRITY_SALT) {
            console.error('Missing JazzCash environment variables');
            return res.status(500).json({ error: 'Server configuration error: Missing credentials' });
        }

        // Build request parameters
        const params = {
            pp_TxnRefNo: txnRefNo,
            pp_MerchantID: MERCHANT_ID,
            pp_Password: PASSWORD
        };

        // Generate secure hash
        const pp_SecureHash = generateStatusInquiryHash(params, INTEGRITY_SALT);

        // Add hash to request
        const requestBody = {
            ...params,
            pp_SecureHash
        };

        console.log('\n========== JAZZCASH STATUS INQUIRY ==========');
        console.log('Transaction Ref:', txnRefNo);

        // Make request to JazzCash
        const response = await fetch(STATUS_INQUIRY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        console.log('\n========== JAZZCASH RESPONSE ==========');
        console.log('Response Code:', data.pp_ResponseCode);
        console.log('Message:', data.pp_ResponseMessage);
        console.log('Full Response:', JSON.stringify(data, null, 2));

        // UPDATE DATABASE IF PAYMENT SUCCESSFUL
        // Per Docs: pp_ResponseCode '000' means API call success.
        // pp_PaymentResponseCode '121' means Transaction Completed.
        // We strictly check for '121' to confirm payment.
        if (data.pp_PaymentResponseCode === '121') {
            try {
                // Try to get Supabase credentials
                const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
                // Use Service Role Key for backend updates if available, otherwise Anon Key (might fail RLS)
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

                if (supabaseUrl && supabaseKey) {
                    const supabase = createClient(supabaseUrl, supabaseKey);

                    // 1. Update Transaction
                    // First we need to find the transaction by ref no
                    // Note: RLS might block SELECT if using Anon key, but Service Role Key bypasses RLS
                    const { data: transaction } = await supabase
                        .from('payment_transactions')
                        .select('*')
                        .eq('txn_ref_no', txnRefNo)
                        .single();

                    if (transaction) {
                        // Update Transaction Status
                        await supabase
                            .from('payment_transactions')
                            .update({
                                status: 'completed',
                                response_code: data.pp_PaymentResponseCode,
                                response_message: data.pp_PaymentResponseMessage,
                                retrieval_ref_no: data.pp_RetrievalReferenceNo,
                                auth_code: data.pp_AuthCode,
                                response_timestamp: new Date().toISOString()
                            })
                            .eq('txn_ref_no', txnRefNo);

                        // 2. Update Order Status
                        if (transaction.order_id) {
                            await supabase
                                .from('orders')
                                .update({
                                    payment_status: 'completed', // Mark as paid
                                    jazzcash_txn_ref_no: txnRefNo,
                                    jazzcash_retrieval_ref_no: data.pp_RetrievalReferenceNo || '',
                                    jazzcash_auth_code: data.pp_AuthCode || '',
                                    jazzcash_response_code: data.pp_PaymentResponseCode || '',
                                    payment_completed_at: new Date().toISOString(),
                                    amount_paid: transaction.amount
                                })
                                .eq('id', transaction.order_id);

                            console.log('Database updated: Transaction and Order marked as completed');
                        }
                    } else {
                        console.warn('Transaction not found in DB for Ref:', txnRefNo);
                    }
                } else {
                    console.warn('Supabase credentials not found. Database not updated.');
                }
            } catch (dbError) {
                console.error('Database Update Failed:', dbError);
                // We proceed to return the response to the frontend
            }
        }

        // Return standardized response
        return res.status(200).json({
            success: data.pp_PaymentResponseCode === '121',
            txnRefNo: data.pp_TxnRefNo,
            responseCode: data.pp_ResponseCode,
            responseMessage: data.pp_ResponseMessage,
            paymentResponseCode: data.pp_PaymentResponseCode,
            paymentResponseMessage: data.pp_PaymentResponseMessage,
            status: data.pp_Status,
            amount: data.pp_Amount,
            raw: data
        });

    } catch (error) {
        console.error('JazzCash Status Inquiry API Error:', error);
        return res.status(500).json({
            error: 'Failed to check transaction status',
            message: error.message
        });
    }
}
