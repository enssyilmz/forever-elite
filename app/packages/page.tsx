'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { useState, useMemo, useEffect } from 'react'
import { Package } from '@/lib/database.types'
import SuccessModal from '@/components/SuccessModal'
import PackageSortDropdown, { SortOption } from './components/PackageSortDropdown'
import PackageCard from './components/packages/PackageCard'

export default function PackagesPage() {
  const router = useRouter()
  const { addToCart } = useApp()
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch packages from database
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/packages')
        if (response.ok) {
          const data = await response.json()
          setPackages(data.packages || [])
        } else {
          console.error('Failed to fetch packages')
        }
      } catch (error) {
        console.error('Error fetching packages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  // Sıralama fonksiyonu
  const sortedPackages = useMemo(() => {
    const sorted = [...packages]
    
    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      case 'name-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title))
      case 'price-asc':
        return sorted.sort((a, b) => {
          const priceA = a.discounted_price_gbp || a.price_gbp || 0
          const priceB = b.discounted_price_gbp || b.price_gbp || 0
          return priceA - priceB
        })
      case 'price-desc':
        return sorted.sort((a, b) => {
          const priceA = a.discounted_price_gbp || a.price_gbp || 0
          const priceB = b.discounted_price_gbp || b.price_gbp || 0
          return priceB - priceA
        })
      default:
        return sorted.sort((a, b) => a.sort_order - b.sort_order)
    }
  }, [packages, sortBy])

  const showPopup = (title: string, message: string) => {
    setModalTitle(title)
    setModalMessage(message)
    setShowSuccessModal(true)
  }

  const handleAddToCart = async (packageId: number) => {
    setAddingToCart(packageId)
    addToCart(packageId, 1)
    
    const pkg = packages.find(p => p.id === packageId)
    if (pkg) {
      showPopup('Added to Cart!', `${pkg.title} has been added to your cart.`)
    }
    
    // Show feedback for 1 second
    setTimeout(() => {
      setAddingToCart(null)
    }, 1000)
  }

  return (
    <div className="mt-4 py-4 px-2 md:py-6 md:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-16">
          <div className="text-center mb-6">
            <h1 className="text-responsive-2xl font-bold text-gray-800 mb-6">
              Choose Your Perfect Package
            </h1>
            <p className="text-responsive-lg text-gray-600 max-w-3xl mx-auto">
              Transform your body with our scientifically designed packages. Each package is specifically 
              tailored to different body fat percentages for maximum effectiveness.
            </p>
          </div>
          
          {/* Sort Dropdown - Sağ tarafa yerleştir */}
          <div className="flex justify-end">
            <PackageSortDropdown 
              sortBy={sortBy} 
              onSortChange={setSortBy} 
            />
          </div>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-lg text-gray-600">Loading packages...</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {sortedPackages.map((pkg) => (
              <PackageCard 
                key={pkg.id} 
                package={pkg} 
              />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-8 md:mt-16">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-responsive-xl font-bold text-gray-800 mb-4">
              Not Sure Which Package is Right for You?
            </h2>
            <p className="text-responsive-base text-gray-600 mb-6">
              Take our free body fat assessment to get a personalized package recommendation
            </p>
            <Link href="/body-fat-calculator">
              <button className="btn-primary">
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