import { useState } from 'react'
import { supabase } from '../supabase/client'

const TrackOrder = () => {
    const [orderId, setOrderId] = useState('')
    const [loading, setLoading] = useState(false)
    const [order, setOrder] = useState(null)
    const [error, setError] = useState('')

    const handleTrack = async (e) => {
        e.preventDefault()
        if (!orderId.trim()) return

        setLoading(true)
        setError('')
        setOrder(null)

        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId.trim())
                .single()

            if (error) throw error

            if (data) {
                setOrder(data)
            } else {
                setError('No order found with the provided ID. Please verify the ID and try again.')
            }
        } catch (err) {
            console.error('Error tracking order:', err)
            setError('Could not find order. Please verify that you entered a valid Order UUID.')
        } finally {
            setLoading(false)
        }
    }

    const getStatusStep = (status) => {
        const steps = ['pending', 'paid', 'shipped', 'delivered']
        return steps.indexOf(status?.toLowerCase())
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-display font-bold mb-3 uppercase tracking-wide">
                        Track Your Order
                    </h1>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Enter your Order ID (sent to you after placing the order) to view its shipping status and details.
                    </p>
                </div>

                {/* Track Form */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 md:p-8 mb-8 max-w-2xl mx-auto">
                    <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-grow">
                            <label htmlFor="orderId" className="sr-only">Order ID</label>
                            <input
                                id="orderId"
                                type="text"
                                placeholder="Paste your Order ID (e.g. 550e8400-e29b-41d4-a716-446655440000)"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-sans"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !orderId.trim()}
                            className="bg-black text-white hover:bg-primary-500 hover:text-black font-bold py-3 px-8 rounded-lg transition-all duration-300 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Searching...' : 'Track'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                {/* Tracking Results */}
                {order && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 md:p-8 space-y-8 animate-fade-in">
                        {/* Summary Header */}
                        <div className="flex flex-wrap justify-between items-center gap-4 pb-6 border-b border-gray-100">
                            <div>
                                <span className="text-[10px] text-primary-600 uppercase tracking-widest font-bold">Order Confirmed</span>
                                <h2 className="text-xl font-bold text-gray-900 mt-1">ID: {order.id}</h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Placed on: {new Date(order.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-gray-500 uppercase">Grand Total</span>
                                <p className="text-2xl font-bold text-gray-900 mt-1">Rs {order.total_price.toLocaleString()}</p>
                                <span className="inline-block bg-primary-100 text-primary-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mt-1.5">
                                    Payment: {order.payment_status || 'Pending'}
                                </span>
                            </div>
                        </div>

                        {/* Status Stepper */}
                        <div>
                            <h3 className="text-lg font-bold mb-6 uppercase tracking-wider">Shipment Progress</h3>
                            
                            {/* Stepper for Desktop */}
                            <div className="hidden md:flex justify-between items-center relative">
                                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-100 z-0">
                                    <div 
                                        className="h-full bg-primary-500 transition-all duration-500" 
                                        style={{ width: `${Math.max(0, getStatusStep(order.status)) * 33.3}%` }}
                                    />
                                </div>

                                {['Pending', 'Paid/Confirmed', 'Shipped', 'Delivered'].map((step, idx) => {
                                    const currentStep = getStatusStep(order.status)
                                    const isCompleted = idx <= currentStep
                                    const isActive = idx === currentStep

                                    return (
                                        <div key={step} className="flex flex-col items-center z-10 bg-white px-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                                                isCompleted 
                                                    ? 'bg-primary-500 border-primary-500 text-black' 
                                                    : 'bg-white border-gray-200 text-gray-400'
                                            } ${isActive ? 'ring-4 ring-primary-100' : ''}`}>
                                                {isCompleted ? '✓' : idx + 1}
                                            </div>
                                            <span className={`text-xs font-semibold mt-2 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {step}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Stepper for Mobile (Vertical) */}
                            <div className="md:hidden space-y-6">
                                {['Pending', 'Paid/Confirmed', 'Shipped', 'Delivered'].map((step, idx) => {
                                    const currentStep = getStatusStep(order.status)
                                    const isCompleted = idx <= currentStep

                                    return (
                                        <div key={step} className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] border-2 ${
                                                isCompleted 
                                                    ? 'bg-primary-500 border-primary-500 text-black' 
                                                    : 'bg-white border-gray-200 text-gray-400'
                                            }`}>
                                                {isCompleted ? '✓' : idx + 1}
                                            </div>
                                            <span className={`text-xs font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {step}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Order Items & Shipping details split */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                            {/* Items Purchased */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 uppercase tracking-wider">Items</h3>
                                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                    {order.order_items?.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-b-0">
                                            <img 
                                                src={item.image} 
                                                alt={item.name} 
                                                className="w-12 h-12 object-cover rounded bg-gray-50 border border-gray-100"
                                            />
                                            <div className="flex-grow">
                                                <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                                                <p className="text-[10px] text-gray-500 mt-0.5">Qty: {item.quantity} | Rs {item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 uppercase tracking-wider">Shipping Address</h3>
                                <div className="bg-gray-50 rounded-xl p-5 text-sm space-y-2 border border-gray-100 text-gray-700 leading-relaxed font-sans">
                                    <p><strong className="text-gray-900">Name:</strong> {order.shipping_address?.firstName} {order.shipping_address?.lastName}</p>
                                    <p><strong className="text-gray-900">Email:</strong> {order.shipping_address?.email}</p>
                                    <p><strong className="text-gray-900">Phone:</strong> {order.shipping_address?.phone}</p>
                                    <p><strong className="text-gray-900">Address:</strong> {order.shipping_address?.address}, {order.shipping_address?.city}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TrackOrder
