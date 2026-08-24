import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Only accept POST requests from the RapidGateway webhook
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const signature = req.headers['x-rapidgateway-signature'] || req.headers['x-rapidpay-signature'];
        const timestamp = req.headers['x-rapidgateway-timestamp'] || req.headers['x-rapidpay-timestamp'];
        const WEBHOOK_SECRET = process.env.RG_WEBHOOK_SECRET;

        console.log('Received RapidGateway Webhook notification. Headers:', { signature, timestamp });

        if (!signature || !timestamp) {
            console.error('Missing signature or timestamp headers in webhook request.');
            return res.status(400).json({ error: 'Verification failed: Missing X-RapidGateway-Signature/Timestamp headers' });
        }

        if (!WEBHOOK_SECRET) {
            console.error('Missing RG_WEBHOOK_SECRET environment variable on server.');
            return res.status(500).json({ error: 'Server configuration error: Webhook secret not configured' });
        }

        // Retrieve raw body buffer
        const rawBody = req.rawBody ? req.rawBody.toString('utf-8') : JSON.stringify(req.body);

        // Verify HMAC-SHA256 signature (timestamp + "." + rawBody)
        const message = timestamp + '.' + rawBody;
        const computedSignature = crypto
            .createHmac('sha256', WEBHOOK_SECRET)
            .update(message)
            .digest('hex')
            .toUpperCase();

        if (computedSignature !== signature.toUpperCase()) {
            console.error('Webhook signature mismatch! Computed:', computedSignature, 'Received:', signature);
            return res.status(401).json({ error: 'Invalid webhook signature' });
        }

        const event = req.body;
        console.log('Webhook signature verified successfully. Payload details:', event);

        // Handle Webhook Test Events (Settings check)
        if (event.eventType === 'webhook.test') {
            console.log('Test webhook event received and acknowledged.');
            return res.status(200).json({ success: true, message: 'Test event verified' });
        }

        const orderId = event.merchantTransactionId;
        const status = event.status;

        if (!orderId) {
            console.error('No merchantTransactionId (orderId) found in payload');
            return res.status(400).json({ error: 'Missing merchantTransactionId' });
        }

        // Initialize Supabase Client
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
        const supabase = createClient(supabaseUrl, supabaseKey);

        if (event.eventType === 'transaction.completed' && status === 'SUCCESS') {
            // Update order status in Supabase
            console.log(`Webhook: Marking order ${orderId} as PAID...`);
            const { error } = await supabase
                .from('orders')
                .update({
                    status: 'paid',
                    payment_status: 'completed',
                })
                .eq('id', orderId);

            if (error) {
                console.error('Webhook: Failed to mark order as paid:', error);
                return res.status(500).json({ error: 'Database update failed' });
            }
            console.log(`Webhook: Order ${orderId} successfully marked as PAID.`);
        } else if (event.eventType === 'transaction.failed' || status === 'FAILED') {
            // Mark payment status as failed
            console.log(`Webhook: Marking order ${orderId} as FAILED...`);
            const { error } = await supabase
                .from('orders')
                .update({
                    payment_status: 'failed',
                })
                .eq('id', orderId);

            if (error) {
                console.error('Webhook: Failed to mark order as failed:', error);
            }
            console.log(`Webhook: Order ${orderId} marked as FAILED.`);
        }

        // Acknowledge receipt of the webhook (must be 2xx status code)
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error in RapidGateway webhook handler:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
