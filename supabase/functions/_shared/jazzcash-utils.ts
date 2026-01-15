/**
 * Shared utility functions for JazzCash Edge Functions
 * HMAC-SHA256 hash generation and verification
 */

/**
 * Generate HMAC-SHA256 hash for JazzCash API
 * @param {object} params - Parameters object
 * @param {string} integritySalt - Integrity salt/hash key
 * @returns {Promise<string>} - Generated hash
 */
export async function generateHash(params, integritySalt) {
    // Step 1: Sort parameters alphabetically by key
    const sortedKeys = Object.keys(params).sort();

    // Step 2: Build string with non-empty values
    const values = [];
    for (const key of sortedKeys) {
        const value = params[key];
        // Include only non-empty values
        if (value !== null && value !== undefined && value !== '') {
            values.push(String(value));
        }
    }

    // Step 3: Join values with '&' and prepend integrity salt
    const message = integritySalt + '&' + values.join('&');

    // Step 4: Generate HMAC-SHA256 hash
    const encoder = new TextEncoder();
    const keyData = encoder.encode(integritySalt);
    const messageData = encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        messageData
    );

    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex.toUpperCase();
}

/**
 * Verify HMAC-SHA256 hash from JazzCash response
 * @param {object} params - Response parameters
 * @param {string} receivedHash - Hash received from JazzCash
 * @param {string} integritySalt - Integrity salt/hash key
 * @returns {Promise<boolean>} - True if hash is valid
 */
export async function verifyHash(params, receivedHash, integritySalt) {
    const generatedHash = await generateHash(params, integritySalt);
    return generatedHash === receivedHash.toUpperCase();
}

/**
 * Create CORS headers for Edge Function responses
 * @returns {object} - CORS headers
 */
export function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
}

/**
 * Create JSON response with CORS headers
 * @param {object} data - Response data
 * @param {number} status - HTTP status code
 * @returns {Response} - Response object
 */
export function jsonResponse(data, status = 200) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: {
                ...corsHeaders(),
                'Content-Type': 'application/json',
            },
        }
    );
}

/**
 * Create error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Response} - Error response
 */
export function errorResponse(message, status = 400) {
    return jsonResponse({ error: message }, status);
}

/**
 * Format amount for JazzCash (multiply by 100)
 * @param {number} amount - Amount in PKR
 * @returns {string} - Formatted amount
 */
export function formatAmount(amount) {
    return String(Math.round(amount * 100));
}

/**
 * Parse amount from JazzCash (divide by 100)
 * @param {string|number} amount - Amount from JazzCash
 * @returns {number} - Actual amount
 */
export function parseAmount(amount) {
    const num = typeof amount === 'string' ? parseInt(amount, 10) : amount;
    return num / 100;
}

/**
 * Generate unique transaction reference
 * @returns {string} - Transaction reference
 */
export function generateTxnRef() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');

    return `HAN${year}${month}${day}${hours}${minutes}${seconds}${ms}`;
}

/**
 * Format date/time for JazzCash (Pakistan Time)
 * @param {Date} date - Date object
 * @returns {string} - Formatted date/time (YYYYMMDDHHMMSS)
 */
export function formatDateTime(date = new Date()) {
    // Convert to Pakistan Standard Time (UTC+5)
    const pktOffset = 5 * 60 * 60 * 1000;
    const pktDate = new Date(date.getTime() + pktOffset - (date.getTimezoneOffset() * 60 * 1000));

    const year = pktDate.getUTCFullYear();
    const month = String(pktDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(pktDate.getUTCDate()).padStart(2, '0');
    const hours = String(pktDate.getUTCHours()).padStart(2, '0');
    const minutes = String(pktDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(pktDate.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Get expiry date/time (+1 day)
 * @returns {string} - Expiry date/time
 */
export function getExpiryDateTime() {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return formatDateTime(tomorrow);
}

/**
 * Log transaction to database
 * @param {object} supabase - Supabase client
 * @param {object} data - Transaction data
 * @returns {Promise<object>} - Inserted record
 */
export async function logTransaction(supabase, data) {
    const { data: record, error } = await supabase
        .from('payment_transactions')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error('Error logging transaction:', error);
        throw error;
    }

    return record;
}

/**
 * Update transaction status
 * @param {object} supabase - Supabase client
 * @param {string} txnRefNo - Transaction reference
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} - Updated record
 */
export async function updateTransaction(supabase, txnRefNo, updates) {
    const { data, error } = await supabase
        .from('payment_transactions')
        .update(updates)
        .eq('txn_ref_no', txnRefNo)
        .select()
        .single();

    if (error) {
        console.error('Error updating transaction:', error);
        throw error;
    }

    return data;
}

/**
 * Update order payment status
 * @param {object} supabase - Supabase client
 * @param {string} orderId - Order ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} - Updated order
 */
export async function updateOrderPayment(supabase, orderId, updates) {
    const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

    if (error) {
        console.error('Error updating order:', error);
        throw error;
    }

    return data;
}
