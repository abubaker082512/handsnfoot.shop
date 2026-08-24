import easypaisaMaPayment from '../api-handlers/easypaisa-ma-payment.js';
import easypaisaOtcPayment from '../api-handlers/easypaisa-otc-payment.js';
import easypaisaStatusInquiry from '../api-handlers/easypaisa-status-inquiry.js';

export default async function handler(req, res) {
    const url = req.url || '';
    const action = req.query?.action;

    if (url.includes('otc') || action === 'otc') {
        return easypaisaOtcPayment(req, res);
    }
    if (url.includes('status') || action === 'status') {
        return easypaisaStatusInquiry(req, res);
    }
    return easypaisaMaPayment(req, res);
}
