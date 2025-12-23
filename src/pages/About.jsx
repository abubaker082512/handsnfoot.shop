import HeroSlider from '../components/HeroSlider'
import FeaturedProducts from '../components/FeaturedProducts'
import TopProducts from '../components/TopProducts'

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-20">
                <div className="container-custom text-center">
                    <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
                        About HandsnFoot
                    </h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        Your trusted destination for luxury watches and premium footwear since 2020
                    </p>
                </div>
            </section>

            {/* Brand Story */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-display font-bold mb-6 gradient-text text-center">
                            Our Story
                        </h2>
                        <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                            <p>
                                HandsnFoot was born from a passion for timeless elegance and exceptional craftsmanship.
                                We believe that the accessories you wear—from the watch on your wrist to the shoes on
                                your feet—tell your unique story.
                            </p>
                            <p>
                                Our journey began with a simple mission: to curate the finest collection of luxury
                                watches and premium footwear that combine style, quality, and comfort. Every product
                                in our collection is carefully selected to meet our exacting standards.
                            </p>
                            <p>
                                Today, we're proud to serve thousands of customers worldwide who trust us to deliver
                                not just products, but experiences that elevate their everyday lives.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Statement */}
            <section className="py-16 bg-gray-50">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-display font-bold mb-6 gradient-text">
                            Our Mission
                        </h2>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            To provide our customers with exceptional products that blend luxury, functionality,
                            and style. We're committed to offering an unparalleled shopping experience backed by
                            outstanding customer service and a dedication to quality that never compromises.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <h2 className="text-4xl font-display font-bold mb-12 gradient-text text-center">
                        Our Values
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card p-8 text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold mb-3">Quality First</h3>
                            <p className="text-gray-600">
                                We never compromise on quality. Every product meets our rigorous standards.
                            </p>
                        </div>

                        <div className="card p-8 text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold mb-3">Customer Focused</h3>
                            <p className="text-gray-600">
                                Your satisfaction is our priority. We're here to serve you every step of the way.
                            </p>
                        </div>

                        <div className="card p-8 text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold mb-3">Innovation</h3>
                            <p className="text-gray-600">
                                We constantly evolve to bring you the latest trends and timeless classics.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 bg-gray-50">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-display font-bold mb-6 gradient-text">
                            Get In Touch
                        </h2>
                        <p className="text-lg text-gray-700 mb-8">
                            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="card p-6">
                                <svg className="w-8 h-8 text-primary-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <h3 className="font-semibold mb-2">Email</h3>
                                <p className="text-gray-600">info@handsnfoot.shop</p>
                            </div>

                            <div className="card p-6">
                                <svg className="w-8 h-8 text-primary-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <h3 className="font-semibold mb-2">Phone</h3>
                                <p className="text-gray-600">+1 (555) 123-4567</p>
                            </div>

                            <div className="card p-6">
                                <svg className="w-8 h-8 text-primary-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <h3 className="font-semibold mb-2">Address</h3>
                                <p className="text-gray-600">123 Fashion Street, New York, NY 10001</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default About
