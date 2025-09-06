'use client'

import PackageCard from './PackageCard'
import { Package } from '@/lib/database.types'

interface EliteAthletesPackageProps {
  package: Package
}

export default function EliteAthletesPackage({ package: pkg }: EliteAthletesPackageProps) {
  return <PackageCard package={pkg} />
}