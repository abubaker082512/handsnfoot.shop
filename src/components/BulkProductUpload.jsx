import { useState } from 'react'
import Papa from 'papaparse'
import { supabase } from '../supabase/client'

const BulkProductUpload = () => {
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [results, setResults] = useState(null)
    const [errors, setErrors] = useState([])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile)
            setErrors([])
            setResults(null)
        } else {
            setErrors(['Please select a valid CSV file'])
        }
    }

    const validateProduct = (product, index) => {
        const errors = []

        if (!product.name || product.name.trim() === '') {
            errors.push(`Row ${index + 2}: Name is required`)
        }

        if (!product.price || isNaN(parseFloat(product.price))) {
            errors.push(`Row ${index + 2}: Valid price is required`)
        }

        if (!product.category || product.category.trim() === '') {
            errors.push(`Row ${index + 2}: Category is required`)
        }

        return errors
    }

    const handleUpload = async () => {
        if (!file) {
            setErrors(['Please select a file first'])
            return
        }

        setUploading(true)
        setErrors([])
        setResults(null)

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (parseResult) => {
                const validationErrors = []
                const products = []

                // Validate all rows
                parseResult.data.forEach((row, index) => {
                    const rowErrors = validateProduct(row, index)
                    validationErrors.push(...rowErrors)

                    if (rowErrors.length === 0) {
                        products.push({
                            name: row.name.trim(),
                            description: row.description?.trim() || '',
                            price: parseFloat(row.price),
                            category: row.category.trim(),
                            image: row.image?.trim() || '',
                            stock: parseInt(row.stock) || 0,
                            featured: row.featured?.toLowerCase() === 'true' || row.featured === '1',
                            rating: parseFloat(row.rating) || 0
                        })
                    }
                })

                if (validationErrors.length > 0) {
                    setErrors(validationErrors)
                    setUploading(false)
                    return
                }

                // Insert products into Supabase
                try {
                    const { data, error } = await supabase
                        .from('products')
                        .insert(products)
                        .select()

                    if (error) throw error

                    setResults({
                        success: true,
                        count: data.length,
                        products: data
                    })
                } catch (error) {
                    console.error('Error uploading products:', error)
                    setErrors([`Database error: ${error.message}`])
                } finally {
                    setUploading(false)
                }
            },
            error: (error) => {
                setErrors([`CSV parsing error: ${error.message}`])
                setUploading(false)
            }
        })
    }

    const downloadTemplate = () => {
        const template = `name,description,price,category,image,stock,featured,rating
Casio Digital Watch,Premium digital watch with multiple features,10500,Watches,https://example.com/image.jpg,10,true,4.5
Leather Wallet,Genuine leather bifold wallet,2250,Accessories,https://example.com/image.jpg,20,false,4.3`

        const blob = new Blob([template], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'product-upload-template.csv'
        a.click()
        window.URL.revokeObjectURL(url)
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Bulk Product Upload</h2>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions:</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Download the CSV template below</li>
                    <li>Fill in your product data (name, price, category are required)</li>
                    <li>Upload the completed CSV file</li>
                    <li>Review and confirm the upload</li>
                </ul>
            </div>

            {/* Download Template */}
            <div className="mb-6">
                <button
                    onClick={downloadTemplate}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                    📥 Download CSV Template
                </button>
            </div>

            {/* File Upload */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File
                </label>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-primary-50 file:text-primary-700
            hover:file:bg-primary-100"
                />
                {file && (
                    <p className="text-sm text-gray-600 mt-2">
                        Selected: {file.name}
                    </p>
                )}
            </div>

            {/* Upload Button */}
            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {uploading ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                    </span>
                ) : (
                    '🚀 Upload Products'
                )}
            </button>

            {/* Errors */}
            {errors.length > 0 && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-900 mb-2">❌ Errors:</h3>
                    <ul className="text-sm text-red-800 space-y-1 list-disc list-inside max-h-60 overflow-y-auto">
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Success Results */}
            {results && results.success && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">✅ Success!</h3>
                    <p className="text-green-800">
                        Successfully uploaded {results.count} product{results.count !== 1 ? 's' : ''}
                    </p>
                    <div className="mt-4 max-h-60 overflow-y-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-green-100">
                                <tr>
                                    <th className="px-4 py-2 text-left">Name</th>
                                    <th className="px-4 py-2 text-left">Price</th>
                                    <th className="px-4 py-2 text-left">Category</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.products.map((product) => (
                                    <tr key={product.id} className="border-t border-green-200">
                                        <td className="px-4 py-2">{product.name}</td>
                                        <td className="px-4 py-2">Rs {product.price}</td>
                                        <td className="px-4 py-2">{product.category}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* CSV Format Reference */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">📝 CSV Format:</h3>
                <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Required columns:</strong> name, price, category</p>
                    <p><strong>Optional columns:</strong> description, image, stock, featured (true/false), rating (0-5)</p>
                    <p><strong>Example:</strong></p>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mt-2">
                        name,description,price,category,image,stock,featured,rating{'\n'}
                        Casio Watch,Digital watch,10500,Watches,https://...,10,true,4.5
                    </pre>
                </div>
            </div>
        </div>
    )
}

export default BulkProductUpload
