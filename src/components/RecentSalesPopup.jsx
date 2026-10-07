import { useState, useEffect } from 'react'
import { mockProducts } from '../utils/mockProducts'

const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad', 'Sialkot', 'Gujranwala', 'Hyderabad']
const customerNames = [
    'Ali R.', 'Zainab M.', 'Usman K.', 'Fatima S.', 'Hamza A.', 'Ayesha K.', 
    'Bilal H.', 'Sana T.', 'Omer F.', 'Hira Z.', 'Tariq N.', 'Maryam I.'
]
const timeAgos = ['Just now', '2 minutes ago', '5 minutes ago', '12 minutes ago', '25 minutes ago', '1 hour ago', '3 hours ago']

const RecentSalesPopup = () => {
    const [currentSale, setCurrentSale] = useState(null)
    const [isVisible, setIsVisible] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        if (isDismissed || !mockProducts || mockProducts.length === 0) return

        const getRandomSale = () => {
            const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)]
            const randomCity = cities[Math.floor(Math.random() * cities.length)]
            const randomName = customerNames[Math.floor(Math.random() * customerNames.length)]
            const randomTime = timeAgos[Math.floor(Math.random() * timeAgos.length)]

            return {
                name: randomName,
                city: randomCity,
                title: randomProduct.name,
                image: randomProduct.image,
                time: randomTime,
                productId: randomProduct.id
            }
        }

        // Show first popup after 4 seconds
        const initialTimer = setTimeout(() => {
            setCurrentSale(getRandomSale())
            setIsVisible(true)
        }, 4000)

        // Rotate popup every 12 seconds
        const interval = setInterval(() => {
            setIsVisible(false)
            setTimeout(() => {
                setCurrentSale(getRandomSale())
                setIsVisible(true)
            }, 1000)
        }, 12000)

        return () => {
            clearTimeout(initialTimer)
            clearInterval(interval)
        }
    }, [isDismissed])

    if (!currentSale || isDismissed) return null

    return (
        <div 
            className={`fixed bottom-5 left-5 z-40 max-w-xs sm:max-w-sm bg-gray-900/95 text-white rounded-xl shadow-2xl p-3 border border-gray-800 backdrop-blur-md transition-all duration-500 transform ${
                isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'
            }`}
        >
            <div className="flex items-center gap-3">
                {/* Product Thumbnail */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 border border-gray-700">
                    <img 
                        src={currentSale.image} 
                        alt={currentSale.title} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs text-gray-300 font-medium">
                        <span className="font-bold text-amber-400">{currentSale.name}</span> in <span className="font-semibold text-white">{currentSale.city}</span> purchased
                    </p>
                    <p className="text-xs font-bold text-white truncate mt-0.5" title={currentSale.title}>
                        {currentSale.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {currentSale.time}
                    </p>
                </div>

                {/* Close Button */}
                <button 
                    onClick={() => {
                        setIsVisible(false)
                        setIsDismissed(true)
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
                    aria-label="Close notification"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default RecentSalesPopup
