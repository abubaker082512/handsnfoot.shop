import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [status, setStatus] = useState('processing'); // processing, success, failed
    const [message, setMessage] = useState('');
    const hasRedirected = useRef(false);

    useEffect(() => {
        // Prevent multiple redirects
        if (hasRedirected.current) return;

        // Check if we have success parameters
        const orderId = searchParams.get('orderId');
        const txnRef = searchParams.get('txnRef');
        const error = searchParams.get('error');

        if (error) {
            setStatus('failed');
            setMessage(decodeURIComponent(error));
        } else if (orderId && txnRef) {
            setStatus('success');
            // Clear cart on successful payment
            clearCart();

            // Mark that we're redirecting
            hasRedirected.current = true;

            // Redirect to order success page after 2 seconds
            const timer = setTimeout(() => {
                navigate(`/order-success?orderId=${orderId}&txnRef=${txnRef}`, { replace: true });
            }, 2000);

            // Cleanup function
            return () => clearTimeout(timer);
        } else {
            setStatus('processing');
            setMessage('Processing your payment...');
        }
    }, [searchParams, navigate, clearCart]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    {status === 'processing' && (
                        <>
                            <div className="mb-6">
                                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
                            </div>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
                                Processing Payment
                            </h2>
                            <p className="text-gray-600">
                                Please wait while we confirm your payment...
                            </p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
                                Payment Successful!
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Your payment has been processed successfully.
                            </p>
                            <p className="text-sm text-gray-500">
                                Redirecting to order confirmation...
                            </p>
                        </>
                    )}

                    {status === 'failed' && (
                        <>
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
                                Payment Failed
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {message || 'Your payment could not be processed. Please try again.'}
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => navigate('/cart')}
                                    className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Return to Cart
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentCallback;
