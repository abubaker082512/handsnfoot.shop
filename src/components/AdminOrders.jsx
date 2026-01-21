import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

const AdminOrders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusLoading, setStatusLoading] = useState({})

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setOrders(data || [])
        } catch (error) {
            console.error('Error fetching orders:', error)
            alert('Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    const handleCheckStatus = async (orderId, txnRefNo) => {
        if (!txnRefNo) {
            alert('No Transaction Reference Number found for this order.')
            return
        }

        setStatusLoading(prev => ({ ...prev, [orderId]: true }))

        try {
            // Call Supabase Edge Function
            const { data, error } = await supabase.functions.invoke('jazzcash-status-inquiry', {
                body: { txnRefNo }
            })

            if (error) throw error

            console.log('Status Inquiry Result:', data)

            if (data.success) {
                // If payment status changed to Completed, it might have been updated in DB by the function
                // but let's refresh the list to be sure
                await fetchOrders()

                if (data.status === 'Completed' || data.responseCode === '000') {
                    alert('Payment Confirmed: Transaction Successful!')
                } else {
                    alert(`Payment Status: ${data.status} (${data.responseMessage})`)
                }
            } else {
                alert(`Inquiry Failed: ${data.responseMessage || 'Unknown error'}`)
            }

        } catch (error) {
            console.error('Error checking status:', error)
            alert('Error calling status inquiry API')
        } finally {
            setStatusLoading(prev => ({ ...prev, [orderId]: false }))
        }
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'paid':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'failed':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const parseShippingAddress = (address) => {
        if (!address) return 'N/A'
        // If address is JSON object
        if (typeof address === 'object') {
            return `${address.address}, ${address.city}, ${address.country}`
        }
        // If string (legacy)
        return address
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-display font-bold">Recent Orders</h2>
                <button onClick={fetchOrders} className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                    Refresh List
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center">
                                    <div className="flex justify-center">
                                        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{order.id.slice(0, 8)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        <div className="text-xs text-gray-400">
                                            {new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="font-medium">{order.shipping_address?.fullName || 'Guest'}</div>
                                        <div className="text-gray-500 text-xs">{order.contact_email}</div>
                                        <div className="text-gray-400 text-xs truncate max-w-xs" title={parseShippingAddress(order.shipping_address)}>
                                            {parseShippingAddress(order.shipping_address)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                        Rs {order.total_amount?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex flex-col">
                                            <span className="capitalize">{order.payment_method || 'COD'}</span>
                                            {order.jazzcash_txn_ref_no && (
                                                <span className="text-xs text-gray-400 font-mono" title={order.jazzcash_txn_ref_no}>
                                                    Ref: {order.jazzcash_txn_ref_no.slice(0, 8)}...
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.payment_status)}`}>
                                            {order.payment_status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex flex-col gap-2">
                                            <button className="text-primary-600 hover:text-primary-900 text-left">
                                                View Details
                                            </button>

                                            {/* Status Inquiry Button for JazzCash Orders */}
                                            {((order.payment_status === 'pending' || order.payment_status === 'initiated') &&
                                                (order.payment_method === 'jazzcash' || order.jazzcash_txn_ref_no)) && (
                                                    <button
                                                        onClick={() => handleCheckStatus(order.id, order.jazzcash_txn_ref_no)}
                                                        disabled={statusLoading[order.id]}
                                                        className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-1 rounded border border-indigo-200 flex items-center justify-center gap-1"
                                                    >
                                                        {statusLoading[order.id] ? (
                                                            <>
                                                                <div className="w-3 h-3 border-2 border-indigo-200 border-t-indigo-700 rounded-full animate-spin"></div>
                                                                Checking...
                                                            </>
                                                        ) : (
                                                            'Check Status'
                                                        )}
                                                    </button>
                                                )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AdminOrders
