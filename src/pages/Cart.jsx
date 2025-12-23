import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart()

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <svg className="w-32 h-32 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <h2 className="text-3xl font-display font-bold mb-4">Your cart is empty</h2>
                    <p className="text-gray-600 mb-8">Add some products to get started</p>
                    <Link to="/products" className="btn btn-primary">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container-custom">
                <h1 className="text-4xl font-display font-bold mb-8 gradient-text">
                    Shopping Cart
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex gap-6">
                                    <Link to={`/products/${item.id}`} className="flex-shrink-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-32 h-32 object-cover rounded-lg hover:opacity-75 transition-opacity"
                                        />
                                    </Link>

                                    <div className="flex-1">
                                        <Link to={`/products/${item.id}`}>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
                                                {item.name}
                                            </h3>
                                        </Link>
                                        <p className="text-sm text-gray-500 mb-4">{item.category}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded hover:bg-gray-100 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="w-12 text-center font-semibold text-lg">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded hover:bg-gray-100 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-primary-600">
                                                    Rs {(item.price * item.quantity).toFixed(2)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Rs {item.price.toFixed(2)} each
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="mt-4 text-red-600 hover:text-red-700 font-medium text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <h2 className="text-2xl font-display font-bold mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>Rs {getCartTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600">FREE</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (estimated)</span>
                                    <span>Rs {(getCartTotal() * 0.1).toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-xl font-bold">
                                        <span>Total</span>
                                        <span className="text-primary-600">
                                            Rs {(getCartTotal() * 1.1).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link to="/checkout" className="btn btn-primary w-full block text-center mb-4">
                                Proceed to Checkout
                            </Link>

                            <Link to="/products" className="btn btn-outline w-full block text-center">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart
