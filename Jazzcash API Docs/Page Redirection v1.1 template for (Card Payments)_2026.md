Card Payment – Page
Redirection/Checkout (v1.1)
VERSION: 2026
TABLE OF CONTENTS
1 Introduction to Card Page Redirection V.1.1
2 Create a Sandbox Account
2.1 Signup
2.2 Get Your Credentials
2.3 Testing
1 INTRODUCTION TO CARD PAGE REDIRECTION V.1.
Welcome!

Please read the complete document to understand the process of integration.

This guide explains how to integrate JazzCash payments into your website or mobile application using Card Page Redirection v1.1.

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
Please find below details guide to implement Card Page Redirection V.1.1 feature with secure hash logic.

For Mobile Application same redirection code will be used in web-view.

2.3 Testing
After the configurations, perform few test transactions take the screenshots of the transactions and share the testing results.

Mobile Account
Voucher Payment
Credit/Debit
The below screenshots are needed in testing against each payment method:

Merchant Checkout page
Our landing page
Payment method selection
Payment
Payment Response against the attempted payment on the Merchant Callback URL
Order status from Merchant Admin Panel
Paste all the screenshot as per the attached word file and share the testing results by simply attaching and replying in the same email thread.

In case of any query, feel free to contact us.

In case of any query, feel free to contact us.

Sample PHP CODE for JazzCash Implementation Page Redirection (v1.1):

date_default_timezone_set("Asia/karachi");
// --- Configuration ---

$MerchantID = "YOUR_MERCHANT_ID";

$Password = "YOUR_PASSWORD";

$IntegritySalt = "YOUR_INTEGRITY_SALT";

$ReturnURL = "YOUR_RETURN_URL"; // Return URL

$PostURL = "https://onlinepayments.jazzcash.com.pk/payment-
orchestrator/CustomerPortal/transactionmanagement/merchantform";

// --- Unique Transaction Reference No with Milliseconds ---

$milliTime = sprintf("%03d", (microtime(true) * 1000) % 1000);

$uniqueRefNo = "TRN". date('YmdHis'). $milliTime;

// --- Parameters Array ---

$Params = [

"pp_Version" => '1.1',

"pp_TxnType" => "MPAY", // MPAY for Card

"pp_Language" => "EN",

"pp_MerchantID" => $MerchantID,

"pp_Password" => $Password,

"pp_TxnRefNo" => $uniqueRefNo,

"pp_Amount" => 1 * 100, // Rs. 1

"pp_TxnCurrency" => "PKR",

"pp_TxnDateTime" => date('YmdHis'),

"pp_BillReference" => "billref001",

"pp_Description" => "Test transaction description",

"pp_TxnExpiryDateTime" => date('YmdHis', strtotime('+1 Days')),

"pp_ReturnURL" => $ReturnURL,

"pp_SubMerchantID" => "",

"pp_BankID" => "",

"pp_ProductID" => "",

"ppmpf_1" => "", // leave it empty

"ppmpf_2" => "", // leave it empty

"ppmpf_3" => "", // optional

"ppmpf_4" => "", // optional

"ppmpf_5" => "", // optional

];

// --- Automatic Sorting (A-Z) ---

ksort($Params);

// --- Secure Hash Generation ---

$SortedString = $IntegritySalt;

foreach ($Params as $key => $value) {

if ($value != null && $value != "") {

$SortedString .= "&". $value;

}

}

$Securehash = hash_hmac('sha256', $SortedString, $IntegritySalt);

?>



Card Payment - Page Redirection/Checkout v1.1


Order Summary

Transaction Reference:

Amount: PKR .00

Description:

Bill Reference:

TxnDateTime:

$value): ?>


Proceed to Checkout
<p style="font-size: 12px; color: #999; margin-top: 15px;">You will be redirected to JazzCash
secure payment page.</p>
</div>
</body>
</html>
Important Note :

pp_TxnRefNo : It is a unique identifier and must be a unique value for every transaction.
pp_ Amount : It is mandatory parameter. The last two digits will be treated as decimal, so multiply the product amount by 100 (e.g.,
2x100=200).
pp_TxnDateTime : Set transaction current date/time format to YYYYMMDDHHMMSS in Pakistan Time Zone (PKT)
pp_TxnExpiryDateTime : Set transaction date/time format to YYYYMMDDHHMMSS in Pakistan Time Zone (PKT) and add 1 day to the
current date.
pp_ReturnURL : This field is mandatory and merchant must share this URL before using API as it will be a part of merchant profile. URL
should always be the same in every request once shared. It is a part of merchant authentication; difference of URL will fail the validation.
Keep all mandatory parameters in every request.
All empty fields must remain as "".
Generate pp_SecureHash as per JazzCash guidelines before sending request.
END