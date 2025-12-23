import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase/client'
import ProductCard from '../components/ProductCard'

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All')
    const [sortBy, setSortBy] = useState('name')

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error fetching products:', error)
            // Use mock data if Supabase is not configured
            setProducts(getAllMockProducts())
        } finally {
            setLoading(false)
        }
    }

    const getAllMockProducts = () => {
        return [
            {
                id: '1',
                name: 'Luxury Chronograph Watch',
                description: 'Premium Swiss-made automatic watch with sapphire crystal',
                price: 1299.99,
                category: 'Watches',
                rating: 4.8,
                stock: 15,
                featured: true,
                top_product: true,
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
            },
            {
                id: '2',
                name: 'Designer Leather Sneakers',
                description: 'Handcrafted Italian leather sneakers with premium comfort',
                price: 349.99,
                category: 'Footwear',
                rating: 4.6,
                stock: 25,
                featured: true,
                top_product: false,
                image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80',
            },
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
            {
                id: '5',
                name: 'Smart Watch Pro',
                description: 'Advanced smartwatch with health tracking and GPS',
                price: 599.99,
                category: 'Watches',
                rating: 4.9,
                stock: 20,
                featured: false,
                top_product: true,
                image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80',
            },
            {
                id: '6',
                name: 'Oxford Dress Shoes',
                description: 'Classic leather Oxford shoes for the modern gentleman',
                price: 279.99,
                category: 'Footwear',
                rating: 4.8,
                stock: 18,
                featured: false,
                top_product: true,
                image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=500&q=80',
            },
            {
                id: '7',
                name: 'Diver Watch',
                description: 'Professional diving watch with 300m water resistance',
                price: 1599.99,
                category: 'Watches',
                rating: 4.9,
                stock: 8,
                featured: false,
                top_product: true,
                image: 'https://images.unsplash.com/photo-1606390104762-8e0f36f2c0e4?w=500&q=80',
            },
            {
                id: '8',
                name: 'Casual Canvas Sneakers',
                description: 'Comfortable everyday sneakers with timeless style',
                price: 89.99,
                category: 'Footwear',
                rating: 4.7,
                stock: 40,
                featured: false,
                top_product: true,
                image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&q=80',
            },
            {
                id: '9',
                name: 'Aviator Chronograph',
                description: 'Pilot-inspired watch with multiple time zones',
                price: 749.99,
                category: 'Watches',
                rating: 4.6,
                stock: 12,
                featured: false,
                top_product: false,
                image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=500&q=80',
            },
            {
                id: '10',
                name: 'Hiking Boots',
                description: 'Durable waterproof boots for outdoor adventures',
                price: 229.99,
                category: 'Footwear',
                rating: 4.8,
                stock: 22,
                featured: false,
                top_product: false,
                image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500&q=80',
            },
            {
                id: '11',
                name: 'Minimalist Watch',
                description: 'Ultra-thin design with Japanese quartz movement',
                price: 299.99,
                category: 'Watches',
                rating: 4.5,
                stock: 28,
                featured: false,
                top_product: false,
                image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=500&q=80',
            },
            {
                id: '12',
                name: 'Loafers',
                description: 'Comfortable slip-on loafers for casual elegance',
                price: 159.99,
                category: 'Footwear',
                rating: 4.4,
                stock: 35,
                featured: false,
                top_product: false,
                image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=500&q=80',
            },
        ]
    }

    // Filter and sort products
    const filteredProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
            return matchesSearch && matchesCategory
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price
                case 'price-high':
                    return b.price - a.price
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0)
                case 'name':
                default:
                    return a.name.localeCompare(b.name)
            }
        })

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-display font-bold mb-4 gradient-text">
                        All Products
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Explore our complete collection of luxury watches and premium footwear
                    </p>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input"
                            />
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="input"
                            >
                                <option value="All">All Categories</option>
                                <option value="Watches">Watches</option>
                                <option value="Footwear">Footwear</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="input"
                            >
                                <option value="name">Name (A-Z)</option>
                                <option value="price-low">Price (Low to High)</option>
                                <option value="price-high">Price (High to Low)</option>
                                <option value="rating">Rating</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        Showing <span className="font-semibold">{filteredProducts.length}</span> products
                    </p>
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-2xl font-semibold text-gray-700 mb-2">No products found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Products
