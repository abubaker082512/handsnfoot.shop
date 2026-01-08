IPN Implementation Guide (REST)
VERSION: 2026
TABLE OF CONTENTS
1 IPN Implementation Guide (REST) ......................................................................................................................................................................... 2
1.1 Expected IPN Response from Merchant Side: .............................................................................................................................................. 2
1.2 Example of Endpoint and Request Response: .............................................................................................................................................. 2
1 IPN IMPLEMENTATION GUIDE (REST)
JazzCash provides merchants with a way to be notified when their payments are successful. After a transaction is completed, the
Payment Gateway (PG) updates the merchant with the transaction status.
To receive Instant Payment Notifications (IPNs) , merchants must expose a REST-based API URL. JazzCash’s service will send
notifications to the merchant's REST IPN listener.
If a failed response is received from the merchant or no response is received within 60 seconds , JazzCash will retry 2 more times ,
with a short delay between each attempt.
1.1 EXPECTED IPN RESPONSE FROM MERCHANT SIDE:
{
"pp_ResponseCode": "000",
"pp_ResponseMessage": "IPN received successfully",
"pp_SecureHash": "{{Your Generated Secure Hash}}"
}
Response Code Description
121 For Successful Transactions
199, 999, others For Failed Transactions
1.2 EXAMPLE OF ENDPOINT AND REQUEST RESPONSE:
Sample API Endpoint:

https://jazzipndata.free.beeceptor.com/jazzipndata

Sample IPN Request and Response:

Request Response
{
"pp_Version": "2.0", // API Version
"pp_TxnType": "MWALLET", // Txn Type
"pp_BankID": "",
"pp_ProductID": null,
"pp_Password": "0123456789",
"pp_TxnRefNo": "T20240418145702",
"pp_TxnDateTime": "20240418145702",
"pp_ResponseCode": "121",
"pp_ResponseMessage": "Transaction has been marked confirmed by Merchant.",
"pp_AuthCode": "060935465981",
"pp_SettlementExpiry": null,
"pp_RetreivalReferenceNo": "240418718258",
"pp_SecureHash":
"2B47BCF7825FA27FC8B522292BC8D226213FCCDA685FC68A67EC20B10836E5B7"
}
{
"pp_ResponseCode": "000",
"pp_ResponseMessage": "IPN received successfully",
"pp_SecureHash": ""
}
END