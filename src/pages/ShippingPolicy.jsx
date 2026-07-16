const ShippingPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container-custom max-w-4xl">
                <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
                    <h1 className="text-4xl font-display font-bold gradient-text mb-4">
                        📦 Service & Shipping Policy
                    </h1>
                    <p className="text-gray-600 mb-8">
                        <strong>Effective Date:</strong> July 14, 2026
                    </p>

                    <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
                        <p>
                            At HandsnFoot, we are proud to offer nationwide shipping and premium courier service for our <strong>Complete Range Of Products</strong>. Our goal is to ensure your purchase arrives safely, securely, and in a timely manner.
                        </p>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                1. Shipping Scope
                            </h2>
                            <p>
                                We ship to all major cities and towns across Pakistan. Whether you order luxury watches, premium footwear, or accessories, we deliver directly to your doorstep.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                2. Currency & Pricing (PKR)
                            </h2>
                            <p>
                                All prices listed on our website, including shipping fees and delivery surcharges, are in <strong>Pakistani Rupees (PKR)</strong>. Payments must be settled in PKR at checkout or upon Cash on Delivery (COD) if applicable.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                3. Delivery Timelines
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Islamabad & Rawalpindi:</strong> 1–2 business days.</li>
                                <li><strong>Other Cities (Lahore, Karachi, Faisalabad, etc.):</strong> 2–4 business days.</li>
                                <li><strong>Remote Areas:</strong> 4–7 business days.</li>
                            </ul>
                            <p className="mt-4 text-sm text-gray-500">
                                Note: Deliveries may be subject to minor delays during public holidays, extreme weather events, or high-volume sale periods.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                4. Shipping Charges
                            </h2>
                            <p>
                                Shipping charges are calculated at checkout based on order value, weight, and delivery address. We offer flat-rate shipping on standard orders, and promotional free shipping may apply for orders above a certain threshold (as highlighted on the website).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                5. Order Tracking & Status Updates
                            </h2>
                            <p>
                                Once your order is processed and handed to our delivery partner, you will receive a tracking link via email or SMS. You can use this link to monitor your shipment in real-time.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                6. Inquiries and Support
                            </h2>
                            <div className="bg-primary-50 p-6 rounded-lg mt-4 space-y-2 text-gray-900">
                                <p className="font-semibold text-lg">For shipping support, contact us:</p>
                                <p>
                                    📞 <strong>Phone:</strong>{' '}
                                    <a href="tel:+923280801100" className="text-primary-600 hover:text-primary-700 font-semibold">
                                        +92-328-0801100
                                    </a>
                                </p>
                                <p>
                                    📧 <strong>Email:</strong>{' '}
                                    <a href="mailto:info@handsnfoot.shop" className="text-primary-600 hover:text-primary-700 font-semibold">
                                        info@handsnfoot.shop
                                    </a>
                                </p>
                                <p>
                                    📍 <strong>Address:</strong> 21, Mobile Arena, SOAN Garden, Islamabad
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShippingPolicy
