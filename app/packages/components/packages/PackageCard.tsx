'use client'

import Link from 'next/link'
import { Package } from '@/lib/database.types'

interface PackageCardProps {
  package: Package
}

export default function PackageCard({ package: pkg }: PackageCardProps) {
  // Fiyat değerlerini güvenli şekilde al
  const originalPrice = pkg.price_gbp || 0
  const discountedPrice = pkg.discounted_price_gbp || pkg.price_gbp || 0

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      {/* Package Image */}
      <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 bg-gradient-to-br from-sky-400 to-sky-600 flex-shrink-0">
        {pkg.image_url_1 ? (
          <img 
            src={`${pkg.image_url_1}`} 
            alt={pkg.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white opacity-80">
              📦
            </div>
          </div>
        )}
        {/* Body Fat Range Badge */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
          <span className="bg-white text-sky-800 text-xs font-semibold px-2 py-1 sm:px-3 rounded-full">
            {pkg.body_fat_range}
          </span>
        </div>
      </div>

      {/* Package Content */}
      <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-1">
        <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 mb-2 sm:mb-3 line-clamp-2">
          {pkg.title}
        </h3>
        
        <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6 flex-1 line-clamp-3">
          {pkg.description}
        </p>

        {/* Pricing and CTA */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            {/* Discount */}
            <div className="bg-red-100 text-red-600 text-xs font-bold px-1 py-0.5 sm:px-2 sm:py-1 rounded">
              %{pkg.discount_percentage || 0} OFF
            </div>
            
            {/* Price */}
            <div className="text-right">
              <div className="text-gray-400 text-xs sm:text-sm line-through">
                £{originalPrice}
              </div>
              <div className="text-sm sm:text-base md:text-lg font-bold text-sky-600">
                £{discountedPrice}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Link href={`/packages/${pkg.id}`}>
            <button className="btn-primary w-full text-xs sm:text-sm py-2 sm:py-3">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}