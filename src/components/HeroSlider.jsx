import { useState, useEffect } from 'react'

const slides = [
    {
        id: 1,
        title: 'Luxury Watches',
        subtitle: 'Timeless Elegance on Your Wrist',
        description: 'Discover our premium collection of luxury timepieces',
        cta: 'Shop Watches',
        link: '/products?category=Watches',
        bgGradient: 'from-blue-600 to-purple-700',
    },
    {
        id: 2,
        title: 'Premium Footwear',
        subtitle: 'Step Into Style & Comfort',
        description: 'Explore our exclusive range of designer shoes',
        cta: 'Shop Footwear',
        link: '/products?category=Footwear',
        bgGradient: 'from-purple-600 to-pink-700',
    },
    {
        id: 3,
        title: 'New Arrivals',
        subtitle: 'Fresh Styles Just Dropped',
        description: 'Be the first to own our latest collections',
        cta: 'Explore Now',
        link: '/products',
        bgGradient: 'from-pink-600 to-red-700',
    },
]

const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000)

        return () => clearInterval(timer)
    }, [])

    const goToSlide = (index) => {
        setCurrentSlide(index)
    }

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }

    return (
        <div className="relative h-[500px] md:h-[600px] overflow-hidden">
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <div className={`w-full h-full bg-gradient-to-r ${slide.bgGradient} flex items-center`}>
                        <div className="container-custom">
                            <div className="max-w-2xl text-white animate-slide-up">
                                <h2 className="text-5xl md:text-7xl font-display font-bold mb-4">
                                    {slide.title}
                                </h2>
                                <p className="text-2xl md:text-3xl font-semibold mb-4">
                                    {slide.subtitle}
                                </p>
                                <p className="text-lg md:text-xl mb-8 text-white/90">
                                    {slide.description}
                                </p>
                                <a
                                    href={slide.link}
                                    className="btn bg-white text-gray-900 hover:bg-gray-100 inline-block"
                                >
                                    {slide.cta}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 z-10"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 z-10"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'bg-white w-8'
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}

export default HeroSlider
