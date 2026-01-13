import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [settings, setSettings] = useState({})
    const [brands, setBrands] = useState([])

    useEffect(() => {
        fetchFeaturedProducts()
        fetchSettings()
        fetchBrands()
    }, [])

    const fetchSettings = async () => {
        try {
            const { data } = await supabase.from('site_settings').select('*')
            if (data) {
                const settingsObj = {}
                data.forEach(item => settingsObj[item.key] = item.value)
                setSettings(settingsObj)
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        }
    }

    const fetchBrands = async () => {
        try {
            const { data } = await supabase
                .from('brand_logos')
                .select('*')
                .eq('is_active', true)
                .order('display_order')
            if (data) setBrands(data)
        } catch (error) {
            console.error('Error fetching brands:', error)
        }
    }

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
            {settings.announcement_bar_text && (
                <div className="bg-black text-white text-center py-2 text-sm px-4">
                    <p>{settings.announcement_bar_text}</p>
                </div>
            )}

            {/* Hero Section - Modern & Clean */}
            <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
                <div className="container-custom py-20 md:py-32 relative z-10">
                    <div className="max-w-3xl animate-fade-in-up">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            {settings.hero_title || 'Premium Watches'}<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                                {settings.hero_subtitle || '& Accessories'}
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl">
                            {settings.hero_description || 'Discover authentic timepieces and luxury accessories from top brands'}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/products"
                                className="bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                            >
                                {settings.hero_cta_primary || 'Shop Now'}
                            </Link>
                            <Link
                                to="/about"
                                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-all"
                            >
                                {settings.hero_cta_secondary || 'Learn More'}
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                    <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-40 w-96 h-96 bg-orange-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
            </section>

            {/* Brand Logos Section */}
            <section className="py-12 bg-gray-50 border-y border-gray-200">
                <div className="container-custom">
                    <div className="flex items-center justify-center gap-12 flex-wrap opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {brands.length > 0 ? (
                            brands.map(brand => (
                                brand.logo_url ? (
                                    <img key={brand.id} src={brand.logo_url} alt={brand.name} className="h-12 object-contain" />
                                ) : (
                                    <div key={brand.id} className="text-2xl font-bold text-gray-800">{brand.name}</div>
                                )
                            ))
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-gray-800">CASIO</div>
                                <div className="text-2xl font-bold text-gray-800">TIMEX</div>
                                <div className="text-2xl font-bold text-gray-800">SEIKO</div>
                                <div className="text-2xl font-bold text-gray-800">CITIZEN</div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4 font-display">Featured Products</h2>
                        <p className="text-gray-600 text-lg">Handpicked collection of our best sellers</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-4"></div>
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
                                    className="group block"
                                >
                                    <div className="relative overflow-hidden rounded-lg mb-4 bg-gray-100 aspect-[3/4]">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        {product.stock < 5 && product.stock > 0 && (
                                            <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                                                Only {product.stock} left
                                            </span>
                                        )}
                                        {/* Quick Add Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent">
                                            <button className="w-full bg-white text-black font-semibold py-2 rounded shadow hover:bg-gray-100 text-sm">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{product.category}</p>
                                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-amber-600 transition-colors h-10">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-lg font-bold text-gray-900">
                                                Rs {product.price.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? 'text-amber-400' : 'text-gray-300'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                            <span className="text-xs text-gray-500 ml-1">({product.rating || 0})</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link
                            to="/products"
                            className="inline-block bg-black text-white px-10 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
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
                        <Link to="/products?category=Watches" className="group relative overflow-hidden rounded-xl h-64 shadow-lg">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-600 transition-transform duration-500 group-hover:scale-105"></div>
                            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                                <h3 className="text-3xl font-bold mb-2 font-display">Watches</h3>
                                <p className="text-blue-100 mb-4 text-sm uppercase tracking-wider">Premium timepieces</p>
                                <span className="text-sm font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center">
                                    Shop Collection <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </span>
                            </div>
                        </Link>
                        <Link to="/products?category=Accessories" className="group relative overflow-hidden rounded-xl h-64 shadow-lg">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-700 to-amber-500 transition-transform duration-500 group-hover:scale-105"></div>
                            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                                <h3 className="text-3xl font-bold mb-2 font-display">Accessories</h3>
                                <p className="text-amber-100 mb-4 text-sm uppercase tracking-wider">Wallets & Belts</p>
                                <span className="text-sm font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center">
                                    Shop Collection <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </span>
                            </div>
                        </Link>
                        <Link to="/products?category=Beauty" className="group relative overflow-hidden rounded-xl h-64 shadow-lg">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-700 to-purple-600 transition-transform duration-500 group-hover:scale-105"></div>
                            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                                <h3 className="text-3xl font-bold mb-2 font-display">Beauty</h3>
                                <p className="text-pink-100 mb-4 text-sm uppercase tracking-wider">Cosmetics & Care</p>
                                <span className="text-sm font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center">
                                    Shop Collection <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border rounded-2xl p-8 bg-gray-50 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-3xl">
                                ✨
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">100% Authentic</h3>
                                <p className="text-gray-600 text-sm">All products are genuine and verified</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-3xl">
                                🚚
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">Fast Delivery</h3>
                                <p className="text-gray-600 text-sm">Free shipping over Rs 10,000</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-3xl">
                                🔒
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">Secure Payment</h3>
                                <p className="text-gray-600 text-sm">JazzCash, EasyPaisa & Cards</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
