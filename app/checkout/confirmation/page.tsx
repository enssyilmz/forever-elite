'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center bg-white p-12 rounded-lg shadow-xl">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. You will receive an email confirmation shortly.
        </p>
        <Link href="/" className="btn-primary px-8 py-3">
          Back to Homepage
        </Link>
      </div>
    </div>
  )
} 