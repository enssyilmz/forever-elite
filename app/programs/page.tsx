'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { useState } from 'react'
import { programs } from '@/lib/programsData'
import SuccessModal from '@/components/SuccessModal'

export default function ProgramsPage() {
  const router = useRouter()
  const { addToCart } = useApp()
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
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

  const handleAddToCart = async (programId: number) => {
    setAddingToCart(programId)
    addToCart(programId, 1)
    
    const program = programs.find(p => p.id === programId)
    if (program) {
      showPopup('Added to Cart!', `${program.title} has been added to your cart.`)
    }
    
    // Show feedback for 1 second
    setTimeout(() => {
      setAddingToCart(null)
    }, 1000)
  }

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Choose Your Perfect Program
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your body with our scientifically designed programs. Each program is specifically 
            tailored to different body fat percentages for maximum effectiveness.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {programs.map((program) => (
            <div key={program.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Program Image */}
              <div className="relative h-48 bg-gradient-to-br from-sky-400 to-sky-600">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl text-white opacity-80">
                    {program.emoji}
                  </div>
                </div>
                {/* Body Fat Range Badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-white text-sky-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {program.bodyFatRange}
                  </span>
                </div>
              </div>

              {/* Program Content */}
              <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {program.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 flex-1">
                  {program.description}
                </p>

                {/* Features */}
                <ul className="space-y-1 mb-6">
                  {program.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-center">
                      <svg className="w-3 h-3 text-sky-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Pricing */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    {/* Discount */}
                    <div className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                      %{program.discount} OFF
                    </div>
                    
                    {/* Price */}
                    <div className="text-right">
                      <div className="text-gray-400 text-sm line-through">
                        £{convertToGBP(program.originalPrice)}
                      </div>
                      <div className="text-2xl font-bold text-sky-600">
                        £{convertToGBP(program.discountedPrice)}
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-2">
                  <Link href={`/programs/${program.id}`}>
                    <button className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-lg font-semibold transition-colors">
                        View Details
                    </button>
                  </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Not Sure Which Program is Right for You?
            </h2>
            <p className="text-gray-600 mb-6">
              Take our free body fat assessment to get a personalized program recommendation
            </p>
            <Link href="/bodyfc">
              <button className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Take Free Assessment
              </button>
            </Link>
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
  