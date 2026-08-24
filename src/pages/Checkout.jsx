import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase/client'
import JazzCashPayment from '../components/JazzCashPayment'
import EasypaisaPayment from '../components/EasypaisaPayment'
import RapidGatewayPayment from '../components/RapidGatewayPayment'
import DirectPayPayment from '../components/DirectPayPayment'

const Checkout = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { cart, getCartTotal, clearCart } = useCart()
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState('shipping') // 'shipping' or 'payment'
    const [orderId, setOrderId] = useState(null)
    const [paymentGateway, setPaymentGateway] = useState('directpay') // Default to 'directpay'

    const errorParam = searchParams.get('error')

    useEffect(() => {
        if (errorParam) {
            alert(errorParam)
        }
    }, [errorParam])
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const newOrderId = crypto.randomUUID()

            // Create order in Supabase with explicit pre-generated UUID
            const orderData = {
                id: newOrderId,
                user_id: user?.id || null,
                order_items: cart,
                total_price: getCartTotal() * 1.1, // Including tax
                status: 'pending',
                payment_status: 'pending',
                shipping_address: formData,
            }

            const { error } = await supabase
                .from('orders')
                .insert([orderData])

            if (error) {
                console.error('Supabase order creation error:', error)
                throw error
            }

            // Store order ID and move to payment step immediately
            setOrderId(newOrderId)
            setStep('payment')
        } catch (error) {
            console.error('Error creating order:', error)
            alert('Failed to create order: ' + (error.message || 'Please try again.'))
        } finally {
            setLoading(false)
        }
    }

    const handlePaymentSuccess = (data) => {
        console.log('Payment successful:', data)
        clearCart()

        // Handle different payment gateways
        const txnRef = data.txnRefNo || data.data?.paymentToken || 'N/A'
        navigate(`/order-success?orderId=${orderId}&txnRef=${txnRef}`)
    }

    const handlePaymentError = (error) => {
        console.error('Payment error:', error)
        alert('Payment failed. Please try again.')
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-3xl font-display font-bold mb-4">Your cart is empty</h2>
                    <p className="text-gray-600 mb-8">Add some products before checking out</p>
                    <button onClick={() => navigate('/products')} className="btn btn-primary">
                        Continue Shopping
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container-custom">
                <h1 className="text-4xl font-display font-bold mb-8 gradient-text">
                    Checkout
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Information */}
                        {step === 'shipping' ? (
                            <form onSubmit={handleSubmit} id="shipping-form">
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h2 className="text-2xl font-display font-bold mb-6">Shipping Information</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Address *
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                State *
                                            </label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ZIP Code *
                                            </label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={formData.zipCode}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-display font-bold">Shipping Information</h2>
                                    <button
                                        onClick={() => setStep('shipping')}
                                        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <div className="text-gray-600">
                                    <p className="font-medium text-gray-900">{formData.firstName} {formData.lastName}</p>
                                    <p>{formData.address}</p>
                                    <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                                    <p>{formData.phone}</p>
                                    <p>{formData.email}</p>
                                </div>
                            </div>
                        )}

                        {/* Payment Information */}
                        {step === 'payment' && orderId && (
                            <>
                                {/* Payment Gateway Selector */}
                                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                    <h3 className="text-xl font-display font-bold mb-4">Select Payment Gateway</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentGateway('directpay')}
                                            className={`p-4 border-2 rounded-lg transition-all ${paymentGateway === 'directpay'
                                                    ? 'border-primary-600 bg-primary-50'
                                                    : 'border-gray-300 hover:border-primary-300'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="text-2xl mb-2">⚡</div>
                                                <span className="font-semibold">DirectPay</span>
                                                <span className="text-sm text-gray-600">Card & Wallet</span>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setPaymentGateway('rapidgateway')}
                                            className={`p-4 border-2 rounded-lg transition-all ${paymentGateway === 'rapidgateway'
                                                    ? 'border-primary-600 bg-primary-50'
                                                    : 'border-gray-300 hover:border-primary-300'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="text-2xl mb-2">🚀</div>
                                                <span className="font-semibold">RapidPay</span>
                                                <span className="text-sm text-gray-600">Card, Bank & Raast</span>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setPaymentGateway('jazzcash')}
                                            className={`p-4 border-2 rounded-lg transition-all ${paymentGateway === 'jazzcash'
                                                    ? 'border-primary-600 bg-primary-50'
                                                    : 'border-gray-300 hover:border-primary-300'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="text-2xl mb-2">💳</div>
                                                <span className="font-semibold">JazzCash</span>
                                                <span className="text-sm text-gray-600">Card & Wallet</span>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setPaymentGateway('easypaisa')}
                                            className={`p-4 border-2 rounded-lg transition-all ${paymentGateway === 'easypaisa'
                                                    ? 'border-primary-600 bg-primary-50'
                                                    : 'border-gray-300 hover:border-primary-300'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="text-2xl mb-2">📱</div>
                                                <span className="font-semibold">Easypaisa</span>
                                                <span className="text-sm text-gray-600">Account & OTC</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Render selected payment gateway */}
                                {paymentGateway === 'directpay' && (
                                    <DirectPayPayment
                                        orderId={orderId}
                                        amount={getCartTotal() * 1.1}
                                        phone={formData.phone}
                                        email={formData.email}
                                        payerName={`${formData.firstName} ${formData.lastName}`}
                                    />
                                )}
                                {paymentGateway === 'rapidgateway' && (
                                    <RapidGatewayPayment
                                        orderId={orderId}
                                        amount={getCartTotal() * 1.1}
                                        phone={formData.phone}
                                        email={formData.email}
                                    />
                                )}
                                {paymentGateway === 'jazzcash' && (
                                    <JazzCashPayment
                                        orderId={orderId}
                                        amount={getCartTotal() * 1.1}
                                        onSuccess={handlePaymentSuccess}
                                        onError={handlePaymentError}
                                    />
                                )}
                                {paymentGateway === 'easypaisa' && (
                                    <EasypaisaPayment
                                        orderId={orderId}
                                        amount={getCartTotal() * 1.1}
                                        onSuccess={handlePaymentSuccess}
                                        onError={handlePaymentError}
                                    />
                                )}
                            </>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <h2 className="text-2xl font-display font-bold mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{item.name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                            <p className="text-sm font-semibold text-primary-600">
                                                Rs {(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 space-y-2 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>Rs {getCartTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600">FREE</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span>Rs {(getCartTotal() * 0.1).toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-2">
                                    <div className="flex justify-between text-xl font-bold">
                                        <span>Total</span>
                                        <span className="text-primary-600">
                                            Rs {(getCartTotal() * 1.1).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {step === 'shipping' && (
                                <button
                                    type="submit"
                                    form="shipping-form"
                                    disabled={loading}
                                    className="btn btn-primary w-full"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <div className="spinner mr-2"></div>
                                            Creating Order...
                                        </span>
                                    ) : (
                                        'Continue to Payment'
                                    )}
                                </button>
                            )}
                            {step === 'payment' && (
                                <button
                                    type="button"
                                    onClick={() => setStep('shipping')}
                                    className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 w-full"
                                >
                                    ← Back to Shipping
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout
