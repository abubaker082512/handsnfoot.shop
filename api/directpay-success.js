import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const orderId = req.query.orderId || req.body.client_transaction_id;

    console.log('DirectPay Success Callback triggered for Order ID:', orderId);

    if (!orderId) {
        console.error('No Order ID found in success parameters');
        return res.redirect(302, '/');
    }

    try {
        // Initialize Supabase Client
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Update status in Supabase
        console.log(`Updating Supabase order ${orderId} status to Paid...`);
        const { error } = await supabase
            .from('orders')
            .update({
                status: 'paid',
                payment_status: 'completed',
            })
            .eq('id', orderId);

        if (error) {
            console.error('Supabase Order status update failed on DirectPay success callback:', error);
        } else {
            console.log(`Supabase order ${orderId} updated to Paid successfully.`);
        }

        // Redirect browser to React frontend success landing page
        res.redirect(302, `/order-success?orderId=${orderId}&txnRef=DP-${Date.now()}`);
    } catch (error) {
        console.error('Error in DirectPay success callback handler:', error);
        res.redirect(302, `/order-success?orderId=${orderId}&error=DatabaseUpdateError`);
    }
}
