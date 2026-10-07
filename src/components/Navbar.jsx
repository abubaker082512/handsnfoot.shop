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
        <header className="sticky top-0 z-50">
            {/* Top Luxury Announcement Bar */}
            <div className="bg-gradient-to-r from-gray-900 via-amber-950 to-gray-900 text-white text-xs font-semibold py-2 px-4 text-center tracking-widest uppercase shadow-inner flex justify-center items-center">
                <div className="text-amber-300 font-bold flex items-center gap-2">
                    <span>✨</span> FREE NATIONWIDE EXPRESS DELIVERY ACROSS PAKISTAN | 100% AUTHENTIC GUARANTEE | CASH ON DELIVERY AVAILABLE
                </div>
            </div>

            <nav className="bg-white shadow-md border-b border-gray-100 backdrop-blur-md bg-white/95">
                <div className="container-custom">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center group">
                            <Logo className="h-11 w-auto transition-transform group-hover:scale-105 duration-300" variant="full" />
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-7">
                            <Link to="/" className="text-gray-800 hover:text-primary-600 font-semibold uppercase text-xs tracking-widest transition-colors py-2 border-b-2 border-transparent hover:border-primary-500">
                                Home
                            </Link>

                            <Link to="/products?category=Jewelry" className="text-primary-800 hover:text-primary-600 font-bold uppercase text-xs tracking-widest transition-all py-2 border-b-2 border-primary-500 flex items-center gap-1.5 bg-primary-50 px-3 rounded-full">
                                <span>✨</span> Jewelry
                            </Link>

                            <Link to="/products?category=Watches" className="text-gray-900 hover:text-primary-600 font-bold uppercase text-xs tracking-widest transition-all py-2 border-b-2 border-gray-800 flex items-center gap-1.5 hover:bg-gray-50 px-3 rounded-full">
                                <span>⌚</span> Watches
                            </Link>

                            <Link to="/products?category=Accessories" className="text-gray-800 hover:text-primary-600 font-semibold uppercase text-xs tracking-widest transition-colors py-2 border-b-2 border-transparent hover:border-primary-500">
                                Accessories
                            </Link>

                            <Link to="/products" className="text-gray-800 hover:text-primary-600 font-semibold uppercase text-xs tracking-widest transition-colors py-2 border-b-2 border-transparent hover:border-primary-500">
                                All Catalog
                            </Link>

                            <Link to="/track-order" className="text-gray-800 hover:text-primary-600 font-semibold uppercase text-xs tracking-widest transition-colors py-2 border-b-2 border-transparent hover:border-primary-500">
                                Track Order
                            </Link>

                            {isAdmin() && (
                                <Link to="/admin" className="text-accent-600 hover:text-accent-700 font-bold uppercase text-xs tracking-widest transition-colors">
                                    Admin
                                </Link>
                            )}
                        </div>

                        {/* Right Side Icons */}
                        <div className="flex items-center space-x-4">
                            {/* Cart Icon */}
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2.5 text-gray-800 hover:text-primary-600 transition-all rounded-full hover:bg-gray-100"
                                aria-label="Cart"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {getCartItemsCount() > 0 && (
                                    <span className="absolute top-1 right-1 bg-amber-500 text-white text-xs font-extrabold rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
                                        {getCartItemsCount()}
                                    </span>
                                )}
                            </button>

                            {/* User Menu */}
                            {user ? (
                                <div className="hidden md:flex items-center space-x-4">
                                    <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                                        {user.email}
                                    </span>
                                    <button
                                        onClick={handleSignOut}
                                        className="text-xs uppercase font-bold text-gray-700 hover:text-primary-600 transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center space-x-3">
                                    <Link to="/login" className="text-xs uppercase font-bold text-gray-800 hover:text-primary-600 px-3 py-2">
                                        Login
                                    </Link>
                                    <Link to="/signup" className="btn btn-primary text-xs uppercase font-extrabold tracking-wider py-2 px-5 rounded-full shadow-sm hover:shadow-md transition-all">
                                        Sign Up
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 text-gray-800 hover:text-primary-600 focus:outline-none"
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
                        <div className="md:hidden py-4 border-t border-gray-100 bg-white animate-slide-down px-2">
                            <div className="flex flex-col space-y-3 font-semibold text-sm">
                                <Link to="/" className="text-gray-800 hover:text-primary-600 py-1" onClick={() => setIsMobileMenuOpen(false)}>
                                    Home
                                </Link>
                                <Link to="/products?category=Jewelry" className="text-primary-700 font-bold flex items-center gap-2 py-2 px-3 bg-primary-50 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                                    ✨ Jewelry Collection
                                </Link>
                                <Link to="/products?category=Watches" className="text-gray-900 font-bold flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                                    ⌚ Watches Collection
                                </Link>
                                <Link to="/products?category=Accessories" className="text-gray-800 hover:text-primary-600 py-1" onClick={() => setIsMobileMenuOpen(false)}>
                                    Leather Accessories & Wallets
                                </Link>
                                <Link to="/products" className="text-gray-800 hover:text-primary-600 py-1" onClick={() => setIsMobileMenuOpen(false)}>
                                    All Products Catalog
                                </Link>
                                <Link to="/track-order" className="text-gray-800 hover:text-primary-600 py-1" onClick={() => setIsMobileMenuOpen(false)}>
                                    Track Order
                                </Link>
                                <Link to="/faq" className="text-gray-800 hover:text-primary-600 py-1" onClick={() => setIsMobileMenuOpen(false)}>
                                    FAQ
                                </Link>
                                <Link to="/about" className="text-gray-800 hover:text-primary-600 py-1" onClick={() => setIsMobileMenuOpen(false)}>
                                    About Us
                                </Link>
                                {isAdmin() && (
                                    <Link to="/admin" className="text-accent-600 font-bold py-1" onClick={() => setIsMobileMenuOpen(false)}>
                                        Admin Panel
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    )
}

export default Navbar
