'use client'

import PackageCard from './PackageCard'
import { Package } from '@/lib/database.types'

interface BeginnerBoostPackageProps {
  package: Package
}

export default function BeginnerBoostPackage({ package: pkg }: BeginnerBoostPackageProps) {
  return <PackageCard package={pkg} />
}