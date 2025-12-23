import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'
import ProductCard from './ProductCard'

const FeaturedProducts = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchFeaturedProducts()
    }, [])

    const fetchFeaturedProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('featured', true)
                .limit(4)

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error fetching featured products:', error)
            // Use mock data if Supabase is not configured
            setProducts(getMockFeaturedProducts())
        } finally {
            setLoading(false)
        }
    }

    const getMockFeaturedProducts = () => {
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
        ]
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <section className="py-16 bg-white">
            <div className="container-custom">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-display font-bold mb-4 gradient-text">
                        Featured Products
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Handpicked selections from our premium collection
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FeaturedProducts
