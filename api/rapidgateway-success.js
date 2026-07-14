import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const orderId = req.query.orderId || req.body.BASKET_ID;

    console.log('RapidGateway Success Callback triggered for Order ID:', orderId);

    if (!orderId) {
        console.error('No Order ID found in success callback query/body parameters');
        return res.redirect(302, '/');
    }

    try {
        // Initialize Supabase Client
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Update order record in Supabase
        console.log(`Updating Supabase order ${orderId} status to Paid...`);
        const { error } = await supabase
            .from('orders')
            .update({
                status: 'paid',
                payment_status: 'completed',
            })
            .eq('id', orderId);

        if (error) {
            console.error('Supabase Order status update failed:', error);
        } else {
            console.log(`Supabase order ${orderId} updated to Paid successfully.`);
        }

        // Redirect browser to React frontend order success route
        res.redirect(302, `/order-success?orderId=${orderId}&txnRef=RG-${Date.now()}`);
    } catch (error) {
        console.error('Error in RapidGateway success callback handler:', error);
        res.redirect(302, `/order-success?orderId=${orderId}&error=DatabaseUpdateError`);
    }
}
