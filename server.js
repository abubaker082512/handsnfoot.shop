import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Import handlers directly
import jazzcashCardPayment from './api/jazzcash-card-payment.js';
import jazzcashMwalletPayment from './api/jazzcash-mwallet-payment.js';
import jazzcashReturn from './api/jazzcash-return.js';
import jazzcashStatusInquiry from './api/jazzcash-status-inquiry.js';

import rapidgatewayCheckout from './api/rapidgateway-checkout.js';
import rapidgatewaySuccess from './api/rapidgateway-success.js';
import rapidgatewayFailure from './api/rapidgateway-failure.js';
import rapidgatewayWebhook from './api/rapidgateway-webhook.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse JSON bodies and keep rawBody buffer for signature verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Parse URL-encoded bodies (important for JazzCash callbacks)
app.use(express.urlencoded({ extended: true }));

// Routing for API endpoints
app.all('/api/jazzcash-card-payment', async (req, res) => {
  try {
    await jazzcashCardPayment(req, res);
  } catch (error) {
    console.error('Error in /api/jazzcash-card-payment:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.all('/api/jazzcash-mwallet-payment', async (req, res) => {
  try {
    await jazzcashMwalletPayment(req, res);
  } catch (error) {
    console.error('Error in /api/jazzcash-mwallet-payment:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.all('/api/jazzcash-return', async (req, res) => {
  try {
    await jazzcashReturn(req, res);
  } catch (error) {
    console.error('Error in /api/jazzcash-return:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.all('/api/jazzcash-status-inquiry', async (req, res) => {
  try {
    await jazzcashStatusInquiry(req, res);
  } catch (error) {
    console.error('Error in /api/jazzcash-status-inquiry:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.all('/api/rapidgateway-checkout', async (req, res) => {
  try {
    await rapidgatewayCheckout(req, res);
  } catch (error) {
    console.error('Error in /api/rapidgateway-checkout:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.all('/api/rapidgateway-success', async (req, res) => {
  try {
    await rapidgatewaySuccess(req, res);
  } catch (error) {
    console.error('Error in /api/rapidgateway-success:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.all('/api/rapidgateway-failure', async (req, res) => {
  try {
    await rapidgatewayFailure(req, res);
  } catch (error) {
    console.error('Error in /api/rapidgateway-failure:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.all('/api/rapidgateway-webhook', async (req, res) => {
  try {
    await rapidgatewayWebhook(req, res);
  } catch (error) {
    console.error('Error in /api/rapidgateway-webhook:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Serve static files from Vite build
app.use(express.static(path.join(__dirname, 'dist')));

// SPA client-side routing fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Port configuration (cPanel/Passenger usually overrides or supplies process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
