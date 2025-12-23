import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const ProductCard = ({ product }) => {
    const { addToCart } = useCart()

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart(product)
    }

    const renderStars = (rating) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 !== 0

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <svg key={`full-${i}`} className="w-4 h-4 star" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            )
        }

        if (hasHalfStar) {
            stars.push(
                <svg key="half" className="w-4 h-4 star" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            )
        }

        const emptyStars = 5 - Math.ceil(rating)
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <svg key={`empty-${i}`} className="w-4 h-4 star-empty" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            )
        }

        return stars
    }

    return (
        <Link to={`/products/${product.id}`} className="block">
            <div className="card card-hover product-card group">
                {/* Product Image */}
                <div className="relative overflow-hidden bg-gray-100 aspect-square">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="badge badge-danger text-lg">Out of Stock</span>
                        </div>
                    )}
                    {product.featured && (
                        <div className="absolute top-4 left-4">
                            <span className="badge bg-accent-600 text-white">Featured</span>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                    <div className="mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                    </h3>

                    {/* Rating */}
                    {product.rating && (
                        <div className="flex items-center space-x-1 mb-2 star-rating">
                            {renderStars(product.rating)}
                            <span className="text-sm text-gray-600 ml-2">({product.rating})</span>
                        </div>
                    )}

                    {/* Price and Add to Cart */}
                    <div className="flex items-center justify-between mt-4">
                        <span className="text-2xl font-bold text-primary-600">
                            Rs {product.price.toFixed(2)}
                        </span>
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className={`btn btn-primary text-sm py-2 px-4 ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default ProductCard
