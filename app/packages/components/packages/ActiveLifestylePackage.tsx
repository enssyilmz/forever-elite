'use client'

import PackageCard from './PackageCard'
import { Package } from '@/lib/database.types'

interface ActiveLifestylePackageProps {
  package: Package
}

export default function ActiveLifestylePackage({ package: pkg }: ActiveLifestylePackageProps) {
  return <PackageCard package={pkg} />
}