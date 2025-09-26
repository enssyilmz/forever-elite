'use client'

import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'

interface SuggestionsFormProps {
  packageId: number
  packageTitle: string
  onSuccess: () => void
  onError: (message: string) => void
}

const suggestionOptions = [
  "The product image quality is poor or blurry",
  "Missing information in product description",
  "Errors found in product details",
  "Product price seems expensive compared to other sites",
  "This product should have different alternatives"
]

export default function SuggestionsForm({ packageId, packageTitle, onSuccess, onError }: SuggestionsFormProps) {
  const { user } = useApp()
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCheckboxChange = (suggestion: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestion)
        ? prev.filter(s => s !== suggestion)
        : [...prev, suggestion]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedSuggestions.length === 0) {
      onError('Please select at least one suggestion.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          package_id: packageId,
          package_title: packageTitle,
          suggestions: selectedSuggestions,
          user_id: user?.id || null,
          user_email: user?.email || null
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSelectedSuggestions([])
        onSuccess()
      } else {
        onError(data.error || 'Failed to submit suggestions. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting suggestions:', error)
      onError('Failed to submit suggestions. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-responsive-sm text-gray-600 mb-4">
        Help us improve this product by sharing your suggestions. Your feedback is valuable to us!
      </p>
      
      <div className="space-y-3">
        {suggestionOptions.map((suggestion, index) => (
          <label key={index} className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedSuggestions.includes(suggestion)}
              onChange={() => handleCheckboxChange(suggestion)}
              className="mt-1 w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 rounded focus:ring-sky-500 focus:ring-2"
            />
            <span className="text-responsive-sm text-gray-700 leading-relaxed">
              {suggestion}
            </span>
          </label>
        ))}
      </div>

      <div className="pt-4 border-t">
        <button
          type="submit"
          disabled={isSubmitting || selectedSuggestions.length === 0}
          className={`w-full py-2 px-4 rounded-lg font-medium text-responsive-sm transition-colors ${
            isSubmitting || selectedSuggestions.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'btn-primary-sm'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Suggestions'}
        </button>
      </div>
    </form>
  )
}
