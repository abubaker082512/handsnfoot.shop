import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase/client'
import ImageUpload from '../components/ImageUpload'
import BulkProductUpload from '../components/BulkProductUpload'
import CMSEditor from '../components/CMSEditor'

const Admin = () => {
    const navigate = useNavigate()
    const { user, isAdmin } = useAuth()
    const [activeTab, setActiveTab] = useState('products')

    // Product Management State
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Watches',
        rating: '',
        stock: '',
        featured: false,
        top_product: false,
        image: '',
    })

    useEffect(() => {
        if (!user || !isAdmin()) {
            navigate('/')
            return
        }
        fetchProducts()
    }, [user, isAdmin, navigate])

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
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setFormData({
            ...formData,
            [e.target.name]: value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            rating: formData.rating ? parseFloat(formData.rating) : null,
            stock: parseInt(formData.stock),
        }

        try {
            if (editingProduct) {
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', editingProduct.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([productData])

                if (error) throw error
            }

            fetchProducts()
            resetForm()
        } catch (error) {
            console.error('Error saving product:', error)
            alert('Error saving product. Please check your Supabase configuration.')
        }
    }

    const handleEdit = (product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            category: product.category,
            rating: product.rating?.toString() || '',
            stock: product.stock.toString(),
            featured: product.featured,
            top_product: product.top_product,
            image: product.image,
        })
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchProducts()
        } catch (error) {
            console.error('Error deleting product:', error)
            alert('Error deleting product. Please check your Supabase configuration.')
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'Watches',
            rating: '',
            stock: '',
            featured: false,
            top_product: false,
            image: '',
        })
        setEditingProduct(null)
        setShowForm(false)
    }

    if (!user || !isAdmin()) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container-custom">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-display font-bold gradient-text">
                        Admin Dashboard
                    </h1>
                    <button
                        onClick={() => {
                            setActiveTab('products')
                            setShowForm(true)
                            setEditingProduct(null)
                        }}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add New Product
                    </button>
                </div>

                {/* Admin Navigation Tabs */}
                <div className="bg-white rounded-lg shadow-sm p-1 mb-8 inline-flex">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-6 py-3 rounded-md font-medium transition-all ${activeTab === 'products'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        Product Management
                    </button>
                    <button
                        onClick={() => setActiveTab('bulk-upload')}
                        className={`px-6 py-3 rounded-md font-medium transition-all ${activeTab === 'bulk-upload'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        Bulk Upload
                    </button>
                    <button
                        onClick={() => setActiveTab('cms')}
                        className={`px-6 py-3 rounded-md font-medium transition-all ${activeTab === 'cms'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        Content Management
                    </button>
                </div>

                {/* Content Area */}
                <div className="animate-fade-in">
                    {activeTab === 'products' && (
                        <>

                            {/* Product Form */}
                            {showForm && (
                                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                                    <h2 className="text-2xl font-display font-bold mb-6">
                                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                                    </h2>
                                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Product Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Category *
                                            </label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                required
                                                className="input"
                                            >
                                                <option value="Watches">Watches</option>
                                                <option value="Accessories">Accessories</option>
                                                <option value="Beauty">Beauty</option>
                                                <option value="Footwear">Footwear</option>
                                                <option value="Bags">Bags</option>
                                            </select>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description *
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                required
                                                rows="3"
                                                className="input"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Price *
                                            </label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                required
                                                step="0.01"
                                                min="0"
                                                className="input"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Stock *
                                            </label>
                                            <input
                                                type="number"
                                                name="stock"
                                                value={formData.stock}
                                                onChange={handleChange}
                                                required
                                                min="0"
                                                className="input"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Rating (0-5)
                                            </label>
                                            <input
                                                type="number"
                                                name="rating"
                                                value={formData.rating}
                                                onChange={handleChange}
                                                step="0.1"
                                                min="0"
                                                max="5"
                                                className="input"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <ImageUpload
                                                currentImage={formData.image}
                                                productName={formData.name}
                                                onImageUploaded={(url) => setFormData({ ...formData, image: url })}
                                            />
                                        </div>

                                        <div className="md:col-span-2 flex gap-6">
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    name="featured"
                                                    checked={formData.featured}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 text-primary-600"
                                                />
                                                <span className="text-sm font-medium text-gray-700">Featured Product</span>
                                            </label>

                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    name="top_product"
                                                    checked={formData.top_product}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 text-primary-600"
                                                />
                                                <span className="text-sm font-medium text-gray-700">Top Product</span>
                                            </label>
                                        </div>

                                        <div className="md:col-span-2 flex gap-4">
                                            <button type="submit" className="btn btn-primary">
                                                {editingProduct ? 'Update Product' : 'Add Product'}
                                            </button>
                                            <button type="button" onClick={resetForm} className="btn btn-outline">
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Products Table */}
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Product
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Category
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Price
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Stock
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-12 text-center">
                                                        <div className="spinner mx-auto"></div>
                                                    </td>
                                                </tr>
                                            ) : products.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                        No products found. Add your first product to get started.
                                                    </td>
                                                </tr>
                                            ) : (
                                                products.map((product) => (
                                                    <tr key={product.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <img
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    className="w-12 h-12 object-cover rounded"
                                                                />
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="badge badge-primary">{product.category}</span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            Rs {product.price.toFixed(2)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {product.stock}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex gap-2">
                                                                {product.featured && <span className="badge bg-accent-600 text-white text-xs">Featured</span>}
                                                                {product.top_product && <span className="badge badge-success text-xs">Top</span>}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button
                                                                onClick={() => handleEdit(product)}
                                                                className="text-primary-600 hover:text-primary-900 mr-4"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(product.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'bulk-upload' && (
                        <BulkProductUpload />
                    )}

                    {activeTab === 'cms' && (
                        <CMSEditor />
                    )}
                </div>
            </div>
        </div>
    )
}

export default Admin
