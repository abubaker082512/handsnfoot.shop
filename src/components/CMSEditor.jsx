import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

const CMSEditor = () => {
    const [settings, setSettings] = useState({})
    const [brands, setBrands] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState(null)
    const [activeTab, setActiveTab] = useState('homepage')

    useEffect(() => {
        fetchSettings()
        fetchBrands()
    }, [])

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')

            if (error) throw error

            const settingsObj = {}
            data.forEach(setting => {
                settingsObj[setting.key] = setting.value
            })
            setSettings(settingsObj)
        } catch (error) {
            console.error('Error fetching settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchBrands = async () => {
        try {
            const { data, error } = await supabase
                .from('brand_logos')
                .select('*')
                .order('display_order')

            if (error) throw error
            setBrands(data || [])
        } catch (error) {
            console.error('Error fetching brands:', error)
        }
    }

    const handleSettingChange = (key, value) => {
        setSettings({ ...settings, [key]: value })
    }

    const saveSettings = async () => {
        setSaving(true)
        setMessage(null)

        try {
            const updates = Object.entries(settings).map(([key, value]) => ({
                key,
                value,
                type: 'text'
            }))

            for (const update of updates) {
                const { error } = await supabase
                    .from('site_settings')
                    .upsert(update, { onConflict: 'key' })

                if (error) throw error
            }

            setMessage({ type: 'success', text: 'Settings saved successfully!' })
        } catch (error) {
            console.error('Error saving settings:', error)
            setMessage({ type: 'error', text: 'Failed to save settings' })
        } finally {
            setSaving(false)
        }
    }

    const addBrand = async () => {
        const name = prompt('Enter brand name:')
        if (!name) return

        try {
            const { data, error } = await supabase
                .from('brand_logos')
                .insert({
                    name,
                    display_order: brands.length + 1,
                    is_active: true
                })
                .select()

            if (error) throw error
            setBrands([...brands, data[0]])
            setMessage({ type: 'success', text: 'Brand added successfully!' })
        } catch (error) {
            console.error('Error adding brand:', error)
            setMessage({ type: 'error', text: 'Failed to add brand' })
        }
    }

    const updateBrand = async (id, field, value) => {
        try {
            const { error } = await supabase
                .from('brand_logos')
                .update({ [field]: value })
                .eq('id', id)

            if (error) throw error

            setBrands(brands.map(b => b.id === id ? { ...b, [field]: value } : b))
            setMessage({ type: 'success', text: 'Brand updated!' })
        } catch (error) {
            console.error('Error updating brand:', error)
            setMessage({ type: 'error', text: 'Failed to update brand' })
        }
    }

    const deleteBrand = async (id) => {
        if (!confirm('Are you sure you want to delete this brand?')) return

        try {
            const { error } = await supabase
                .from('brand_logos')
                .delete()
                .eq('id', id)

            if (error) throw error

            setBrands(brands.filter(b => b.id !== id))
            setMessage({ type: 'success', text: 'Brand deleted!' })
        } catch (error) {
            console.error('Error deleting brand:', error)
            setMessage({ type: 'error', text: 'Failed to delete brand' })
        }
    }

    if (loading) {
        return <div className="text-center py-8">Loading CMS...</div>
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Content Management System</h2>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
                <button
                    onClick={() => setActiveTab('homepage')}
                    className={`px-4 py-2 font-semibold ${activeTab === 'homepage'
                            ? 'border-b-2 border-primary-600 text-primary-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Homepage Content
                </button>
                <button
                    onClick={() => setActiveTab('brands')}
                    className={`px-4 py-2 font-semibold ${activeTab === 'brands'
                            ? 'border-b-2 border-primary-600 text-primary-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Brand Logos
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Homepage Content Tab */}
            {activeTab === 'homepage' && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Announcement Bar Text
                        </label>
                        <input
                            type="text"
                            value={settings.announcement_bar_text || ''}
                            onChange={(e) => handleSettingChange('announcement_bar_text', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="🎉 Free Shipping on Orders Over Rs 10,000"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hero Title
                            </label>
                            <input
                                type="text"
                                value={settings.hero_title || ''}
                                onChange={(e) => handleSettingChange('hero_title', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="Premium Watches"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hero Subtitle
                            </label>
                            <input
                                type="text"
                                value={settings.hero_subtitle || ''}
                                onChange={(e) => handleSettingChange('hero_subtitle', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="& Accessories"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hero Description
                        </label>
                        <textarea
                            value={settings.hero_description || ''}
                            onChange={(e) => handleSettingChange('hero_description', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="Discover authentic timepieces and luxury accessories from top brands"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Primary CTA Button Text
                            </label>
                            <input
                                type="text"
                                value={settings.hero_cta_primary || ''}
                                onChange={(e) => handleSettingChange('hero_cta_primary', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="Shop Now"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Secondary CTA Button Text
                            </label>
                            <input
                                type="text"
                                value={settings.hero_cta_secondary || ''}
                                onChange={(e) => handleSettingChange('hero_cta_secondary', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="Learn More"
                            />
                        </div>
                    </div>

                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Homepage Content'}
                    </button>
                </div>
            )}

            {/* Brand Logos Tab */}
            {activeTab === 'brands' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-gray-600">Manage brand logos displayed on homepage</p>
                        <button
                            onClick={addBrand}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            + Add Brand
                        </button>
                    </div>

                    <div className="space-y-4">
                        {brands.map((brand) => (
                            <div key={brand.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                                <input
                                    type="number"
                                    value={brand.display_order}
                                    onChange={(e) => updateBrand(brand.id, 'display_order', parseInt(e.target.value))}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded"
                                    placeholder="Order"
                                />
                                <input
                                    type="text"
                                    value={brand.name}
                                    onChange={(e) => updateBrand(brand.id, 'name', e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Brand Name"
                                />
                                <input
                                    type="text"
                                    value={brand.logo_url || ''}
                                    onChange={(e) => updateBrand(brand.id, 'logo_url', e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Logo URL (optional)"
                                />
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={brand.is_active}
                                        onChange={(e) => updateBrand(brand.id, 'is_active', e.target.checked)}
                                        className="w-5 h-5"
                                    />
                                    <span className="text-sm">Active</span>
                                </label>
                                <button
                                    onClick={() => deleteBrand(brand.id)}
                                    className="text-red-600 hover:text-red-800 p-2"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CMSEditor
