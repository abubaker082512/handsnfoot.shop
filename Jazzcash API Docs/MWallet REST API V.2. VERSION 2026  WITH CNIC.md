MWallet REST API V.2.
VERSION: 2026 | WITH CNIC
TABLE OF CONTENTS
1 Introduction
2 Create a Sandbox Account
2.1 Signup
2.2 Get Your Credentials
3 JazzCash MWALLET REST API V.2.0 - Implementation Notes
3.1 Request Payload Rules..................................................................................................................................................................................
3.2 Mandatory API Integrations
3.3 Currency and Amount Handling
3.4 Transaction Reference Requirements
3.5 Date and Time Parameters
3.6 Secure Hash Generation
3.7 General Validation Checklist
4 API Endpoints:
1 Introduction
Welcome!
Please read the complete document to understand the process of integration.
This guide explains how to integrate JazzCash payments into your website or mobile application using MWallet REST API v2.0 (with
CNIC) feature.
To begin the integration process:

2 Create a Sandbox Account
2.1 Signup
Sign up at the link below to create your JazzCash sandbox account:
https://onlinepayments.jazzcash.com.pk/sandbox-frontend/
Once your sandbox account is created, please share your Merchant ID with us. Our team will enable the payment option for you.

2.2 Get Your Credentials
After logging into your Sandbox account:

Go to Integration > Credentials from the left menu.
Enter your Return URL/Callback URL in the respective field.
(If applicable) Enter your IPN URL in the IPN field.
Please find below details guide to implement MWallet REST API 2.0 feature with secure hash logic.
3 JazzCash MWALLET REST API V.2.0 - Implementation Notes
3.1 Request Payload Rules..................................................................................................................................................................................
All parameter values must be passed as strings and enclosed in double quotes " ".
Parameters with no value must remain as empty strings "". Do not replace them with null and do not remove them from the
request.
Parameter names must not be changed and must exactly match those defined in the official documentation.
No parameters may be added or removed from the request payload.
Mandatory constant parameters (such as pp_Language, pp_TxnCurrency, pp_TxnType, and pp_Version) must not be
modified.
3.2 Mandatory API Integrations
Status Inquiry API - Mandatory
IPN (Instant Payment Notification) - Mandatory
Refund API - Optional
3.3 Currency and Amount Handling
The gateway processes transactions only in PKR. No currency conversion is performed by JazzCash.
The pp_Amount value must be multiplied by 100 before sending the request.
o Example: 100.00 must be sent as "10000".
The gateway treats the last two digits as decimal values.
While processing the response, the amount should be divided by 100 to obtain the actual value.
3.4 Transaction Reference Requirements
pp_TxnRefNo
o Must be unique for every transaction.
o Recommended format: first three letters of the merchant’s domain name followed by the transaction date/time.
o Example: Goo20230208115409 (format: YmdHis).
pp_BillReference
o Mandatory field.
o May be duplicated across transactions.
o Must contain only alphanumeric characters (A–Z, a–z, 0 – 9).
o Spaces and special characters are not allowed.
3.5 Date and Time Parameters
All date and time values must be in Pakistan Standard Time (PKT).

pp_TxnDateTime
o Current transaction date and time
o Format: YYYYMMDDHHMMSS
pp_TxnExpiryDateTime
o Transaction expiry date and time
o Must be set to one day after the transaction date
o Format: YYYYMMDDHHMMSS
3.6 Secure Hash Generation
A unique pp_SecureHash must be generated for every transaction.
Secure hash generation is required for both:
o Request submission
o Response verification
The secure hash must be generated strictly according to JazzCash’s official guidelines.
3.7 General Validation Checklist
Ensure all mandatory parameters are included in every request.
Confirm that all empty parameters remain as "".
Verify the following before sending the request:
o pp_Amount is multiplied by 100
o pp_TxnRefNo is unique
o pp_SecureHash is freshly generated
4 API Endpoints:
Environment Endpoints
Sandbox https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v2/rest/payments/m-wallet^
Production https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v2/rest/payments/m-wallet^
Sample Request Sample Response
{
"pp_Amount": "100", //Mandatory Parameter
"pp_BankID": "", //Leave it empty
"pp_BillReference": "billRef185", //Mandatory Parameter
"pp_CNIC": "{{Last 6-digits}}", //Mandatory Parameter
"pp_Description": "product description", //Mandatory Parameter
"pp_Language": "EN", //Mandatory Parameter
"pp_MerchantID": "{{MerchantID}}", //Mandatory Parameter
"pp_MobileNumber": "{{JazzcashMobileAccount}}", //Mandatory
Parameter
"pp_Password": "{{Password}}", //Mandatory Parameter
"pp_ProductID": "", //Leave it empty
"pp_SecureHash":
"CD4DA5575F6CC08F9A0B78D414B91657FF0AACFDBE8FF691F8A1F
0C6E0C0C4F", //Mandatory Parameter
"pp_SubMerchantID": "", //Leave it empty
"pp_TxnCurrency": "PKR", //Mandatory Parameter
"pp_TxnDateTime": "20250908151702", //Mandatory Parameter
"pp_TxnExpiryDateTime": "20250910151702", //Mandatory
Parameter
"pp_TxnRefNo": "T20250908151702", //Mandatory Parameter
"ppmpf_1": "", // Leave it empty
"ppmpf_2": "", //Leave it empty
{
"pp_Amount": "100",
"pp_AuthCode": "088911015335",
"pp_BankID": "",
"pp_BillReference": "billRef185",
"pp_CNIC": "{{Last 6-digits}}",
"pp_CustomerMsisdn": "",
"pp_Language": "EN",
"pp_MerchantID": "{{MerchantID}}",
"pp_Password": "{{Password}}",
"pp_ProductID": "",
"pp_ResponseCode": "000",
"pp_ResponseMessage": "Thank you for Using JazzCash, your
transaction was successful.",
"pp_RetreivalReferenceNo": "202509081757326660695254",
"pp_ReturnURL": "",
"pp_SecureHash":
"80609D35A17575E249E99D20AE83B9EA25BDAEAF3EB17FD19B
502503E2B7",
"pp_SettlementExpiry": "",
"pp_SubMerchantId": "",
"pp_TxnCurrency": "PKR",
"pp_TxnDateTime": "20250908151702",

"ppmpf_3": "", //Leave it empty
"ppmpf_4": "", //Leave it empty
"ppmpf_5": "" //Leave it empty
}
"pp_TxnRefNo": "T20250908151702",
"pp_TxnType": "",
"pp_Version": "",
"ppmpf_1": "",
"ppmpf_2": "",
"ppmpf_3": "",
"ppmpf_4": "",
"ppmpf_5": ""
}
END