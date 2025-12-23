import { useLocation, Link } from 'react-router-dom'

const OrderSuccess = () => {
    const location = useLocation()
    const orderId = location.state?.orderId || 'N/A'

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
            <div className="max-w-2xl w-full mx-4">
                <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center">
                    {/* Success Icon */}
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    {/* Success Message */}
                    <h1 className="text-4xl font-display font-bold mb-4 gradient-text">
                        Order Placed Successfully!
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Thank you for your purchase. Your order has been confirmed.
                    </p>

                    {/* Order Details */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Order Number</p>
                                <p className="font-semibold text-lg">{orderId}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Order Date</p>
                                <p className="font-semibold text-lg">
                                    {new Date().toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                        <h3 className="font-semibold text-lg mb-3">What's Next?</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>You'll receive an order confirmation email shortly</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>We'll send you shipping updates as your order is processed</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Expected delivery: 3-5 business days</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/products" className="btn btn-primary">
                            Continue Shopping
                        </Link>
                        <Link to="/" className="btn btn-outline">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderSuccess
