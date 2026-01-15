Status Inquiry Guide
VERSION: 2026
TABLE OF CONTENTS
1 Introduction
2 API Endpoints:
2.1 For Version 1.1
2.2 API VERSION 2.0:
1 Introduction
Welcome!

Please refer to the implementation guide for the Status Inquiry API (REST). This API is primarily utilized to obtain the final status of pending or
missing transactions. It is recommended to call this API a minimum of 10 minutes after transaction initiated.

Note: Only to confirm the pending transaction status, the pp_PaymentResponseCode parameter will be considered.

In the below example the '000' response code indicates that the API (status Inquiry API) operation was successful. The payment response code
'121' indicates the transaction status (completed transaction).

pp_ResponseCode: '000', // This indicates that the 'Status Inquiry' API operation was performed successfully.
pp_ResponseMessage: 'Thank you for Using JazzCash, your operation successfully completed.'

pp_PaymentResponseCode: '121' // It means that the transaction is completed and the amount has been debited.
pp_PaymentResponseMessage: 'Sorry! Your transaction was not successful. Please try again later.'
pp_Status: 'Completed'

2 API Endpoints:
2.1 For Version 1.1
Environment Endpoints
Sandbox https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v1/rest/payments/status/inquiry
Production https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v1/rest/payments/status/inquiry
Sample Request Sample Response
{
"pp_TxnRefNo": "T20251124131402",
"pp_MerchantID": "{{Your Merchant ID}}",
"pp_Password": "{{Your Password}}",
"pp_SecureHash":
"18494EE9B220CA4ADBE3ED5B597CCBF26E8C6F8BA205A9199A2EC8B
7A2C0673"
}
{
"pp_ResponseCode": "000",
"pp_ResponseMessage": "Thank you for using JazzCash. Your operation
was processed successfully.",
"pp_PaymentResponseCode": "121", // 121 code for completed
transactions
"pp_PaymentResponseMessage": "Thank you for using JazzCash. Your
transaction was processed successfully.",
"pp_Status": "Completed",
"pp_RetrievalReferenceNo": "202511241314312807581909",
"pp_SettlementDate": "",
"pp_SettlementExpiry": "",
"pp_AuthCode": "095469672235",
"pp_BankID": "",
"pp_ProductID": "",
"pp_SecureHash":
"EC906098D8C778B0043F33102698929F39DC32D7D560D6204377E0B
90CE17E4"
}
2.2 API VERSION 2.0:
Environment Endpoints
Sandbox https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v2/rest/payments/status/inquiry
Production https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v2/rest/payments/status/inquiry
Sample Request: Sample Response:
{
"pp_TxnRefNo": "T20251124131402",
"pp_MerchantID": "{{Your Merchant ID}}",
"pp_Password": "{{Your Password}}",
"pp_SecureHash":
"18494EE9B220CA4ADBE3ED5B597CCBF26E8C6F8BA205A9199A2EC
B87A2C0673"
}
{
"pp_ResponseCode": "000",
"pp_ResponseMessage": "Thank you for using JazzCash. Your
operation was processed successfully.",
"pp_PaymentResponseCode": "121", // 121 code for completed
transactions
"pp_PaymentResponseMessage": "Thank you for using JazzCash.
Your transaction was processed successfully.",
"pp_Status": "Completed",
"pp_MerchantID": "{{Your Merchant ID}}",
"pp_RetrievalReferenceNo": "202511241314312807581909",
"pp_TxnRefNo": "T20251124131402",
"pp_TxnType": "MWALLET",
"pp_Amount": "100",
"pp_TxnDateTime": "20251124131402",
"pp_BillReference": "B20251124131402",
"pp_SettlementDate": "",
"pp_AuthCode": "095469672235",
"pp_SecureHash":
"F1CE61CD416F75860009839091607127279C179531B6DE0F1806A
42AFD62096"
}
END