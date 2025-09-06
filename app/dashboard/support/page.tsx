'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SupportPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard support section
    router.push('/dashboard?section=support')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to support...</p>
      </div>
    </div>
  )
}
