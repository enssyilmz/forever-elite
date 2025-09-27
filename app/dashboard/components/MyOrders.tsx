'use client'

import Link from 'next/link'
import { Package, ChevronDown, ChevronUp, Diamond, Trophy, Target, Flame, Zap, Star, Rocket, ClipboardList, Utensils, BarChart3, MessageCircle } from 'lucide-react'
import { programs } from '@/lib/packagesData'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabaseClient'

interface MyOrdersProps {
  purchases: any[]
  purchasesLoading: boolean
}

interface PackageDetail {
  id: number
  package_id: number
  title: string
  body_fat_range: string
  description: string
  long_description: string
  features: string[]
  specifications: string[]
  recommendations: string[]
  original_price: number
  discounted_price: number
  discount: number
  icon_name: string
  icon_color: string
}

export default function MyOrders({ purchases, purchasesLoading }: MyOrdersProps) {
  const allPrograms = programs
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [packageDetails, setPackageDetails] = useState<PackageDetail[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)

  useEffect(() => {
    fetchPackageDetails()
  }, [])

  const fetchPackageDetails = async () => {
    setDetailsLoading(true)
    try {
      const { data, error } = await supabase
        .from('package_details')
        .select('*')
        .order('package_id')
      
      if (error) {
        console.error('Error fetching package details:', error)
        // Fallback to hardcoded data if database fails
        setPackageDetails([])
      } else {
        setPackageDetails(data || [])
      }
    } catch (error) {
      console.error('Error fetching package details:', error)
      setPackageDetails([])
    } finally {
      setDetailsLoading(false)
    }
  }

  const toggleExpanded = (purchaseId: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(purchaseId)) {
      newExpanded.delete(purchaseId)
    } else {
      newExpanded.add(purchaseId)
    }
    setExpandedOrders(newExpanded)
  }

  const getPackageIcon = (packageTitle: string) => {
    // First try to get from database
    const dbPackage = packageDetails.find(p => p.title === packageTitle)
    if (dbPackage) {
      const colorClass = `text-${dbPackage.icon_color}-600`
      const iconClass = `w-5 h-5 md:w-6 md:h-6 ${colorClass}`
      switch (dbPackage.icon_name) {
        case 'Diamond': return <Diamond className={iconClass} />
        case 'Trophy': return <Trophy className={iconClass} />
        case 'Target': return <Target className={iconClass} />
        case 'Flame': return <Flame className={iconClass} />
        case 'Zap': return <Zap className={iconClass} />
        case 'Star': return <Star className={iconClass} />
        case 'Rocket': return <Rocket className={iconClass} />
        default: return <Package className={iconClass} />
      }
    }
    
    // Fallback to hardcoded mapping
    const iconClass = "w-5 h-5 md:w-6 md:h-6"
    const iconMap: { [key: string]: React.ReactNode } = {
      'Elite Athletes Package': <Diamond className={`${iconClass} text-purple-600`} />,
      'Advanced Fitness Package': <Trophy className={`${iconClass} text-yellow-600`} />,
      'Active Lifestyle Package': <Target className={`${iconClass} text-blue-600`} />,
      'Transformation Package': <Flame className={`${iconClass} text-red-600`} />,
      'Beginner Boost Package': <Zap className={`${iconClass} text-green-600`} />,
      'Health Foundation Package': <Star className={`${iconClass} text-orange-600`} />,
      'Wellness Journey Package': <Package className={`${iconClass} text-pink-600`} />,
      'Personalized Package': <Rocket className={`${iconClass} text-indigo-600`} />
    }
    return iconMap[packageTitle] || <Package className={`${iconClass} text-gray-600`} />
  }

  return (
    <div className="bg-white p-3 md:p-4 lg:p-6 rounded-lg shadow-md">
      <h2 className="text-base md:text-lg lg:text-xl font-bold mb-3 md:mb-4 lg:mb-6 text-gray-900">My Orders</h2>
      {purchasesLoading ? (
        <p className="text-sm md:text-base text-gray-500">Loading orders...</p>
      ) : purchases.length === 0 ? (
        <div className="text-center py-4 md:py-6 lg:py-8">
          <Package className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
          <p className="text-sm md:text-base text-gray-500 mb-3 md:mb-4">You have no orders yet.</p>
          <Link href="/packages" className="inline-block px-3 py-2 md:px-4 md:py-2 bg-blue-600 text-white text-sm md:text-base rounded-lg hover:bg-blue-700 transition-colors">
            Browse Packages
          </Link>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3 lg:space-y-4">
          {purchases.map((purchase) => {
            // Find the corresponding program details from database first, fallback to hardcoded
            const dbPackage = packageDetails.find(p => p.title === purchase.package_name)
            const programDetails = dbPackage || allPrograms.find(p => p.title === purchase.package_name)
            const isExpanded = expandedOrders.has(purchase.id)
            const formatAmount = (amount: number, currency: string) => {
              const formatted = (amount / 100).toFixed(2)
              const symbol = currency.toUpperCase() === 'GBP' ? '£' : '$'
              return `${symbol}${formatted}`
            }
            
            return (
              <div key={purchase.id} className="border rounded-lg bg-gray-50 overflow-hidden">
                {/* Header Section */}
                <div className="p-3 md:p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-2 md:mb-3 lg:mb-4 gap-2 md:gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                        <div className="flex-shrink-0">
                          {getPackageIcon(purchase.package_name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm md:text-base lg:text-lg font-semibold text-gray-800 truncate">{purchase.package_name}</h3>
                          <p className="text-xs md:text-sm text-gray-600">Order #{purchase.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      
                      {programDetails && (
                        <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">
                          {dbPackage ? dbPackage.body_fat_range : (programDetails as any).bodyFatRange}
                        </p>
                      )}
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 text-xs md:text-sm text-gray-600">
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
                      <button 
                        onClick={() => toggleExpanded(purchase.id)}
                        className="btn-secondary-sm flex items-center justify-center gap-2"
                      >
                        {isExpanded ? (
                          <>
                            <span>Hide Details</span>
                            <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <span>Show Details</span>
                            <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Details Section */}
                {isExpanded && programDetails && (
                  <div className="border-t bg-white p-3 md:p-4 lg:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
                      {/* Program Overview */}
                      <div>
                        <h4 className="text-sm md:text-base font-semibold text-gray-800 mb-2">Program Overview</h4>
                        <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">
                          {dbPackage ? dbPackage.long_description : (programDetails as any).longDescription}
                        </p>
                        
                        <div className="mb-3 md:mb-4">
                          <h5 className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Key Features:</h5>
                          <ul className="list-disc list-inside space-y-0.5 md:space-y-1">
                            {(dbPackage ? dbPackage.features : (programDetails as any).features).map((feature: string, index: number) => (
                              <li key={index} className="text-xs md:text-sm text-gray-600">{feature}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Program Specifications */}
                      <div>
                        <h4 className="text-sm md:text-base font-semibold text-gray-800 mb-2">Program Specifications</h4>
                        <div className="space-y-1 md:space-y-2 mb-3 md:mb-4">
                          {(dbPackage ? dbPackage.specifications : (programDetails as any).specifications).map((spec: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                              <span className="text-xs md:text-sm text-gray-600">{spec}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mb-3 md:mb-4">
                          <h5 className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Recommendations:</h5>
                          <ul className="list-disc list-inside space-y-0.5 md:space-y-1">
                            {(dbPackage ? dbPackage.recommendations : (programDetails as any).recommendations).map((rec: string, index: number) => (
                              <li key={index} className="text-xs md:text-sm text-gray-600">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Additional Package Content */}
                    <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t">
                      <h4 className="text-sm md:text-base font-semibold text-gray-800 mb-2 md:mb-3">What's Included in Your Package</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                        <div className="bg-gray-50 p-2 md:p-3 rounded">
                          <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                            <ClipboardList className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
                            <h5 className="text-xs md:text-sm font-medium text-gray-700">Workout Plans</h5>
                          </div>
                          <ul className="text-xs md:text-sm text-gray-600 space-y-0.5 md:space-y-1">
                            <li>• Detailed exercise instructions</li>
                            <li>• Progressive training schedules</li>
                            <li>• Video demonstrations</li>
                            <li>• Modification options</li>
                          </ul>
                        </div>
                        
                        <div className="bg-gray-50 p-2 md:p-3 rounded">
                          <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                            <Utensils className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                            <h5 className="text-xs md:text-sm font-medium text-gray-700">Nutrition Guide</h5>
                          </div>
                          <ul className="text-xs md:text-sm text-gray-600 space-y-0.5 md:space-y-1">
                            <li>• Customized meal plans</li>
                            <li>• Macro calculations</li>
                            <li>• Recipe collections</li>
                            <li>• Supplement guidance</li>
                          </ul>
                        </div>
                        
                        <div className="bg-gray-50 p-2 md:p-3 rounded">
                          <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                            <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-purple-600 flex-shrink-0" />
                            <h5 className="text-xs md:text-sm font-medium text-gray-700">Progress Tracking</h5>
                          </div>
                          <ul className="text-xs md:text-sm text-gray-600 space-y-0.5 md:space-y-1">
                            <li>• Body measurement charts</li>
                            <li>• Progress photo guides</li>
                            <li>• Performance metrics</li>
                            <li>• Achievement milestones</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Support Information */}
                    <div className="mt-3 md:mt-4 p-2 md:p-3 bg-blue-50 rounded">
                      <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                        <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
                        <h5 className="text-xs md:text-sm font-medium text-blue-800">Support & Community</h5>
                      </div>
                      <p className="text-xs md:text-sm text-blue-700">
                        Access to our private community forum, weekly Q&A sessions, and direct support from certified trainers. 
                        Your success is our priority!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
