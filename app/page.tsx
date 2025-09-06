// app/page.tsx

'use client'

import Link from 'next/link'
import { useEffect, useState, useRef, useCallback } from 'react'

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(4)

  const programs = [
    {
      id: 1,
      logo: '💎',
      bodyFatRange: '6-10% Body Fat',
      title: 'Elite Athletes Package',
      description: 'Designed for professional athletes and bodybuilders. Extreme cutting and muscle definition workouts.'
    },
    {
      id: 2,
      logo: '🏆',
      bodyFatRange: '10-14% Body Fat',
      title: 'Advanced Fitness Package',
      description: 'Perfect for experienced fitness enthusiasts. Focus on strength building and lean muscle maintenance.'
    },
    {
      id: 3,
      logo: '🎯',
      bodyFatRange: '14-18% Body Fat',
      title: 'Active Lifestyle Package',
      description: 'Great for active individuals looking to improve their physique. Balanced cardio and strength training.'
    },
    {
      id: 4,
      logo: '🔥',
      bodyFatRange: '18-22% Body Fat',
      title: 'Transformation Package',
      description: 'Ideal for those starting their fitness journey. Progressive workouts for sustainable weight loss.'
    },
    {
      id: 5,
      logo: '⚡',
      bodyFatRange: '22-26% Body Fat',
      title: 'Beginner Boost Package',
      description: 'Perfect starting point for fitness beginners. Low-impact exercises with gradual intensity increase.'
    },
    {
      id: 6,
      logo: '🌟',
      bodyFatRange: '26-30% Body Fat',
      title: 'Health Foundation Package',
      description: 'Focus on building healthy habits and basic fitness. Gentle movements and lifestyle changes.'
    },
    {
      id: 7,
      logo: '💪',
      bodyFatRange: '30%+ Body Fat',
      title: 'Wellness Journey Package',
      description: 'Comprehensive approach to health improvement. Medical support and supervised progress tracking.'
    },
    {
      id: 8,
      logo: '🚀',
      bodyFatRange: 'Custom Body Fat',
      title: 'Personalized Package',
      description: 'Tailored specifically to your body composition and goals. One-on-one coaching available.'
    }
  ]
  
  const numPages = Math.ceil(programs.length / itemsPerPage);
  const currentPage = Math.floor(currentIndex / itemsPerPage);

  const goToPage = (page: number) => {
    const newIndex = page * itemsPerPage;
    // Ensure the new index does not exceed the maximum possible start index
    const maxIndex = programs.length - itemsPerPage;
    setCurrentIndex(Math.min(newIndex, maxIndex));
  };


  // Update items per page based on screen width
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) { // sm
        setItemsPerPage(1)
      } else if (window.innerWidth < 1024) { // lg
        setItemsPerPage(2)
      } else {
        setItemsPerPage(4)
      }
    }

    updateItemsPerPage()
    window.addEventListener('resize', updateItemsPerPage)
    return () => window.removeEventListener('resize', updateItemsPerPage)
  }, [])

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1 >= programs.length - itemsPerPage + 1 ? 0 : prevIndex + 1));
  }, [itemsPerPage, programs.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 < 0 ? programs.length - itemsPerPage : prevIndex - 1));
  }

  // Auto-slide every 10 seconds
  useEffect(() => {
    const interval = setInterval(goToNext, 10000)
    return () => clearInterval(interval)
  }, [goToNext])

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
          <div className="flex items-center justify-center gap-4 w-full px-4">
  {/* Sol Buton */}
  <button 
    onClick={goToPrevious}
    className="bg-sky-500 hover:bg-sky-600 text-white p-3 rounded-full shadow-lg transition flex-shrink-0 z-10"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  </button>

  {/* Slider Container */}
  <div className="overflow-hidden flex-1 w-full">
    <div 
      className="flex transition-transform duration-700 ease-in-out"
      style={{ 
        width: `${(programs.length / itemsPerPage) * 100}%`,
        transform: `translateX(-${(currentIndex / programs.length) * 100}%)`
      }}
    >
      {programs.map((program) => (
        <div 
          key={program.id}
          className="w-full flex-shrink-0 p-3"
          style={{ width: `${100 / programs.length}%`}}
        >
          <div
            className="h-[410px] bg-white rounded-xl shadow-lg p-6 flex flex-col border hover:border-sky-300 transition hover:shadow-xl"
          >
            <div className="text-responsive-xl w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center text-white mb-4 shadow-lg">
              {program.logo}
            </div>

            <div className="text-right mb-3">
              <span className="bg-sky-100 text-sky-800 text-sm font-semibold px-3 py-1 rounded-full border">
                {program.bodyFatRange}
              </span>
            </div>

            <h3 className="text-responsive-lg font-bold text-gray-800 mb-3">{program.title}</h3>

            <p className="text-gray-600 text-responsive-sm flex-1 mb-4">{program.description}</p>

            <div className="mt-auto">
              <Link href="/packages">
                <button className="btn-primary w-full">
                  View All Packages
                </button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Sağ Buton */}
  <button 
    onClick={goToNext}
    className="bg-sky-500 hover:bg-sky-600 text-white p-3 rounded-full shadow-lg transition flex-shrink-0 z-10"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </button>
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
