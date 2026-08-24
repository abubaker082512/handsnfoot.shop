import jazzcashCardPayment from '../api-handlers/jazzcash-card-payment.js';
import jazzcashMwalletPayment from '../api-handlers/jazzcash-mwallet-payment.js';
import jazzcashReturn from '../api-handlers/jazzcash-return.js';
import jazzcashStatusInquiry from '../api-handlers/jazzcash-status-inquiry.js';

export default async function handler(req, res) {
    const url = req.url || '';
    const action = req.query?.action;

    if (url.includes('mwallet') || action === 'mwallet') {
        return jazzcashMwalletPayment(req, res);
    }
    if (url.includes('return') || action === 'return') {
        return jazzcashReturn(req, res);
    }
    if (url.includes('status') || action === 'status') {
        return jazzcashStatusInquiry(req, res);
    }
    return jazzcashCardPayment(req, res);
}
