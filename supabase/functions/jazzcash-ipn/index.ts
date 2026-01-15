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

        // Parse IPN request from JazzCash
        const ipnData = await req.json()
        console.log('Received IPN from JazzCash:', ipnData)

        const {
            pp_TxnRefNo,
            pp_ResponseCode,
            pp_ResponseMessage,
            pp_SecureHash,
            pp_RetreivalReferenceNo,
            pp_AuthCode,
            pp_TxnType,
            pp_Version
        } = ipnData

        if (!pp_TxnRefNo) {
            return errorResponse('Missing transaction reference in IPN')
        }

        // Create Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Verify hash
        const paramsWithoutHash = { ...ipnData }
        delete paramsWithoutHash.pp_SecureHash

        const isHashValid = await verifyHash(paramsWithoutHash, pp_SecureHash, INTEGRITY_SALT)

        // Log IPN to database
        await supabaseClient
            .from('ipn_logs')
            .insert({
                txn_ref_no: pp_TxnRefNo,
                ipn_payload: ipnData,
                ipn_hash: pp_SecureHash,
                hash_verified: isHashValid
            })

        if (!isHashValid) {
            console.error('Invalid IPN hash received from JazzCash')
            const errorResponse = {
                pp_ResponseCode: '999',
                pp_ResponseMessage: 'Invalid hash',
                pp_SecureHash: ''
            }
            return jsonResponse(errorResponse, 400)
        }

        // Determine payment status
        const isSuccess = pp_ResponseCode === '121'
        const status = isSuccess ? 'completed' : 'failed'

        // Update transaction in database
        const transaction = await updateTransaction(supabaseClient, pp_TxnRefNo, {
            status,
            ipn_received: true,
            ipn_timestamp: new Date().toISOString(),
            response_code: pp_ResponseCode,
            response_message: pp_ResponseMessage,
            retrieval_ref_no: pp_RetreivalReferenceNo,
            auth_code: pp_AuthCode
        })

        // Update order if payment successful
        if (isSuccess && transaction.order_id) {
            await updateOrderPayment(supabaseClient, transaction.order_id, {
                payment_status: 'completed',
                jazzcash_txn_ref_no: pp_TxnRefNo,
                jazzcash_retrieval_ref_no: pp_RetreivalReferenceNo,
                jazzcash_auth_code: pp_AuthCode,
                jazzcash_response_code: pp_ResponseCode,
                jazzcash_response_message: pp_ResponseMessage,
                jazzcash_full_response: ipnData,
                payment_completed_at: new Date().toISOString(),
                amount_paid: transaction.amount
            })
        }

        // Generate response hash
        const responseParams = {
            pp_ResponseCode: '000',
            pp_ResponseMessage: 'IPN received successfully'
        }
        const responseHash = await generateHash(responseParams, INTEGRITY_SALT)

        // Update IPN log with response
        await supabaseClient
            .from('ipn_logs')
            .update({
                response_sent: { ...responseParams, pp_SecureHash: responseHash }
            })
            .eq('txn_ref_no', pp_TxnRefNo)
            .order('created_at', { ascending: false })
            .limit(1)

        // Return acknowledgment to JazzCash
        return jsonResponse({
            ...responseParams,
            pp_SecureHash: responseHash
        })

    } catch (error) {
        console.error('Error in jazzcash-ipn:', error)

        // Still return success to JazzCash to avoid retries
        // But log the error
        return jsonResponse({
            pp_ResponseCode: '000',
            pp_ResponseMessage: 'IPN received successfully',
            pp_SecureHash: ''
        })
    }
})
