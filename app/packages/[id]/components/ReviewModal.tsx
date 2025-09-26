'use client'

import { useState } from 'react'
import { X, Star } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  programId: number
  onSuccess: () => void
}

export default function ReviewModal({ isOpen, onClose, programId, onSuccess }: ReviewModalProps) {
  const { user, addReview } = useApp()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || rating === 0) return

    setIsSubmitting(true)

    try {
      await addReview(programId, rating, comment)
      
      // Reset form
      setRating(0)
      setHoveredRating(0)
      setComment('')
      
      // Close modal and show success
      onClose()
      onSuccess()
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('There was an error submitting your review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setRating(0)
    setHoveredRating(0)
    setComment('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Write a Review</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Rating */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Rating</label>
            <div className="md:col-span-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className={`transition-colors ${
                    value <= (hoveredRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <Star className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <label className="text-sm font-medium text-gray-700 md:pt-3">Comment</label>
            <div className="md:col-span-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm md:text-base text-gray-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none"
                placeholder="Write your comment here..."
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 md:gap-3 pt-4 md:pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="btn-primary-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
