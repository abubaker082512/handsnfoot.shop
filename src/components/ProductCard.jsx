import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const ProductCard = ({ product }) => {
    const { addToCart } = useCart()

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (product.stock > 0) {
            addToCart(product)
        }
    }

    const renderStars = (rating) => {
        const stars = []
        const fullStars = Math.floor(rating || 0)
        const hasHalfStar = (rating || 0) % 1 !== 0

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <svg key={`full-${i}`} className="w-3 h-3 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            )
        }

        if (hasHalfStar) {
            stars.push(
                <svg key="half" className="w-3 h-3 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            )
        }

        const emptyStars = 5 - Math.ceil(rating || 0)
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <svg key={`empty-${i}`} className="w-3 h-3 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            )
        }

        return stars
    }

    return (
        <Link
            to={`/products/${product.id}`}
            className="group bg-white p-4 rounded-xl border border-gray-100 hover:border-primary-500/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
        >
            {/* Product Image */}
            <div className="relative overflow-hidden rounded-lg mb-4 bg-gray-100 aspect-square flex-shrink-0">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.stock === 0 && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm z-10">
                        Out of Stock
                    </span>
                )}
                {product.stock > 0 && product.stock < 5 && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm z-10">
                        Only {product.stock} Left
                    </span>
                )}
                {product.featured && (
                    <span className="absolute top-2 left-2 bg-primary-500 text-black text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm z-10">
                        Hot
                    </span>
                )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col flex-grow">
                <p className="text-[10px] text-primary-600 uppercase tracking-widest font-semibold mb-1">
                    {product.category}
                </p>
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-2 leading-snug h-10">
                    {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3 mt-auto">
                    <div className="flex items-center gap-0.5">
                        {renderStars(product.rating)}
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium ml-1">
                        ({product.rating || 0})
                    </span>
                </div>

                {/* Price and Cart Action */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                    <span className="text-base font-bold text-gray-900">
                        Rs {product.price.toLocaleString()}
                    </span>
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className={`text-[11px] font-semibold text-primary-600 hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors uppercase tracking-wider`}
                    >
                        {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </Link>
    )
}

export default ProductCard
