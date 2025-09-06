'use client'

import Link from 'next/link'
import { Package } from 'lucide-react'
import { programs } from '@/lib/packagesData'

interface MyOrdersProps {
  purchases: any[]
  purchasesLoading: boolean
}

export default function MyOrders({ purchases, purchasesLoading }: MyOrdersProps) {
  const allPrograms = programs

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
      <h2 className="text-responsive-lg font-bold mb-4 md:mb-6 text-gray-900">My Orders</h2>
      {purchasesLoading ? (
        <p className="text-responsive-sm text-gray-500">Loading orders...</p>
      ) : purchases.length === 0 ? (
        <div className="text-center py-6 md:py-8">
          <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-responsive-sm text-gray-500 mb-4">You have no orders yet.</p>
          <Link href="/packages" className="btn-primary-sm">
            Browse Packages
          </Link>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {purchases.map((purchase) => {
            // Find the corresponding program details
            const programDetails = allPrograms.find(p => p.title === purchase.package_name)
            const formatAmount = (amount: number, currency: string) => {
              const formatted = (amount / 100).toFixed(2)
              const symbol = currency.toUpperCase() === 'GBP' ? '£' : '$'
              return `${symbol}${formatted}`
            }
            
            return (
              <div key={purchase.id} className="border rounded-lg p-4 md:p-6 bg-gray-50">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 md:mb-4 gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                      {programDetails && (
                        <span className="text-xl md:text-2xl">{programDetails.emoji}</span>
                      )}
                      <div>
                        <h3 className="text-responsive-sm md:text-responsive-base font-semibold text-gray-800">{purchase.package_name}</h3>
                        <p className="text-responsive-sm text-gray-600">Order #{purchase.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    
                    {programDetails && (
                      <p className="text-gray-600 text-responsive-sm mb-2">{programDetails.bodyFatRange}</p>
                    )}
                    
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-responsive-sm text-gray-600">
                      <span><strong>Amount:</strong> {formatAmount(purchase.amount, purchase.currency)}</span>
                      <span><strong>Status:</strong> {purchase.status}</span>
                      <span><strong>Date:</strong> {new Date(purchase.created_at).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Link 
                      href={`/packages/${programDetails?.id || ''}`}
                      className="btn-primary-sm text-center"
                    >
                      View Package
                    </Link>
                    {purchase.status === 'completed' && (
                      <button className="btn-secondary-sm">
                        Download
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
