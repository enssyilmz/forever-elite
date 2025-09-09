'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import SuccessModal from './SuccessModal'
import { useApp } from '@/contexts/AppContext'

interface ReviewSectionProps {
  programId: number
}

export default function ReviewSection({ programId }: ReviewSectionProps) {
  const { user, reviews, addReview, deleteReview, toggleNavbar } = useApp()
  const ADMIN_EMAIL = 'yozdzhansyonmez@gmail.com'
  
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [confirmState, setConfirmState] = useState<{ open: boolean, reviewId: number | null }>({ open: false, reviewId: null })

  const programReviews = reviews.filter(review => review.program_id === programId);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)

    try {
      await addReview(programId, rating, comment)

      setShowReviewForm(false)
      setRating(0)
      setComment('')
      
    } catch (error) {
      console.error('Error submitting review:', error)
      setModalTitle('Error')
      setModalMessage('There was an error submitting your review. Please try again.')
      setShowSuccessModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = (reviewId: number) => {
    setConfirmState({ open: true, reviewId })
  }

  const handleConfirmDelete = async () => {
    if (!confirmState.reviewId) return
    try {
      await deleteReview(confirmState.reviewId)
      setModalTitle('Success')
      setModalMessage('Your review has been deleted.')
      setShowSuccessModal(true)
    } catch (error: any) {
      setModalTitle('Error')
      setModalMessage(error.message || 'There was an error deleting your review. Please try again.')
      setShowSuccessModal(true)
    } finally {
      setConfirmState({ open: false, reviewId: null })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6 bg-white p-3 rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
        {user && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="btn-primary px-4 py-2"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && user && (
        <form onSubmit={handleSubmitReview} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`text-2xl ${value <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  <Star className="w-8 h-8" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full border rounded-lg p-3 text-gray-800"
              placeholder="Write your review here..."
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowReviewForm(false)
                setRating(0)
                setComment('')
              }}
              className="btn-secondary px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="btn-primary px-4 py-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {programReviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet. Be the first to review!</p>
        ) : (
          programReviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{review.user_name}</h3>
                  <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                </div>
                <div className="flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {user && (user.id === review.user_id || (user.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase()) && (
                    <button
                      onClick={() => confirmDelete(review.id)}
                      className="ml-4 text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))
        )}
      </div>

      {!user && (
        <div className="border p-6 rounded-lg text-center">
          <p className="text-gray-600 mb-4">Please sign in to write a review</p>
          <button 
            onClick={toggleNavbar}
            className="btn-primary px-6 py-2"
          >
            Sign In
          </button>
        </div>
      )}

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={modalTitle}
        message={modalMessage}
      />

      {/* Confirm Delete Modal */}
      {confirmState.open && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setConfirmState({ open: false, reviewId: null })}>
          <div className="bg-white rounded-lg p-5 w-full max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete review?</h3>
            <p className="text-gray-600 mb-4 text-sm">Are you sure you want to delete this review? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmState({ open: false, reviewId: null })}
                className="btn-secondary-sm px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn-primary-sm px-4 py-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 