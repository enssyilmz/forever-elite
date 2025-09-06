'use client'

import PackageCard from './PackageCard'
import { Package } from '@/lib/database.types'

interface TransformationPackageProps {
  package: Package
}

export default function TransformationPackage({ package: pkg }: TransformationPackageProps) {
  return <PackageCard package={pkg} />
}