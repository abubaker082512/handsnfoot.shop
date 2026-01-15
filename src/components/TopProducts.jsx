import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'
import ProductCard from './ProductCard'

const TopProducts = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTopProducts()
    }, [])

    const fetchTopProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('top_product', true)
                .order('rating', { ascending: false })
                .limit(4)

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error fetching top products:', error)
            // Use mock data if Supabase is not configured
            setProducts(getMockTopProducts())
        } finally {
            setLoading(false)
        }
    }

    const getMockTopProducts = () => {
        return [
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
        <section className="py-16 bg-gray-50">
            <div className="container-custom">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-display font-bold mb-4 gradient-text">
                        Top Rated Products
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Customer favorites with the highest ratings
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

export default TopProducts
