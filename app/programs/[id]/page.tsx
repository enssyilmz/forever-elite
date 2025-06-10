'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'

export default function ProgramDetailPage() {
  const params = useParams()
  const programId = parseInt(params.id as string)
  const { addToCart, addToFavorites, removeFromFavorites, isFavorite, addReview, reviews } = useApp()
  
  const [quantity, setQuantity] = useState(1)
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    name: '',
    rating: 5,
    comment: ''
  })

  const programs = [
    {
      id: 1,
      title: 'Elite Athletes Program',
      bodyFatRange: '6-10% Body Fat',
      description: 'Designed for professional athletes and bodybuilders.',
      longDescription: 'This elite-level program is specifically designed for professional athletes, competitive bodybuilders, and individuals who have already achieved a high level of fitness. The program focuses on extreme cutting protocols, advanced training techniques, and precise nutrition strategies.',
      features: [
        'Advanced cutting protocols',
        'Competition prep guidance', 
        'Supplement optimization',
        'Performance tracking',
        'Elite nutrition plans'
      ],
      originalPrice: 299,
      discountedPrice: 199,
      discount: 33,
      specifications: [
        '12-week intensive program',
        '6 days per week training',
        'Advanced nutrition protocols',
        'Weekly progress assessments'
      ],
      recommendations: [
        'Minimum 2 years of training experience',
        'Current body fat below 12%',
        'Access to well-equipped gym'
      ],
      reviews: []
    },
    {
      id: 2,
      title: 'Advanced Fitness Program',
      bodyFatRange: '10-14% Body Fat',
      description: 'Perfect for experienced fitness enthusiasts.',
      longDescription: 'Built for experienced fitness enthusiasts who want to take their physique to the next level. This program combines advanced strength training protocols with lean muscle maintenance strategies.',
      features: [
        'Advanced strength training',
        'Muscle maintenance protocols',
        'Progressive overload systems',
        'Recovery optimization'
      ],
      originalPrice: 249,
      discountedPrice: 169,
      discount: 32,
      specifications: [
        '10-week progressive program',
        '5 days per week training',
        'Strength-focused protocols',
        'Bi-weekly progress assessments'
      ],
      recommendations: [
        'Minimum 1 year of training',
        'Basic compound movement knowledge',
        'Access to free weights'
      ],
      reviews: []
    },
    {
      id: 3,
      title: 'Active Lifestyle Program',
      bodyFatRange: '14-18% Body Fat',
      description: 'Great for active individuals looking to improve their physique.',
      longDescription: 'Perfect program for active individuals who want to balance fitness with their busy lifestyle. Combines efficient workouts with flexible scheduling options.',
      features: [
        'Balanced training approach',
        'Cardio-strength integration',
        'Lifestyle-friendly schedules',
        'Flexible meal plans'
      ],
      originalPrice: 199,
      discountedPrice: 139,
      discount: 30,
      specifications: [
        '8-week balanced program',
        '4 days per week training',
        'Flexible scheduling options',
        'Weekly progress check-ins'
      ],
      recommendations: [
        'Basic fitness foundation',
        'Consistent workout habit',
        'Time for 4 weekly sessions'
      ],
      reviews: []
    },
    {
      id: 4,
      title: 'Transformation Program',
      bodyFatRange: '18-22% Body Fat',
      description: 'Ideal for those starting their fitness journey.',
      longDescription: 'Comprehensive transformation program designed for beginners who want to make lasting changes. Focus on building healthy habits and sustainable progress.',
      features: [
        'Progressive workout system',
        'Weight loss strategies',
        'Habit formation guidance',
        'Motivation techniques'
      ],
      originalPrice: 179,
      discountedPrice: 129,
      discount: 28,
      specifications: [
        '12-week transformation program',
        '3-4 days per week training',
        'Progressive difficulty increase',
        'Habit tracking tools'
      ],
      recommendations: [
        'Ready to commit to change',
        'Basic gym access',
        'Willingness to track progress'
      ],
      reviews: [
        {
          id: 1,
          name: 'David Wilson',
          rating: 5,
          comment: 'Lost 25 pounds and gained so much confidence! Highly recommend.',
          date: '2024-01-08'
        }
      ]
    },
    {
      id: 5,
      title: 'Beginner Boost Program',
      bodyFatRange: '22-26% Body Fat',
      description: 'Perfect starting point for fitness beginners.',
      longDescription: 'Gentle introduction to fitness with low-impact exercises and gradual progression. Perfect for those who are new to exercise or returning after a long break.',
      features: [
        'Beginner-friendly exercises',
        'Low-impact movements',
        'Gradual progression',
        'Basic nutrition education'
      ],
      originalPrice: 149,
      discountedPrice: 99,
      discount: 34,
      specifications: [
        '8-week beginner program',
        '3 days per week training',
        'Low-impact focus',
        'Educational materials included'
      ],
      recommendations: [
        'New to exercise',
        'Previous injuries or concerns',
        'Prefer gentle approach'
      ],
      reviews: [
        {
          id: 1,
          name: 'Maria Rodriguez',
          rating: 5,
          comment: 'Great for beginners! Felt supported throughout the journey.',
          date: '2024-01-05'
        }
      ]
    },
    {
      id: 6,
      title: 'Health Foundation Program',
      bodyFatRange: '26-30% Body Fat',
      description: 'Focus on building healthy habits and basic fitness.',
      longDescription: 'Foundational program focusing on health improvement rather than intense fitness. Emphasis on building sustainable healthy habits and gentle movement.',
      features: [
        'Gentle movement protocols',
        'Lifestyle modification',
        'Health habit building',
        'Stress management'
      ],
      originalPrice: 129,
      discountedPrice: 89,
      discount: 31,
      specifications: [
        '10-week foundation program',
        '2-3 days per week activities',
        'Health-focused approach',
        'Lifestyle coaching included'
      ],
      recommendations: [
        'Health improvement focus',
        'Gentle approach preferred',
        'Building basic habits'
      ],
      reviews: [
        {
          id: 1,
          name: 'Robert Kim',
          rating: 4,
          comment: 'Helped me build healthy habits that actually stick. Great approach.',
          date: '2024-01-03'
        }
      ]
    },
    {
      id: 7,
      title: 'Wellness Journey Program',
      bodyFatRange: '30%+ Body Fat',
      description: 'Comprehensive approach to health improvement.',
      longDescription: 'Holistic wellness program with medical support and comprehensive health assessment. Focus on safe, sustainable health improvement with professional guidance.',
      features: [
        'Medical supervision',
        'Comprehensive health assessment',
        'Safe progression protocols',
        'Mental health support'
      ],
      originalPrice: 199,
      discountedPrice: 149,
      discount: 25,
      specifications: [
        '16-week wellness program',
        'Medical assessment included',
        'Supervised progression',
        'Mental health resources'
      ],
      recommendations: [
        'Medical clearance obtained',
        'Commitment to long-term change',
        'Open to professional guidance'
      ],
      reviews: [
        {
          id: 1,
          name: 'Jennifer Brown',
          rating: 5,
          comment: 'Life-changing program! The medical support made all the difference.',
          date: '2024-01-01'
        }
      ]
    },
    {
      id: 8,
      title: 'Personalized Program',
      bodyFatRange: 'Custom Body Fat',
      description: 'Tailored specifically to your body composition and goals.',
      longDescription: 'Completely customized program designed specifically for your unique needs, goals, and circumstances. Includes one-on-one coaching and personalized meal and workout plans.',
      features: [
        'Complete personalization',
        'One-on-one coaching',
        'Custom meal plans',
        'Individual workout design'
      ],
      originalPrice: 399,
      discountedPrice: 299,
      discount: 25,
      specifications: [
        'Fully customized duration',
        'Personalized schedule',
        'Individual assessment',
        'Unlimited coach access'
      ],
      recommendations: [
        'Specific unique goals',
        'Previous program experience',
        'Investment in personalization'
      ],
      reviews: [
        {
          id: 1,
          name: 'Thomas Anderson',
          rating: 5,
          comment: 'Worth every penny! Having a personalized approach made all the difference.',
          date: '2023-12-28'
        }
      ]
    }
  ]

  const program = programs.find(p => p.id === programId)

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Program Not Found</h1>
          <Link href="/programs">
            <button className="bg-sky-500 text-white px-6 py-3 rounded-lg">
              Back to Programs
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
    alert('Product added to cart!')
  }

  const handleFavoriteToggle = () => {
    if (isFavorite(programId)) {
      removeFromFavorites(programId)
    } else {
      addToFavorites(programId)
    }
  }

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (reviewForm.name.trim() && reviewForm.comment.trim()) {
      addReview(programId, {
        name: reviewForm.name,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        date: new Date().toISOString().split('T')[0]
      })
      setReviewForm({ name: '', rating: 5, comment: '' })
      setShowReviewForm(false)
      alert('Review added successfully!')
    }
  }

  // Get reviews for this program
  const programReviews = reviews.filter(review => review.programId === programId)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-sky-600">Home</Link></li>
            <li><span className="mx-2">/</span></li>
            <li><Link href="/programs" className="hover:text-sky-600">Programs</Link></li>
            <li><span className="mx-2">/</span></li>
            <li className="text-gray-900">{program.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Sol Taraf - Fotoğraflar */}
          <div className="space-y-4">
            {/* Ana Fotoğraf */}
            <div className={`aspect-square bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl overflow-hidden border-4 transition ${
              isFavorite(programId) ? 'border-red-500' : 'border-transparent'
            }`}>
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-8xl text-white opacity-80">
                  {program.id === 1 ? '💎' : 
                   program.id === 2 ? '🏆' : 
                   program.id === 3 ? '🎯' : 
                   program.id === 4 ? '🔥' : 
                   program.id === 5 ? '⚡' : 
                   program.id === 6 ? '🌟' : 
                   program.id === 7 ? '💪' : '🚀'}
                </div>
              </div>
            </div>

            {/* Thumbnail'ler */}
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((index) => (
                <button
                  key={index}
                  className={`aspect-square bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg overflow-hidden border-2 transition ${
                    isFavorite(programId) 
                      ? 'border-red-500 hover:border-red-600' 
                      : 'border-transparent hover:border-sky-600'
                  }`}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-2xl text-white opacity-80">
                      {program.id === 1 ? '💎' : 
                       program.id === 2 ? '🏆' : 
                       program.id === 3 ? '🎯' : 
                       program.id === 4 ? '🔥' : 
                       program.id === 5 ? '⚡' : 
                       program.id === 6 ? '🌟' : 
                       program.id === 7 ? '💪' : '🚀'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sağ Taraf - Program Bilgileri */}
          <div className="space-y-6">
            {/* Program Başlığı */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-sky-100 text-sky-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {program.bodyFatRange}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{program.title}</h1>
            </div>

            {/* İndirim ve Fiyat */}
            <div className="space-y-2">
              <div className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full inline-block">
                %{program.discount} OFF - Limited Time!
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-sky-600">${program.discountedPrice}</span>
                <span className="text-xl text-gray-400 line-through">${program.originalPrice}</span>
              </div>
            </div>

            {/* Açıklama */}
            <p className="text-gray-600 leading-relaxed">{program.longDescription}</p>

            {/* Miktar ve Butonlar */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-900">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={decreaseQuantity}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 text-black">{quantity}</span>
                  <button
                    onClick={increaseQuantity}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-3 px-6 rounded-lg font-semibold transition btn-primary"
                >
                  Add to Cart
                </button>
                <button className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold transition btn-secondary">
                  Buy Now
                </button>
              </div>
            </div>

            {/* Yorum Yaz */}
            <div className="border-t pt-4">
              <button 
                onClick={() => setShowReviewForm(true)}
                className="text-sky-600 hover:text-sky-700 font-medium"
              >
                📝 Write a Review
              </button>
            </div>

            {/* Favorilere Ekle */}
            <div>
              <button 
                onClick={handleFavoriteToggle}
                className={`font-medium transition ${
                  isFavorite(programId) 
                    ? 'text-red-600 hover:text-red-700' 
                    : 'text-red-500 hover:text-red-600'
                }`}
              >
                {isFavorite(programId) ? '💖 Remove from Favorites' : '❤️ Add to Favorites'}
              </button>
            </div>

            {/* Accordion Bölümler */}
            <div className="space-y-3">
              {/* Ürün Özellikleri */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleAccordion('specifications')}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900">Product Specifications</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${
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
                  <div className="px-4 pb-4">
                    <ul className="space-y-2">
                      {program.specifications.map((spec, index) => (
                        <li key={index} className="text-gray-600 flex items-center">
                          <svg className="w-4 h-4 text-sky-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900">Our Recommendations</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${
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
                  <div className="px-4 pb-4">
                    <ul className="space-y-2">
                      {program.recommendations.map((rec, index) => (
                        <li key={index} className="text-gray-600 flex items-center">
                          <svg className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900">Customer Reviews ({program.reviews.length})</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${
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
                  <div className="px-4 pb-4 space-y-4">
                    {program.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">{review.name}</span>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 