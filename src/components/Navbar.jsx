import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import Logo from './Logo'

const Navbar = () => {
    const { getCartItemsCount, setIsCartOpen } = useCart()
    const { user, signOut, isAdmin } = useAuth()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const handleSignOut = async () => {
        await signOut()
    }

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="container-custom">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <Logo className="h-10 w-auto" variant="full" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                            Home
                        </Link>
                        <Link to="/products" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                            Products
                        </Link>
                        <Link to="/about" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                            About
                        </Link>
                        {isAdmin() && (
                            <Link to="/admin" className="text-accent-600 hover:text-accent-700 font-medium transition-colors">
                                Admin
                            </Link>
                        )}
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center space-x-4">
                        {/* Cart Icon */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {getCartItemsCount() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-accent-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {getCartItemsCount()}
                                </span>
                            )}
                        </button>

                        {/* User Menu */}
                        {user ? (
                            <div className="hidden md:flex items-center space-x-4">
                                <span className="text-sm text-gray-600">
                                    {user.email}
                                </span>
                                <button
                                    onClick={handleSignOut}
                                    className="text-sm text-gray-700 hover:text-primary-600 font-medium transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center space-x-4">
                                <Link to="/login" className="text-sm text-gray-700 hover:text-primary-600 font-medium transition-colors">
                                    Login
                                </Link>
                                <Link to="/signup" className="btn btn-primary text-sm py-2 px-4">
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-gray-700 hover:text-primary-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t animate-slide-down">
                        <div className="flex flex-col space-y-4">
                            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                Home
                            </Link>
                            <Link to="/products" className="text-gray-700 hover:text-primary-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                Products
                            </Link>
                            <Link to="/about" className="text-gray-700 hover:text-primary-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                About
                            </Link>
                            {isAdmin() && (
                                <Link to="/admin" className="text-accent-600 hover:text-accent-700 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                    Admin
                                </Link>
                            )}
                            {user ? (
                                <>
                                    <span className="text-sm text-gray-600">{user.email}</span>
                                    <button onClick={handleSignOut} className="text-left text-gray-700 hover:text-primary-600 font-medium">
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                        Login
                                    </Link>
                                    <Link to="/signup" className="text-gray-700 hover:text-primary-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
