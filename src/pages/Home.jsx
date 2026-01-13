import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchFeaturedProducts()
    }, [])

    const fetchFeaturedProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('featured', true)
                .limit(8)

            if (error) throw error
            setFeaturedProducts(data || [])
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Announcement Bar */}
            <div className="bg-black text-white text-center py-2 text-sm">
                <p>🎉 Free Shipping on Orders Over Rs 10,000 | Easy Returns Within 7 Days</p>
            </div>

            {/* Hero Section - Modern & Clean */}
            <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
                <div className="container-custom py-20 md:py-32">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            Premium Watches<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                                & Accessories
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-8">
                            Discover authentic timepieces and luxury accessories from top brands
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/products"
                                className="bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
                            >
                                Shop Now
                            </Link>
                            <Link
                                to="/about"
                                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-all"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
                    <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-40 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
                </div>
            </section>

            {/* Brand Logos Section */}
            <section className="py-12 bg-gray-50 border-y border-gray-200">
                <div className="container-custom">
                    <div className="flex items-center justify-center gap-12 flex-wrap opacity-60">
                        <div className="text-2xl font-bold text-gray-800">CASIO</div>
                        <div className="text-2xl font-bold text-gray-800">TIMEX</div>
                        <div className="text-2xl font-bold text-gray-800">SEIKO</div>
                        <div className="text-2xl font-bold text-gray-800">CITIZEN</div>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
                        <p className="text-gray-600 text-lg">Handpicked collection of our best sellers</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    to={`/products/${product.id}`}
                                    className="group"
                                >
                                    <div className="relative overflow-hidden rounded-lg mb-4 bg-gray-100 aspect-square">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        {product.stock < 5 && product.stock > 0 && (
                                            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                                Only {product.stock} left
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</p>
                                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-orange-600 transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-orange-600">
                                                Rs {product.price.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                            <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link
                            to="/products"
                            className="inline-block bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                        >
                            View All Products
                        </Link>
                    </div>
                </div>
            </section>

            {/* Categories Banner */}
            <section className="py-16 bg-gray-50">
                <div className="container-custom">
                    <div className="grid md:grid-cols-3 gap-6">
                        <Link to="/products?category=Watches" className="group relative overflow-hidden rounded-xl h-64 bg-gradient-to-br from-blue-600 to-blue-800">
                            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                                <h3 className="text-3xl font-bold mb-2">Watches</h3>
                                <p className="text-blue-100 mb-4">Premium timepieces</p>
                                <span className="text-sm font-semibold group-hover:underline">Shop Now →</span>
                            </div>
                        </Link>
                        <Link to="/products?category=Accessories" className="group relative overflow-hidden rounded-xl h-64 bg-gradient-to-br from-orange-600 to-red-600">
                            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                                <h3 className="text-3xl font-bold mb-2">Accessories</h3>
                                <p className="text-orange-100 mb-4">Wallets & more</p>
                                <span className="text-sm font-semibold group-hover:underline">Shop Now →</span>
                            </div>
                        </Link>
                        <Link to="/products?category=Beauty" className="group relative overflow-hidden rounded-xl h-64 bg-gradient-to-br from-pink-600 to-purple-600">
                            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                                <h3 className="text-3xl font-bold mb-2">Beauty</h3>
                                <p className="text-pink-100 mb-4">Cosmetics & care</p>
                                <span className="text-sm font-semibold group-hover:underline">Shop Now →</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">100% Authentic</h3>
                                <p className="text-gray-600">All products are genuine and verified</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">Fast Delivery</h3>
                                <p className="text-gray-600">Free shipping on orders over Rs 10,000</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">Secure Payment</h3>
                                <p className="text-gray-600">JazzCash, EasyPaisa & Card payments</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
