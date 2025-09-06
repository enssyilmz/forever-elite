'use client'

import { Package } from '@/lib/database.types'
import EliteAthletesPackage from './EliteAthletesPackage'
import AdvancedFitnessPackage from './AdvancedFitnessPackage'
import ActiveLifestylePackage from './ActiveLifestylePackage'
import TransformationPackage from './TransformationPackage'
import BeginnerBoostPackage from './BeginnerBoostPackage'
import HealthFoundationPackage from './HealthFoundationPackage'
import WellnessJourneyPackage from './WellnessJourneyPackage'
import PersonalizedPackage from './PersonalizedPackage'

interface PackageRendererProps {
  package: Package
}

export default function PackageRenderer({ package: pkg }: PackageRendererProps) {
  // Package title'ına göre uygun component'i render et
  switch (pkg.title) {
    case 'Elite Athletes Package':
      return <EliteAthletesPackage package={pkg} />
    
    case 'Advanced Fitness Package':
      return <AdvancedFitnessPackage package={pkg} />
    
    case 'Active Lifestyle Package':
      return <ActiveLifestylePackage package={pkg} />
    
    case 'Transformation Package':
      return <TransformationPackage package={pkg} />
    
    case 'Beginner Boost Package':
      return <BeginnerBoostPackage package={pkg} />
    
    case 'Health Foundation Package':
      return <HealthFoundationPackage package={pkg} />
    
    case 'Wellness Journey Package':
      return <WellnessJourneyPackage package={pkg} />
    
    case 'Personalized Package':
      return <PersonalizedPackage package={pkg} />
    
    default:
      // Fallback olarak genel PackageCard kullan
      return <EliteAthletesPackage package={pkg} />
  }
}