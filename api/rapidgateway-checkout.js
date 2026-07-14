import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { amount, phone, email, orderId } = req.body;

    if (!amount || !phone || !email || !orderId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const RG_MERCHANT_ID = process.env.RG_MERCHANT_ID;
        const RG_CLIENT_SECRET = process.env.RG_CLIENT_SECRET;
        const BASE_URL = process.env.BASE_URL;

        if (!RG_MERCHANT_ID || !RG_CLIENT_SECRET || !BASE_URL) {
            console.error('RapidGateway config missing: RG_MERCHANT_ID, RG_CLIENT_SECRET, or BASE_URL');
            throw new Error('RapidGateway configuration is not fully set up on this server.');
        }

        // ── Step 1: Get Bearer Token ────────────────────────────────────
        const creds = Buffer
            .from(`${RG_MERCHANT_ID}:${RG_CLIENT_SECRET}`)
            .toString('base64');

        console.log('Requesting RapidGateway bearer token...');
        const tokenRes = await fetch('https://secure.rapid-gateway.com/oauth2/token', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${creds}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });

        if (!tokenRes.ok) {
            const errText = await tokenRes.text();
            throw new Error(`Failed to retrieve OAuth token from RapidGateway: ${errText}`);
        }

        const { access_token } = await tokenRes.json();

        // ── Step 2: Submit transaction to get Redirect Location ────────
        const body = new URLSearchParams({
            MERCHANT_ID: RG_MERCHANT_ID,
            MERCHANT_NAME: 'Hands & Foot Shop',
            TXNAMT: String(amount),
            CURRENCY_CODE: 'PKR',
            CUSTOMER_MOBILE_NO: phone,
            CUSTOMER_EMAIL_ADDRESS: email,
            BASKET_ID: orderId,
            SUCCESS_URL: `${BASE_URL}/api/rapidgateway-success?orderId=${orderId}`,
            FAILURE_URL: `${BASE_URL}/api/rapidgateway-failure?orderId=${orderId}`,
            CHECKOUT_URL: `${BASE_URL}/payment/complete`,
            VERSION: 'MY_VER_1.0',
            PROCCODE: '0',
        });

        console.log('Submitting transaction details to RapidGateway...');
        const payRes = await fetch(
            'https://secure.rapid-gateway.com/rapid/process-transaction',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body.toString(),
                redirect: 'manual', // Capture redirection header directly without following it
            }
        );

        const redirectUrl = payRes.headers.get('location');

        if (!redirectUrl) {
            const responseText = await payRes.text();
            console.error('RapidGateway Process Transaction Response:', responseText);
            throw new Error('RapidGateway response did not contain a redirect location.');
        }

        console.log('RapidGateway redirect URL acquired successfully:', redirectUrl);
        res.json({ success: true, redirectUrl });
    } catch (error) {
        console.error('Error in RapidGateway checkout backend handler:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error', message: error.message });
    }
}
