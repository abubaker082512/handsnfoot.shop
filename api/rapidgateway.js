import rapidgatewayCheckout from '../api-handlers/rapidgateway-checkout.js';
import rapidgatewaySuccess from '../api-handlers/rapidgateway-success.js';
import rapidgatewayFailure from '../api-handlers/rapidgateway-failure.js';
import rapidgatewayWebhook from '../api-handlers/rapidgateway-webhook.js';

export default async function handler(req, res) {
    const url = req.url || '';
    const action = req.query?.action;

    if (url.includes('success') || action === 'success') {
        return rapidgatewaySuccess(req, res);
    }
    if (url.includes('failure') || action === 'failure') {
        return rapidgatewayFailure(req, res);
    }
    if (url.includes('webhook') || action === 'webhook') {
        return rapidgatewayWebhook(req, res);
    }
    return rapidgatewayCheckout(req, res);
}
