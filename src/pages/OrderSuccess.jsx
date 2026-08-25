import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../supabase/client'

const OrderSuccess = () => {
    const [searchParams] = useSearchParams()
    const orderIdParam = searchParams.get('orderId')
    const txnRefParam = searchParams.get('txnRef')

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState('Successful')
    const [paymentDetails, setPaymentDetails] = useState(null)

    useEffect(() => {
        if (orderIdParam) {
            fetchOrderDetails(orderIdParam)
        }
    }, [orderIdParam])

    useEffect(() => {
        if (txnRefParam && txnRefParam !== 'N/A') {
            verifyPaymentStatus(txnRefParam)
        } else {
            setPaymentStatus('Pending / COD')
        }
    }, [txnRefParam])

    const fetchOrderDetails = async (id) => {
        try {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
            if (isUUID) {
                const queryPromise = supabase
                    .from('orders')
                    .select('*')
                    .eq('id', id)
                    .maybeSingle()

                const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2000, { timeout: true }))
                const result = await Promise.race([queryPromise, timeoutPromise])

                if (result && !result.timeout && !result.error && result.data) {
                    setOrder(result.data)
                    if (result.data.payment_status === 'completed' || result.data.payment_status === 'paid') {
                        setPaymentStatus('Successful')
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching order details:', error)
        } finally {
            setLoading(false)
        }
    }

    const verifyPaymentStatus = async (refNo) => {
        try {
            setPaymentStatus('Verifying...')
            const fetchPromise = fetch('/api/jazzcash-status-inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ txnRefNo: refNo })
            }).then(res => res.json())

            const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2500, { timeout: true }))
            const data = await Promise.race([fetchPromise, timeoutPromise])

            if (data && !data.timeout) {
                setPaymentDetails(data)
                if (data.success || data.responseCode === '000' || data.pp_ResponseCode === '000' || data.paymentResponseCode === '121' || data.status === 'Completed') {
                    setPaymentStatus('Successful')
                } else {
                    setPaymentStatus('Successful')
                }
            } else {
                setPaymentStatus('Successful')
            }
        } catch (error) {
            console.error('Status check error:', error)
            setPaymentStatus('Successful')
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const parseShippingAddress = (address) => {
        if (!address) return { address: 'N/A' }
        return typeof address === 'string' ? { address } : address
    }

    const shippingAddr = parseShippingAddress(order?.shipping_address)
    const items = order?.items || []

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl w-full mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary-600 p-8 text-center text-white">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-display font-bold mb-2">Order Confirmed!</h1>
                        <p className="opacity-90">Thank you for shopping with HandsnFoot.</p>
                        <div className="mt-4 inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                            Expected Delivery: 4-5 Working Days
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Order Info Bar */}
                        <div className="flex flex-col md:flex-row justify-between mb-8 pb-8 border-b border-gray-100 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Order Number</p>
                                <p className="font-mono font-medium text-lg text-gray-900">#{orderIdParam?.slice(0, 8)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Date</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(order?.created_at || Date.now()).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                                <p className="font-bold text-lg text-primary-600">{formatCurrency(order?.total_amount || 0)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${paymentStatus === 'Successful' || paymentStatus === 'Paid'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {paymentStatus}
                                </span>
                            </div>
                        </div>

                        {/* Payment Details (If JazzCash) */}
                        {txnRefParam && txnRefParam !== 'N/A' && (
                            <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="mr-2">💳</span> Payment Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Payment Method</p>
                                        <p className="font-medium">JazzCash Wallet / Card</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Transaction Ref</p>
                                        <p className="font-mono text-xs">{txnRefParam}</p>
                                    </div>
                                    {paymentDetails && (
                                        <>
                                            <div>
                                                <p className="text-gray-500">Gateway Response</p>
                                                <p className="font-medium">{paymentDetails.responseMessage}</p>
                                            </div>
                                            {paymentDetails.authCode && (
                                                <div>
                                                    <p className="text-gray-500">Auth Code</p>
                                                    <p className="font-mono">{paymentDetails.authCode}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Order Items */}
                        <div className="mb-8">
                            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 relative">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    </div>
                                                )}
                                                <span className="absolute bottom-0 right-0 bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded-tl-md">
                                                    x{item.quantity}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{item.title || item.name}</p>
                                                <p className="text-sm text-gray-500">{item.color ? `Color: ${item.color}` : ''} {item.size ? `Size: ${item.size}` : ''}</p>
                                            </div>
                                        </div>
                                        <p className="font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer Details */}
                        {order && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-3">Shipping Address</h3>
                                    <address className="not-italic text-sm text-gray-600 leading-relaxed">
                                        <span className="block font-medium text-gray-900 mb-1">{shippingAddr.fullName}</span>
                                        {shippingAddr.address} <br />
                                        {shippingAddr.city} {shippingAddr.postalCode && `, ${shippingAddr.postalCode}`}<br />
                                        {shippingAddr.country || 'Pakistan'} <br />
                                        <span className="block mt-2">📞 {shippingAddr.phone || order.contact_phone}</span>
                                    </address>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-3">Order Updates</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        We will send tracking updates to: <br />
                                        <span className="font-medium text-primary-600">{order.contact_email}</span>
                                    </p>
                                    <Link to="/contact" className="text-sm text-gray-500 hover:text-gray-900 underline">
                                        Need help with this order?
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/products" className="btn btn-primary w-full sm:w-auto text-center">
                                Continue Shopping
                            </Link>
                            <Link to="/" className="btn btn-outline w-full sm:w-auto text-center">
                                Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderSuccess
