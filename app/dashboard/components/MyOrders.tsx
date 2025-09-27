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
      switch (dbPackage.icon_name) {
        case 'Diamond': return <Diamond className={`w-6 h-6 ${colorClass}`} />
        case 'Trophy': return <Trophy className={`w-6 h-6 ${colorClass}`} />
        case 'Target': return <Target className={`w-6 h-6 ${colorClass}`} />
        case 'Flame': return <Flame className={`w-6 h-6 ${colorClass}`} />
        case 'Zap': return <Zap className={`w-6 h-6 ${colorClass}`} />
        case 'Star': return <Star className={`w-6 h-6 ${colorClass}`} />
        case 'Rocket': return <Rocket className={`w-6 h-6 ${colorClass}`} />
        default: return <Package className={`w-6 h-6 ${colorClass}`} />
      }
    }
    
    // Fallback to hardcoded mapping
    const iconMap: { [key: string]: React.ReactNode } = {
      'Elite Athletes Package': <Diamond className="w-6 h-6 text-purple-600" />,
      'Advanced Fitness Package': <Trophy className="w-6 h-6 text-yellow-600" />,
      'Active Lifestyle Package': <Target className="w-6 h-6 text-blue-600" />,
      'Transformation Package': <Flame className="w-6 h-6 text-red-600" />,
      'Beginner Boost Package': <Zap className="w-6 h-6 text-green-600" />,
      'Health Foundation Package': <Star className="w-6 h-6 text-orange-600" />,
      'Wellness Journey Package': <Package className="w-6 h-6 text-pink-600" />,
      'Personalized Package': <Rocket className="w-6 h-6 text-indigo-600" />
    }
    return iconMap[packageTitle] || <Package className="w-6 h-6 text-gray-600" />
  }

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
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 md:mb-4 gap-3">
                    <div className="flex-1">
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                      {getPackageIcon(purchase.package_name)}
                      <div>
                        <h3 className="text-responsive-sm md:text-responsive-base font-semibold text-gray-800">{purchase.package_name}</h3>
                        <p className="text-responsive-sm text-gray-600">Order #{purchase.id.slice(0, 8)}</p>
                      </div>
                    </div>
                      
                      {programDetails && (
                        <p className="text-gray-600 text-responsive-sm mb-2">
                          {dbPackage ? dbPackage.body_fat_range : (programDetails as any).bodyFatRange}
                        </p>
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
                  <div className="border-t bg-white p-4 md:p-6">
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                      {/* Program Overview */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Program Overview</h4>
                        <p className="text-gray-600 text-sm mb-3">
                          {dbPackage ? dbPackage.long_description : (programDetails as any).longDescription}
                        </p>
                        
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-700 mb-2">Key Features:</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {(dbPackage ? dbPackage.features : (programDetails as any).features).map((feature: string, index: number) => (
                              <li key={index} className="text-gray-600 text-sm">{feature}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Program Specifications */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Program Specifications</h4>
                        <div className="space-y-2 mb-4">
                          {(dbPackage ? dbPackage.specifications : (programDetails as any).specifications).map((spec: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-gray-600 text-sm">{spec}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mb-4">
                          <h5 className="font-medium text-gray-700 mb-2">Recommendations:</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {(dbPackage ? dbPackage.recommendations : (programDetails as any).recommendations).map((rec: string, index: number) => (
                              <li key={index} className="text-gray-600 text-sm">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Additional Package Content */}
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="font-semibold text-gray-800 mb-3">What's Included in Your Package</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <ClipboardList className="w-5 h-5 text-blue-600" />
                            <h5 className="font-medium text-gray-700">Workout Plans</h5>
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Detailed exercise instructions</li>
                            <li>• Progressive training schedules</li>
                            <li>• Video demonstrations</li>
                            <li>• Modification options</li>
                          </ul>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <Utensils className="w-5 h-5 text-green-600" />
                            <h5 className="font-medium text-gray-700">Nutrition Guide</h5>
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Customized meal plans</li>
                            <li>• Macro calculations</li>
                            <li>• Recipe collections</li>
                            <li>• Supplement guidance</li>
                          </ul>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="w-5 h-5 text-purple-600" />
                            <h5 className="font-medium text-gray-700">Progress Tracking</h5>
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Body measurement charts</li>
                            <li>• Progress photo guides</li>
                            <li>• Performance metrics</li>
                            <li>• Achievement milestones</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Support Information */}
                    <div className="mt-4 p-3 bg-blue-50 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                        <h5 className="font-medium text-blue-800">Support & Community</h5>
                      </div>
                      <p className="text-blue-700 text-sm">
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
