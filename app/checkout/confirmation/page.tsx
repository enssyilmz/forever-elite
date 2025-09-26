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

  // Localhost otomatik reconcile: webhook çalışmadığı durumlarda purchases kaydını oluştur.
  useEffect(() => {
    const autoReconcile = async () => {
      if (!sessionId) return
      if (typeof window === 'undefined') return
      if (window.location.hostname !== 'localhost') return // sadece local
      try {
        setReconcileStatus('running')
        setReconcileMessage('Local ortam algılandı, satın alım kaydı senkronize ediliyor...')
        const res = await fetch('/api/reconcile-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId })
        })
        const json = await res.json()
        if (!res.ok) {
          setReconcileStatus('error')
          setReconcileMessage('Reconcile hata: ' + (json.error || 'Bilinmeyen hata'))
          return
        }
        if (json.status === 'already_exists') {
          setReconcileStatus('exists')
          setReconcileMessage('Satın alım zaten kayıtlı (purchase_id: ' + json.purchase_id + ')')
        } else if (json.status === 'reconciled') {
          setReconcileStatus('success')
          setReconcileMessage('Satın alım kaydedildi. (inserted: ' + json.inserted?.join(', ') + ')')
        } else {
          setReconcileStatus('success')
          setReconcileMessage('Durum: ' + json.status)
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
    setReconcileMessage('Tekrar deneniyor...')
    try {
      const res = await fetch('/api/reconcile-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      })
      const json = await res.json()
      if (!res.ok) {
        setReconcileStatus('error')
        setReconcileMessage('Hata: ' + (json.error || 'Bilinmeyen'))
        return
      }
      if (json.status === 'already_exists') {
        setReconcileStatus('exists')
        setReconcileMessage('Zaten kayıtlı (purchase_id: ' + json.purchase_id + ')')
      } else if (json.status === 'reconciled') {
        setReconcileStatus('success')
        setReconcileMessage('Kaydedildi (inserted: ' + json.inserted?.join(', ') + ')')
      } else {
        setReconcileStatus('success')
        setReconcileMessage('Durum: ' + json.status)
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
                    <p className="text-xs text-gray-500 font-medium">Local ortam: Webhook çalışmadığı için otomatik senkron denemesi yapıldı.</p>
                    <div className="text-xs">
                      <span className="font-semibold">Reconcile Durumu:</span>{' '}
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
                      {reconcileStatus === 'running' ? 'Bekleyin...' : 'Tekrar Senkronize Et'}
                    </button>
                    <p className="text-[10px] text-gray-500">Production ortamında bu kutu görünmez; gerçek kayıt Stripe webhook üzerinden gelir.</p>
                  </div>
                )}
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