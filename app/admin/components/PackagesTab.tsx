'use client'

import { Edit, Trash2, Package } from 'lucide-react'

interface Package {
  id: number
  title: string
  body_fat_range: string
  description: string
  long_description: string | null
  features: string[]
  image_url: string | null
  price_usd: number
  price_gbp: number
  discounted_price_gbp: number | null
  discount_percentage: number
  emoji: string
  specifications: string[]
  recommendations: string[]
  duration_weeks: number | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export default function PackagesTab({ 
  packages, 
  onEdit, 
  onDelete 
}: { 
  packages: Package[]
  onEdit: (pkg: Package) => void
  onDelete: (pkg: Package) => void
}) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50">
        <p className="text-responsive-sm text-gray-600">Total Packages: <span className="font-semibold">{packages.length}</span></p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-responsive-sm text-left text-gray-600">
          <thead className="text-responsive-sm text-gray-700 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 w-2/5">Package</th>
              <th scope="col" className="px-6 py-3 w-1/6">Body Fat Range</th>
              <th scope="col" className="px-6 py-3 w-1/6">Price</th>
              <th scope="col" className="px-6 py-3 w-1/12">Status</th>
              <th scope="col" className="px-6 py-3 w-1/12">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-responsive-sm text-gray-500">
                  No packages found
                </td>
              </tr>
            ) : (
              packages.map((pkg) => {
                const originalPrice = pkg.price_gbp || 0
                const discountedPrice = pkg.discounted_price_gbp || pkg.price_gbp || 0
                
                return (
                  <tr key={pkg.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-responsive-sm text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">{pkg.emoji}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-responsive-sm text-gray-900 truncate">{pkg.title}</div>
                          <div className="text-responsive-sm text-gray-500 line-clamp-2 max-w-xs">{pkg.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {pkg.body_fat_range}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-left">
                        {pkg.discount_percentage > 0 && (
                          <div className="text-gray-400 text-xs sm:text-sm line-through">
                            £{originalPrice}
                          </div>
                        )}
                        <div className="text-sm sm:text-base md:text-lg font-bold text-sky-600">
                          £{discountedPrice}
                        </div>
                        {pkg.discount_percentage > 0 && (
                          <div className="text-xs text-green-600">
                            {pkg.discount_percentage}% off
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {pkg.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(pkg)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit package"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(pkg)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete package"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
