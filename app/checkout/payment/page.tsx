'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { programs } from '@/lib/programsData'
import { CreditCard, Lock, Calendar, User as UserIcon, MessageSquare } from 'lucide-react'
import SuccessModal from '@/components/SuccessModal'
import Link from 'next/link'

export default function PaymentPage() {
  const router = useRouter()
  const { cartItems, getTotalPrice } = useApp()
  const [cardState, setCardState] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    focus: '',
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSmsModal, setShowSmsModal] = useState(false)
  const [smsCode, setSmsCode] = useState('')
  const [smsError, setSmsError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardState((prev) => ({ ...prev, [name]: value }))
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    // Simulate API call to start payment
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsProcessing(false)
    setShowSmsModal(true)
  }

  const handleSmsConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (smsCode === '123456') { // Mock correct code
      setShowSmsModal(false)
      setShowSuccessModal(true)
      // Clear cart or redirect after a delay
      setTimeout(() => {
        // Here you would typically clear the cart and redirect
        // For now, just redirecting to a confirmation page
        router.push('/checkout/confirmation')
      }, 2000)
    } else {
      setSmsError('Invalid code. Please try again.')
    }
  }

  const totalPrice = getTotalPrice()

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Payment</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Total Amount: £{totalPrice.toFixed(2)}</h2>
            </div>
            
            <form onSubmit={handlePay} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="number"
                    className="w-full border rounded-lg p-3 pl-10 text-gray-800"
                    placeholder="0000 0000 0000 0000"
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="expiry"
                      className="w-full border rounded-lg p-3 pl-10 text-gray-800"
                      placeholder="MM/YY"
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="cvc"
                      className="w-full border rounded-lg p-3 pl-10 text-gray-800"
                      placeholder="123"
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    className="w-full border rounded-lg p-3 pl-10 text-gray-800"
                    placeholder="John Doe"
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full btn-primary py-3 mt-4"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay £${totalPrice.toFixed(2)}`}
              </button>
            </form>
          </div>
          
          <div className="text-center mt-4">
            <Link href="/checkout" className="text-sm text-blue-500">Go back to cart</Link>
          </div>
        </div>
      </div>

      {/* SMS Modal */}
      {showSmsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-xl max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">SMS Confirmation</h2>
            <p className="text-gray-600 mb-6">A confirmation code has been sent to your phone. Please enter it below.</p>
            <form onSubmit={handleSmsConfirm}>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value)}
                  className="w-full border rounded-lg p-3 pl-10 text-gray-800"
                  placeholder="Enter 6-digit code"
                  required
                />
              </div>
              {smsError && <p className="text-red-500 text-sm mt-2">{smsError}</p>}
              <button type="submit" className="w-full btn-primary py-3 mt-6">Confirm Payment</button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Payment Successful!"
        message="Your order has been placed successfully. You will be redirected shortly."
      />
    </>
  )
} 