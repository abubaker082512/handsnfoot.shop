const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container-custom max-w-4xl">
                <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
                    <h1 className="text-4xl font-display font-bold gradient-text mb-4">
                        🛡️ Privacy Policy
                    </h1>
                    <p className="text-gray-600 mb-8">
                        <strong>Effective Date:</strong> January 5, 2026
                    </p>

                    <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
                        <p>
                            Thank you for visiting HandsnFoot ("we," "us," or "our"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, share, and safeguard your information when you visit or purchase from{' '}
                            <a href="https://www.handsnfoot.shop/" className="text-primary-600 hover:text-primary-700">
                                https://www.handsnfoot.shop/
                            </a>{' '}
                            (the "Site").
                        </p>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                1. Information We Collect
                            </h2>
                            <p>We collect information you provide directly when you:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Create an account or place an order (such as name, email, billing/shipping address, phone number);</li>
                                <li>Communicate with customer support;</li>
                                <li>Subscribe to newsletters.</li>
                            </ul>
                            <p className="mt-4">We also automatically collect:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Usage data (like pages viewed, time spent on site);</li>
                                <li>Device and log data (like IP address, browser type);</li>
                                <li>Cookies and similar tracking technologies.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                2. How We Use Your Information
                            </h2>
                            <p>We use your data to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Process and fulfill orders;</li>
                                <li>Send order updates, receipts, and customer service responses;</li>
                                <li>Improve our products, services, and site experience;</li>
                                <li>Personalize marketing, offers, and promotions;</li>
                                <li>Comply with legal obligations.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                3. Sharing Your Data
                            </h2>
                            <p>We may share your information with:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Third-party service providers (e.g., payment processors, shipping carriers);</li>
                                <li>Analytics partners;</li>
                                <li>Legal authorities when required by law.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                4. Cookies & Tracking
                            </h2>
                            <p>
                                Our site uses cookies and similar technologies to remember preferences and track activity to enhance your experience. You can manage cookie settings through your browser.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                5. Your Rights
                            </h2>
                            <p>
                                Depending on your location, you may have rights to access, correct, delete, or restrict use of your personal data. Contact us below to exercise any rights.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                6. Data Security
                            </h2>
                            <p>
                                We implement reasonable safeguards to protect your information. However, no method of transmission over the internet is 100% secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                7. Changes to This Policy
                            </h2>
                            <p>
                                We may update this policy at any time. The "Effective Date" above will reflect when the last changes were made.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mt-8 mb-4">
                                8. Contact Us
                            </h2>
                            <p>
                                If you have any questions about this Privacy Policy or your data, please contact:
                            </p>
                            <div className="bg-gray-50 p-6 rounded-lg mt-4">
                                <p className="font-semibold text-gray-900">HandsnFoot</p>
                                <p className="mt-2">
                                    📧 Email:{' '}
                                    <a href="mailto:info@handsnfoot.shop" className="text-primary-600 hover:text-primary-700">
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

export default PrivacyPolicy
