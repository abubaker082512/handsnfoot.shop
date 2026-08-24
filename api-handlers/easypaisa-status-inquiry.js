import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Helper function to generate HMAC-SHA256 signature
function generateSignature(data, hashKey) {
    const hmac = crypto.createHmac('sha256', hashKey);
    hmac.update(data);
    return hmac.digest('hex');
}

// Helper function to generate Basic Auth header
function generateBasicAuth(username, password) {
    const credentials = `${username}:${password}`;
    return 'Basic ' + Buffer.from(credentials).toString('base64');
}

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { orderId, storeId } = req.body;

        // Validate inputs
        if (!orderId) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'orderId is required'
            });
        }

        // Credentials from environment
        const STORE_ID = storeId || process.env.EASYPAISA_STORE_ID;
        const USERNAME = process.env.EASYPAISA_USERNAME || 'HandsnFoot';
        const PASSWORD = process.env.EASYPAISA_PASSWORD || 'b0c0c9e7dea2c69232cb608230ba24f6';
        const HASH_KEY = process.env.EASYPAISA_HASH_KEY || 'PBYUY9IX5TZ840KB';
        const INQUIRY_API_URL = process.env.EASYPAISA_INQUIRY_API_URL ||
            'https://easypaystg.easypaisa.com.pk/easypay-service/rest/v4/inquire-transaction';

        if (!STORE_ID) {
            console.error('Missing EASYPAISA_STORE_ID environment variable');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Supabase Client
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.VITE_SUPABASE_ANON_KEY
        );

        // Prepare request payload
        const payload = {
            orderId: orderId,
            storeId: STORE_ID
        };

        // Generate signature
        // Signature format: orderId#storeid#hashKey
        const signatureString = `${orderId}#${STORE_ID}#${HASH_KEY}`;
        const signature = generateSignature(signatureString, HASH_KEY);

        console.log('Easypaisa Status Inquiry Request:', {
            ...payload,
            signature: signature.substring(0, 10) + '...',
            apiUrl: INQUIRY_API_URL
        });

        // Make API request to Easypaisa
        const easypaisaResponse = await fetch(INQUIRY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': generateBasicAuth(USERNAME, PASSWORD)
            },
            body: JSON.stringify({
                ...payload,
                signature: signature
            })
        });

        const easypaisaData = await easypaisaResponse.json();
        console.log('Easypaisa Status Inquiry Response:', easypaisaData);

        // Extract response data
        const {
            orderId: responseOrderId,
            storeId: responseStoreId,
            transactionAmount,
            transactionDateTime,
            transactionStatus,
            responseCode,
            responseDesc
        } = easypaisaData;

        // Update transaction status in database
        if (responseOrderId) {
            const { error: updateError } = await supabase
                .from('easypaisa_transactions')
                .update({
                    transaction_status: transactionStatus ||
                        (responseCode === '0000' ? 'success' :
                            responseCode === '0001' ? 'pending' : 'failed'),
                    response_code: responseCode,
                    response_desc: responseDesc,
                    updated_at: new Date().toISOString()
                })
                .eq('order_id', orderId);

            if (updateError) {
                console.error('Database update error:', updateError);
            }

            // Update order status if payment is successful
            if (responseCode === '0000') {
                await supabase
                    .from('orders')
                    .update({
                        payment_status: 'completed',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', orderId);
            } else if (responseCode === '0002') {
                // Payment failed
                await supabase
                    .from('orders')
                    .update({
                        payment_status: 'failed',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', orderId);
            }
        }

        const success = responseCode === '0000';

        return res.status(200).json({
            success,
            responseCode,
            responseMessage: responseDesc,
            data: {
                orderId: responseOrderId,
                storeId: responseStoreId,
                transactionAmount: transactionAmount ? parseFloat(transactionAmount) / 100 : null,
                transactionDateTime,
                transactionStatus,
                statusDescription:
                    responseCode === '0000' ? 'Payment Successful' :
                        responseCode === '0001' ? 'Payment Pending' :
                            responseCode === '0002' ? 'Payment Failed' :
                                'Unknown Status'
            }
        });

    } catch (error) {
        console.error('Easypaisa Status Inquiry Error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
}
