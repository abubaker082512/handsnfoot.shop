import { useState } from 'react'

const RapidGatewayPayment = ({ orderId, amount, phone, email }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handlePayment = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/rapidgateway-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    phone,
                    email,
                    orderId,
                }),
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to initialize payment session')
            }

            // Redirect user to the secure checkout page hosted by RapidGateway
            window.location.href = data.redirectUrl
        } catch (err) {
            console.error('RapidGateway payment error:', err)
            setError(err.message || 'An error occurred while initiating the payment. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 font-sans">
            <h3 className="text-xl font-bold mb-4 uppercase tracking-wider text-gray-900">Secure Payment</h3>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                You will be redirected to the secure checkout portal of **RapidGateway.pk** to complete your transaction. You can pay using:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 text-center text-xs font-semibold text-gray-700">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">💳 Card</div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">📱 Mobile Wallet</div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">🏦 Bank Transfer</div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">⚡ Raast</div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
                    ⚠️ {error}
                </div>
            )}

            <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-400 text-black font-bold py-3.5 px-6 rounded-lg transition-all shadow-md hover:shadow-primary-500/10 uppercase tracking-widest text-sm disabled:opacity-50"
            >
                {loading ? 'Initiating Secure Payment...' : `Pay Rs ${(amount).toLocaleString()}`}
            </button>
        </div>
    )
}

export default RapidGatewayPayment
