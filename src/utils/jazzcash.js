/**
 * JazzCash Payment Gateway Utility Functions
 * Handles amount formatting, validation, and helper functions
 */

/**
 * Format amount for JazzCash API (multiply by 100)
 * @param {number} amount - Amount in PKR (e.g., 100.50)
 * @returns {string} - Formatted amount (e.g., "10050")
 */
export const formatAmountForJazzCash = (amount) => {
  const amountInPaisa = Math.round(amount * 100);
  return amountInPaisa.toString();
};

/**
 * Parse amount from JazzCash response (divide by 100)
 * @param {string|number} amount - Amount from JazzCash (e.g., "10050")
 * @returns {number} - Actual amount in PKR (e.g., 100.50)
 */
export const parseAmountFromJazzCash = (amount) => {
  const amountNum = typeof amount === 'string' ? parseInt(amount, 10) : amount;
  return amountNum / 100;
};

/**
 * Generate unique transaction reference number
 * Format: HAN + YYYYMMDDHHMMSSmmm
 * @returns {string} - Unique transaction reference
 */
export const generateTxnRefNo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  
  return `HAN${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
};

/**
 * Format date/time for JazzCash API (Pakistan Standard Time)
 * Format: YYYYMMDDHHMMSS
 * @param {Date} date - Date object (optional, defaults to now)
 * @returns {string} - Formatted date/time
 */
export const formatDateTimeForJazzCash = (date = new Date()) => {
  // Convert to Pakistan Standard Time (UTC+5)
  const pktOffset = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
  const pktDate = new Date(date.getTime() + pktOffset - (date.getTimezoneOffset() * 60 * 1000));
  
  const year = pktDate.getUTCFullYear();
  const month = String(pktDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(pktDate.getUTCDate()).padStart(2, '0');
  const hours = String(pktDate.getUTCHours()).padStart(2, '0');
  const minutes = String(pktDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(pktDate.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

/**
 * Get expiry date/time (+1 day from now)
 * @returns {string} - Formatted expiry date/time
 */
export const getExpiryDateTime = () => {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return formatDateTimeForJazzCash(tomorrow);
};

/**
 * Validate CNIC (last 6 digits)
 * @param {string} cnic - CNIC last 6 digits
 * @returns {boolean} - True if valid
 */
export const validateCNIC = (cnic) => {
  if (!cnic) return false;
  return /^\d{6}$/.test(cnic.trim());
};

/**
 * Validate Pakistani mobile number
 * Format: 03XXXXXXXXX (11 digits starting with 03)
 * @param {string} mobile - Mobile number
 * @returns {boolean} - True if valid
 */
export const validateMobileNumber = (mobile) => {
  if (!mobile) return false;
  const cleaned = mobile.replace(/[\s-]/g, ''); // Remove spaces and dashes
  return /^03\d{9}$/.test(cleaned);
};

/**
 * Format mobile number (remove spaces and dashes)
 * @param {string} mobile - Mobile number
 * @returns {string} - Cleaned mobile number
 */
export const formatMobileNumber = (mobile) => {
  return mobile.replace(/[\s-]/g, '');
};

/**
 * Validate bill reference (alphanumeric only)
 * @param {string} billRef - Bill reference
 * @returns {boolean} - True if valid
 */
export const validateBillReference = (billRef) => {
  if (!billRef) return false;
  return /^[A-Za-z0-9]+$/.test(billRef);
};

/**
 * Generate bill reference from order ID
 * @param {string} orderId - Order ID
 * @returns {string} - Bill reference
 */
export const generateBillReference = (orderId) => {
  // Remove hyphens and take first 20 characters
  return orderId.replace(/-/g, '').substring(0, 20).toUpperCase();
};

/**
 * Get payment status display text
 * @param {string} status - Payment status
 * @returns {object} - Status display info
 */
export const getPaymentStatusDisplay = (status) => {
  const statusMap = {
    'pending': { text: 'Pending', color: 'yellow', icon: '⏳' },
    'initiated': { text: 'Processing', color: 'blue', icon: '🔄' },
    'completed': { text: 'Completed', color: 'green', icon: '✅' },
    'failed': { text: 'Failed', color: 'red', icon: '❌' },
    'cancelled': { text: 'Cancelled', color: 'gray', icon: '🚫' }
  };
  
  return statusMap[status] || { text: status, color: 'gray', icon: '❓' };
};

/**
 * Get error message for response code
 * @param {string} code - JazzCash response code
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (code) => {
  const errorMessages = {
    '000': 'Transaction successful',
    '121': 'Transaction completed successfully',
    '199': 'Payment failed. Please try again or use a different payment method.',
    '999': 'System error. Please contact support.',
    'timeout': 'Payment is taking longer than expected. We will update your order once confirmed.',
    'invalid_cnic': 'Please enter the last 6 digits of your CNIC.',
    'invalid_mobile': 'Please enter a valid Pakistani mobile number (03XXXXXXXXX).',
    'invalid_amount': 'Invalid payment amount.',
    'duplicate_txn': 'This transaction has already been processed.'
  };
  
  return errorMessages[code] || 'An error occurred. Please try again.';
};

/**
 * Check if response code indicates success
 * @param {string} code - Response code
 * @returns {boolean} - True if successful
 */
export const isSuccessResponse = (code) => {
  return code === '000' || code === '121';
};

/**
 * Check if payment response code indicates completed transaction
 * @param {string} code - Payment response code
 * @returns {boolean} - True if completed
 */
export const isPaymentCompleted = (code) => {
  return code === '121';
};

/**
 * Sanitize string for JazzCash (remove special characters)
 * @param {string} str - Input string
 * @returns {string} - Sanitized string
 */
export const sanitizeForJazzCash = (str) => {
  if (!str) return '';
  // Remove special characters, keep alphanumeric and spaces
  return str.replace(/[^A-Za-z0-9\s]/g, '').trim();
};

/**
 * Create payment description
 * @param {string} orderId - Order ID
 * @param {number} itemCount - Number of items
 * @returns {string} - Payment description
 */
export const createPaymentDescription = (orderId, itemCount = 1) => {
  return `HandsnFoot Order ${orderId.substring(0, 8)} - ${itemCount} item(s)`;
};

export default {
  formatAmountForJazzCash,
  parseAmountFromJazzCash,
  generateTxnRefNo,
  formatDateTimeForJazzCash,
  getExpiryDateTime,
  validateCNIC,
  validateMobileNumber,
  formatMobileNumber,
  validateBillReference,
  generateBillReference,
  getPaymentStatusDisplay,
  getErrorMessage,
  isSuccessResponse,
  isPaymentCompleted,
  sanitizeForJazzCash,
  createPaymentDescription
};
