HMAC-SHA256(Hash) Calculation
VERSION: 2026
TABLE OF CONTENTS
1 How is HMAC-SHA256 calculated? ........................................................................................................................................................................ 2
2 Examples of Hash Calculation ................................................................................................................................................................................ 2
2.1 Sorted Hash Array ......................................................................................................................................................................................... 2

1 HOW IS HMAC-SHA256 CALCULATED?
Please read the complete document to understand the process of Hash Calculation.

The SHA- 256 HMAC calculation includes all non-empty fields.
Sorting is performed based on the parameter names (keys) in ascending alphabetical (ASCII code) order, and then their values are
concatenated.
All parameter values are joined in alphabetical order using "&" between each value (except after the last one).
The Integrity Salt / Hash Key is prepended before the concatenated string.
The final string is hashed using HMAC-SHA256, with the Integrity Salt/Hash Key itself as the secret key.
2 EXAMPLES OF HASH CALCULATION
Consider the following payment parameters and their respective values and assuming the Integrity Salt/Hash Key/Hash as
“ 3vv9wu3a18 ”:

2.1 SORTED HASH ARRAY
{
pp_Amount: "25000"
pp_MerchantID: "MC25041"
pp_MerchantMPIN: "1234"
pp_Password: "sz1v4agvyf"
pp_TxnCurrency: "PKR"
pp_TxnRefNo: "T20220518150213"
}
In ascending alphabetical order and separating each value with '&', the transaction request
fields would be:
25000&MC25041&1234&sz1v4agvyf&PKR&T
After prepending the Integrity Salt/Hash Key to the message, the transaction request fields
would be:
3vv9wu3a18&25000&MC25041&1234&sz1v4agvyf&PKR&T
Now calculating the hash with the hashing scheme 'HMAC-SHA256' with the secret
key: 3vv9wu3a18.

END