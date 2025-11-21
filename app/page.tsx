// app/page.tsx

'use client'

import Link from 'next/link'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Package } from '@/lib/database.types'

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(4)
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch packages from database
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/packages')
        if (response.ok) {
          const data = await response.json()
          // Filter only active packages and sort by sort_order
          const activePackages = (data.packages || [])
            .filter((pkg: Package) => pkg.is_active)
            .sort((a: Package, b: Package) => a.sort_order - b.sort_order)
          setPackages(activePackages)
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
  
  const numPages = Math.ceil(packages.length / itemsPerPage);
  const currentPage = Math.floor(currentIndex / itemsPerPage);

  const goToPage = (page: number) => {
    const newIndex = page * itemsPerPage;
    // Ensure the new index does not exceed the maximum possible start index
    const maxIndex = packages.length - itemsPerPage;
    setCurrentIndex(Math.min(newIndex, maxIndex));
  };


  // Update items per page based on screen width
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) { // sm
        setItemsPerPage(2) // Mobilde 2 kart
      } else if (window.innerWidth < 1024) { // lg
        setItemsPerPage(3) // Tablet'te 3 kart
      } else {
        setItemsPerPage(4) // Desktop'ta 4 kart
      }
    }

    updateItemsPerPage()
    window.addEventListener('resize', updateItemsPerPage)
    return () => window.removeEventListener('resize', updateItemsPerPage)
  }, [])

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1 >= packages.length - itemsPerPage + 1 ? 0 : prevIndex + 1));
  }, [itemsPerPage, packages.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 < 0 ? packages.length - itemsPerPage : prevIndex - 1));
  }

  // Auto-slide every 10 seconds
  useEffect(() => {
    const interval = setInterval(goToNext, 10000)
    return () => clearInterval(interval)
  }, [goToNext])

  if (loading) {
    return (
      <main>
        <div className="relative h-[70vh] md:h-[85vh] lg:h-screen w-full overflow-hidden -mt-16">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
          >
            <source src="/video/backgroundvideo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="flex flex-col items-center justify-center h-full bg-black/50">
            <h1 className="text-responsive-2xl mb-6 text-center text-white">Discover your power!</h1>
            <button 
              onClick={() => {
                const programsSection = document.getElementById('programs-section');
                programsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-transparent text-white border rounded-xl hover:bg-gray-200 hover:text-black transition text-responsive-sm px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3"
            >
              CHECK OUT THE PACKAGES
            </button>
          </div>
        </div>
        <div id="programs-section" className="py-16 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading packages...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <div className="relative h-[70vh] md:h-[85vh] lg:h-screen w-full overflow-hidden -mt-16">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
        >
          <source src="/video/backgroundvideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Content */}
        <div className="flex flex-col items-center justify-center h-full bg-black/50">
          <h1 className="text-responsive-2xl mb-6 text-center text-white">Discover your power!</h1>
          <button 
            onClick={() => {
              const programsSection = document.getElementById('programs-section');
              programsSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-transparent text-white border rounded-xl hover:bg-gray-200 hover:text-black transition text-responsive-sm px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3"
          >
            CHECK OUT THE PACKAGES
          </button>
        </div>
      </div>

      {/* Programs Section */}
      <div id="programs-section" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-responsive-2xl font-bold text-center mb-4 text-gray-800">
            Body Fat Specific Packages
          </h2>
          <p className="text-responsive-base text-gray-600 text-center mb-12">
            Choose the perfect program based on your current body fat percentage
          </p>
          
          {/* Programs Carousel */}
          <div className="w-full">
            {/* Slider Container */}
            <div className="overflow-hidden w-full">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ 
                  width: `${(packages.length / itemsPerPage) * 100}%`,
                  transform: `translateX(-${(currentIndex / packages.length) * 100}%)`
                }}
              >
                {packages.map((pkg) => (
                  <div 
                    key={pkg.id}
                    className="w-full flex-shrink-0 px-2 sm:px-3"
                    style={{ width: `${100 / packages.length}%`}}
                  >
                    <div
                      className="h-[250px] sm:h-[280px] bg-white rounded-xl shadow-lg p-3 sm:p-4 flex flex-col border hover:border-sky-300 transition hover:shadow-xl"
                    >
                      <div className="text-center mb-2">
                        <span className="bg-sky-100 text-sky-800 text-xs font-semibold px-2 py-0.5 rounded-full border inline-block">
                          {pkg.body_fat_range}
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-xs sm:text-sm lg:text-base font-bold text-gray-800 mb-2 line-clamp-2 text-center">
                          {pkg.title}
                        </h3>

                        <p className="text-gray-600 text-[10px] sm:text-xs mb-3 line-clamp-3 text-center">
                          {pkg.description}
                        </p>
                      </div>

                      <div className="mt-auto">
                        <Link href="/packages">
                          <button className="btn-primary w-full text-xs md:text-sm py-1 sm:py-2 md:py-2.5 px-2 sm:px-3 md:px-4">
                            View All Packages
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Carousel Indicators */}
          <div className="flex justify-center items-center mt-8 space-x-3 w-full">
            {Array.from({ length: numPages }).map((_, index) => (
              <button
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-300 border-2 ${
                  currentPage === index 
                    ? 'bg-sky-500 border-sky-500 shadow-md' 
                    : 'bg-transparent border-sky-300 hover:border-sky-400 hover:bg-sky-100'
                }`}
                onClick={() => goToPage(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
