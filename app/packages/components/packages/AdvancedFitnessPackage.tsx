'use client'

import PackageCard from './PackageCard'
import { Package } from '@/lib/database.types'

interface AdvancedFitnessPackageProps {
  package: Package
}

export default function AdvancedFitnessPackage({ package: pkg }: AdvancedFitnessPackageProps) {
  return <PackageCard package={pkg} />
}