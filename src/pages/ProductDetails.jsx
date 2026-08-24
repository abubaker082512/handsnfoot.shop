import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import { getMockProduct, getMockRelatedProducts } from '../utils/mockProducts'

const ProductDetails = () => {
    const { id } = useParams()
    const { addToCart } = useCart()

    // Initialize state synchronously with mock data so page renders INSTANTLY (0ms delay)
    const initialMock = getMockProduct(id)
    const [product, setProduct] = useState(initialMock)
    const [relatedProducts, setRelatedProducts] = useState(
        initialMock ? getMockRelatedProducts(initialMock.category, id) : []
    )
    const [loading, setLoading] = useState(!initialMock)
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        // Sync state when ID parameter changes
        const mock = getMockProduct(id)
        if (mock) {
            setProduct(mock)
            setRelatedProducts(getMockRelatedProducts(mock.category, id))
            setLoading(false)
        } else {
            setLoading(true)
        }

        fetchProduct()
    }, [id])

    const fetchProduct = async () => {
        try {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
            if (!isUUID) return

            const queryPromise = supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .maybeSingle()

            const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2000, { timeout: true }))
            const result = await Promise.race([queryPromise, timeoutPromise])

            if (result && !result.timeout && !result.error && result.data) {
                setProduct(result.data)
                if (result.data.category) {
                    fetchRelatedProducts(result.data.category)
                }
            }
        } catch (error) {
            console.error('Error fetching product from Supabase:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchRelatedProducts = async (category) => {
        try {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
            if (!isUUID) return

            const queryPromise = supabase
                .from('products')
                .select('*')
                .eq('category', category)
                .neq('id', id)
                .limit(4)

            const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2000, { timeout: true }))
            const result = await Promise.race([queryPromise, timeoutPromise])

            if (result && !result.timeout && !result.error && result.data && result.data.length > 0) {
                setRelatedProducts(result.data)
            }
        } catch (error) {
            console.error('Error fetching related products from Supabase:', error)
        }
    }

    const handleAddToCart = () => {
        if (!product) return
        addToCart(product, quantity)
        setQuantity(1)
    }

    const renderStars = (rating = 5) => {
        const stars = []
        const fullStars = Math.floor(rating)

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <svg key={`full-${i}`} className="w-5 h-5 star" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            )
        }

        const emptyStars = 5 - fullStars
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <svg key={`empty-${i}`} className="w-5 h-5 star-empty" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            )
        }

        return stars
    }

    if (loading && !product) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="spinner"></div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Product not found</h2>
                    <Link to="/products" className="btn btn-primary">
                        Back to Products
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container-custom">
                {/* Breadcrumbs */}
                <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                    <Link to="/" className="hover:text-primary-600">Home</Link>
                    <span>/</span>
                    <Link to="/products" className="hover:text-primary-600">Products</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{product.name}</span>
                </div>

                {/* Product Main Section */}
                <div className="bg-white rounded-xl shadow-md p-6 lg:p-10 mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Image */}
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover object-center"
                            />
                            {product.featured && (
                                <span className="absolute top-4 left-4 bg-black text-white text-xs px-3 py-1 font-bold uppercase tracking-wider rounded">
                                    Featured
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex flex-col justify-between">
                            <div>
                                <span className="text-primary-600 text-xs font-semibold uppercase tracking-widest">
                                    {product.category}
                                </span>
                                <h1 className="text-3xl font-display font-bold text-gray-900 mt-1 mb-3">
                                    {product.name}
                                </h1>

                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex text-amber-400">
                                        {renderStars(product.rating || 5)}
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium">
                                        {product.rating || 5.0} / 5.0
                                    </span>
                                </div>

                                <div className="text-3xl font-bold text-gray-900 mb-6">
                                    Rs {Number(product.price).toLocaleString()}
                                </div>

                                <p className="text-gray-600 leading-relaxed mb-6">
                                    {product.description}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="space-y-4 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-4">
                                    <label className="text-sm font-medium text-gray-700">Quantity:</label>
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 text-lg font-bold"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 font-semibold text-gray-800">{quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 text-lg font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="w-full bg-black text-white hover:bg-primary-500 hover:text-black py-4 rounded-lg font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    <span>🛒</span> Add to Shopping Bag
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                            Related Products
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relProduct) => (
                                <ProductCard key={relProduct.id} product={relProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductDetails
