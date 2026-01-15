import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const CartDrawer = () => {
    const { cart, removeFromCart, updateQuantity, getCartTotal, isCartOpen, setIsCartOpen } = useCart()

    if (!isCartOpen) return null

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-down">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-display font-bold">Shopping Cart</h2>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
                            <Link
                                to="/products"
                                onClick={() => setIsCartOpen(false)}
                                className="btn btn-primary"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex gap-4 border-b pb-4">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">Rs {item.price.toFixed(2)}</p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="ml-auto text-red-600 hover:text-red-700 text-sm font-medium"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="border-t p-6 space-y-4">
                        <div className="flex justify-between items-center text-lg font-semibold">
                            <span>Total:</span>
                            <span className="text-2xl text-primary-600">Rs {getCartTotal().toFixed(2)}</span>
                        </div>
                        <Link
                            to="/cart"
                            onClick={() => setIsCartOpen(false)}
                            className="btn btn-outline w-full block text-center"
                        >
                            View Cart
                        </Link>
                        <Link
                            to="/checkout"
                            onClick={() => setIsCartOpen(false)}
                            className="btn btn-primary w-full block text-center"
                        >
                            Checkout
                        </Link>
                    </div>
                )}
            </div>
        </>
    )
}

export default CartDrawer
