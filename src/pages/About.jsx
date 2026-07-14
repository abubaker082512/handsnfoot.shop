import HeroSlider from '../components/HeroSlider'
import FeaturedProducts from '../components/FeaturedProducts'
import TopProducts from '../components/TopProducts'

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-black text-white py-20 border-b border-primary-500/10">
                <div className="container-custom text-center">
                    <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 uppercase tracking-wider text-primary-500">
                        About Us
                    </h1>
                    <p className="text-xl max-w-3xl mx-auto text-gray-300 font-light">
                        Welcome to Handsnfoot.shop — your trusted destination for premium hand and foot care products online!
                    </p>
                </div>
            </section>

            {/* Brand Story & Mission */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div>
                            <h2 className="text-3xl font-display font-bold mb-4 text-gray-900 uppercase tracking-wide">
                                Who We Are
                            </h2>
                            <p className="text-gray-700 text-lg leading-relaxed font-sans">
                                Handsnfoot.shop is proudly a sub-business of Sheikh Abu Baker Group, a sole proprietorship officially registered and committed to bringing quality products to our customers with integrity and care. As part of the Sheikh Abu Baker Group family, we uphold strong values of honesty, reliability, and customer satisfaction in everything we do.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-3xl font-display font-bold mb-4 text-gray-900 uppercase tracking-wide">
                                What We Offer
                            </h2>
                            <p className="text-gray-700 text-lg leading-relaxed font-sans">
                                At Handsnfoot.shop, we specialize in an extensive range of hand and foot care solutions designed to keep your skin soft, smooth, healthy, and beautiful. Our catalog includes nourishing creams and lotions, brightening and moisturizing treatments, exfoliating scrubs, serums, pedicure tools and kits, and more — all carefully selected to meet your everyday self-care needs.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-3xl font-display font-bold mb-4 text-gray-900 uppercase tracking-wide">
                                Our Promise
                            </h2>
                            <p className="text-gray-700 text-lg leading-relaxed font-sans">
                                Whether you’re looking to soothe dry skin, soften rough patches, rejuvenate tired hands and feet, or enhance your overall skin care routine, our products are sourced to deliver effective results for all skin types. We are dedicated to providing high-quality products, reliable delivery, and exceptional customer service that you can always count on.
                            </p>
                            <p className="text-gray-700 text-lg leading-relaxed mt-4 font-medium text-center italic">
                                Thank you for choosing Handsnfoot.shop — where your comfort and confidence come first!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 bg-gray-50">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-display font-bold mb-6 text-gray-900 uppercase tracking-wide">
                            Get In Touch
                        </h2>
                        <p className="text-lg text-gray-700 mb-8 font-sans">
                            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                            <div className="card p-6 border border-gray-100 shadow-sm bg-white">
                                <svg className="w-8 h-8 text-primary-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <h3 className="font-semibold mb-2">Email</h3>
                                <p className="text-gray-600">info@handsnfoot.shop</p>
                            </div>

                            <div className="card p-6 border border-gray-100 shadow-sm bg-white">
                                <svg className="w-8 h-8 text-primary-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <h3 className="font-semibold mb-2">Phone</h3>
                                <p className="text-gray-600">+92-328-0801100</p>
                            </div>

                            <div className="card p-6 border border-gray-100 shadow-sm bg-white">
                                <svg className="w-8 h-8 text-primary-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <h3 className="font-semibold mb-2">Address</h3>
                                <p className="text-gray-600">G-20, Mobile Arena, SOAN Avenue Road, SOAN Garden, Islamabad</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default About
