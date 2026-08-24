import crypto from 'crypto';

// Helper to format Pakistani mobile number to exact format 03xxxxxxxxx (11 digits)
function formatMsisdn(phone) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Convert 923001234567 to 03001234567
    if (cleaned.startsWith('92')) {
        cleaned = '0' + cleaned.slice(2);
    }
    
    // If it's a 10 digit number starting with 3 (e.g. 3001234567), prepend 0
    if (cleaned.length === 10 && cleaned.startsWith('3')) {
        cleaned = '0' + cleaned;
    }
    
    return cleaned;
}

// Helper to remove forbidden characters from description: <>{}[]\|~!@#$%^&*()_+=-`
function cleanDescription(desc) {
    return desc.replace(/[<>{}[\]\\|~!@#$%^&*()_+=\-`]/g, ' ');
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { amount, phone, email, payerName, orderId } = req.body;

    if (!amount || !phone || !email || !payerName || !orderId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const client_id = process.env.DP_CLIENT_ID || 'ci_arfqfd8aml2fiq9oto1y';
        const client_secret = process.env.DP_CLIENT_SECRET || 'cs_2tajmvsqs9qyw783v8b132de9khjgsykx3gfyocwovaau1ir757gopouc9hwfzgf';
        const BASE_URL = process.env.BASE_URL;

        if (!BASE_URL) {
            console.error('Missing BASE_URL configuration environment variable');
            throw new Error('BASE_URL environment variable is not configured on this server.');
        }

        // Format parameters according to DirectPay guidelines
        const msisdn = formatMsisdn(phone);
        const amountInPaisas = Math.round(amount * 100).toString();
        const description = cleanDescription(`Payment for Order #${orderId}`);
        
        // Success and Fail redirection endpoints on our server
        const successRedirectUrl = `${BASE_URL}/api/directpay-success?orderId=${orderId}`;
        const failedRedirectUrl = `${BASE_URL}/api/directpay-failure?orderId=${orderId}`;

        // Checksum formula: DirectPay:{client_transaction_id}:{description}:{amount}
        const plainText = `DirectPay:${orderId}:${description}:${amountInPaisas}`;
        const checksum = crypto
            .createHmac('sha256', client_secret)
            .update(plainText)
            .digest('hex');

        // Compile query string parameters (description is URL encoded here)
        const params = new URLSearchParams({
            client_id: client_id,
            client_transaction_id: orderId,
            amount: amountInPaisas,
            description: description,
            payer_name: payerName,
            email: email,
            msisdn: msisdn,
            checksum: checksum,
            currency: 'PKR',
            success_redirect_url: successRedirectUrl,
            failed_redirect_url: failedRedirectUrl
        });

        const paymentUrl = `https://payin-pwa.directpay.pro/pay?${params.toString()}`;
        console.log(`Generated DirectPay Redirect URL for Order ${orderId}: ${paymentUrl}`);

        res.json({ success: true, redirectUrl: paymentUrl });
    } catch (error) {
        console.error('Error in DirectPay checkout handler:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error', message: error.message });
    }
}
