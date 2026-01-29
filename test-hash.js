// Test script to verify hash calculation
// Run with: node test-hash.js

import crypto from 'crypto';

// Test data from official JazzCash documentation
const INTEGRITY_SALT = '3vv9wu3a18';

const params = {
    pp_Amount: '25000',
    pp_MerchantID: 'MC25041',
    pp_MerchantMPIN: '1234',
    pp_Password: 'sz1v4agvyf',
    pp_TxnCurrency: 'PKR',
    pp_TxnRefNo: 'T20220518150213'
};

// Hash generation function (same as in API)
function generateHash(params, integritySalt) {
    // Get all non-empty parameter keys and sort alphabetically
    const sortedKeys = Object.keys(params)
        .filter(key => params[key] !== null && params[key] !== undefined && params[key] !== '')
        .sort();

    // Concatenate values only
    const values = sortedKeys.map(key => String(params[key]));
    const concatenatedValues = values.join('&');

    // Prepend integrity salt
    const hashString = integritySalt + '&' + concatenatedValues;

    console.log('\n=== HASH CALCULATION TEST ===');
    console.log('Sorted keys:', sortedKeys);
    console.log('Values:', values);
    console.log('Hash String (before hashing):', hashString);
    console.log('\nExpected hash string from docs:');
    console.log('3vv9wu3a18&25000&MC25041&1234&sz1v4agvyf&PKR&T20220518150213');
    console.log('\nMatch:', hashString === '3vv9wu3a18&25000&MC25041&1234&sz1v4agvyf&PKR&T20220518150213');

    // Generate HMAC-SHA256 hash
    const hash = crypto.createHmac('sha256', integritySalt)
        .update(hashString)
        .digest('hex');

    console.log('\nGenerated hash (lowercase):', hash);
    console.log('Generated hash (uppercase):', hash.toUpperCase());
    console.log('===========================\n');

    return hash;
}

// Run test
generateHash(params, INTEGRITY_SALT);

// Now test with YOUR credentials
console.log('\n=== TEST WITH YOUR CREDENTIALS ===');
const YOUR_SALT = 'z2t4c6q7y2';
const YOUR_MERCHANT_ID = 'MC989920';
const YOUR_PASSWORD = '3r9k9de0b1';

const yourParams = {
    pp_Version: '1.1',
    pp_TxnType: 'MPAY',
    pp_Language: 'EN',
    pp_MerchantID: YOUR_MERCHANT_ID,
    pp_Password: YOUR_PASSWORD,
    pp_TxnRefNo: 'T20260120125500',
    pp_Amount: '100', // 1 PKR
    pp_TxnCurrency: 'PKR',
    pp_TxnDateTime: '20260120125500',
    pp_BillReference: 'billRef001',
    pp_Description: 'Test transaction',
    pp_TxnExpiryDateTime: '20260121125500',
    pp_ReturnURL: 'https://onlinepayments.jazzcash.com.pk/payment-orchestrator/payment/api/v1/merchant/callback/simulators/return-url-v2',
    pp_SubMerchantID: '',
    pp_BankID: '',
    pp_ProductID: '',
    ppmpf_1: '',
    ppmpf_2: '',
    ppmpf_3: '',
    ppmpf_4: '',
    ppmpf_5: ''
};

generateHash(yourParams, YOUR_SALT);
