import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
    generateHash,
    jsonResponse,
    errorResponse,
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
        const STATUS_INQUIRY_URL = Deno.env.get('JAZZCASH_STATUS_INQUIRY_URL') ||
            'https://onlinepayments.jazzcash.com.pk/payment-orchestrator/api/v2/rest/payments/status/inquiry'

        if (!MERCHANT_ID || !PASSWORD || !INTEGRITY_SALT) {
            return errorResponse('JazzCash credentials not configured', 500)
        }

        // Parse request body
        const { txnRefNo } = await req.json()

        if (!txnRefNo) {
            return errorResponse('Missing required field: txnRefNo')
        }

        // Build parameters for Status Inquiry API
        const params = {
            pp_TxnRefNo: txnRefNo,
            pp_MerchantID: MERCHANT_ID,
            pp_Password: PASSWORD
        }

        // Generate secure hash
        const secureHash = await generateHash(params, INTEGRITY_SALT)
        params.pp_SecureHash = secureHash

        console.log('Calling Status Inquiry API for:', txnRefNo)

        // Call JazzCash Status Inquiry API
        const response = await fetch(STATUS_INQUIRY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        })

        const responseData = await response.json()
        console.log('Status Inquiry API response:', responseData)

        // Extract response fields
        const {
            pp_ResponseCode,
            pp_ResponseMessage,
            pp_PaymentResponseCode,
            pp_PaymentResponseMessage,
            pp_Status,
            pp_RetrievalReferenceNo,
            pp_AuthCode,
            pp_Amount,
            pp_TxnDateTime,
            pp_BillReference
        } = responseData

        // Create Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Update transaction if status has changed
        if (pp_PaymentResponseCode === '121' && pp_Status === 'Completed') {
            // Get transaction from database
            const { data: transaction } = await supabaseClient
                .from('payment_transactions')
                .select('*')
                .eq('txn_ref_no', txnRefNo)
                .single()

            if (transaction && transaction.status !== 'completed') {
                // Update transaction status
                await supabaseClient
                    .from('payment_transactions')
                    .update({
                        status: 'completed',
                        response_code: pp_PaymentResponseCode,
                        response_message: pp_PaymentResponseMessage,
                        retrieval_ref_no: pp_RetrievalReferenceNo,
                        auth_code: pp_AuthCode,
                        response_timestamp: new Date().toISOString()
                    })
                    .eq('txn_ref_no', txnRefNo)

                // Update order
                if (transaction.order_id) {
                    await supabaseClient
                        .from('orders')
                        .update({
                            payment_status: 'completed',
                            jazzcash_txn_ref_no: txnRefNo,
                            jazzcash_retrieval_ref_no: pp_RetrievalReferenceNo,
                            jazzcash_auth_code: pp_AuthCode,
                            jazzcash_response_code: pp_PaymentResponseCode,
                            jazzcash_response_message: pp_PaymentResponseMessage,
                            jazzcash_full_response: responseData,
                            payment_completed_at: new Date().toISOString(),
                            amount_paid: transaction.amount
                        })
                        .eq('id', transaction.order_id)
                }
            }
        }

        return jsonResponse({
            success: pp_ResponseCode === '000',
            txnRefNo,
            responseCode: pp_ResponseCode,
            responseMessage: pp_ResponseMessage,
            paymentResponseCode: pp_PaymentResponseCode,
            paymentResponseMessage: pp_PaymentResponseMessage,
            status: pp_Status,
            retrievalReferenceNo: pp_RetrievalReferenceNo,
            authCode: pp_AuthCode,
            amount: pp_Amount,
            txnDateTime: pp_TxnDateTime,
            billReference: pp_BillReference
        })

    } catch (error) {
        console.error('Error in jazzcash-status-inquiry:', error)
        return errorResponse(error.message || 'Internal server error', 500)
    }
})
