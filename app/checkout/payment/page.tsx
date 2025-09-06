'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { CreditCard, Lock, Calendar, User as UserIcon, MessageSquare } from 'lucide-react'
import SuccessModal from '@/components/SuccessModal'
import Link from 'next/link'

export default function PaymentPage() {
  const router = useRouter()
  const { getTotalPrice } = useApp()
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
    const { name, value } = e.target;

    if (name === 'number') {
      // Allow only numbers, limit to 16 digits, and format as XXXX XXXX XXXX XXXX
      const cleaned = value.replace(/\D/g, '');
      const formatted = cleaned.substring(0, 16).replace(/(.{4})/g, '$1 ').trim();
      setCardState((prev) => ({ ...prev, number: formatted }));
    } else if (name === 'expiry') {
      // Allow only numbers, limit to 4 digits, and format as MM/YY
      let cleaned = value.replace(/\D/g, '');
      if (cleaned.length > 4) cleaned = cleaned.substring(0, 4);
      let formatted = cleaned;
      if (cleaned.length > 2) {
        formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
      }
      setCardState((prev) => ({ ...prev, expiry: formatted }));
    } else if (name === 'cvc') {
      // Allow only numbers, limit to 3 digits
      const cleaned = value.replace(/\D/g, '').substring(0, 3);
      setCardState((prev) => ({ ...prev, cvc: cleaned }));
    } else if (name === 'name') {
      // Capitalize the first letter of each word
      const formatted = value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      setCardState((prev) => ({ ...prev, name: formatted }));
    } else {
      setCardState((prev) => ({ ...prev, [name]: value }));
    }
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
      <div className="min-h-screen py-12">
        <div className="max-w-md mx-auto px-4">
          <h1 className="text-responsive-2xl font-bold text-gray-900 mb-8 text-center">Payment</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Total Amount: £{totalPrice.toFixed(2)}</h2>
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
                    value={cardState.number}
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
                      value={cardState.expiry}
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
                      value={cardState.cvc}
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
                    value={cardState.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full btn-primary mt-4"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay`}
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
          <div className="bg-white rounded-lg p-4 md:p-8 shadow-xl max-w-xs md:max-w-sm w-full mx-4">
            <h2 className="text-responsive-base md:text-responsive-lg font-bold mb-3 md:mb-4 text-gray-900">SMS Confirmation</h2>
            <p className="text-gray-600 mb-4 md:mb-6 text-responsive-sm">A confirmation code has been sent to your phone. Please enter it below.</p>
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
              <button type="submit" className="w-full btn-primary mt-6">Confirm Payment</button>
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