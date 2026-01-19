import { useState } from 'react';
import { validateCNIC, validateMobileNumber, formatMobileNumber } from '../utils/jazzcash';

const JazzCashPayment = ({ orderId, amount, onSuccess, onError }) => {
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'mwallet'
    const [loading, setLoading] = useState(false);
    const [mwalletData, setMwalletData] = useState({
        mobileNumber: '',
        cnic: ''
    });
    const [errors, setErrors] = useState({});

    const handleCardPayment = async () => {
        setLoading(true);
        setErrors({});

        try {

            // Use local Vercel API route
            const response = await fetch('/api/jazzcash-card-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderId,
                    amount,
                    billReference: orderId, // Pass Order ID as Bill Reference for tracking
                    description: `HandsnFoot Order ${orderId.substring(0, 8)}`
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error('API Error:', response.status, errText);
                throw new Error('Failed to initiate payment: ' + response.status);
            }

            // Get HTML form and inject into page for auto-submission
            const htmlForm = await response.text();

            console.log('Received HTML form from API');

            // Use DOMParser to properly parse the HTML (ensures scripts execute)
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlForm, 'text/html');

            // Extract and append the body content
            const bodyContent = doc.body;

            // Clear the current page and replace with payment form
            document.body.innerHTML = '';

            // Append all elements from the parsed body
            while (bodyContent.firstChild) {
                document.body.appendChild(bodyContent.firstChild);
            }

            console.log('Form injected and scripts should execute');

            // Manually execute script tags (DOMParser doesn't auto-execute them)
            const scripts = document.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                if (oldScript.src) {
                    newScript.src = oldScript.src;
                } else {
                    newScript.textContent = oldScript.textContent;
                }
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });

            console.log('Scripts executed');

            // The form will auto-submit via the script in the HTML

        } catch (error) {
            console.error('Card payment error:', error);
            setErrors({ general: error.message });
            onError?.(error);
            setLoading(false);
        }
    };

    const handleMWalletPayment = async () => {
        // Validate inputs
        const newErrors = {};

        if (!validateMobileNumber(mwalletData.mobileNumber)) {
            newErrors.mobileNumber = 'Please enter a valid Pakistani mobile number (03XXXXXXXXX)';
        }

        if (!validateCNIC(mwalletData.cnic)) {
            newErrors.cnic = 'Please enter the last 6 digits of your CNIC';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            // Use local Vercel API route
            const response = await fetch('/api/jazzcash-mwallet-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // No need for Bearer token for this public API route, 
                    // or you can add custom auth if needed later.
                },
                body: JSON.stringify({
                    orderId,
                    amount,
                    mobileNumber: formatMobileNumber(mwalletData.mobileNumber),
                    cnic: mwalletData.cnic,
                    description: `HandsnFoot Order ${orderId.substring(0, 8)}`
                })
            });

            const data = await response.json();

            console.log('MWallet Payment Response:', data);

            // Check for success or '000' response code (JazzCash success)
            if (!response.ok || (!data.success && data.pp_ResponseCode !== '000')) {
                throw new Error(data.responseMessage || data.message || 'Payment failed');
            }

            // Payment successful
            onSuccess?.(data);

        } catch (error) {
            console.error('MWallet payment error:', error);
            setErrors({ general: error.message });
            onError?.(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (paymentMethod === 'card') {
            handleCardPayment();
        } else {
            handleMWalletPayment();
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-display font-bold mb-4">Payment Method</h3>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg transition-all ${paymentMethod === 'card'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-300'
                        }`}
                >
                    <div className="flex flex-col items-center">
                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="font-semibold">Credit/Debit Card</span>
                        <span className="text-sm text-gray-600">Via JazzCash</span>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => setPaymentMethod('mwallet')}
                    className={`p-4 border-2 rounded-lg transition-all ${paymentMethod === 'mwallet'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-300'
                        }`}
                >
                    <div className="flex-col items-center">
                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold">Mobile Wallet</span>
                        <span className="text-sm text-gray-600">JazzCash Account</span>
                    </div>
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Card Payment Info */}
                {paymentMethod === 'card' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">Redirect to Secure Gateway</h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>
                                        For security, you will be redirected to the official JazzCash payment page to enter your card details.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MWallet Form Fields */}
                {paymentMethod === 'mwallet' && (
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile Number
                            </label>
                            <input
                                type="tel"
                                value={mwalletData.mobileNumber}
                                onChange={(e) => setMwalletData({ ...mwalletData, mobileNumber: e.target.value })}
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
                                CNIC (Last 6 Digits)
                            </label>
                            <input
                                type="text"
                                value={mwalletData.cnic}
                                onChange={(e) => setMwalletData({ ...mwalletData, cnic: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                placeholder="XXXXXX"
                                maxLength={6}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.cnic ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                disabled={loading}
                            />
                            {errors.cnic && (
                                <p className="text-red-500 text-sm mt-1">{errors.cnic}</p>
                            )}
                        </div>
                    </div>
                )}

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
                    🔒 Secure payment powered by JazzCash
                </p>
            </form>
        </div>
    );
};

export default JazzCashPayment;
