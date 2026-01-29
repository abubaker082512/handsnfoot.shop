/**
 * Easypaisa Payment Gateway Utility Functions
 */

/**
 * Validates Pakistani mobile number format
 * @param {string} number - Mobile number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateMobileNumber(number) {
    // Remove any spaces or dashes
    const cleaned = number.replace(/[\s-]/g, '');

    // Check if it matches Pakistani mobile format: 03XXXXXXXXX (11 digits)
    const regex = /^03[0-9]{9}$/;
    return regex.test(cleaned);
}

/**
 * Validates email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateEmail(email) {
    if (!email) return true; // Email is optional

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Formats mobile number to standard format (03XXXXXXXXX)
 * @param {string} number - Mobile number to format
 * @returns {string} - Formatted mobile number
 */
export function formatMobileNumber(number) {
    // Remove any spaces, dashes, or special characters
    const cleaned = number.replace(/[\s-()]/g, '');

    // If it starts with +92, replace with 0
    if (cleaned.startsWith('+92')) {
        return '0' + cleaned.substring(3);
    }

    // If it starts with 92, replace with 0
    if (cleaned.startsWith('92')) {
        return '0' + cleaned.substring(2);
    }

    return cleaned;
}

/**
 * Formats amount for display
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted amount with currency
 */
export function formatAmount(amount) {
    return `PKR ${amount.toFixed(2)}`;
}

/**
 * Converts amount to paisa (multiply by 100)
 * @param {number} amount - Amount in rupees
 * @returns {number} - Amount in paisa
 */
export function convertToPaisa(amount) {
    return Math.round(amount * 100);
}

/**
 * Converts paisa to rupees (divide by 100)
 * @param {number} paisa - Amount in paisa
 * @returns {number} - Amount in rupees
 */
export function convertToRupees(paisa) {
    return parseFloat(paisa) / 100;
}

/**
 * Generates a unique order ID
 * @returns {string} - Unique order ID
 */
export function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `EP${timestamp}${random}`;
}

/**
 * Formats datetime for display
 * @param {string} datetime - ISO datetime string
 * @returns {string} - Formatted datetime
 */
export function formatDateTime(datetime) {
    if (!datetime) return '';

    const date = new Date(datetime);
    return date.toLocaleString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Validates payment token format
 * @param {string} token - Payment token to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function validatePaymentToken(token) {
    if (!token) return false;

    // Token should be alphanumeric and at least 10 characters
    return token.length >= 10 && /^[a-zA-Z0-9]+$/.test(token);
}

/**
 * Gets payment method display name
 * @param {string} method - Payment method code
 * @returns {string} - Display name
 */
export function getPaymentMethodName(method) {
    const methods = {
        'easypaisa_ma': 'Easypaisa Mobile Account',
        'easypaisa_otc': 'Easypaisa Over-the-Counter',
        'jazzcash': 'JazzCash',
        'card': 'Credit/Debit Card',
        'cod': 'Cash on Delivery'
    };

    return methods[method] || method;
}

/**
 * Gets transaction status display info
 * @param {string} status - Transaction status code
 * @returns {object} - Status info with color and text
 */
export function getTransactionStatusInfo(status) {
    const statuses = {
        'success': {
            text: 'Payment Successful',
            color: 'green',
            icon: '✓'
        },
        'pending': {
            text: 'Payment Pending',
            color: 'yellow',
            icon: '⏳'
        },
        'failed': {
            text: 'Payment Failed',
            color: 'red',
            icon: '✗'
        },
        'expired': {
            text: 'Token Expired',
            color: 'gray',
            icon: '⌛'
        }
    };

    return statuses[status] || {
        text: 'Unknown Status',
        color: 'gray',
        icon: '?'
    };
}

/**
 * Checks if payment token is expired
 * @param {string} expiryDateTime - Token expiry datetime
 * @returns {boolean} - True if expired, false otherwise
 */
export function isTokenExpired(expiryDateTime) {
    if (!expiryDateTime) return false;

    const expiry = new Date(expiryDateTime);
    const now = new Date();

    return now > expiry;
}

/**
 * Calculates time remaining until token expiry
 * @param {string} expiryDateTime - Token expiry datetime
 * @returns {string} - Human-readable time remaining
 */
export function getTimeRemaining(expiryDateTime) {
    if (!expiryDateTime) return '';

    const expiry = new Date(expiryDateTime);
    const now = new Date();
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        return `${hours}h ${minutes}m remaining`;
    }

    return `${minutes}m remaining`;
}
