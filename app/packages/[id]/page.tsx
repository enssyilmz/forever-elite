'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import SuccessModal from '@/components/SuccessModal'
import { Package } from '@/lib/database.types'
import SuggestionsForm from './components/SuggestionsForm'
import ReviewModal from './components/ReviewModal'
import ImageLightbox from './components/ImageLightbox'
import { Edit, Heart, HeartOff, Trash2 } from 'lucide-react'

export default function PackageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const programId = parseInt(params.id as string)
  const { addToCart, addToFavorites, removeFromFavorites, isFavorite, reviews, user, deleteReview } = useApp()
  
  const [quantity, setQuantity] = useState(1)
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [program, setProgram] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{show: boolean, reviewId: number | null}>({
    show: false,
    reviewId: null
  })
  const [showLightbox, setShowLightbox] = useState(false)
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0)

  // Fetch package from database
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await fetch(`/api/packages/${programId}`)
        if (response.ok) {
          const data = await response.json()
          setProgram(data.package)
        } else {
          console.error('Failed to fetch package')
        }
      } catch (error) {
        console.error('Error fetching package:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPackage()
  }, [programId])

  const showPopup = (title: string, message: string) => {
    setModalTitle(title)
    setModalMessage(message)
    setShowSuccessModal(true)
  }

  // Deletion handled inside components/ReviewSection.tsx

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Loading package details...</p>
        </div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-responsive-lg md:text-responsive-xl font-bold text-gray-800 mb-4">Package Not Found</h1>
          <Link href="/packages">
            <button className="btn-primary-sm px-4 md:px-6 py-2 md:py-3">
              Back to Packages
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section)
  }

  const handleDeleteReview = (reviewId: number) => {
    setShowDeleteConfirm({ show: true, reviewId })
  }

  const confirmDeleteReview = async () => {
    if (showDeleteConfirm.reviewId) {
      await deleteReview(showDeleteConfirm.reviewId)
      setShowDeleteConfirm({ show: false, reviewId: null })
      setModalTitle('Success!')
      setModalMessage('Your review has been deleted successfully.')
      setShowSuccessModal(true)
    }
  }

  const cancelDeleteReview = () => {
    setShowDeleteConfirm({ show: false, reviewId: null })
  }

  const openLightbox = (index: number) => {
    setLightboxInitialIndex(index)
    setShowLightbox(true)
  }

  const increaseQuantity = () => setQuantity(prev => prev + 1)
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1)

  const handleAddToCart = () => {
    addToCart(programId, quantity)
    showPopup('Added to Cart!', `${program.title} has been added to your cart.`)
  }

  const handleFavoriteToggle = () => {
    if (isFavorite(programId)) {
      removeFromFavorites(programId)
      setModalTitle('Removed!')
      setModalMessage('Product removed from favorites.')
      setShowSuccessModal(true)
    } else {
      addToFavorites(programId)
      setModalTitle('Added!')
      setModalMessage('Product added to favorites.')
      setShowSuccessModal(true)
    }
  }

  // Get reviews for this program
  const programReviews = reviews.filter(review => review.program_id === programId)

  return (
    <div className="min-h-screen py-4 md:py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-4 md:mb-8">
          <ol className="flex items-center space-x-1 md:space-x-2 text-responsive-sm text-gray-600">
            <li><Link href="/" className="hover:text-sky-600">Home</Link></li>
            <li><span className="mx-1 md:mx-2">/</span></li>
            <li><Link href="/packages" className="hover:text-sky-600">Packages</Link></li>
            <li><span className="mx-1 md:mx-2">/</span></li>
            <li className="text-gray-900 truncate">{program.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {/* Sol Taraf - Fotoğraflar */}
          <div>
            {/* İki büyük resim gösterimi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {[program.image_url_1, program.image_url_2].map((imageUrl, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl md:rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => imageUrl && openLightbox(index)}
                >
                  {imageUrl ? (
                    <img 
                      src={`${imageUrl}`} 
                      alt={`${program.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-2xl md:text-4xl text-white opacity-80">
                        📦
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sağ Taraf - Program Bilgileri */}
          <div className="space-y-4 md:space-y-6">
            {/* Package Başlığı */}
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <span className="bg-sky-100 text-sky-800 text-responsive-sm font-semibold px-2 md:px-3 py-1 rounded-full">
                  {program.body_fat_range}
                </span>
              </div>
              <h1 className="text-responsive-xl md:text-responsive-2xl font-bold text-gray-900 mb-3 md:mb-4">{program.title}</h1>
            </div>

            {/* İndirim ve Fiyat */}
            <div className="space-y-2">
              {program.discount_percentage > 0 && (
                <div className="bg-red-100 text-red-600 text-responsive-sm font-bold px-2 md:px-3 py-1 rounded-full inline-block">
                  %{program.discount_percentage} OFF - Limited Time!
                </div>
              )}
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-responsive-xl md:text-responsive-2xl font-bold text-sky-600">£{program.discounted_price_gbp || program.price_gbp}</span>
                {program.discount_percentage > 0 && (
                  <span className="text-responsive-base md:text-responsive-lg text-gray-400 line-through">£{program.price_gbp}</span>
                )}
              </div>
            </div>

            {/* Açıklama */}
            <p className="text-gray-600 leading-relaxed text-responsive-sm md:text-responsive-base">{program.long_description}</p>

            {/* Miktar ve Butonlar */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-responsive-sm font-medium text-gray-900">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                  <button
                    onClick={decreaseQuantity}
                    className="px-2 md:px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-l-lg text-responsive-sm"
                  >
                    -
                  </button>
                  <span className="px-3 md:px-4 py-2 border-x border-gray-300 text-gray-800 text-responsive-sm">{quantity}</span>
                  <button
                    onClick={increaseQuantity}
                    className="px-2 md:px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-r-lg text-responsive-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary-sm py-2 md:py-3 px-4 md:px-6"
                >
                  Add to Cart
                </button>
                <button 
                  onClick={() => {
                    addToCart(programId, quantity)
                    router.push('/checkout')
                  }}
                  className="flex-1 btn-secondary-sm py-2 md:py-3 px-4 md:px-6"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Yorum Yaz */}
            <div className="border-t pt-3 md:pt-4">
              <button 
                onClick={() => setShowReviewModal(true)}
                className="text-sky-600 hover:text-sky-700 font-medium text-responsive-sm flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Write a Review
              </button>
            </div>

            {/* Favorilere Ekle */}
            <div>
              <button 
                onClick={handleFavoriteToggle}
                className={`font-medium transition text-responsive-sm flex items-center gap-2 ${
                  isFavorite(programId) 
                    ? 'text-red-600 hover:text-red-700' 
                    : 'text-red-500 hover:text-red-600'
                }`}
              >
                {isFavorite(programId) ? (
                  <>
                    <HeartOff className="w-4 h-4" />
                    Remove from Favorites
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    Add to Favorites
                  </>
                )}
              </button>
            </div>

            {/* Accordion Bölümler */}
            <div className="space-y-2 md:space-y-3">
              {/* Ürün Özellikleri */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleAccordion('specifications')}
                  className="w-full flex items-center justify-between p-3 md:p-4 text-left hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900 text-responsive-sm">PACKAGE SPECIFICATIONS</span>
                  <svg
                    className={`w-4 h-4 md:w-5 md:h-5 transition-transform text-black ${
                      activeAccordion === 'specifications' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <hr className="border-black" />
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  activeAccordion === 'specifications' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-3 md:px-4 py-3 md:py-4">
                    <ul className="space-y-2">
                      {program.specifications.map((spec, index) => (
                        <li key={index} className="text-gray-600 flex items-center text-responsive-sm">
                          <svg className="w-3 h-3 md:w-4 md:h-4 text-sky-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {spec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Suggestions Form */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleAccordion('suggestions')}
                  className="w-full flex items-center justify-between p-3 md:p-4 text-left hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900 text-responsive-sm">YOUR SUGGESTIONS</span>
                  <svg
                    className={`w-4 h-4 md:w-5 md:h-5 transition-transform text-black ${
                      activeAccordion === 'suggestions' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <hr className="border-black" />
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  activeAccordion === 'suggestions' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-3 md:px-4 py-3 md:py-4">
                <SuggestionsForm
                  packageId={programId}
                  packageTitle={program.title}
                  onSuccess={() => {
                    setModalTitle('Thank You!')
                    setModalMessage('Your suggestions have been received. Thank you!')
                    setShowSuccessModal(true)
                    setActiveAccordion(null)
                  }}
                  onError={(message) => {
                    setModalTitle('Error')
                    setModalMessage(message)
                    setShowSuccessModal(true)
                  }}
                />
                  </div>
                </div>
              </div>

              {/* Ürün Yorumları */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleAccordion('reviews')}
                  className="w-full flex items-center justify-between p-3 md:p-4 text-left hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900 text-responsive-sm">CUSTOMER REVİEWS ({programReviews.length})</span>
                  <svg
                    className={`w-4 h-4 md:w-5 md:h-5 transition-transform text-black ${
                      activeAccordion === 'reviews' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <hr className="border-black" />
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  activeAccordion === 'reviews' ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-3 md:px-4 py-3 md:py-4 space-y-3 md:space-y-4">
                    {programReviews.length > 0 ? (
                      programReviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-3 md:pb-4 last:border-b-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="font-medium text-gray-900 text-responsive-sm">{review.user_name}</span>
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-3 h-3 md:w-4 md:h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-responsive-sm text-gray-500">{formatDate(review.created_at)}</span>
                            </div>
                            {user && user.id === review.user_id && (
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="text-red-500 hover:text-red-700 transition-colors ml-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-600 text-responsive-sm">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-responsive-sm text-center py-4">No reviews yet. Be the first to write a review!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={modalTitle}
        message={modalMessage}
      />

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        programId={programId}
        onSuccess={() => {
          setModalTitle('Thank You!')
          setModalMessage('Your review has been submitted successfully!')
          setShowSuccessModal(true)
        }}
      />

      {/* Delete Review Confirmation Modal */}
      {showDeleteConfirm.show && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={cancelDeleteReview}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-sm w-full p-4 md:p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
              Delete Review
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
              Are you sure you want to delete your review? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 md:gap-3">
              <button
                onClick={cancelDeleteReview}
                className="btn-secondary-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReview}
                className="btn-danger-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      <ImageLightbox
        images={[program.image_url_1, program.image_url_2]}
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
        initialIndex={lightboxInitialIndex}
      />
    </div>
  )
} 