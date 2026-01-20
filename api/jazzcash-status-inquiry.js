import crypto from 'crypto';

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
    console.log('Sorted keys:', sortedKeys);

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
        console.log('Request Body:', JSON.stringify(requestBody, null, 2));
        console.log('==============================================\n');

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
        console.log('Response Message:', data.pp_ResponseMessage);
        console.log('Payment Response Code:', data.pp_PaymentResponseCode);
        console.log('Status:', data.pp_Status);
        console.log('Full Response:', JSON.stringify(data, null, 2));
        console.log('========================================\n');

        // Verify response hash (optional but recommended)
        if (data.pp_SecureHash) {
            const responseParams = { ...data };
            delete responseParams.pp_SecureHash;

            const expectedHash = generateStatusInquiryHash(responseParams, INTEGRITY_SALT);

            if (expectedHash !== data.pp_SecureHash.toLowerCase()) {
                console.warn('Response hash verification failed!');
                console.warn('Expected:', expectedHash);
                console.warn('Received:', data.pp_SecureHash.toLowerCase());
            } else {
                console.log('Response hash verified successfully ✓');
            }
        }

        // Return response
        return res.status(200).json({
            success: data.pp_ResponseCode === '000',
            responseCode: data.pp_ResponseCode,
            responseMessage: data.pp_ResponseMessage,
            paymentResponseCode: data.pp_PaymentResponseCode,
            paymentResponseMessage: data.pp_PaymentResponseMessage,
            status: data.pp_Status,
            transactionDetails: {
                merchantId: data.pp_MerchantID,
                txnRefNo: data.pp_TxnRefNo,
                txnType: data.pp_TxnType,
                amount: data.pp_Amount,
                txnDateTime: data.pp_TxnDateTime,
                billReference: data.pp_BillReference,
                retrievalReferenceNo: data.pp_RetrievalReferenceNo,
                authCode: data.pp_AuthCode,
                settlementDate: data.pp_SettlementDate
            }
        });

    } catch (error) {
        console.error('JazzCash Status Inquiry API Error:', error);
        return res.status(500).json({
            error: 'Failed to check transaction status',
            message: error.message
        });
    }
}
