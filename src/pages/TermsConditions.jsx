const TermsConditions = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container-custom max-w-4xl">
                <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
                    <h1 className="text-4xl font-display font-bold gradient-text mb-4">
                        ⚖️ Terms & Conditions
                    </h1>
                    <p className="text-gray-600 mb-8">
                        <strong>Effective Date:</strong> July 14, 2026
                    </p>

                    <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
                        <p>
                            Welcome to HandsnFoot. By accessing or using our website (https://www.handsnfoot.shop/), you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully.
                        </p>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                1. Overview & Acceptance of Terms
                            </h2>
                            <p>
                                This website is operated by HandsnFoot. Throughout the site, the terms "we," "us," and "our" refer to HandsnFoot. By placing an order, browsing our website, or using our services, you engage in our "Service" and agree to be bound by these terms, including any additional policies referenced herein or available by hyperlink.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                2. Product Range & Catalog
                            </h2>
                            <p>
                                We offer a <strong>Complete Range Of Products</strong> including premium timepieces, luxury watches, stylish footwear, and related accessories. We strive to exhibit the colors and details of our items as accurately as possible; however, actual colors may vary slightly depending on your screen settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                3. Pricing and Payments (PKR)
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>All product prices, delivery costs, and transactions are displayed and processed exclusively in <strong>Pakistani Rupees (PKR)</strong>.</li>
                                <li>We reserve the right to modify prices or adjust product availability at any time without prior notice.</li>
                                <li>We accept secure payments through JazzCash (Mobile Wallet and Debit/Credit Cards) and other payment options as displayed at checkout.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                4. Order Acceptance and Verification
                            </h2>
                            <p>
                                We reserve the right to refuse or cancel any order. We may limit or cancel quantities purchased per person, per household, or per order. If we make changes to or cancel an order, we will attempt to notify you via the email, billing address, or phone number provided at the time the order was placed.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                5. Accuracy of Billing & Account Information
                            </h2>
                            <p>
                                You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store. You agree to promptly update your account and other information, including your email address, phone number, and delivery details, so that we can complete your transactions and contact you as needed.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                6. Shipping & Return Policies
                            </h2>
                            <p>
                                Your purchases are subject to our standard <a href="/shipping-policy" className="text-primary-600 hover:text-primary-700 font-semibold">Shipping Policy</a> and our <a href="/refund-policy" className="text-primary-600 hover:text-primary-700 font-semibold">Refund & Return Policy</a>. Please review those pages for details on shipping options, PKR refund terms, and timescales.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                7. Contact Details
                            </h2>
                            <div className="bg-gray-50 p-6 rounded-lg mt-4 space-y-2 text-gray-900">
                                <p className="font-semibold text-lg">If you have any questions regarding these Terms & Conditions, please contact us at:</p>
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

export default TermsConditions
