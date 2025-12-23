import { useState } from 'react'
import { supabase } from '../supabase/client'

const ImageUpload = ({ onImageUploaded, currentImage, productName }) => {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState(currentImage || null)
    const [error, setError] = useState(null)
    const [dragActive, setDragActive] = useState(false)

    const validateFile = (file) => {
        // Check file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid image file (JPG, PNG, or WebP)')
            return false
        }

        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB in bytes
        if (file.size > maxSize) {
            setError('Image size must be less than 5MB')
            return false
        }

        return true
    }

    const uploadImage = async (file) => {
        if (!validateFile(file)) return

        setUploading(true)
        setError(null)

        try {
            // Create a unique file name
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `products/${fileName}`

            // Upload to Supabase Storage
            const { data, error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath)

            setPreview(publicUrl)
            onImageUploaded(publicUrl)
        } catch (error) {
            console.error('Error uploading image:', error)
            setError(error.message || 'Failed to upload image. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            uploadImage(file)
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const file = e.dataTransfer.files?.[0]
        if (file) {
            uploadImage(file)
        }
    }

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
                Product Image *
            </label>

            {/* Preview */}
            {preview && (
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                        src={preview}
                        alt={productName || 'Product preview'}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                        <span className="badge badge-success">✓ Image Ready</span>
                    </div>
                </div>
            )}

            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-400'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="space-y-2">
                    {uploading ? (
                        <>
                            <div className="spinner mx-auto"></div>
                            <p className="text-sm text-gray-600">Uploading image...</p>
                        </>
                    ) : (
                        <>
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                            >
                                <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <div className="text-sm text-gray-600">
                                <span className="font-semibold text-primary-600 hover:text-primary-500">
                                    Click to upload
                                </span>{' '}
                                or drag and drop
                            </div>
                            <p className="text-xs text-gray-500">
                                PNG, JPG, WEBP up to 5MB
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Help Text */}
            <p className="text-xs text-gray-500">
                💡 Tip: Use high-quality images with a 1:1 aspect ratio for best results
            </p>
        </div>
    )
}

export default ImageUpload
