import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Helper function to generate HMAC-SHA256 signature
function generateSignature(data, hashKey) {
    const hmac = crypto.createHmac('sha256', hashKey);
    hmac.update(data);
    return hmac.digest('hex');
}

// Helper function to format datetime for Easypaisa (YYYYMMDDHHMMSS in PKT)
function formatEasypaisaDateTime(date) {
    // Convert to PKT (UTC+5)
    const pktDate = new Date(date.getTime() + (5 * 60 * 60 * 1000));
    
    const year = pktDate.getUTCFullYear();
    const month = String(pktDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(pktDate.getUTCDate()).padStart(2, '0');
    const hours = String(pktDate.getUTCHours()).padStart(2, '0');
    const minutes = String(pktDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(pktDate.getUTCSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
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
        const { orderId, amount, mobileAccountNo, emailAddress } = req.body;

        // Validate inputs
        if (!orderId || !amount || !mobileAccountNo) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'orderId, amount, and mobileAccountNo are required'
            });
        }

        // Credentials from environment
        const STORE_ID = process.env.EASYPAISA_STORE_ID;
        const USERNAME = process.env.EASYPAISA_USERNAME || 'HandsnFoot';
        const PASSWORD = process.env.EASYPAISA_PASSWORD || 'b0c0c9e7dea2c69232cb608230ba24f6';
        const HASH_KEY = process.env.EASYPAISA_HASH_KEY || 'PBYUY9IX5TZ840KB';
        const MA_API_URL = process.env.EASYPAISA_MA_API_URL || 
            'https://easypaisa.com.pk/easypay/ma-transaction';

        if (!STORE_ID) {
            console.error('Missing EASYPAISA_STORE_ID environment variable');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Supabase Client
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.VITE_SUPABASE_ANON_KEY
        );

        // Generate transaction datetime
        const now = new Date();
        const transactionDateTime = formatEasypaisaDateTime(now);
        
        // Calculate token expiry (24 hours from now)
        const expiryHours = parseInt(process.env.EASYPAISA_TOKEN_EXPIRY_HOURS || '24');
        const expiryDate = new Date(now.getTime() + (expiryHours * 60 * 60 * 1000));
        const tokenExpiry = formatEasypaisaDateTime(expiryDate);

        // Format amount (convert to paisa - multiply by 100)
        const transactionAmount = String(Math.round(amount * 100));

        // Prepare request payload
        const payload = {
            orderId: orderId,
            storeId: STORE_ID,
            transactionAmount: transactionAmount,
            transactionType: 'MA',
            mobileAccountNo: mobileAccountNo,
            emailAddress: emailAddress || '',
            tokenExpiry: tokenExpiry
        };

        // Generate signature
        // Signature format: amount#storeid#postBackURL#merchantHashKey
        // For MA transactions, we use: amount#storeid#orderId#hashKey
        const signatureString = `${transactionAmount}#${STORE_ID}#${orderId}#${HASH_KEY}`;
        const signature = generateSignature(signatureString, HASH_KEY);

        console.log('Easypaisa MA Payment Request:', {
            ...payload,
            signature: signature.substring(0, 10) + '...',
            apiUrl: MA_API_URL
        });

        // Make API request to Easypaisa
        const easypaisaResponse = await fetch(MA_API_URL, {
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
        console.log('Easypaisa MA Response:', easypaisaData);

        // Extract response data
        const {
            orderId: responseOrderId,
            storeId: responseStoreId,
            paymentToken,
            transactionDateTime: responseTxnDateTime,
            paymentTokenExpiryDateTime,
            responseCode,
            responseDesc
        } = easypaisaData;

        // Log transaction to database
        const { error: dbError } = await supabase
            .from('easypaisa_transactions')
            .insert({
                order_id: orderId,
                store_id: STORE_ID,
                payment_token: paymentToken,
                transaction_type: 'MA',
                transaction_amount: amount,
                mobile_number: mobileAccountNo,
                email_address: emailAddress || null,
                transaction_datetime: now.toISOString(),
                token_expiry_datetime: expiryDate.toISOString(),
                response_code: responseCode,
                response_desc: responseDesc,
                transaction_status: responseCode === '0000' ? 'success' : 'pending'
            });

        if (dbError) {
            console.error('Database logging error:', dbError);
        }

        // Check if transaction was successful
        const success = responseCode === '0000';

        if (success) {
            // Update order status
            await supabase
                .from('orders')
                .update({
                    payment_status: 'completed',
                    payment_method: 'easypaisa_ma',
                    easypaisa_payment_token: paymentToken,
                    easypaisa_transaction_type: 'MA'
                })
                .eq('id', orderId);
        }

        return res.status(200).json({
            success,
            responseCode,
            responseMessage: responseDesc,
            data: {
                orderId: responseOrderId,
                storeId: responseStoreId,
                paymentToken,
                transactionDateTime: responseTxnDateTime,
                paymentTokenExpiryDateTime,
                transactionAmount: amount
            }
        });

    } catch (error) {
        console.error('Easypaisa MA Payment Error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
}
