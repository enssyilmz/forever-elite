'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function ProgramsPage() {
  const programs = [
    {
      id: 1,
      title: 'Elite Athletes Program',
      bodyFatRange: '6-10% Body Fat',
      description: 'Designed for professional athletes and bodybuilders. Extreme cutting and muscle definition workouts with advanced techniques.',
      features: [
        'Advanced cutting protocols',
        'Competition prep guidance',
        'Supplement optimization',
        'Performance tracking',
        'Elite nutrition plans'
      ],
      image: '/images/elite-program.jpg',
      originalPrice: 299,
      discountedPrice: 199,
      discount: 33
    },
    {
      id: 2,
      title: 'Advanced Fitness Program',
      bodyFatRange: '10-14% Body Fat',
      description: 'Perfect for experienced fitness enthusiasts. Focus on strength building and lean muscle maintenance with scientific approach.',
      features: [
        'Advanced strength training',
        'Muscle maintenance protocols',
        'Progressive overload systems',
        'Recovery optimization',
        'Performance nutrition'
      ],
      image: '/images/advanced-program.jpg',
      originalPrice: 249,
      discountedPrice: 169,
      discount: 32
    },
    {
      id: 3,
      title: 'Active Lifestyle Program',
      bodyFatRange: '14-18% Body Fat',
      description: 'Great for active individuals looking to improve their physique. Balanced cardio and strength training for optimal results.',
      features: [
        'Balanced training approach',
        'Cardio-strength integration',
        'Lifestyle-friendly schedules',
        'Flexible meal plans',
        'Progress tracking tools'
      ],
      image: '/images/active-program.jpg',
      originalPrice: 199,
      discountedPrice: 139,
      discount: 30
    },
    {
      id: 4,
      title: 'Transformation Program',
      bodyFatRange: '18-22% Body Fat',
      description: 'Ideal for those starting their fitness journey. Progressive workouts for sustainable weight loss and body transformation.',
      features: [
        'Progressive workout system',
        'Weight loss strategies',
        'Habit formation guidance',
        'Motivation techniques',
        'Community support'
      ],
      image: '/images/transformation-program.jpg',
      originalPrice: 179,
      discountedPrice: 129,
      discount: 28
    },
    {
      id: 5,
      title: 'Beginner Boost Program',
      bodyFatRange: '22-26% Body Fat',
      description: 'Perfect starting point for fitness beginners. Low-impact exercises with gradual intensity increase for safe progress.',
      features: [
        'Beginner-friendly exercises',
        'Low-impact movements',
        'Gradual progression',
        'Basic nutrition education',
        'Weekly check-ins'
      ],
      image: '/images/beginner-program.jpg',
      originalPrice: 149,
      discountedPrice: 99,
      discount: 34
    },
    {
      id: 6,
      title: 'Health Foundation Program',
      bodyFatRange: '26-30% Body Fat',
      description: 'Focus on building healthy habits and basic fitness. Gentle movements and lifestyle changes for long-term health.',
      features: [
        'Gentle movement protocols',
        'Lifestyle modification',
        'Health habit building',
        'Stress management',
        'Sleep optimization'
      ],
      image: '/images/health-program.jpg',
      originalPrice: 129,
      discountedPrice: 89,
      discount: 31
    },
    {
      id: 7,
      title: 'Wellness Journey Program',
      bodyFatRange: '30%+ Body Fat',
      description: 'Comprehensive approach to health improvement. Medical support and supervised progress tracking for safe transformation.',
      features: [
        'Medical supervision',
        'Comprehensive health assessment',
        'Safe progression protocols',
        'Mental health support',
        'Long-term sustainability'
      ],
      image: '/images/wellness-program.jpg',
      originalPrice: 199,
      discountedPrice: 149,
      discount: 25
    },
    {
      id: 8,
      title: 'Personalized Program',
      bodyFatRange: 'Custom Body Fat',
      description: 'Tailored specifically to your body composition and goals. One-on-one coaching available with personalized meal and workout plans.',
      features: [
        'Complete personalization',
        'One-on-one coaching',
        'Custom meal plans',
        'Individual workout design',
        'Unlimited support'
      ],
      image: '/images/personalized-program.jpg',
      originalPrice: 399,
      discountedPrice: 299,
      discount: 25
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Choose Your Perfect Program
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your body with our scientifically designed programs. Each program is specifically 
            tailored to different body fat percentages for maximum effectiveness.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {programs.map((program) => (
            <div key={program.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Program Image */}
              <div className="relative h-48 bg-gradient-to-br from-sky-400 to-sky-600">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl text-white opacity-80">
                    {program.id === 1 ? '💎' : 
                     program.id === 2 ? '🏆' : 
                     program.id === 3 ? '🎯' : 
                     program.id === 4 ? '🔥' : 
                     program.id === 5 ? '⚡' : 
                     program.id === 6 ? '🌟' : 
                     program.id === 7 ? '💪' : '🚀'}
                  </div>
                </div>
                {/* Body Fat Range Badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-white text-sky-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {program.bodyFatRange}
                  </span>
                </div>
              </div>

              {/* Program Content */}
              <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {program.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 flex-1">
                  {program.description}
                </p>

                {/* Features */}
                <ul className="space-y-1 mb-6">
                  {program.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-center">
                      <svg className="w-3 h-3 text-sky-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Pricing */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    {/* Discount */}
                    <div className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                      %{program.discount} OFF
                    </div>
                    
                    {/* Price */}
                    <div className="text-right">
                      <div className="text-gray-400 text-sm line-through">
                        ${program.originalPrice}
                      </div>
                      <div className="text-2xl font-bold text-sky-600">
                        ${program.discountedPrice}
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link href={`/programs/${program.id}`}>
                    <button className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-lg font-semibold transition-colors">
                      Start Program
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Not Sure Which Program is Right for You?
            </h2>
            <p className="text-gray-600 mb-6">
              Take our free body fat assessment to get a personalized program recommendation
            </p>
            <Link href="/bodyfc">
              <button className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Take Free Assessment
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
  