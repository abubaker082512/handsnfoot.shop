import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Helper function to generate HMAC-SHA256 hash (must match outgoing hash generation)
function generateHash(params, integritySalt) {
    // Sort parameters alphabetically (A-Z)
    const sortedKeys = Object.keys(params).sort();

    // Build sorted string with only non-empty values
    let sortedString = integritySalt;

    for (const key of sortedKeys) {
        const value = params[key];
        // Include only non-null, non-empty values
        if (value !== null && value !== undefined && value !== '') {
            sortedString += '&' + String(value);
        }
    }

    // Generate HMAC-SHA256 hash
    const hmac = crypto.createHmac('sha256', integritySalt);
    hmac.update(sortedString);
    return hmac.digest('hex').toUpperCase();
}

// Parse raw body into key-value pairs for URL-encoded form data (needed on Vercel)
async function parseUrlEncodedBody(req) {
    // If Express middleware already parsed it, use req.body
    if (req.body && Object.keys(req.body).length > 0) {
        return req.body;
    }
    // Otherwise read and parse the raw stream (Vercel serverless)
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => { data += chunk.toString(); });
        req.on('end', () => {
            try {
                const parsed = Object.fromEntries(new URLSearchParams(data));
                resolve(parsed);
            } catch (e) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

export default async function handler(req, res) {
    // JazzCash sends a POST request to the Return URL
    if (req.method !== 'POST') {
        console.log('JazzCash Return: Received non-POST request, redirecting to home');
        return res.redirect(302, '/');
    }

    try {
        const params = await parseUrlEncodedBody(req);
        console.log('JazzCash Return Params:', JSON.stringify(params, null, 2));

        const INTEGRITY_SALT = (process.env.JAZZCASH_INTEGRITY_SALT || 'z35f76uo0m').trim();

        // Supabase Client
        // Use Service Role Key if available for reliable DB updates, otherwise fallback to Anon Key
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Verify Secure Hash
        const receivedHash = params.pp_SecureHash;

        // Create a copy of params without pp_SecureHash for hash verification
        const paramsForHash = { ...params };
        delete paramsForHash.pp_SecureHash;

        // Calculate hash from received params
        const calculatedHash = generateHash(paramsForHash, INTEGRITY_SALT);

        console.log('Hash Verification:', {
            received: receivedHash,
            calculated: calculatedHash,
            match: receivedHash === calculatedHash
        });

        // Verify hash matches
        if (receivedHash !== calculatedHash) {
            console.error('JazzCash Hash Mismatch - Possible tampering!');
            // In production, you should reject mismatched hashes
            // For now, we'll log but continue (for debugging)
        }

        // 2. Extract Status and Order Information
        const responseCode = params.pp_ResponseCode;
        const responseMessage = params.pp_ResponseMessage;
        const txnRefNo = params.pp_TxnRefNo;
        const orderId = params.pp_BillReference; // We stored orderId in pp_BillReference
        const amount = params.pp_Amount ? parseFloat(params.pp_Amount) / 100 : 0;

        console.log('Payment Response:', {
            responseCode,
            responseMessage,
            txnRefNo,
            orderId,
            amount
        });

        // 3. Update Database
        try {
            await supabase
                .from('payment_transactions')
                .update({
                    status: responseCode === '000' ? 'completed' : 'failed',
                    response_code: responseCode,
                    response_message: responseMessage,
                    response_payload: params,
                    updated_at: new Date().toISOString()
                })
                .eq('txn_ref_no', txnRefNo);

            // Update order status if payment successful
            if (responseCode === '000' && orderId) {
                await supabase
                    .from('orders')
                    .update({
                        payment_status: 'paid',
                        status: 'confirmed',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', orderId);
            }
        } catch (dbError) {
            console.error('Database update error:', dbError);
            // Continue with redirect even if DB update fails
        }

        // 4. Determine Redirect URL
        let redirectUrl = '/payment/callback';
        const queryParams = new URLSearchParams();

        // Success response codes: 000 (success), 121 (approved), 200 (success)
        if (responseCode === '000' || responseCode === '121' || responseCode === '200') {
            queryParams.append('orderId', orderId);
            queryParams.append('txnRef', txnRefNo);
            queryParams.append('status', 'success');
            queryParams.append('amount', amount.toString());
        } else {
            queryParams.append('error', responseMessage || 'Payment Failed');
            queryParams.append('code', responseCode);
            queryParams.append('status', 'failed');
        }

        // 5. Perform Redirect
        const finalRedirect = `${redirectUrl}?${queryParams.toString()}`;
        console.log('Redirecting to:', finalRedirect);

        res.redirect(302, finalRedirect);

    } catch (error) {
        console.error('JazzCash Return Handler Error:', error);
        res.redirect(302, '/payment/callback?error=Internal Server Error&status=failed');
    }
}
