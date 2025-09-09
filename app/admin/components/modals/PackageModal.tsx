'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }


  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/10 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 sm:p-6 border-b">
          <h2 className="text-responsive-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Package' : 'Create Package'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-responsive w-full text-black"
                required
              />
            </div>

            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
                Body Fat Range
              </label>
              <input
                type="text"
                value={formData.body_fat_range}
                onChange={(e) => setFormData({ ...formData, body_fat_range: e.target.value })}
                className="input-responsive w-full text-black"
                required
              />
            </div>

            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
                Emoji
              </label>
              <input
                type="text"
                value={formData.emoji}
                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                className="input-responsive w-full text-black"
                required
              />
            </div>

            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="input-responsive w-full text-black"
              />
            </div>

            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
                Price USD
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price_usd}
                onChange={(e) => setFormData({ ...formData, price_usd: parseFloat(e.target.value) || 0 })}
                className="input-responsive w-full text-black"
                required
              />
            </div>

            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
                Price GBP
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price_gbp}
                onChange={(e) => setFormData({ ...formData, price_gbp: parseFloat(e.target.value) || 0 })}
                className="input-responsive w-full text-black"
                required
              />
            </div>

            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
                Discounted Price GBP
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.discounted_price_gbp}
                onChange={(e) => setFormData({ ...formData, discounted_price_gbp: parseFloat(e.target.value) || 0 })}
                className="input-responsive w-full text-black"
              />
            </div>

            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
                Discount Percentage
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
                className="input-responsive w-full text-black"
              />
            </div>

            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
                Duration (weeks)
              </label>
              <input
                type="number"
                min="1"
                value={formData.duration_weeks}
                onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) || 0 })}
                className="input-responsive w-full text-black"
              />
            </div>

            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="input-responsive w-full text-black"
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
            <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="input-responsive w-full text-black"
              required
            />
          </div>

          <div>
            <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
              Long Description
            </label>
            <textarea
              value={formData.long_description}
              onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
              rows={4}
              className="input-responsive w-full text-black"
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
              Features
            </label>
            <div className="space-y-2">
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
                    className="input-responsive flex-1 text-black"
                    placeholder={`Feature ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Specifications */}
          <div>
            <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
              Specifications
            </label>
            <div className="space-y-2">
              {formData.specifications.map((spec: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={spec}
                    onChange={(e) => {
                      const newSpecs = [...formData.specifications]
                      newSpecs[index] = e.target.value
                      setFormData({ ...formData, specifications: newSpecs })
                    }}
                    className="input-responsive flex-1 text-black"
                    placeholder={`Specification ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
              Recommendations
            </label>
            <div className="space-y-2">
              {formData.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rec}
                    onChange={(e) => {
                      const newRecs = [...formData.recommendations]
                      newRecs[index] = e.target.value
                      setFormData({ ...formData, recommendations: newRecs })
                    }}
                    className="input-responsive flex-1 text-black"
                    placeholder={`Recommendation ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {isEditing ? 'Update Package' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
