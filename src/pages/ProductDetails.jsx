import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'

const ProductDetails = () => {
    const { id } = useParams()
    const { addToCart } = useCart()
    const [product, setProduct] = useState(null)
    const [relatedProducts, setRelatedProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        fetchProduct()
    }, [id])

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            setProduct(data)
            fetchRelatedProducts(data.category)
        } catch (error) {
            console.error('Error fetching product:', error)
            // Use mock data
            const mockProduct = getMockProduct(id)
            setProduct(mockProduct)
            if (mockProduct) {
                fetchRelatedProducts(mockProduct.category)
            }
        } finally {
            setLoading(false)
        }
    }

    const fetchRelatedProducts = async (category) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('category', category)
                .neq('id', id)
                .limit(4)

            if (error) throw error
            setRelatedProducts(data || [])
        } catch (error) {
            console.error('Error fetching related products:', error)
            setRelatedProducts(getMockRelatedProducts(category, id))
        }
    }

    const getMockProduct = (productId) => {
        const allProducts = [
            {
                id: '1',
                name: 'Luxury Chronograph Watch',
                description: 'Premium Swiss-made automatic watch with sapphire crystal. Features include chronograph function, date display, and water resistance up to 100m. The stainless steel case and leather strap combine durability with elegance.',
                price: 1299.99,
                category: 'Watches',
                rating: 4.8,
                stock: 15,
                featured: true,
                top_product: true,
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
            },
            {
                id: '2',
                name: 'Designer Leather Sneakers',
                description: 'Handcrafted Italian leather sneakers with premium comfort. Made from full-grain leather with a cushioned insole and rubber outsole for superior grip. Perfect for both casual and semi-formal occasions.',
                price: 349.99,
                category: 'Footwear',
                rating: 4.6,
                stock: 25,
                featured: true,
                top_product: false,
                image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
            },
            // Add more products as needed
        ]
        return allProducts.find(p => p.id === productId) || allProducts[0]
    }

    const getMockRelatedProducts = (category, excludeId) => {
        const allProducts = [
            {
                id: '3',
                name: 'Classic Dress Watch',
                description: 'Elegant minimalist watch perfect for formal occasions',
                price: 899.99,
                category: 'Watches',
                rating: 4.9,
                stock: 10,
                featured: true,
                top_product: true,
                image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80',
            },
            {
                id: '4',
                name: 'Premium Running Shoes',
                description: 'High-performance running shoes with advanced cushioning',
                price: 199.99,
                category: 'Footwear',
                rating: 4.7,
                stock: 30,
                featured: true,
                top_product: false,
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
            },
        ]
        return allProducts.filter(p => p.category === category && p.id !== excludeId).slice(0, 4)
    }

    const handleAddToCart = () => {
        addToCart(product, quantity)
        setQuantity(1)
    }

    const renderStars = (rating) => {
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

    if (loading) {
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
                {/* Breadcrumb */}
                <nav className="mb-8 text-sm">
                    <Link to="/" className="text-gray-600 hover:text-primary-600">Home</Link>
                    <span className="mx-2 text-gray-400">/</span>
                    <Link to="/products" className="text-gray-600 hover:text-primary-600">Products</Link>
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-900">{product.name}</span>
                </nav>

                {/* Product Details */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                        {/* Product Image */}
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col">
                            <div className="mb-4">
                                <span className="badge badge-primary">{product.category}</span>
                                {product.featured && (
                                    <span className="badge bg-accent-600 text-white ml-2">Featured</span>
                                )}
                            </div>

                            <h1 className="text-4xl font-display font-bold mb-4">{product.name}</h1>

                            {/* Rating */}
                            {product.rating && (
                                <div className="flex items-center space-x-2 mb-6 star-rating">
                                    {renderStars(product.rating)}
                                    <span className="text-lg text-gray-600">({product.rating})</span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="mb-6">
                                <span className="text-5xl font-bold text-primary-600">
                                    Rs {product.price.toFixed(2)}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                                {product.description}
                            </p>

                            {/* Stock Status */}
                            <div className="mb-6">
                                {product.stock > 0 ? (
                                    <span className="badge badge-success text-base">
                                        In Stock ({product.stock} available)
                                    </span>
                                ) : (
                                    <span className="badge badge-danger text-base">Out of Stock</span>
                                )}
                            </div>

                            {/* Quantity and Add to Cart */}
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="flex items-center space-x-2">
                                    <label className="font-medium">Quantity:</label>
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded hover:bg-gray-100 transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        disabled={quantity >= product.stock}
                                        className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className={`btn btn-primary text-lg w-full ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section>
                        <h2 className="text-3xl font-display font-bold mb-6 gradient-text">
                            Related Products
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard key={relatedProduct.id} product={relatedProduct} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}

export default ProductDetails
