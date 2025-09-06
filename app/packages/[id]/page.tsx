'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import SuccessModal from '@/components/SuccessModal'
import ReviewSection from '@/components/ReviewSection'
import { programs } from '@/lib/packagesData' // Import programs

export default function PackageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const programId = parseInt(params.id as string)
  const { addToCart, addToFavorites, removeFromFavorites, isFavorite, reviews } = useApp()
  
  const [quantity, setQuantity] = useState(1)
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')

  const convertToGBP = (usdPrice: number) => {
    // Convert USD to GBP (approximate exchange rate: 1 USD = 0.79 GBP)
    return Math.round(usdPrice * 0.79)
  }

  const showPopup = (title: string, message: string) => {
    setModalTitle(title)
    setModalMessage(message)
    setShowSuccessModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const program = programs.find(p => p.id === programId)

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

  const increaseQuantity = () => setQuantity(prev => prev + 1)
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1)

  const handleAddToCart = () => {
    addToCart(programId, quantity)
    showPopup('Added to Cart!', `${program.title} has been added to your cart.`)
  }

  const handleFavoriteToggle = () => {
    if (isFavorite(programId)) {
      removeFromFavorites(programId)
    } else {
      addToFavorites(programId)
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
          <div className="space-y-3 md:space-y-4">
            {/* Ana Fotoğraf */}
            <div className={`aspect-square bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl md:rounded-2xl overflow-hidden border-2 md:border-4 transition ${
              isFavorite(programId) ? 'border-red-500' : 'border-transparent'
            }`}>
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-4xl md:text-8xl text-white opacity-80">
                  {program.emoji}
                </div>
              </div>
            </div>

            {/* Thumbnail'ler */}
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {[1, 2, 3, 4].map((index) => (
                <button
                  key={index}
                  className={`aspect-square bg-gradient-to-br from-sky-400 to-sky-600 rounded-md md:rounded-lg overflow-hidden border-2 transition ${
                    isFavorite(programId) 
                      ? 'border-red-500 hover:border-red-600' 
                      : 'border-transparent hover:border-sky-600'
                  }`}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-lg md:text-2xl text-white opacity-80">
                      {program.emoji}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sağ Taraf - Program Bilgileri */}
          <div className="space-y-4 md:space-y-6">
            {/* Package Başlığı */}
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <span className="bg-sky-100 text-sky-800 text-responsive-sm font-semibold px-2 md:px-3 py-1 rounded-full">
                  {program.bodyFatRange}
                </span>
              </div>
              <h1 className="text-responsive-xl md:text-responsive-2xl font-bold text-gray-900 mb-3 md:mb-4">{program.title}</h1>
            </div>

            {/* İndirim ve Fiyat */}
            <div className="space-y-2">
              <div className="bg-red-100 text-red-600 text-responsive-sm font-bold px-2 md:px-3 py-1 rounded-full inline-block">
                %{program.discount} OFF - Limited Time!
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-responsive-xl md:text-responsive-2xl font-bold text-sky-600">£{convertToGBP(program.discountedPrice)}</span>
                <span className="text-responsive-base md:text-responsive-lg text-gray-400 line-through">£{convertToGBP(program.originalPrice)}</span>
              </div>
            </div>

            {/* Açıklama */}
            <p className="text-gray-600 leading-relaxed text-responsive-sm md:text-responsive-base">{program.longDescription}</p>

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
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-sky-600 hover:text-sky-700 font-medium text-responsive-sm"
              >
                📝 Write a Review
              </button>
            </div>

            {showReviewForm && (
              <div className="mt-4 md:mt-8">
                <ReviewSection programId={programId} />
              </div>
            )}

            {/* Favorilere Ekle */}
            <div>
              <button 
                onClick={handleFavoriteToggle}
                className={`font-medium transition text-responsive-sm ${
                  isFavorite(programId) 
                    ? 'text-red-600 hover:text-red-700' 
                    : 'text-red-500 hover:text-red-600'
                }`}
              >
                {isFavorite(programId) ? '💖 Remove from Favorites' : '❤️ Add to Favorites'}
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
                  <span className="font-medium text-gray-900 text-responsive-sm">Package Specifications</span>
                  <svg
                    className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${
                      activeAccordion === 'specifications' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeAccordion === 'specifications' && (
                  <div className="px-3 md:px-4 pb-3 md:pb-4">
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
                )}
              </div>

              {/* Önerilerimiz */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleAccordion('recommendations')}
                  className="w-full flex items-center justify-between p-3 md:p-4 text-left hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900 text-responsive-sm">Our Recommendations</span>
                  <svg
                    className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${
                      activeAccordion === 'recommendations' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeAccordion === 'recommendations' && (
                  <div className="px-3 md:px-4 pb-3 md:pb-4">
                    <ul className="space-y-2">
                      {program.recommendations.map((rec, index) => (
                        <li key={index} className="text-gray-600 flex items-center text-responsive-sm">
                          <svg className="w-3 h-3 md:w-4 md:h-4 text-amber-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Ürün Yorumları */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleAccordion('reviews')}
                  className="w-full flex items-center justify-between p-3 md:p-4 text-left hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900 text-responsive-sm">Customer Reviews ({programReviews.length})</span>
                  <svg
                    className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${
                      activeAccordion === 'reviews' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeAccordion === 'reviews' && (
                  <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-3 md:space-y-4">
                    {programReviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-3 md:pb-4 last:border-b-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
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
                        <p className="text-gray-600 text-responsive-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
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
    </div>
  )
} 