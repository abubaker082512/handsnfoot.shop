import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
    generateHash,
    verifyHash,
    jsonResponse,
    errorResponse,
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
        const INTEGRITY_SALT = Deno.env.get('JAZZCASH_INTEGRITY_SALT')

        if (!INTEGRITY_SALT) {
            return errorResponse('JazzCash credentials not configured', 500)
        }

        // Parse form data from JazzCash
        const formData = await req.formData()
        const params = {}

        for (const [key, value] of formData.entries()) {
            params[key] = value
        }

        console.log('Received callback from JazzCash:', params)

        // Extract important fields
        const {
            pp_TxnRefNo,
            pp_ResponseCode,
            pp_ResponseMessage,
            pp_SecureHash,
            pp_Amount,
            pp_RetreivalReferenceNo,
            pp_AuthCode,
            pp_BillReference
        } = params

        if (!pp_TxnRefNo) {
            return errorResponse('Missing transaction reference')
        }

        // Create Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Verify hash
        const paramsWithoutHash = { ...params }
        delete paramsWithoutHash.pp_SecureHash

        const isHashValid = await verifyHash(paramsWithoutHash, pp_SecureHash, INTEGRITY_SALT)

        if (!isHashValid) {
            console.error('Invalid hash received from JazzCash')
            await updateTransaction(supabaseClient, pp_TxnRefNo, {
                status: 'failed',
                response_code: 'INVALID_HASH',
                response_message: 'Hash verification failed',
                response_payload: params,
                response_timestamp: new Date().toISOString()
            })
            return errorResponse('Invalid response signature', 400)
        }

        // Determine payment status
        const isSuccess = pp_ResponseCode === '000' || pp_ResponseCode === '121'
        const status = isSuccess ? 'completed' : 'failed'

        // Update transaction in database
        const transaction = await updateTransaction(supabaseClient, pp_TxnRefNo, {
            status,
            response_code: pp_ResponseCode,
            response_message: pp_ResponseMessage,
            response_payload: params,
            response_hash: pp_SecureHash,
            response_timestamp: new Date().toISOString(),
            retrieval_ref_no: pp_RetreivalReferenceNo,
            auth_code: pp_AuthCode
        })

        // Update order if payment successful
        if (isSuccess && transaction.order_id) {
            await updateOrderPayment(supabaseClient, transaction.order_id, {
                payment_status: 'completed',
                payment_method: 'card',
                jazzcash_txn_ref_no: pp_TxnRefNo,
                jazzcash_retrieval_ref_no: pp_RetreivalReferenceNo,
                jazzcash_auth_code: pp_AuthCode,
                jazzcash_response_code: pp_ResponseCode,
                jazzcash_response_message: pp_ResponseMessage,
                jazzcash_full_response: params,
                payment_completed_at: new Date().toISOString(),
                amount_paid: transaction.amount
            })
        }

        // Redirect to success/failure page
        const redirectUrl = isSuccess
            ? `/order-success?orderId=${transaction.order_id}&txnRef=${pp_TxnRefNo}`
            : `/payment-failed?error=${encodeURIComponent(pp_ResponseMessage)}&txnRef=${pp_TxnRefNo}`

        return new Response(null, {
            status: 302,
            headers: {
                ...corsHeaders(),
                'Location': redirectUrl
            }
        })

    } catch (error) {
        console.error('Error in jazzcash-callback:', error)
        return errorResponse(error.message || 'Internal server error', 500)
    }
})
