import Logo from '../components/Logo'

const LogoPreview = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container-custom">
                <h1 className="text-4xl font-display font-bold text-center mb-12">
                    HandsnFoot Logo Preview
                </h1>

                {/* Full Logo on White */}
                <div className="bg-white rounded-xl shadow-lg p-12 mb-8">
                    <h2 className="text-xl font-semibold mb-6 text-gray-700">Full Logo - White Background</h2>
                    <div className="flex items-center justify-center">
                        <Logo className="h-16 w-auto" variant="full" />
                    </div>
                </div>

                {/* Full Logo on Dark */}
                <div className="bg-gray-900 rounded-xl shadow-lg p-12 mb-8">
                    <h2 className="text-xl font-semibold mb-6 text-white">Full Logo - Dark Background</h2>
                    <div className="flex items-center justify-center">
                        <Logo className="h-16 w-auto" variant="full" />
                    </div>
                </div>

                {/* Icon Only */}
                <div className="bg-white rounded-xl shadow-lg p-12 mb-8">
                    <h2 className="text-xl font-semibold mb-6 text-gray-700">Icon Only (for mobile/favicon)</h2>
                    <div className="flex items-center justify-center gap-8">
                        <div className="text-center">
                            <Logo className="h-16 w-16" variant="icon" />
                            <p className="text-sm text-gray-500 mt-2">Large (64px)</p>
                        </div>
                        <div className="text-center">
                            <Logo className="h-12 w-12" variant="icon" />
                            <p className="text-sm text-gray-500 mt-2">Medium (48px)</p>
                        </div>
                        <div className="text-center">
                            <Logo className="h-8 w-8" variant="icon" />
                            <p className="text-sm text-gray-500 mt-2">Small (32px)</p>
                        </div>
                    </div>
                </div>

                {/* Different Sizes */}
                <div className="bg-white rounded-xl shadow-lg p-12 mb-8">
                    <h2 className="text-xl font-semibold mb-6 text-gray-700">Different Sizes</h2>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Logo className="h-20 w-auto" variant="full" />
                            <span className="text-sm text-gray-500">Extra Large (80px)</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Logo className="h-12 w-auto" variant="full" />
                            <span className="text-sm text-gray-500">Large (48px)</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Logo className="h-8 w-auto" variant="full" />
                            <span className="text-sm text-gray-500">Medium (32px) - Navbar Size</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Logo className="h-6 w-auto" variant="full" />
                            <span className="text-sm text-gray-500">Small (24px)</span>
                        </div>
                    </div>
                </div>

                {/* Logo Description */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Logo Design Elements</h2>
                    <div className="space-y-4 text-gray-600">
                        <div className="flex items-start gap-3">
                            <span className="text-primary-600 font-bold">🕐</span>
                            <div>
                                <strong>Watch Element:</strong> Circular watch face with hands representing luxury timepieces
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-primary-600 font-bold">👟</span>
                            <div>
                                <strong>Footwear Element:</strong> Stylized shoe silhouette representing premium footwear
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-primary-600 font-bold">🎨</span>
                            <div>
                                <strong>Color Gradient:</strong> Blue to purple gradient (#667eea → #764ba2) for premium feel
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-primary-600 font-bold">✨</span>
                            <div>
                                <strong>Typography:</strong> Modern Outfit font with bold "Hands" and "Foot" connected by elegant "n"
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-primary-600 font-bold">🔗</span>
                            <div>
                                <strong>Connection:</strong> Dotted line connecting watch and shoe symbolizing the brand unity
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LogoPreview
