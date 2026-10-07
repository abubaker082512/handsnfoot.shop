import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase/client'
import ProductCard from '../components/ProductCard'
import { mockProducts } from '../utils/mockProducts'

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
            const queryPromise = supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false })

            const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 3000, { timeout: true }))

            const result = await Promise.race([queryPromise, timeoutPromise])

            const oldExcludedNames = [
                'designer leather sneakers',
                'premium running shoes',
                'luxury chronograph watch',
                'mekeyxecret natural long-lasting liquid blush',
                'the vertical vogue',
                'the futuristic: a leather bifold wallet',
                'the artisan: leather cardholder'
            ]

            const isValidProduct = (item) => {
                if (!item || !item.name) return false
                if (item.category === 'Footwear') return false
                const nameLower = item.name.toLowerCase().trim()
                return !oldExcludedNames.some(ex => nameLower.includes(ex))
            }

            let dbProducts = []
            if (result && !result.timeout && !result.error && Array.isArray(result.data)) {
                dbProducts = result.data.filter(isValidProduct)
            }

            // Merge DB products with the complete 6,050+ Zeesy & Zamana catalog
            const catalogFiltered = mockProducts.filter(isValidProduct)
            const combined = [...dbProducts, ...catalogFiltered]
            const uniqueProducts = []
            const seenKeys = new Set()

            for (const item of combined) {
                if (!item || !isValidProduct(item)) continue
                const key = item.name ? item.name.toLowerCase().trim() : item.id
                if (!seenKeys.has(key)) {
                    seenKeys.add(key)
                    uniqueProducts.push(item)
                }
            }

            setProducts(uniqueProducts.length > 0 ? uniqueProducts : catalogFiltered)
        } catch (error) {
            console.error('Error fetching products:', error)
            setProducts(mockProducts)
        } finally {
            setLoading(false)
        }
    }

    const getAllMockProducts = () => {
        return mockProducts
    }

    // Filter and sort products
    const filteredProducts = products
        .filter(product => {
            if (!product || !product.name) return false
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description || '').toLowerCase().includes(searchTerm.toLowerCase())
            
            let matchesCategory = false
            if (selectedCategory === 'All') {
                matchesCategory = true
            } else if (selectedCategory === 'Men') {
                matchesCategory = (product.category === 'Watches' || product.category === 'Accessories') && !/women|ladies|girl|female|bangle|choker|necklace|earring|bindiya/i.test(product.name)
            } else if (selectedCategory === 'Women') {
                matchesCategory = product.category === 'Jewelry' || product.category === 'Beauty' || /women|ladies|girl|female|bangle|choker|necklace|earring|bindiya/i.test(product.name)
            } else {
                matchesCategory = product.category === selectedCategory
            }

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
                    <h1 className="text-4xl font-display font-bold mb-3 gradient-text">
                        {selectedCategory === 'All' ? 'All Luxury Collections' : `${selectedCategory}'s Collection`}
                    </h1>
                    <p className="text-gray-600 text-base">
                        Explore our complete catalog of {filteredProducts.length.toLocaleString()} premium items curated for you
                    </p>
                </div>

                {/* Quick Category Navigation Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { name: 'All', icon: '🛍️' },
                        { name: 'Men', icon: '👨' },
                        { name: 'Women', icon: '👩' },
                        { name: 'Jewelry', icon: '✨' },
                        { name: 'Watches', icon: '⌚' },
                        { name: 'Accessories', icon: '👜' }
                    ].map((cat) => (
                        <button
                            key={cat.name}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={`px-5 py-2.5 rounded-full font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                                selectedCategory === cat.name
                                    ? 'bg-amber-600 text-white shadow-md scale-105 ring-2 ring-amber-400'
                                    : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <span>{cat.icon}</span> {cat.name}
                        </button>
                    ))}
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Search Catalog</label>
                            <input
                                type="text"
                                placeholder="Search by name, brand, or style..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input"
                            />
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Category Filter</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="input"
                            >
                                <option value="All">All Categories</option>
                                <option value="Men">Men's Collection</option>
                                <option value="Women">Women's Collection</option>
                                <option value="Jewelry">Jewelry</option>
                                <option value="Watches">Watches</option>
                                <option value="Accessories">Accessories</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Sort By</label>
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
