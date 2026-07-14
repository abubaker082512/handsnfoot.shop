import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'
import { mockProducts } from '../utils/mockProducts'
import ProductCard from '../components/ProductCard'
import HeroSlider from '../components/HeroSlider'

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

            {/* Hero Slider Carousel */}
            <HeroSlider />

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
                                <ProductCard key={product.id} product={product} />
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
