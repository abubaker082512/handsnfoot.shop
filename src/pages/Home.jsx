import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'
import { mockProducts } from '../utils/mockProducts'

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
            // Use mock data as fallback (PKR products from Zamana.pk)
            const featuredMock = mockProducts.filter(p => p.featured).slice(0, 8)
            setFeaturedProducts(featuredMock)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Announcement Bar - Luxury styling */}
            <div className="bg-black text-primary-400 text-center py-2.5 text-xs px-4 font-semibold tracking-widest border-b border-primary-500/20">
                <p>✨ FREE NATIONWIDE DELIVERY ON ALL ORDERS ABOVE RS. 3,000 | 100% AUTHENTIC GUARANTEE</p>
            </div>

            {/* Hero Section - High contrast black & gold luxury styling */}
            <section className="relative hero-gradient text-white overflow-hidden py-24 md:py-36 border-b border-gray-900">
                <div className="container-custom relative z-10">
                    <div className="max-w-4xl mx-auto text-center animate-fade-in">
                        <span className="text-primary-500 font-display font-semibold uppercase tracking-widest text-sm mb-4 inline-block">
                            Premium Curated Collection
                        </span>
                        <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight tracking-tight uppercase">
                            Timeless Elegance <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-300 to-primary-500">
                                Crafted For You
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                            Discover our exquisite range of Japanese Casio watches, hand-stitched leather wallets, and premium beauty products. Designed for those who value authenticity and style.
                        </p>
                        <div className="flex flex-wrap justify-center gap-5">
                            <Link
                                to="/products"
                                className="bg-primary-500 text-black px-10 py-4 rounded-lg font-bold hover:bg-primary-400 transition-all duration-300 shadow-xl hover:shadow-primary-500/10 transform hover:scale-105 active:scale-95 text-sm uppercase tracking-wider"
                            >
                                Shop Collection
                            </Link>
                            <Link
                                to="/about"
                                className="border border-white/30 text-white px-10 py-4 rounded-lg font-semibold hover:bg-white hover:text-black hover:border-white transition-all duration-300 text-sm uppercase tracking-wider"
                            >
                                Our Story
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Ambient Golden Light Gradients */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-600/15 rounded-full blur-3xl animate-pulse-slow"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
                </div>
            </section>

            {/* Value / Trust Badges Section - Clean, minimal layout */}
            <section className="py-12 bg-gray-50 border-b border-gray-100">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex items-start gap-4 p-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 text-2xl">
                                🛡️
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 mb-1 uppercase tracking-wider">100% Authentic</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">Direct imports of original Casio timepieces & curated beauty cosmetics.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 text-2xl">
                                🚚
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 mb-1 uppercase tracking-wider">Nationwide Delivery</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">Free secure shipping inside Pakistan for all order values over Rs 3,000.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 text-2xl">
                                💳
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 mb-1 uppercase tracking-wider">Secure Checkout</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">Settle orders smoothly via JazzCash card, mobile wallet, or COD.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Shop by Collection - Visual categories inspired by zamana.pk */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">Premium Categories</span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2">Shop by Collection</h2>
                        <div className="w-12 h-0.5 bg-primary-500 mx-auto mt-4"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <Link to="/products?category=Watches" className="group relative overflow-hidden rounded-xl h-80 shadow-md">
                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80')" }}></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-10">
                                <span className="text-primary-400 text-xs font-semibold uppercase tracking-wider mb-1">Timepieces</span>
                                <h3 className="text-2xl font-bold font-display uppercase tracking-wide">Premium Watches</h3>
                                <span className="text-sm text-gray-300 mt-4 group-hover:text-primary-400 transition-colors inline-flex items-center">
                                    View Products <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </span>
                            </div>
                        </Link>

                        <Link to="/products?category=Accessories" className="group relative overflow-hidden rounded-xl h-80 shadow-md">
                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: "url('https://www.zamana.pk/cdn/shop/files/the-vertical-vogue-a-bifold-leather-wallet-brown-color-716913.webp?v=1719766381')" }}></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-10">
                                <span className="text-primary-400 text-xs font-semibold uppercase tracking-wider mb-1">Leather Goods</span>
                                <h3 className="text-2xl font-bold font-display uppercase tracking-wide">Wallets & Accessories</h3>
                                <span className="text-sm text-gray-300 mt-4 group-hover:text-primary-400 transition-colors inline-flex items-center">
                                    View Products <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </span>
                            </div>
                        </Link>

                        <Link to="/products?category=Beauty" className="group relative overflow-hidden rounded-xl h-80 shadow-md">
                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: "url('https://www.zamana.pk/cdn/shop/files/mekeyxecret-natural-long-lasting-liquid-blush-734412.jpg?v=1719767529')" }}></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-10">
                                <span className="text-primary-400 text-xs font-semibold uppercase tracking-wider mb-1">Cosmetics</span>
                                <h3 className="text-2xl font-bold font-display uppercase tracking-wide">Beauty & Care</h3>
                                <span className="text-sm text-gray-300 mt-4 group-hover:text-primary-400 transition-colors inline-flex items-center">
                                    View Products <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Products Section - Styled minimal with gold labels */}
            <section className="py-20 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">Customer Favorites</span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2">Trending Now</h2>
                        <div className="w-12 h-0.5 bg-primary-500 mx-auto mt-4"></div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse bg-white p-4 rounded-xl border border-gray-100">
                                    <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    to={`/products/${product.id}`}
                                    className="group bg-white p-4 rounded-xl border border-gray-100 hover:border-primary-500/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
                                >
                                    <div className="relative overflow-hidden rounded-lg mb-4 bg-gray-100 aspect-square flex-shrink-0">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {product.stock < 5 && product.stock > 0 && (
                                            <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                                                Only {product.stock} Left
                                            </span>
                                        )}
                                        {product.featured && (
                                            <span className="absolute top-2 left-2 bg-primary-500 text-black text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                                                Hot
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-grow">
                                        <p className="text-[10px] text-primary-600 uppercase tracking-widest font-semibold mb-1">{product.category}</p>
                                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-2 leading-snug">
                                            {product.name}
                                        </h3>
                                        
                                        {/* Rating */}
                                        <div className="flex items-center gap-1 mb-3 mt-auto">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? 'text-primary-500' : 'text-gray-200'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                            <span className="text-[10px] text-gray-500 font-medium ml-1">({product.rating || 0})</span>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                                            <span className="text-base font-bold text-gray-900">
                                                Rs {product.price.toLocaleString()}
                                            </span>
                                            <span className="text-[11px] font-semibold text-primary-600 group-hover:underline">
                                                Buy Now
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link
                            to="/products"
                            className="inline-block bg-black text-white hover:bg-primary-500 hover:text-black border border-black px-12 py-3.5 rounded-lg font-bold transition-all duration-300 shadow-md hover:shadow-xl text-sm uppercase tracking-wider"
                        >
                            View Entire Catalog
                        </Link>
                    </div>
                </div>
            </section>

            {/* Brand Showcase Banner - High-end gold and black statement */}
            <section className="bg-black text-white py-20 px-4 relative overflow-hidden border-t border-primary-500/10">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <span className="text-primary-500 uppercase tracking-widest text-xs font-semibold mb-4 inline-block">Crafted for Excellence</span>
                    <h2 className="text-3xl md:text-5xl font-display font-bold uppercase mb-6 tracking-wide">Where Luxury Meets Durability</h2>
                    <p className="text-gray-400 font-light text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                        At Hands & Foot Shop, we merge the precision of Japanese horology with the timeless charm of hand-stitched leather. Each item is selected to give you confidence and elevate your styling.
                    </p>
                    <div className="w-16 h-0.5 bg-primary-500 mx-auto"></div>
                </div>
                {/* Visual Ambient Gold Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
            </section>
        </div>
    )
}

export default Home
