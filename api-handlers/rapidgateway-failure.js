import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const orderId = req.query.orderId || req.body.BASKET_ID;

    console.log('RapidGateway Failure Callback triggered for Order ID:', orderId);

    if (!orderId) {
        console.error('No Order ID found in failure callback parameters');
        return res.redirect(302, '/');
    }

    try {
        // Initialize Supabase Client
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Update status to failed
        console.log(`Updating Supabase order ${orderId} status to Failed...`);
        const { error } = await supabase
            .from('orders')
            .update({
                payment_status: 'failed',
            })
            .eq('id', orderId);

        if (error) {
            console.error('Supabase Order status update failed on failure callback:', error);
        }

        // Redirect back to checkout with warning parameters
        res.redirect(302, `/checkout?error=Payment was cancelled or failed. Please try again.`);
    } catch (error) {
        console.error('Error in RapidGateway failure callback handler:', error);
        res.redirect(302, `/checkout?error=Payment failed.`);
    }
}
