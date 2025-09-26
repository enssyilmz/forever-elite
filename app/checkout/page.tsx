'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { programs } from '@/lib/packagesData'
import { Trash2, Plus, Minus, Tag, Truck, Receipt, CreditCard } from 'lucide-react'
import Link from 'next/link'
import SuccessModal from '@/components/SuccessModal'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, updateCartQuantity, removeFromCart, getTotalPrice, user } = useApp()
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<{code: string, percentage: number} | null>(null)
  const [discountError, setDiscountError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

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

    try {
      // Prepare items for Stripe
      const stripeItems = cartItems.map(item => {
        const program = programs.find(p => p.id === item.id)
        if (!program) return null
        
        const finalPrice = appliedDiscount 
          ? convertToGBP(program.discountedPrice) * (1 - appliedDiscount.percentage / 100)
          : convertToGBP(program.discountedPrice)

        return {
          name: program.title,
          description: program.bodyFatRange,
          price: finalPrice,
          quantity: item.quantity,
          images: [] // Add program images if available
        }
      }).filter(Boolean)

      if (!customerEmail) {
        showPopup('Error', 'Please enter your email address.')
        return
      }

      setIsProcessing(true)

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: stripeItems,
          customerEmail,
          // Stripe'ın {CHECKOUT_SESSION_ID} placeholder'ını kullanarak confirmation sayfasına session_id ekleyelim
          successUrl: `${window.location.origin}/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout`,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      showPopup('Error', 'There was an error processing your order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (cartItems.length === 0) {
      // Redirect to programs page if cart is empty
      router.push('/packages')
    }
  }, [cartItems, router])

  // Auto-fill user email when user is logged in
  useEffect(() => {
    if (user?.email) {
      setCustomerEmail(user.email)
    }
  }, [user])

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-8 md:py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-xl md:text-responsive-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
          <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">Add some programs to your cart to proceed with checkout.</p>
          <Link href="/packages" className="btn-primary text-sm md:text-base">
            Browse Programs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen py-6 md:py-12">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <h1 className="text-2xl md:text-responsive-2xl font-bold text-gray-900 mb-4 md:mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 md:space-y-4">
              {cartItems.map((item) => {
                const program = programs.find(p => p.id === item.id)
                if (!program) return null

                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm p-3 md:p-6">
                    <div className="flex items-start gap-3 md:gap-4">
                      {/* Program Image/Emoji */}
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg md:text-2xl text-white">{program.emoji}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">{program.title}</h3>
                            <p className="text-xs md:text-sm text-gray-500">{program.bodyFatRange}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </div>

                        <div className="mt-3 md:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs md:text-sm text-gray-600">Quantity:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-1.5 md:p-2 hover:bg-gray-100 rounded-l-lg text-gray-800"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 md:px-4 py-1.5 md:py-2 bg-white border-x border-gray-300 min-w-[2rem] md:min-w-[3rem] text-center text-xs md:text-sm text-gray-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-1.5 md:p-2 hover:bg-gray-100 rounded-r-lg text-gray-800"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs md:text-sm text-gray-600">Total</p>
                            <p className="font-bold text-sm md:text-base text-gray-800">£{(convertToGBP(program.discountedPrice) * item.quantity).toFixed(2)}</p>
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
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 sticky top-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Order Summary</h2>

                {/* Customer Email */}
                <div className="mb-4 md:mb-6">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder={user ? "Auto-filled from your account" : "Enter your email address"}
                    className={`w-full border border-gray-300 rounded-lg text-black px-2 md:px-3 py-2 text-sm md:text-base focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                      user ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    required
                    readOnly={!!user}
                    disabled={!!user}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {user 
                      ? "This email is auto-filled from your logged-in account" 
                      : "Receipt and order updates will be sent to this email"
                    }
                  </p>
                </div>

                {/* Discount Code */}
                <div className="mb-4 md:mb-6">
                  <div className="flex gap-2 text-black">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Enter discount code"
                      className="flex-1 border rounded-lg px-2 md:px-3 py-2 text-sm md:text-base"
                    />
                    <button
                      onClick={applyDiscountCode}
                      className="btn-secondary px-3 md:px-4 text-xs md:text-sm"
                      disabled={!discountCode}
                    >
                      Apply
                    </button>
                  </div>
                  {discountError && (
                    <p className="text-red-500 text-xs md:text-sm mt-2">{discountError}</p>
                  )}
                  {appliedDiscount && (
                    <div className="flex items-center justify-between mt-2 text-green-600 text-xs md:text-sm">
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
                <div className="space-y-2 md:space-y-3 text-gray-600">
                  <div className="flex justify-between text-sm md:text-base">
                    <span>Subtotal</span>
                    <span>£{subtotal.toFixed(2)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600 text-sm md:text-base">
                      <span>Discount</span>
                      <span>-£{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 md:pt-3 font-semibold text-gray-900 text-base md:text-lg">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span>£{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 md:mt-8">
                  <button
                    onClick={handleCompleteOrder}
                    disabled={isProcessing || !customerEmail.trim()}
                    className="w-full btn-primary py-2.5 md:py-3 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      'Pay with Stripe'
                    )}
                  </button>
                </div>

                <div className="mt-3 md:mt-4 text-center">
                  <p className="text-xs md:text-sm text-gray-600">
                    By completing the order, you agree to our <Link href="/policies/terms" className="text-blue-500">Terms of Service</Link> and <Link href="/policies/privacy" className="text-blue-500">Privacy Policy</Link>.
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