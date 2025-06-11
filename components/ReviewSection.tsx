'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
import { Star, StarHalf } from 'lucide-react'
import SuccessModal from './SuccessModal'

interface Review {
  id: number
  user_id: string
  program_id: number
  rating: number
  comment: string
  created_at: string
  user_name: string
}

interface ReviewSectionProps {
  programId: number
}

export default function ReviewSection({ programId }: ReviewSectionProps) {
  const [user, setUser] = useState<User | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')

  const supabase = createClientComponentClient()

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    // Get reviews for this program
    const getReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('program_id', programId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching reviews:', error)
        return
      }

      setReviews(data)
    }

    getUser()
    getReviews()
  }, [programId, supabase])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          program_id: programId,
          rating,
          comment,
          user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous'
        })

      if (error) throw error

      // Refresh reviews
      const { data: newReviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('program_id', programId)
        .order('created_at', { ascending: false })

      setReviews(newReviews || [])
      setShowReviewForm(false)
      setRating(0)
      setComment('')
      
      setModalTitle('Success')
      setModalMessage('Your review has been submitted successfully!')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error submitting review:', error)
      setModalTitle('Error')
      setModalMessage('There was an error submitting your review. Please try again.')
      setShowSuccessModal(true)
    } finally {
      setIsSubmitting(false)
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
    <div className="space-y-6">
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
        {reviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{review.user_name}</h3>
                  <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                </div>
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
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))
        )}
      </div>

      {!user && (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600 mb-4">Please sign in to write a review</p>
          <a href="/login" className="btn-primary px-6 py-2 inline-block">
            Sign In
          </a>
        </div>
      )}

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  )
} 