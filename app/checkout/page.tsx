'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { programs } from '@/lib/programsData'
import { Trash2, Plus, Minus, Tag, Truck, Receipt, CreditCard } from 'lucide-react'
import Link from 'next/link'
import SuccessModal from '@/components/SuccessModal'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, updateCartQuantity, removeFromCart, getTotalPrice } = useApp()
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<{code: string, percentage: number} | null>(null)
  const [discountError, setDiscountError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')

  const validDiscountCodes = [
    { code: 'WELCOME10', percentage: 10 },
    { code: 'FITNESS20', percentage: 20 },
    { code: 'NEWUSER15', percentage: 15 },
    { code: 'SUMMER25', percentage: 25 }
  ]

  const convertToGBP = (usdPrice: number) => {
    // Convert USD to GBP (approximate exchange rate: 1 USD = 0.79 GBP)
    return Math.round(usdPrice * 0.79)
  }

  const showPopup = (title: string, message: string) => {
    setModalTitle(title)
    setModalMessage(message)
    setShowSuccessModal(true)
  }

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId)
    } else {
      updateCartQuantity(itemId, newQuantity)
    }
  }

  const subtotal = cartItems.reduce((total, item) => {
    const program = programs.find(p => p.id === item.id)
    return total + (program ? convertToGBP(program.discountedPrice) * item.quantity : 0)
  }, 0)

  const discountAmount = appliedDiscount ? Math.round(subtotal * (appliedDiscount.percentage / 100)) : 0
  const subtotalAfterDiscount = subtotal - discountAmount
  const finalTotal = subtotalAfterDiscount

  const applyDiscountCode = () => {
    const discount = validDiscountCodes.find(d => d.code.toLowerCase() === discountCode.toLowerCase())
    if (discount) {
      setAppliedDiscount(discount)
      setDiscountError('')
      showPopup('Discount Applied!', `${discount.percentage}% discount has been applied to your order.`)
    } else {
      setDiscountError('Invalid discount code')
      setAppliedDiscount(null)
    }
  }

  const removeDiscountCode = () => {
    setAppliedDiscount(null)
    setDiscountCode('')
    setDiscountError('')
  }

  const handleCompleteOrder = async () => {
    if (cartItems.length === 0) return
    router.push('/checkout/payment')
  }

  useEffect(() => {
    if (cartItems.length === 0) {
      // Redirect to programs page if cart is empty
      router.push('/programs')
    }
  }, [cartItems, router])

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some programs to your cart to proceed with checkout.</p>
          <Link href="/programs" className="btn-primary px-8 py-3">
            Browse Programs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const program = programs.find(p => p.id === item.id)
                if (!program) return null

                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start gap-4">
                      {/* Program Image/Emoji */}
                      <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl text-white">{program.emoji}</span>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{program.title}</h3>
                            <p className="text-sm text-gray-500">{program.bodyFatRange}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Quantity:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-2 hover:bg-gray-100 rounded-l-lg text-gray-800"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-4 py-2 bg-white border-x border-gray-300 min-w-[3rem] text-center text-gray-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-2 hover:bg-gray-100 rounded-r-lg text-gray-800"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="font-bold text-gray-800">£{(convertToGBP(program.discountedPrice) * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

                {/* Discount Code */}
                <div className="mb-6">
                  <div className="flex gap-2 text-gray-600">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Enter discount code"
                      className="flex-1 border rounded-lg px-3 py-2"
                    />
                    <button
                      onClick={applyDiscountCode}
                      className="btn-secondary px-4"
                      disabled={!discountCode}
                    >
                      Apply
                    </button>
                  </div>
                  {discountError && (
                    <p className="text-red-500 text-sm mt-2">{discountError}</p>
                  )}
                  {appliedDiscount && (
                    <div className="flex items-center justify-between mt-2 text-green-600 text-sm">
                      <span>
                        {appliedDiscount.code} ({appliedDiscount.percentage}% off)
                      </span>
                      <button
                        onClick={removeDiscountCode}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>£{subtotal.toFixed(2)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-£{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 font-semibold text-gray-900 text-lg">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span>£{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={handleCompleteOrder}
                    className="w-full btn-primary py-3"
                  >
                    Complete Order
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    By completing the order, you agree to our <Link href="/terms" className="text-blue-500">Terms of Service</Link> and <Link href="/privacy" className="text-blue-500">Privacy Policy</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </Elements>
  )
} 