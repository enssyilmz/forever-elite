'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, CreditCard, Mail, Calendar, Package } from 'lucide-react'

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
  const [reconcileStatus, setReconcileStatus] = useState<'idle' | 'running' | 'success' | 'exists' | 'error'>('idle')
  const [reconcileMessage, setReconcileMessage] = useState('')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [emailMessage, setEmailMessage] = useState('')

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
      
      // Payment details yüklendikten sonra email gönder
      if (data && data.customer_email) {
        sendPackageEmail(data.customer_email)
      }
    } catch (error) {
      console.error('Error fetching payment details:', error)
      setError('Unable to load payment details')
    } finally {
      setLoading(false)
    }
  }

  const sendPackageEmail = async (customerEmail: string) => {
    if (!sessionId) return
    
    setEmailStatus('sending')
    setEmailMessage('Sending package content via email...')
    
    try {
      const response = await fetch('/api/send-package-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId, 
          customerEmail 
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setEmailStatus('sent')
        setEmailMessage(`Package content sent to ${customerEmail}!`)
      } else {
        setEmailStatus('error')
        setEmailMessage('Error sending email: ' + (result.error || 'Unknown error'))
      }
    } catch (error: any) {
      setEmailStatus('error')
      setEmailMessage('Email sending error: ' + error.message)
    }
  }

  // Localhost otomatik reconcile: webhook çalışmadığı durumlarda purchases kaydını oluştur.
  useEffect(() => {
    const autoReconcile = async () => {
      if (!sessionId) return
      if (typeof window === 'undefined') return
      if (window.location.hostname !== 'localhost') return // sadece local
      try {
        setReconcileStatus('running')
        setReconcileMessage('Local environment detected, synchronizing purchase record...')
        const res = await fetch('/api/reconcile-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId })
        })
        const json = await res.json()
        if (!res.ok) {
          setReconcileStatus('error')
          setReconcileMessage('Reconcile error: ' + (json.error || 'Unknown error'))
          return
        }
        if (json.status === 'already_exists') {
          setReconcileStatus('exists')
          setReconcileMessage('Purchase already recorded (purchase_id: ' + json.purchase_id + ')')
        } else if (json.status === 'reconciled') {
          setReconcileStatus('success')
          setReconcileMessage('Purchase recorded. (inserted: ' + json.inserted?.join(', ') + ')')
        } else {
          setReconcileStatus('success')
          setReconcileMessage('Status: ' + json.status)
        }
      } catch (e: any) {
        setReconcileStatus('error')
        setReconcileMessage('Reconcile exception: ' + e.message)
      }
    }
    autoReconcile()
  }, [sessionId])

  const manualReconcile = async () => {
    if (!sessionId) return
    setReconcileStatus('running')
    setReconcileMessage('Retrying...')
    try {
      const res = await fetch('/api/reconcile-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      })
      const json = await res.json()
      if (!res.ok) {
        setReconcileStatus('error')
        setReconcileMessage('Error: ' + (json.error || 'Unknown'))
        return
      }
      if (json.status === 'already_exists') {
        setReconcileStatus('exists')
        setReconcileMessage('Already recorded (purchase_id: ' + json.purchase_id + ')')
      } else if (json.status === 'reconciled') {
        setReconcileStatus('success')
        setReconcileMessage('Recorded (inserted: ' + json.inserted?.join(', ') + ')')
      } else {
        setReconcileStatus('success')
        setReconcileMessage('Status: ' + json.status)
      }
    } catch (e: any) {
      setReconcileStatus('error')
      setReconcileMessage('Exception: ' + e.message)
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
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen  py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
            <CheckCircle className="w-20 h-20 text-white mx-auto mb-4" />
            <h1 className="text-responsive-2xl font-bold text-white mb-2">Payment Successful!</h1>
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

                <div className=" rounded-lg p-4 mt-6">
                  <p className="text-sm text-gray-600">
                    <strong>Order ID:</strong> {paymentDetails.id}
                  </p>
                </div>
                {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
                  <div className="mt-6 p-4 border rounded-lg bg-gray-50 space-y-3">
                    <p className="text-xs text-gray-500 font-medium">Local environment: Automatic sync attempted as webhook is not working.</p>
                    <div className="text-xs">
                      <span className="font-semibold">Reconcile Status:</span>{' '}
                      <span className={
                        reconcileStatus === 'success' || reconcileStatus === 'exists' ? 'text-green-600' : 
                        reconcileStatus === 'error' ? 'text-red-600' : 'text-gray-700'
                      }>
                        {reconcileStatus}
                      </span>
                    </div>
                    {reconcileMessage && (
                      <div className="text-[11px] text-gray-700 break-all">{reconcileMessage}</div>
                    )}
                    <button
                      onClick={manualReconcile}
                      disabled={reconcileStatus === 'running'}
                      className="px-3 py-1.5 text-xs rounded bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
                    >
                      {reconcileStatus === 'running' ? 'Please wait...' : 'Resync'}
                    </button>
                    <p className="text-[10px] text-gray-500">This box is not visible in production; actual record comes via Stripe webhook.</p>
                  </div>
                )}

                {/* Email Status */}
                <div className="mt-6 p-4 border rounded-lg bg-blue-50 space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-medium text-blue-800">Package Content Email Status</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Status:</span>{' '}
                    <span className={
                      emailStatus === 'sent' ? 'text-green-600' : 
                      emailStatus === 'error' ? 'text-red-600' : 
                      emailStatus === 'sending' ? 'text-blue-600' : 'text-gray-700'
                    }>
                      {emailStatus === 'idle' ? 'Pending' :
                       emailStatus === 'sending' ? 'Sending...' :
                       emailStatus === 'sent' ? 'Sent ✓' :
                       emailStatus === 'error' ? 'Error' : emailStatus}
                    </span>
                  </div>
                  {emailMessage && (
                    <div className="text-xs text-gray-700">{emailMessage}</div>
                  )}
                  {emailStatus === 'error' && (
                    <button
                      onClick={() => paymentDetails && sendPackageEmail(paymentDetails.customer_email)}
                      className="px-3 py-1.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Resend
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 font-bold">
                  Thank you for your purchase. You will receive an email confirmation shortly.
                </p>
              </div>
            )}
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t justify-center">
              <a 
                href="https://gmail.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary text-center flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Mail className="w-5 h-5" />
                View My Email
              </a>
              <Link href="/dashboard?section=orders" className="btn-secondary text-center flex items-center justify-center gap-2 w-full sm:w-auto">
                <Package className="w-5 h-5" />
                My Orders
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
      <div className="min-h-screen  flex items-center justify-center">
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