import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const slides = [
    {
        id: 1,
        title: 'TIMELESS ELEGANCE',
        subtitle: 'Premium Japanese Timepieces',
        description: 'Discover our exclusive range of original Casio watches designed for style, precision, and durability.',
        cta: 'Shop Watches',
        link: '/products?category=Watches',
        bgImage: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=1600&q=80',
    },
    {
        id: 2,
        title: 'HANDCRAFTED LUXURY',
        subtitle: 'Genuine Leather Wallets',
        description: 'Explore hand-stitched leather bi-folds, cardholders, and accessories crafted from the finest hides.',
        cta: 'Shop Accessories',
        link: '/products?category=Accessories',
        bgImage: 'https://www.zamana.pk/cdn/shop/files/the-vertical-vogue-a-bifold-leather-wallet-brown-color-716913.webp?v=1719766381',
    },
    {
        id: 3,
        title: 'GLOW & RADIANCE',
        subtitle: 'Luxury Cosmetics & Beauty',
        description: 'Elevate your daily routine with long-lasting liquid blushes, luminous highlighters, and mascaras.',
        cta: 'Shop Beauty',
        link: '/products?category=Beauty',
        bgImage: 'https://www.zamana.pk/cdn/shop/files/mekeyxecret-natural-long-lasting-liquid-blush-734412.jpg?v=1719767529',
    },
]

const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 6000)

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
        <div className="relative h-[480px] md:h-[620px] overflow-hidden bg-black border-b border-primary-500/10">
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-1000 transform ${index === currentSlide 
                        ? 'opacity-100 scale-100 pointer-events-auto' 
                        : 'opacity-0 scale-105 pointer-events-none'
                    }`}
                >
                    {/* Background Image with Dark Overlay */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] ease-out transform scale-100 group-hover:scale-105"
                        style={{ backgroundImage: `url('${slide.bgImage}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />

                    {/* Content */}
                    <div className="absolute inset-0 flex items-center">
                        <div className="container-custom relative z-10">
                            <div className="max-w-2xl text-white pl-4 md:pl-8">
                                <span className="text-primary-500 font-display font-semibold uppercase tracking-widest text-xs md:text-sm mb-3 block animate-fade-in">
                                    {slide.subtitle}
                                </span>
                                <h2 className="text-4xl md:text-6xl font-display font-bold mb-4 leading-tight uppercase tracking-tight">
                                    {slide.title}
                                </h2>
                                <p className="text-sm md:text-lg mb-8 text-gray-300 font-light leading-relaxed max-w-lg">
                                    {slide.description}
                                </p>
                                <div className="flex gap-4">
                                    <Link
                                        to={slide.link}
                                        className="inline-block bg-primary-500 text-black px-8 py-3.5 rounded-lg font-bold hover:bg-primary-400 transition-all duration-300 shadow-lg hover:shadow-primary-500/20 text-xs md:text-sm uppercase tracking-wider"
                                    >
                                        {slide.cta}
                                    </Link>
                                    <Link
                                        to="/products"
                                        className="inline-block border border-white/30 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-white hover:text-black hover:border-white transition-all duration-300 text-xs md:text-sm uppercase tracking-wider"
                                    >
                                        View Catalog
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-primary-500 hover:text-black border border-white/10 hover:border-primary-500 text-white p-2.5 rounded-full transition-all duration-300 z-20 focus:outline-none"
                aria-label="Previous Slide"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-primary-500 hover:text-black border border-white/10 hover:border-primary-500 text-white p-2.5 rounded-full transition-all duration-300 z-20 focus:outline-none"
                aria-label="Next Slide"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-1.5 rounded-full transition-all duration-500 focus:outline-none ${index === currentSlide
                            ? 'bg-primary-500 w-8'
                            : 'bg-white/30 hover:bg-white/60 w-2'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}

export default HeroSlider
