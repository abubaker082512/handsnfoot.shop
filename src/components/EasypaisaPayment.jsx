import { useState } from 'react';
import {
    validateMobileNumber,
    validateEmail,
    formatMobileNumber,
    getTransactionStatusInfo,
    getTimeRemaining
} from '../utils/easypaisa';

const EasypaisaPayment = ({ orderId, amount, onSuccess, onError }) => {
    const [paymentMethod, setPaymentMethod] = useState('ma'); // 'ma' or 'otc'
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState({
        mobileNumber: '',
        emailAddress: ''
    });
    const [errors, setErrors] = useState({});
    const [otcToken, setOtcToken] = useState(null);

    const handleMAPayment = async () => {
        // Validate inputs
        const newErrors = {};

        if (!validateMobileNumber(paymentData.mobileNumber)) {
            newErrors.mobileNumber = 'Please enter a valid Pakistani mobile number (03XXXXXXXXX)';
        }

        if (paymentData.emailAddress && !validateEmail(paymentData.emailAddress)) {
            newErrors.emailAddress = 'Please enter a valid email address';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await fetch('/api/easypaisa-ma-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderId,
                    amount,
                    mobileAccountNo: formatMobileNumber(paymentData.mobileNumber),
                    emailAddress: paymentData.emailAddress
                })
            });

            const data = await response.json();

            console.log('Easypaisa MA Payment Response:', data);

            if (!response.ok || !data.success) {
                throw new Error(data.responseMessage || data.error || 'Payment failed');
            }

            // Payment successful
            onSuccess?.(data);

        } catch (error) {
            console.error('MA payment error:', error);
            setErrors({ general: error.message });
            onError?.(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOTCPayment = async () => {
        // Validate inputs
        const newErrors = {};

        if (!validateMobileNumber(paymentData.mobileNumber)) {
            newErrors.mobileNumber = 'Please enter a valid Pakistani mobile number (03XXXXXXXXX)';
        }

        if (paymentData.emailAddress && !validateEmail(paymentData.emailAddress)) {
            newErrors.emailAddress = 'Please enter a valid email address';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await fetch('/api/easypaisa-otc-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderId,
                    amount,
                    msisdn: formatMobileNumber(paymentData.mobileNumber),
                    emailAddress: paymentData.emailAddress
                })
            });

            const data = await response.json();

            console.log('Easypaisa OTC Payment Response:', data);

            if (!response.ok || !data.success) {
                throw new Error(data.responseMessage || data.error || 'Payment token generation failed');
            }

            // Show OTC token and instructions
            setOtcToken(data.data);

        } catch (error) {
            console.error('OTC payment error:', error);
            setErrors({ general: error.message });
            onError?.(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (paymentMethod === 'ma') {
            handleMAPayment();
        } else {
            handleOTCPayment();
        }
    };

    // If OTC token is generated, show token details
    if (otcToken) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                        Payment Token Generated
                    </h3>
                    <p className="text-gray-600">
                        Visit any Easypaisa shop to complete your payment
                    </p>
                </div>

                <div className="bg-gradient-to-r from-primary-50 to-accent-50 border-2 border-primary-200 rounded-lg p-6 mb-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Your Payment Token</p>
                        <div className="text-3xl font-bold text-primary-600 tracking-wider mb-2 font-mono">
                            {otcToken.paymentToken}
                        </div>
                        <p className="text-xs text-gray-500">
                            {getTimeRemaining(otcToken.paymentTokenExpiryDateTime)}
                        </p>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-primary-600 font-bold">1</span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">Visit Easypaisa Shop</h4>
                            <p className="text-sm text-gray-600">Go to any nearby Easypaisa retailer or shop</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-primary-600 font-bold">2</span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">Provide Payment Token</h4>
                            <p className="text-sm text-gray-600">Share the token above with the shopkeeper</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-primary-600 font-bold">3</span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">Pay Amount</h4>
                            <p className="text-sm text-gray-600">
                                Pay PKR {otcToken.transactionAmount.toFixed(2)} in cash
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-primary-600 font-bold">4</span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">Receive Confirmation</h4>
                            <p className="text-sm text-gray-600">You'll receive SMS confirmation once payment is complete</p>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>This token will expire on {new Date(otcToken.paymentTokenExpiryDateTime).toLocaleString('en-PK')}. Please complete your payment before expiry.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setOtcToken(null);
                        onSuccess?.(otcToken);
                    }}
                    className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-accent-700 transition-all"
                >
                    I've Noted the Token
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-display font-bold mb-4">Easypaisa Payment</h3>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                    type="button"
                    onClick={() => setPaymentMethod('ma')}
                    className={`p-4 border-2 rounded-lg transition-all ${paymentMethod === 'ma'
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                >
                    <div className="flex flex-col items-center">
                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold">Mobile Account</span>
                        <span className="text-sm text-gray-600">Instant Payment</span>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => setPaymentMethod('otc')}
                    className={`p-4 border-2 rounded-lg transition-all ${paymentMethod === 'otc'
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                >
                    <div className="flex flex-col items-center">
                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="font-semibold">Shop Payment</span>
                        <span className="text-sm text-gray-600">Pay at Shop</span>
                    </div>
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Info Box */}
                {paymentMethod === 'ma' ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">Mobile Account Payment</h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>Payment will be deducted directly from your Easypaisa mobile account.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">Over-the-Counter Payment</h3>
                                <div className="mt-2 text-sm text-green-700">
                                    <p>You'll receive a payment token. Visit any Easypaisa shop to pay in cash.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Fields */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mobile Number
                        </label>
                        <input
                            type="tel"
                            value={paymentData.mobileNumber}
                            onChange={(e) => setPaymentData({ ...paymentData, mobileNumber: e.target.value })}
                            placeholder="03XXXXXXXXX"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
                                }`}
                            disabled={loading}
                        />
                        {errors.mobileNumber && (
                            <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address (Optional)
                        </label>
                        <input
                            type="email"
                            value={paymentData.emailAddress}
                            onChange={(e) => setPaymentData({ ...paymentData, emailAddress: e.target.value })}
                            placeholder="your@email.com"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.emailAddress ? 'border-red-500' : 'border-gray-300'
                                }`}
                            disabled={loading}
                        />
                        {errors.emailAddress && (
                            <p className="text-red-500 text-sm mt-1">{errors.emailAddress}</p>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {errors.general && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {errors.general}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-accent-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        `Pay PKR ${amount.toFixed(2)}`
                    )}
                </button>

                {/* Security Notice */}
                <p className="text-xs text-gray-500 text-center mt-4">
                    🔒 Secure payment powered by Easypaisa
                </p>
            </form>
        </div>
    );
};

export default EasypaisaPayment;
