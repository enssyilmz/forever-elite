'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, CreditCard, Mail, Calendar } from 'lucide-react'

interface PaymentDetails {
  id: string
  amount_total: number
  currency: string
  customer_email: string
  payment_status: string
  created: number
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (sessionId) {
      fetchPaymentDetails()
    } else {
      setLoading(false)
    }
  }, [sessionId])

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(`/api/get-checkout-session?session_id=${sessionId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch payment details')
      }
      const data = await response.json()
      setPaymentDetails(data)
    } catch (error) {
      console.error('Error fetching payment details:', error)
      setError('Unable to load payment details')
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    const formatted = (amount / 100).toFixed(2)
    const symbol = currency.toUpperCase() === 'GBP' ? '£' : '$'
    return `${symbol}${formatted}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
            <CheckCircle className="w-20 h-20 text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-green-100">
              Your order has been confirmed and you will receive an email receipt shortly.
            </p>
          </div>

          {/* Payment Details */}
          <div className="px-8 py-8">
            {error ? (
              <div className="text-center text-red-600 mb-6">
                <p>{error}</p>
              </div>
            ) : paymentDetails ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Amount Paid</p>
                      <p className="font-semibold text-gray-900">
                        {formatAmount(paymentDetails.amount_total, paymentDetails.currency)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{paymentDetails.customer_email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(paymentDetails.created)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold text-green-600 capitalize">{paymentDetails.payment_status}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                  <p className="text-sm text-gray-600">
                    <strong>Order ID:</strong> {paymentDetails.id}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Confirmed!</h2>
                <p className="text-gray-600">
                  Thank you for your purchase. You will receive an email confirmation shortly.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
              <Link href="/" className="btn-primary px-6 py-3 text-center">
                Back to Homepage
              </Link>
              <Link href="/programs" className="btn-secondary px-6 py-3 text-center">
                Browse More Programs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}