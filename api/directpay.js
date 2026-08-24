import directpayCheckout from '../api-handlers/directpay-checkout.js';
import directpaySuccess from '../api-handlers/directpay-success.js';
import directpayFailure from '../api-handlers/directpay-failure.js';

export default async function handler(req, res) {
    const url = req.url || '';
    const action = req.query?.action;

    if (url.includes('success') || action === 'success') {
        return directpaySuccess(req, res);
    }
    if (url.includes('failure') || action === 'failure') {
        return directpayFailure(req, res);
    }
    return directpayCheckout(req, res);
}
