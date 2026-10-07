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
            const queryPromise = supabase
                .from('products')
                .select('*')
                .eq('featured', true)
                .limit(8)

            const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 3000, { timeout: true }))

            const result = await Promise.race([queryPromise, timeoutPromise])

            let dbProducts = []
            if (result && !result.timeout && !result.error && Array.isArray(result.data)) {
                dbProducts = result.data
            }

            const featuredMock = mockProducts.filter(p => p.featured)
            const combined = [...dbProducts, ...featuredMock]
            const uniqueProducts = []
            const seenKeys = new Set()

            for (const item of combined) {
                if (!item) continue
                const key = item.name ? item.name.toLowerCase().trim() : item.id
                if (!seenKeys.has(key)) {
                    seenKeys.add(key)
                    uniqueProducts.push(item)
                }
            }

            setFeaturedProducts(uniqueProducts.slice(0, 12))
        } catch (error) {
            console.error('Error fetching products:', error)
            const featuredMock = mockProducts.filter(p => p.featured).slice(0, 12)
            setFeaturedProducts(featuredMock.length > 0 ? featuredMock : mockProducts.slice(0, 12))
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

            {/* Brand Logos Bar */}
            <section className="py-8 bg-gray-900 text-white border-y border-gray-800">
                <div className="container-custom">
                    <p className="text-center text-xs uppercase tracking-widest text-amber-400 font-semibold mb-6">CURATED PREMIUM BRANDS & ARTISAN COLLECTIONS</p>
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-80 text-sm font-bold tracking-widest uppercase">
                        <span className="hover:text-amber-400 transition-colors">CASIO</span>
                        <span className="hover:text-amber-400 transition-colors">CITIZEN</span>
                        <span className="hover:text-amber-400 transition-colors">G-SHOCK</span>
                        <span className="hover:text-amber-400 transition-colors">ZEESY JEWELS</span>
                        <span className="hover:text-amber-400 transition-colors">LEATHER CRAFTS</span>
                        <span className="hover:text-amber-400 transition-colors">SLAZENGER</span>
                    </div>
                </div>
            </section>

            {/* Shop by Collection - Visual categories */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <span className="text-amber-600 font-semibold text-xs uppercase tracking-widest">Featured Collections</span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2">Shop by Category</h2>
                        <div className="w-12 h-0.5 bg-amber-500 mx-auto mt-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Link to="/products?category=Jewelry" className="group relative overflow-hidden rounded-2xl h-96 shadow-lg">
                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "url('https://cdn.shopify.com/s/files/1/0667/9606/0977/files/OceanWaveZirconBangles-Purple-2.webp?v=1791289290')" }}></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-10">
                                <span className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">Royalty & Grace</span>
                                <h3 className="text-2xl font-bold font-display uppercase tracking-wide">Jewelry & Ornaments</h3>
                                <span className="text-sm text-gray-300 mt-4 group-hover:text-amber-400 transition-colors inline-flex items-center font-semibold">
                                    Explore Jewelry Collection <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </span>
                            </div>
                        </Link>

                        <Link to="/products?category=Watches" className="group relative overflow-hidden rounded-2xl h-96 shadow-lg">
                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80')" }}></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-10">
                                <span className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">Timepieces</span>
                                <h3 className="text-2xl font-bold font-display uppercase tracking-wide">Premium Watches</h3>
                                <span className="text-sm text-gray-300 mt-4 group-hover:text-amber-400 transition-colors inline-flex items-center font-semibold">
                                    Explore Watches Collection <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </span>
                            </div>
                        </Link>

                        <Link to="/products?category=Accessories" className="group relative overflow-hidden rounded-2xl h-96 shadow-lg">
                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80')" }}></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-10">
                                <span className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">Leather Craftsmanship</span>
                                <h3 className="text-2xl font-bold font-display uppercase tracking-wide">Wallets & Accessories</h3>
                                <span className="text-sm text-gray-300 mt-4 group-hover:text-amber-400 transition-colors inline-flex items-center font-semibold">
                                    Explore Leather Accessories <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-20 bg-gray-50 border-t border-gray-100">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <span className="text-amber-600 font-semibold text-xs uppercase tracking-widest">Handpicked Favorites</span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2">Trending Now</h2>
                        <div className="w-12 h-0.5 bg-amber-500 mx-auto mt-4"></div>
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
                            className="inline-block bg-gray-900 text-white hover:bg-amber-500 hover:text-gray-900 px-10 py-4 rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-xl text-xs uppercase tracking-widest"
                        >
                            View Entire Catalog ({mockProducts.length.toLocaleString()}+ Items)
                        </Link>
                    </div>
                </div>
            </section>

            {/* Customer Reviews Section */}
            <section className="py-16 bg-white border-t border-gray-100">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <span className="text-amber-600 font-semibold text-xs uppercase tracking-widest">Verified Feedback</span>
                        <h2 className="text-3xl font-display font-bold text-gray-900 mt-2">What Our Customers Say</h2>
                        <div className="w-12 h-0.5 bg-amber-500 mx-auto mt-4"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-xs">
                            <div className="flex text-amber-400 mb-3 text-sm">★★★★★</div>
                            <p className="text-gray-700 text-sm italic mb-4">"The Kundan set arrived in 2 days in Lahore. Beautiful craftsmanship, exactly as shown in photos. Premium packaging!"</p>
                            <p className="font-bold text-gray-900 text-xs uppercase tracking-wider">Zainab M., Lahore</p>
                            <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">✓ Verified Buyer</span>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-xs">
                            <div className="flex text-amber-400 mb-3 text-sm">★★★★★</div>
                            <p className="text-gray-700 text-sm italic mb-4">"100% original Casio Enticer watch with official warranty card. Super fast delivery in Karachi via JazzCash payment."</p>
                            <p className="font-bold text-gray-900 text-xs uppercase tracking-wider">Hamza A., Karachi</p>
                            <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">✓ Verified Buyer</span>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-xs">
                            <div className="flex text-amber-400 mb-3 text-sm">★★★★★</div>
                            <p className="text-gray-700 text-sm italic mb-4">"Top notch genuine leather bifold wallet. Premium finish and stitch quality. Will definitely order again!"</p>
                            <p className="font-bold text-gray-900 text-xs uppercase tracking-wider">Usman K., Islamabad</p>
                            <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">✓ Verified Buyer</span>
                        </div>
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
