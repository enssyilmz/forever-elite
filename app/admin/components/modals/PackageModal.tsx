'use client'

import { useState } from 'react'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { uploadImage, validateImage, deleteImage } from '@/lib/supabaseStorage'

interface PackageModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: any) => Promise<void>
  formData: any
  setFormData: (data: any) => void
  isEditing: boolean
}

export default function PackageModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  isEditing 
}: PackageModalProps) {
  const [uploading, setUploading] = useState<{image1: boolean, image2: boolean}>({
    image1: false,
    image2: false
  })
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<{show: boolean, imageNumber: 1 | 2 | null}>({
    show: false,
    imageNumber: null
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleImageUpload = async (file: File, imageNumber: 1 | 2) => {
    // Validate image
    const validation = validateImage(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    setUploading(prev => ({ ...prev, [`image${imageNumber}`]: true }))

    try {
      const result = await uploadImage(file)
      if (result.success && result.url) {
        // Delete old image if exists
        const oldUrl = imageNumber === 1 ? formData.image_url_1 : formData.image_url_2
        if (oldUrl && oldUrl.includes('supabase')) {
          await deleteImage(oldUrl)
        }

        // Update form data
        const fieldName = `image_url_${imageNumber}`
        setFormData({ ...formData, [fieldName]: result.url })
      } else {
        alert(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(prev => ({ ...prev, [`image${imageNumber}`]: false }))
    }
  }

  const handleRemoveImage = (imageNumber: 1 | 2) => {
    setShowRemoveConfirm({ show: true, imageNumber })
  }

  const confirmRemoveImage = () => {
    if (showRemoveConfirm.imageNumber === 1) {
      setFormData({ ...formData, image_url_1: '' })
    } else if (showRemoveConfirm.imageNumber === 2) {
      setFormData({ ...formData, image_url_2: '' })
    }
    setShowRemoveConfirm({ show: false, imageNumber: null })
  }

  const cancelRemoveImage = () => {
    setShowRemoveConfirm({ show: false, imageNumber: null })
  }


  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/10 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b flex-shrink-0">
          <h2 className="text-responsive-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Package' : 'Create Package'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-responsive-sm w-full text-black"
                required
              />
            </div>

            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Body Fat Range
              </label>
              <input
                type="text"
                value={formData.body_fat_range}
                onChange={(e) => setFormData({ ...formData, body_fat_range: e.target.value })}
                className="input-responsive-sm w-full text-black"
                required
              />
            </div>

            {/* Image 1 Upload */}
            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Package Image 1
              </label>
              <div className="space-y-2">
                {formData.image_url_1 && (
                  <div className="relative">
                    <img 
                      src={formData.image_url_1} 
                      alt="Package Image 1" 
                      className="w-full h-32 object-cover rounded-lg border"
              />
            </div>
                )}
                <div className="space-y-2">
                  {/* Upload & Remove Buttons */}
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 1)
                      }}
                      className="hidden"
                      id="image1-upload"
                    />
                    <label
                      htmlFor="image1-upload"
                      className="btn-tertiary-sm flex items-center gap-2 cursor-pointer"
                    >
                      {uploading.image1 ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Upload Image 1
                        </>
                      )}
                    </label>
                     {formData.image_url_1 && (
                       <button
                         type="button"
                         onClick={() => handleRemoveImage(1)}
                         className="btn-danger-sm"
                       >
                         Remove
                       </button>
                     )}
                  </div>
                </div>
              </div>
            </div>

            {/* Image 2 Upload */}
            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Package Image 2
              </label>
              <div className="space-y-2">
                {formData.image_url_2 && (
                  <div className="relative">
                    <img 
                      src={formData.image_url_2} 
                      alt="Package Image 2" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  {/* Upload & Remove Buttons */}
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 2)
                      }}
                      className="hidden"
                      id="image2-upload"
                    />
                    <label
                      htmlFor="image2-upload"
                      className="btn-tertiary-sm flex items-center gap-2 cursor-pointer"
                    >
                      {uploading.image2 ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Upload Image 2
                        </>
                      )}
                    </label>
                     {formData.image_url_2 && (
                       <button
                         type="button"
                         onClick={() => handleRemoveImage(2)}
                         className="btn-danger-sm"
                       >
                         Remove
                       </button>
                     )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Price USD
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price_usd}
                onChange={(e) => setFormData({ ...formData, price_usd: parseFloat(e.target.value) || 0 })}
                className="input-responsive-sm w-full text-black"
                required
              />
            </div>

            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Price GBP
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price_gbp}
                onChange={(e) => setFormData({ ...formData, price_gbp: parseFloat(e.target.value) || 0 })}
                className="input-responsive-sm w-full text-black"
                required
              />
            </div>

            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Discounted Price GBP
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.discounted_price_gbp}
                onChange={(e) => setFormData({ ...formData, discounted_price_gbp: parseFloat(e.target.value) || 0 })}
                className="input-responsive-sm w-full text-black"
              />
            </div>

            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Discount Percentage
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
                className="input-responsive-sm w-full text-black"
              />
            </div>

            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Duration (weeks)
              </label>
              <input
                type="number"
                min="1"
                value={formData.duration_weeks}
                onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) || 0 })}
                className="input-responsive-sm w-full text-black"
              />
            </div>

            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="input-responsive-sm w-full text-black"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="ml-2 text-responsive-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-responsive-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="input-responsive-sm w-full text-black"
              required
            />
          </div>

          <div>
            <label className="block text-responsive-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Long Description
            </label>
            <textarea
              value={formData.long_description}
              onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
              rows={4}
              className="input-responsive-sm w-full text-black"
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-responsive-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Features
            </label>
            <div className="space-y-1 sm:space-y-2">
              {formData.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...formData.features]
                      newFeatures[index] = e.target.value
                      setFormData({ ...formData, features: newFeatures })
                    }}
                    className="input-responsive-sm flex-1 text-black"
                    placeholder={`Feature ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>



          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-sm"
            >
              {isEditing ? 'Update Package' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Remove Image
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove Package Image {showRemoveConfirm.imageNumber}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelRemoveImage}
                className="btn-secondary-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveImage}
                className="btn-danger-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
