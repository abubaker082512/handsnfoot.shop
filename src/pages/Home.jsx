import HeroSlider from '../components/HeroSlider'
import FeaturedProducts from '../components/FeaturedProducts'
import TopProducts from '../components/TopProducts'
import { Link } from 'react-router-dom'

const Home = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <HeroSlider />

            {/* Featured Products */}
            <FeaturedProducts />

            {/* Top Products */}
            <TopProducts />

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
                <div className="container-custom text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                        Discover Your Perfect Style
                    </h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Explore our complete collection of luxury watches and premium footwear
                    </p>
                    <Link to="/products" className="btn bg-white text-gray-900 hover:bg-gray-100 text-lg">
                        Shop All Products
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
                            <p className="text-gray-600">
                                All products are carefully selected for superior quality and craftsmanship
                            </p>
                        </div>

                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Fast Shipping</h3>
                            <p className="text-gray-600">
                                Free express shipping on all orders over Rs 10,000
                            </p>
                        </div>

                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
                            <p className="text-gray-600">
                                Your payment information is always safe and secure
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
