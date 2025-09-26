'use client'

import { useState, useEffect, MouseEvent } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'
import { programs } from '@/lib/packagesData'
import { useRouter } from 'next/navigation'

interface SearchPackagesProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchPackages({ isOpen, onClose }: SearchPackagesProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  const convertToGBP = (usd: number) => Math.round(usd * 0.8)

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults(programs.slice(0, 3))
      return
    }
    const q = searchQuery.toLowerCase()
    const filtered = programs.filter(program =>
      program.title.toLowerCase().includes(q) ||
      program.bodyFatRange.toLowerCase().includes(q)
    )
    setSearchResults(filtered)
  }, [searchQuery])

  const handlePackageClick = (e: MouseEvent, program: typeof programs[0]) => {
    e.preventDefault()
    e.stopPropagation()
    onClose() // önce modalı kapat
    router.push(`/packages/${program.id}`) // client-side navigate
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm z-50"
      onClick={onClose}
      onMouseDown={(e) => {
        // Navbar tarafındaki mousedown dinleyicilerine yakalanmasın
        e.stopPropagation()
      }}
    >
      <div
        id="search-packages-panel"
        className="absolute right-2 top-16 w-72 sm:w-80 md:w-96 bg-white rounded-lg shadow-xl border z-50"
        onClick={(e) => { e.stopPropagation(); e.preventDefault() }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-responsive-sm md:text-responsive-base font-semibold text-gray-800">Search Packages</h3>
            <X
              className="w-4 h-4 md:w-5 md:h-5 text-gray-600 cursor-pointer"
              onClick={onClose}
            />
          </div>

          <input
            type="text"
            placeholder="Search for packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 md:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-black text-responsive-sm"
            autoFocus
          />

          <div className="mt-3 md:mt-4 max-h-48 md:max-h-64 overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map((program) => (
                <div
                  key={program.id}
                  onClick={(e) => handlePackageClick(e, program)}
                  className="flex items-center w-full p-2 md:p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 mr-2 md:mr-3 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {program.image_url_1 ? (
                      <img 
                        src={program.image_url_1} 
                        alt={program.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg md:text-2xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-responsive-sm md:text-responsive-base truncate">
                      {program.title}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-600">{program.bodyFatRange}</p>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-xs md:text-sm text-gray-400 line-through">£{convertToGBP(program.originalPrice)}</div>
                    <div className="font-bold text-sky-600 text-responsive-sm md:text-responsive-base">£{convertToGBP(program.discountedPrice)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 md:p-4 text-center text-gray-500 text-responsive-sm">
                No packages found for "{searchQuery}"
              </div>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
              <Link
                href="/packages"
                onClick={onClose}
                className="block w-full text-center text-sky-600 hover:text-sky-700 font-semibold text-responsive-sm md:text-responsive-base"
              >
                View All Packages →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
