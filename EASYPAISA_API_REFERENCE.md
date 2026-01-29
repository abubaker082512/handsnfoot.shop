# Easypaisa API Reference

Technical documentation for Easypaisa payment gateway integration.

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Signature Generation](#signature-generation)
4. [API Endpoints](#api-endpoints)
5. [Response Codes](#response-codes)
6. [Error Handling](#error-handling)
7. [Code Examples](#code-examples)

## API Overview

Easypaisa provides REST APIs for payment processing with two main transaction types:

- **Mobile Account (MA)**: Direct debit from customer's Easypaisa mobile wallet
- **Over-the-Counter (OTC)**: Customer pays cash at any Easypaisa shop

### Base URLs

**Sandbox**:
```
https://easypaisa.com.pk/easypay/
```

**Production**:
```
https://easypaisa.com.pk/easypay-api/
```

## Authentication

All API requests require Basic Authentication.

### Header Format

```
Authorization: Basic <base64_encoded_credentials>
```

### Credentials Format

```javascript
const credentials = `${username}:${password}`;
const base64Credentials = Buffer.from(credentials).toString('base64');
const authHeader = `Basic ${base64Credentials}`;
```

### Example

```javascript
// Username: HandsnFoot
// Password: b0c0c9e7dea2c69232cb608230ba24f6

const auth = Buffer.from('HandsnFoot:b0c0c9e7dea2c69232cb608230ba24f6').toString('base64');
// Result: SGFuZHNuRm9vdDpiMGMwYzllN2RlYTJjNjkyMzJjYjYwODIzMGJhMjRmNg==
```

## Signature Generation

All requests must include a signature for security verification.

### Signature Algorithm

HMAC-SHA256 hash of concatenated parameters.

### Signature Format

```
signature = HMAC-SHA256(signatureString, merchantHashKey)
```

### Signature String Formats

**For MA/OTC Transactions**:
```
signatureString = amount#storeId#orderId#merchantHashKey
```

**For Status Inquiry**:
```
signatureString = orderId#storeId#merchantHashKey
```

### JavaScript Implementation

```javascript
import crypto from 'crypto';

function generateSignature(data, hashKey) {
    const hmac = crypto.createHmac('sha256', hashKey);
    hmac.update(data);
    return hmac.digest('hex');
}

// Example for payment
const amount = '100000'; // PKR 1000.00 in paisa
const storeId = 'STORE123';
const orderId = 'ORDER456';
const hashKey = 'PBYUY9IX5TZ840KB';

const signatureString = `${amount}#${storeId}#${orderId}#${hashKey}`;
const signature = generateSignature(signatureString, hashKey);
```

## API Endpoints

### 1. Initiate Mobile Account Transaction

Initiates a payment from customer's Easypaisa mobile account.

**Endpoint**: `POST /ma-transaction`

**Request Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Basic <base64_credentials>"
}
```

**Request Body**:
```json
{
  "orderId": "ORDER123456",
  "storeId": "STORE123",
  "transactionAmount": "100000",
  "transactionType": "MA",
  "mobileAccountNo": "03001234567",
  "emailAddress": "customer@example.com",
  "tokenExpiry": "20260130235959",
  "signature": "a1b2c3d4e5f6..."
}
```

**Request Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| orderId | String | Yes | Unique order identifier |
| storeId | String | Yes | Merchant store ID |
| transactionAmount | String | Yes | Amount in paisa (multiply by 100) |
| transactionType | String | Yes | Must be "MA" |
| mobileAccountNo | String | Yes | Customer's mobile number (11 digits) |
| emailAddress | String | No | Customer's email address |
| tokenExpiry | String | Yes | Token expiry datetime (YYYYMMDDHHMMSS) |
| signature | String | Yes | HMAC-SHA256 signature |

**Response**:
```json
{
  "orderId": "ORDER123456",
  "storeId": "STORE123",
  "paymentToken": "ABC123XYZ789",
  "transactionDateTime": "20260129203000",
  "paymentTokenExpiryDateTime": "20260130235959",
  "responseCode": "0000",
  "responseDesc": "Transaction Successful"
}
```

---

### 2. Initiate OTC Transaction

Generates a payment token for over-the-counter payment.

**Endpoint**: `POST /otc-transaction`

**Request Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Basic <base64_credentials>"
}
```

**Request Body**:
```json
{
  "orderId": "ORDER123456",
  "storeId": "STORE123",
  "transactionAmount": "100000",
  "transactionType": "OTC",
  "msisdn": "03001234567",
  "emailAddress": "customer@example.com",
  "tokenExpiry": "20260130235959",
  "signature": "a1b2c3d4e5f6..."
}
```

**Request Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| orderId | String | Yes | Unique order identifier |
| storeId | String | Yes | Merchant store ID |
| transactionAmount | String | Yes | Amount in paisa |
| transactionType | String | Yes | Must be "OTC" |
| msisdn | String | Yes | Customer's mobile number for SMS |
| emailAddress | String | No | Customer's email address |
| tokenExpiry | String | Yes | Token expiry datetime |
| signature | String | Yes | HMAC-SHA256 signature |

**Response**:
```json
{
  "orderId": "ORDER123456",
  "storeId": "STORE123",
  "paymentToken": "XYZ789ABC123",
  "transactionDateTime": "20260129203000",
  "paymentTokenExpiryDateTime": "20260130235959",
  "responseCode": "0000",
  "responseDesc": "Token Generated Successfully"
}
```

**Note**: Customer receives SMS with payment token and can pay at any Easypaisa shop.

---

### 3. Inquire Transaction Status

Checks the status of a transaction.

**Endpoint**: `POST /transaction-inquiry`

**Request Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Basic <base64_credentials>"
}
```

**Request Body**:
```json
{
  "orderId": "ORDER123456",
  "storeId": "STORE123",
  "signature": "a1b2c3d4e5f6..."
}
```

**Request Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| orderId | String | Yes | Order identifier to check |
| storeId | String | Yes | Merchant store ID |
| signature | String | Yes | HMAC-SHA256 signature |

**Response**:
```json
{
  "orderId": "ORDER123456",
  "storeId": "STORE123",
  "transactionAmount": "100000",
  "transactionDateTime": "20260129203000",
  "transactionStatus": "success",
  "responseCode": "0000",
  "responseDesc": "Transaction Successful"
}
```

## Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 0000 | Success | Transaction completed successfully |
| 0001 | Pending | Transaction is pending |
| 0002 | Failed | Transaction failed |
| 1001 | Invalid Request | Missing or invalid parameters |
| 1002 | Authentication Failed | Invalid credentials |
| 1003 | Signature Mismatch | Invalid signature |
| 1004 | Insufficient Balance | Customer has insufficient funds |
| 1005 | Token Expired | Payment token has expired |
| 1006 | Duplicate Order | Order ID already exists |
| 9999 | System Error | Internal server error |

## Error Handling

### Error Response Format

```json
{
  "responseCode": "1001",
  "responseDesc": "Invalid Request - Missing required parameter: orderId",
  "error": true
}
```

### Best Practices

1. **Always check responseCode**: Don't rely solely on HTTP status
2. **Log all responses**: Store complete API responses for debugging
3. **Implement retry logic**: For network errors and timeouts
4. **Handle timeouts**: Set appropriate timeout values (30-60 seconds)
5. **Validate before sending**: Check all parameters before API call

### Example Error Handling

```javascript
try {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
        },
        body: JSON.stringify(payload),
        timeout: 30000 // 30 seconds
    });

    const data = await response.json();

    if (data.responseCode !== '0000') {
        throw new Error(`Payment failed: ${data.responseDesc}`);
    }

    // Success handling
    return data;

} catch (error) {
    console.error('Easypaisa API Error:', error);
    
    // Log to database
    await logTransaction({
        status: 'failed',
        error: error.message,
        timestamp: new Date()
    });

    throw error;
}
```

## Code Examples

### Complete MA Payment Flow

```javascript
import crypto from 'crypto';

// Configuration
const config = {
    storeId: 'STORE123',
    username: 'HandsnFoot',
    password: 'b0c0c9e7dea2c69232cb608230ba24f6',
    hashKey: 'PBYUY9IX5TZ840KB',
    apiUrl: 'https://easypaisa.com.pk/easypay/ma-transaction'
};

// Generate signature
function generateSignature(data, hashKey) {
    const hmac = crypto.createHmac('sha256', hashKey);
    hmac.update(data);
    return hmac.digest('hex');
}

// Generate Basic Auth
function generateBasicAuth(username, password) {
    const credentials = `${username}:${password}`;
    return 'Basic ' + Buffer.from(credentials).toString('base64');
}

// Format datetime (PKT timezone)
function formatDateTime(date) {
    const pktDate = new Date(date.getTime() + (5 * 60 * 60 * 1000));
    const year = pktDate.getUTCFullYear();
    const month = String(pktDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(pktDate.getUTCDate()).padStart(2, '0');
    const hours = String(pktDate.getUTCHours()).padStart(2, '0');
    const minutes = String(pktDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(pktDate.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Initiate MA Payment
async function initiateMAPayment(orderId, amount, mobileNumber) {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    
    const transactionAmount = String(Math.round(amount * 100));
    const tokenExpiry = formatDateTime(expiryDate);
    
    // Generate signature
    const signatureString = `${transactionAmount}#${config.storeId}#${orderId}#${config.hashKey}`;
    const signature = generateSignature(signatureString, config.hashKey);
    
    // Prepare payload
    const payload = {
        orderId,
        storeId: config.storeId,
        transactionAmount,
        transactionType: 'MA',
        mobileAccountNo: mobileNumber,
        emailAddress: '',
        tokenExpiry,
        signature
    };
    
    // Make API call
    const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': generateBasicAuth(config.username, config.password)
        },
        body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (data.responseCode === '0000') {
        console.log('Payment successful!');
        return data;
    } else {
        throw new Error(`Payment failed: ${data.responseDesc}`);
    }
}

// Usage
initiateMAPayment('ORDER123', 1000.00, '03001234567')
    .then(result => console.log('Success:', result))
    .catch(error => console.error('Error:', error));
```

### Status Inquiry Example

```javascript
async function checkTransactionStatus(orderId) {
    const signatureString = `${orderId}#${config.storeId}#${config.hashKey}`;
    const signature = generateSignature(signatureString, config.hashKey);
    
    const payload = {
        orderId,
        storeId: config.storeId,
        signature
    };
    
    const response = await fetch('https://easypaisa.com.pk/easypay/transaction-inquiry', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': generateBasicAuth(config.username, config.password)
        },
        body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    return data;
}
```

## Testing

### Test Credentials (Sandbox)

```
Store ID: TEST_STORE_123
Username: test_merchant
Password: test_password_123
Hash Key: TEST_HASH_KEY_ABC
```

### Test Mobile Numbers

```
Success: 03001234567
Insufficient Balance: 03009876543
Invalid Account: 03001111111
```

### Test Scenarios

1. **Successful MA Payment**:
   - Use test mobile number: 03001234567
   - Amount: PKR 100-10000
   - Expected: responseCode = "0000"

2. **Insufficient Balance**:
   - Use test mobile number: 03009876543
   - Expected: responseCode = "1004"

3. **Expired Token**:
   - Set tokenExpiry to past datetime
   - Expected: responseCode = "1005"

## Support

For technical support:
- Email: api.support@easypaisa.com.pk
- Phone: +92-21-111-003-947
- Developer Portal: https://easypaisa.com.pk/developer
