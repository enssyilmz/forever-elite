'use client'

import PackageCard from './PackageCard'
import { Package } from '@/lib/database.types'

interface WellnessJourneyPackageProps {
  package: Package
}

export default function WellnessJourneyPackage({ package: pkg }: WellnessJourneyPackageProps) {
  return <PackageCard package={pkg} />
}