'use client'

import PackageCard from './PackageCard'
import { Package } from '@/lib/database.types'

interface HealthFoundationPackageProps {
  package: Package
}

export default function HealthFoundationPackage({ package: pkg }: HealthFoundationPackageProps) {
  return <PackageCard package={pkg} />
}