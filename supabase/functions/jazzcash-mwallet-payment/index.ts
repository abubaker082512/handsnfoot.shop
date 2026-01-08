import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
    generateHash,
    jsonResponse,
    errorResponse,
    formatAmount,
    generateTxnRef,
    formatDateTime,
    getExpiryDateTime,
    logTransaction,
    updateTransaction,
    updateOrderPayment,
    corsHeaders
} from '../_shared/jazzcash-utils.ts'

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders() })
    }

    try {
        // Get environment variables
        const MERCHANT_ID = Deno.env.get('JAZZCASH_MERCHANT_ID')
        const PASSWORD = Deno.env.get('JAZZCASH_PASSWORD')
        const INTEGRITY_SALT = Deno.env.get('JAZZCASH_INTEGRITY_SALT')
        const MWALLET_API_URL = Deno.env.get('JAZZCASH_MWALLET_API_URL') ||
            'https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v2/rest/payments/m-wallet'

        if (!MERCHANT_ID || !PASSWORD || !INTEGRITY_SALT) {
            return errorResponse('JazzCash credentials not configured', 500)
        }

        // Parse request body
        const { orderId, amount, mobileNumber, cnic, description, billReference } = await req.json()

        if (!orderId || !amount || !mobileNumber || !cnic) {
            return errorResponse('Missing required fields: orderId, amount, mobileNumber, cnic')
        }

        // Validate CNIC (last 6 digits)
        if (!/^\d{6}$/.test(cnic)) {
            return errorResponse('CNIC must be exactly 6 digits')
        }

        // Validate mobile number
        if (!/^03\d{9}$/.test(mobileNumber.replace(/[\s-]/g, ''))) {
            return errorResponse('Invalid Pakistani mobile number format')
        }

        // Create Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Generate transaction reference
        const txnRefNo = generateTxnRef()
        const txnDateTime = formatDateTime()
        const expiryDateTime = getExpiryDateTime()
        const formattedAmount = formatAmount(amount)
        const finalBillRef = billReference || txnRefNo

        // Build parameters for JazzCash MWallet API
        const params = {
            pp_Amount: formattedAmount,
            pp_BankID: '',
            pp_BillReference: finalBillRef,
            pp_CNIC: cnic,
            pp_Description: description || `HandsnFoot Order ${orderId.substring(0, 8)}`,
            pp_Language: 'EN',
            pp_MerchantID: MERCHANT_ID,
            pp_MobileNumber: mobileNumber.replace(/[\s-]/g, ''),
            pp_Password: PASSWORD,
            pp_ProductID: '',
            pp_SubMerchantID: '',
            pp_TxnCurrency: 'PKR',
            pp_TxnDateTime: txnDateTime,
            pp_TxnExpiryDateTime: expiryDateTime,
            pp_TxnRefNo: txnRefNo,
            ppmpf_1: '',
            ppmpf_2: '',
            ppmpf_3: '',
            ppmpf_4: '',
            ppmpf_5: ''
        }

        // Generate secure hash
        const secureHash = await generateHash(params, INTEGRITY_SALT)
        params.pp_SecureHash = secureHash

        // Log transaction to database
        await logTransaction(supabaseClient, {
            order_id: orderId,
            payment_method: 'mwallet',
            txn_ref_no: txnRefNo,
            bill_reference: finalBillRef,
            amount: amount,
            currency: 'PKR',
            mobile_number: mobileNumber,
            cnic_last_6: cnic,
            request_payload: params,
            request_hash: secureHash,
            status: 'initiated'
        })

        // Call JazzCash MWallet API
        const response = await fetch(MWALLET_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        })

        const responseData = await response.json()
        console.log('JazzCash MWallet API response:', responseData)

        // Extract response fields
        const {
            pp_ResponseCode,
            pp_ResponseMessage,
            pp_SecureHash: responseHash,
            pp_RetreivalReferenceNo,
            pp_AuthCode
        } = responseData

        // Determine payment status
        const isSuccess = pp_ResponseCode === '000' || pp_ResponseCode === '121'
        const status = isSuccess ? 'completed' : 'failed'

        // Update transaction in database
        await updateTransaction(supabaseClient, txnRefNo, {
            status,
            response_code: pp_ResponseCode,
            response_message: pp_ResponseMessage,
            response_payload: responseData,
            response_hash: responseHash,
            response_timestamp: new Date().toISOString(),
            retrieval_ref_no: pp_RetreivalReferenceNo,
            auth_code: pp_AuthCode
        })

        // Update order if payment successful
        if (isSuccess) {
            await updateOrderPayment(supabaseClient, orderId, {
                payment_status: 'completed',
                payment_method: 'mwallet',
                jazzcash_txn_ref_no: txnRefNo,
                jazzcash_retrieval_ref_no: pp_RetreivalReferenceNo,
                jazzcash_auth_code: pp_AuthCode,
                jazzcash_response_code: pp_ResponseCode,
                jazzcash_response_message: pp_ResponseMessage,
                jazzcash_full_response: responseData,
                payment_completed_at: new Date().toISOString(),
                amount_paid: amount
            })
        }

        return jsonResponse({
            success: isSuccess,
            txnRefNo,
            responseCode: pp_ResponseCode,
            responseMessage: pp_ResponseMessage,
            orderId
        })

    } catch (error) {
        console.error('Error in jazzcash-mwallet-payment:', error)
        return errorResponse(error.message || 'Internal server error', 500)
    }
})
