'use client'

import PackageCard from './PackageCard'
import { Package } from '@/lib/database.types'

interface PersonalizedPackageProps {
  package: Package
}

export default function PersonalizedPackage({ package: pkg }: PersonalizedPackageProps) {
  return <PackageCard package={pkg} />
}