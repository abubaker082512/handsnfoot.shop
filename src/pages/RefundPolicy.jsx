const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container-custom max-w-4xl">
                <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
                    <h1 className="text-4xl font-display font-bold gradient-text mb-4">
                        💰 Refund & Return Policy
                    </h1>
                    <p className="text-gray-600 mb-8">
                        <strong>Last Updated:</strong> January 5, 2026
                    </p>

                    <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
                        <p>
                            At HandsnFoot, we want you to be completely satisfied with your purchase. If for any reason you are not happy with your order, we're here to help.
                        </p>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                1. Eligibility for Returns
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Returns must be initiated within <strong>15 days of delivery</strong>.</li>
                                <li>Items must be unused, in original condition, and in the original packaging.</li>
                                <li>Proof of purchase is required.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                2. Items Not Eligible for Return
                            </h2>
                            <p>Certain products cannot be returned, including:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Gift cards;</li>
                                <li>Personalized or custom items;</li>
                                <li>Items marked as "Final Sale."</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                3. How to Request a Return
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    Email us at{' '}
                                    <a href="mailto:info@handsnfoot.shop" className="text-primary-600 hover:text-primary-700 font-semibold">
                                        info@handsnfoot.shop
                                    </a>{' '}
                                    with your order number and return reason.
                                </li>
                                <li>We will provide return instructions.</li>
                                <li>Return shipping is paid by the customer, unless the return is due to our error (e.g., wrong item shipped).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                4. Refunds
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Once we receive and inspect the returned item, we'll notify you of your refund status.</li>
                                <li>If approved, refunds are issued to the original method of payment.</li>
                                <li>Shipping charges are non-refundable, except when we made an error.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                5. Exchanges
                            </h2>
                            <p>
                                If you'd like an exchange (e.g., size or color), contact us with your preferences and we'll assist with the process.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                6. Processing Time
                            </h2>
                            <p>
                                Refunds and exchanges may take up to <strong>7–10 business days</strong> after we receive your return. Processing times may vary depending on your payment provider.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                7. Questions?
                            </h2>
                            <div className="bg-primary-50 p-6 rounded-lg mt-4">
                                <p className="text-gray-900">
                                    Contact us anytime via{' '}
                                    <a href="mailto:info@handsnfoot.shop" className="text-primary-600 hover:text-primary-700 font-semibold">
                                        info@handsnfoot.shop
                                    </a>
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RefundPolicy
