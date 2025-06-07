// app/page.tsx

'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const programs = [
    {
      id: 1,
      logo: '💎',
      bodyFatRange: '6-10% Body Fat',
      title: 'Elite Athletes Program',
      description: 'Designed for professional athletes and bodybuilders. Extreme cutting and muscle definition workouts.'
    },
    {
      id: 2,
      logo: '🏆',
      bodyFatRange: '10-14% Body Fat',
      title: 'Advanced Fitness Program',
      description: 'Perfect for experienced fitness enthusiasts. Focus on strength building and lean muscle maintenance.'
    },
    {
      id: 3,
      logo: '🎯',
      bodyFatRange: '14-18% Body Fat',
      title: 'Active Lifestyle Program',
      description: 'Great for active individuals looking to improve their physique. Balanced cardio and strength training.'
    },
    {
      id: 4,
      logo: '🔥',
      bodyFatRange: '18-22% Body Fat',
      title: 'Transformation Program',
      description: 'Ideal for those starting their fitness journey. Progressive workouts for sustainable weight loss.'
    },
    {
      id: 5,
      logo: '⚡',
      bodyFatRange: '22-26% Body Fat',
      title: 'Beginner Boost Program',
      description: 'Perfect starting point for fitness beginners. Low-impact exercises with gradual intensity increase.'
    },
    {
      id: 6,
      logo: '🌟',
      bodyFatRange: '26-30% Body Fat',
      title: 'Health Foundation Program',
      description: 'Focus on building healthy habits and basic fitness. Gentle movements and lifestyle changes.'
    },
    {
      id: 7,
      logo: '💪',
      bodyFatRange: '30%+ Body Fat',
      title: 'Wellness Journey Program',
      description: 'Comprehensive approach to health improvement. Medical support and supervised progress tracking.'
    },
    {
      id: 8,
      logo: '🚀',
      bodyFatRange: 'Custom Body Fat',
      title: 'Personalized Program',
      description: 'Tailored specifically to your body composition and goals. One-on-one coaching available.'
    }
  ]

  // Auto-slide every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex + 1 >= programs.length - 3 ? 0 : prevIndex + 1
      )
    }, 10000)

    return () => clearInterval(interval)
  }, [programs.length])

  const visiblePrograms = programs.slice(currentIndex, currentIndex + 4)

  // Manual navigation functions
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? Math.max(0, programs.length - 4) : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + 1 >= programs.length - 3 ? 0 : prevIndex + 1
    )
  }

  return (
    <>
      <div className="relative h-screen w-full overflow-hidden -mt-16">
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
          <h1 className="text-4xl mb-6 text-center read-only">Discover your power!</h1>
          <Link href="/login">
            <button className="bg-transparent text-white border px-6 py-3 rounded-xl hover:bg-gray-200 hover:text-black transition">
            CHECK OUT THE PROGRAMS
            </button>
          </Link>
        </div>
      </div>

      {/* Programs Section */}
      <div className="bg-gray-50 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
            Body Fat Specific Programs
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12">
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
  <div className="overflow-hidden flex-1 max-w-[1320px] mx-auto"> {/* 4 kart × (300px + 24px gap) + extra space */}
    <div 
      className="flex transition-transform duration-1000 ease-in-out gap-6"
      style={{ 
        transform: `translateX(-${currentIndex * (300 + 24)}px)`, // 300px kart + 24px gap
        width: `${programs.length * (300 + 24)}px`
      }}
    >
      {programs.map((program) => (
        <div 
          key={program.id}
          className="w-[300px] h-[410px] bg-white rounded-xl shadow-lg p-6 flex flex-col shrink-0 border hover:border-sky-300 transition hover:shadow-xl"
        >
          <div className="text-4xl w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center text-white mb-4 shadow-lg">
            {program.logo}
          </div>

          <div className="text-right mb-3">
            <span className="bg-sky-100 text-sky-800 text-sm font-semibold px-3 py-1 rounded-full border">
              {program.bodyFatRange}
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-3">{program.title}</h3>

          <p className="text-gray-600 text-sm flex-1 mb-4">{program.description}</p>

          <div className="mt-auto">
            <Link href="/programs">
              <button className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-lg shadow-md transition">
                Learn More
              </button>
            </Link>
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
            {Array.from({ length: Math.ceil(programs.length / 4) }).map((_, index) => (
              <button
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-300 border-2 ${
                  Math.floor(currentIndex / 4) === index 
                    ? 'bg-sky-500 border-sky-500 shadow-md' 
                    : 'bg-transparent border-sky-300 hover:border-sky-400 hover:bg-sky-100'
                }`}
                onClick={() => setCurrentIndex(index * 4)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
