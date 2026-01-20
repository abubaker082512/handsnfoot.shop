# JazzCash API Reference - Complete Parameters Guide

## Table of Contents
1. [Card Payment (Page Redirection v1.1)](#card-payment-page-redirection-v11)
2. [Mobile Wallet Payment](#mobile-wallet-payment)
3. [Status Inquiry API](#status-inquiry-api)
4. [Return URL Callback](#return-url-callback)
5. [Response Codes](#response-codes)
6. [Hash Calculation](#hash-calculation)

---

## Card Payment (Page Redirection v1.1)

### Endpoint
```
POST https://onlinepayments.jazzcash.com.pk/payment-orchestrator/CustomerPortal/transactionmanagement/merchantform
```

### Request Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `pp_Version` | String | Yes | API version | `1.1` |
| `pp_TxnType` | String | Yes | Transaction type | `MPAY` (for card payments) |
| `pp_Language` | String | Yes | Language code | `EN` |
| `pp_MerchantID` | String | Yes | Your merchant ID | `MC989920` |
| `pp_Password` | String | Yes | Your password | `3r9k9de0b1` |
| `pp_TxnRefNo` | String | Yes | Unique transaction reference | `T20260120083236` |
| `pp_Amount` | String | Yes | Amount in paisa (multiply by 100) | `100` (for PKR 1.00) |
| `pp_TxnCurrency` | String | Yes | Currency code | `PKR` |
| `pp_TxnDateTime` | String | Yes | Transaction date/time | `20260120083236` (YYYYMMDDHHmmss) |
| `pp_BillReference` | String | Yes | Bill/Order reference | Order ID or bill number |
| `pp_Description` | String | Yes | Transaction description | `Order #12345` |
| `pp_TxnExpiryDateTime` | String | Yes | Expiry date/time (+1 day) | `20260121083236` |
| `pp_ReturnURL` | String | Yes | Your return URL | `https://yoursite.com/api/jazzcash-return` |
| `pp_SecureHash` | String | Yes | HMAC-SHA256 hash | Generated hash |
| `pp_SubMerchantID` | String | No | Sub-merchant ID | Empty string `""` |
| `pp_BankID` | String | No | Bank ID | Empty string `""` |
| `pp_ProductID` | String | No | Product ID | Empty string `""` |
| `ppmpf_1` | String | No | Merchant provided field 1 | Empty string `""` |
| `ppmpf_2` | String | No | Merchant provided field 2 | Empty string `""` |
| `ppmpf_3` | String | No | Merchant provided field 3 | Empty string `""` |
| `ppmpf_4` | String | No | Merchant provided field 4 | Empty string `""` |
| `ppmpf_5` | String | No | Merchant provided field 5 | Empty string `""` |

### Example Request
```json
{
  "pp_Version": "1.1",
  "pp_TxnType": "MPAY",
  "pp_Language": "EN",
  "pp_MerchantID": "MC989920",
  "pp_Password": "3r9k9de0b1",
  "pp_TxnRefNo": "T20260120083236",
  "pp_Amount": "277200",
  "pp_TxnCurrency": "PKR",
  "pp_TxnDateTime": "20260120083236",
  "pp_BillReference": "8ad0d43a-2740-4767-8df7-8d0500353fdb",
  "pp_Description": "HandsnFoot Order 8ad0d43a",
  "pp_TxnExpiryDateTime": "20260121083236",
  "pp_ReturnURL": "https://handsnfoot.shop/api/jazzcash-return",
  "pp_SecureHash": "71f1a95046a07b8332e73ebaf144f92abb23b3eb6387e42301e015c7f820895d",
  "pp_SubMerchantID": "",
  "pp_BankID": "",
  "pp_ProductID": "",
  "ppmpf_1": "",
  "ppmpf_2": "",
  "ppmpf_3": "",
  "ppmpf_4": "",
  "ppmpf_5": ""
}
```

---

## Mobile Wallet Payment

### Endpoint
```
POST https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v2/rest/payments/m-wallet
```

### Request Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `pp_Version` | String | Yes | API version | `2.0` |
| `pp_TxnType` | String | Yes | Transaction type | `MWALLET` |
| `pp_Language` | String | Yes | Language code | `EN` |
| `pp_MerchantID` | String | Yes | Your merchant ID | `MC989920` |
| `pp_Password` | String | Yes | Your password | `3r9k9de0b1` |
| `pp_TxnRefNo` | String | Yes | Unique transaction reference | `T20260120083236` |
| `pp_Amount` | String | Yes | Amount in paisa | `100` |
| `pp_TxnCurrency` | String | Yes | Currency code | `PKR` |
| `pp_TxnDateTime` | String | Yes | Transaction date/time | `20260120083236` |
| `pp_BillReference` | String | Yes | Bill/Order reference | Order ID |
| `pp_Description` | String | Yes | Transaction description | `Order #12345` |
| `pp_TxnExpiryDateTime` | String | Yes | Expiry date/time | `20260121083236` |
| `pp_MobileNumber` | String | Yes | Customer mobile (03XXXXXXXXX) | `03001234567` |
| `pp_CNIC` | String | Yes | Last 6 digits of CNIC | `123456` |
| `pp_SecureHash` | String | Yes | HMAC-SHA256 hash | Generated hash |

### Response Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `pp_ResponseCode` | String | Response code (`000` = success) |
| `pp_ResponseMessage` | String | Response message |
| `pp_TxnRefNo` | String | Transaction reference |
| `pp_Amount` | String | Transaction amount |
| `pp_SecureHash` | String | Response hash |

---

## Status Inquiry API

### Endpoint
```
POST https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v2/rest/payments/status/inquiry
```

### Request Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `pp_TxnRefNo` | String | Yes | Transaction reference to check | `T20260120083236` |
| `pp_MerchantID` | String | Yes | Your merchant ID | `MC989920` |
| `pp_Password` | String | Yes | Your password | `3r9k9de0b1` |
| `pp_SecureHash` | String | Yes | HMAC-SHA256 hash | Generated hash |

### Example Request
```json
{
  "pp_TxnRefNo": "T20260120083236",
  "pp_MerchantID": "MC989920",
  "pp_Password": "3r9k9de0b1",
  "pp_SecureHash": "18494EE9B220CA4ADBE3ED5B597CCBF26E8C6F8BA205A9199A2EC8B7A2C0673"
}
```

### Response Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `pp_ResponseCode` | String | API operation status (`000` = success) |
| `pp_ResponseMessage` | String | API operation message |
| `pp_PaymentResponseCode` | String | Payment status code (`121` = completed) |
| `pp_PaymentResponseMessage` | String | Payment status message |
| `pp_Status` | String | Transaction status (`Completed`, `Pending`, `Failed`) |
| `pp_MerchantID` | String | Merchant ID |
| `pp_RetrievalReferenceNo` | String | Retrieval reference number |
| `pp_TxnRefNo` | String | Transaction reference |
| `pp_TxnType` | String | Transaction type |
| `pp_Amount` | String | Transaction amount |
| `pp_TxnDateTime` | String | Transaction date/time |
| `pp_BillReference` | String | Bill reference |
| `pp_SettlementDate` | String | Settlement date |
| `pp_AuthCode` | String | Authorization code |
| `pp_SecureHash` | String | Response hash |

### Example Response
```json
{
  "pp_ResponseCode": "000",
  "pp_ResponseMessage": "Thank you for using JazzCash. Your operation was processed successfully.",
  "pp_PaymentResponseCode": "121",
  "pp_PaymentResponseMessage": "Thank you for using JazzCash. Your transaction was processed successfully.",
  "pp_Status": "Completed",
  "pp_MerchantID": "MC989920",
  "pp_RetrievalReferenceNo": "202601200832362807581909",
  "pp_TxnRefNo": "T20260120083236",
  "pp_TxnType": "MPAY",
  "pp_Amount": "277200",
  "pp_TxnDateTime": "20260120083236",
  "pp_BillReference": "8ad0d43a-2740-4767-8df7-8d0500353fdb",
  "pp_SettlementDate": "",
  "pp_AuthCode": "095469672235",
  "pp_SecureHash": "F1CE61CD416F75860009839091607127279C179531B6DE0F1806A42AFD62096"
}
```

---

## Return URL Callback

After payment completion, JazzCash sends a POST request to your `pp_ReturnURL` with all the original parameters plus response parameters.

### Response Parameters (sent to your return URL)

| Parameter | Type | Description |
|-----------|------|-------------|
| `pp_ResponseCode` | String | Response code (`000`, `121`, `200` = success) |
| `pp_ResponseMessage` | String | Response message |
| `pp_TxnRefNo` | String | Transaction reference |
| `pp_Amount` | String | Transaction amount (in paisa) |
| `pp_BillReference` | String | Your order/bill reference |
| `pp_SecureHash` | String | Response hash (verify this!) |
| All original parameters | - | All parameters you sent are returned |

---

## Response Codes

### API Response Codes
| Code | Description |
|------|-------------|
| `000` | Success - API operation completed successfully |
| `001` | Failed - General failure |
| `124` | Invalid merchant credentials |
| `157` | Invalid secure hash |

### Payment Response Codes
| Code | Description |
|------|-------------|
| `000` | Success - Payment completed |
| `121` | Success - Transaction approved |
| `200` | Success - Transaction completed |
| `124` | Declined - Invalid credentials |
| `157` | Declined - Invalid hash |
| `201` | Declined - Insufficient funds |
| `202` | Declined - Transaction limit exceeded |

---

## Hash Calculation

### Algorithm
1. Sort all non-empty parameters **alphabetically by parameter name (key)**
2. Concatenate **values only** with `&` separator
3. Prepend integrity salt
4. Generate HMAC-SHA256 hash using integrity salt as secret key
5. Return **lowercase** hash

### Example Hash Calculation

**Parameters:**
```javascript
{
  pp_Amount: "100",
  pp_BillReference: "billRef001",
  pp_Description: "Test transaction",
  pp_Language: "EN",
  pp_MerchantID: "MC989920",
  pp_Password: "3r9k9de0b1",
  // ... other parameters
}
```

**Sorted Keys (alphabetically):**
```
pp_Amount, pp_BillReference, pp_Description, pp_Language, pp_MerchantID, pp_Password, ...
```

**Hash String:**
```
z2t4c6q7y2&100&billRef001&Test transaction&EN&MC989920&3r9k9de0b1&...
```

**Generated Hash:**
```
c6650543a13367878a0f4846b74cfa664d5e55b6ed0e46c71e76d274a737a339
```

### Code Example
```javascript
function generateHash(params, integritySalt) {
  // Sort by parameter names alphabetically
  const sortedKeys = Object.keys(params)
    .filter(key => params[key] !== null && params[key] !== undefined && params[key] !== '')
    .sort();

  // Concatenate values only
  const values = sortedKeys.map(key => String(params[key]));
  const concatenatedValues = values.join('&');

  // Prepend integrity salt
  const hashString = integritySalt + '&' + concatenatedValues;

  // Generate HMAC-SHA256 hash
  const hash = crypto.createHmac('sha256', integritySalt)
    .update(hashString)
    .digest('hex');

  return hash; // lowercase
}
```

---

## Important Notes

1. **Amount Format**: Always multiply amount by 100 (PKR 1.00 = 100)
2. **Date Format**: Use `YYYYMMDDHHmmss` format (e.g., `20260120083236`)
3. **Transaction Reference**: Must be unique for each transaction
4. **Hash Verification**: Always verify the response hash for security
5. **Return URL**: Must be HTTPS in production
6. **Trailing Whitespace**: Remove all trailing spaces/newlines from environment variables
7. **Status Inquiry**: Wait at least 10 minutes after transaction before calling

---

## Environment Variables

```env
# Required
JAZZCASH_MERCHANT_ID=MC989920
JAZZCASH_PASSWORD=3r9k9de0b1
JAZZCASH_INTEGRITY_SALT=z2t4c6q7y2
JAZZCASH_RETURN_URL=https://handsnfoot.shop/api/jazzcash-return

# Optional (have defaults)
JAZZCASH_CARD_PAYMENT_URL=https://onlinepayments.jazzcash.com.pk/payment-orchestrator/CustomerPortal/transactionmanagement/merchantform
JAZZCASH_STATUS_INQUIRY_URL=https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v2/rest/payments/status/inquiry
```

---

## API Endpoints in Your Application

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/jazzcash-card-payment` | POST | Initiate card payment |
| `/api/jazzcash-mwallet-payment` | POST | Initiate mobile wallet payment |
| `/api/jazzcash-return` | POST | Handle payment callback from JazzCash |
| `/api/jazzcash-status-inquiry` | POST | Check transaction status |

---

**Last Updated:** 2026-01-20
**API Version:** v2.0
