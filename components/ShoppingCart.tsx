'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CreditCard, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { programs } from '@/lib/packagesData'
import SuccessModal from './SuccessModal'

interface ShoppingCartProps {
  isCartOpen: boolean
  setIsCartOpen: (isOpen: boolean) => void
}

export default function ShoppingCart({ isCartOpen, setIsCartOpen }: ShoppingCartProps) {
  const cartDrawerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { cartItems, updateCartQuantity, removeFromCart, getTotalPrice } = useApp()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        cartDrawerRef.current &&
        !cartDrawerRef.current.contains(event.target as Node)
      ) {
        setIsCartOpen(false)
      }
    }

    if (isCartOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCartOpen, setIsCartOpen])

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId)
    } else {
      updateCartQuantity(itemId, newQuantity)
    }
  }

  const convertToGBP = (usdPrice: number) => {
    // Convert USD to GBP (approximate exchange rate: 1 USD = 0.79 GBP)
    return Math.round(usdPrice * 0.79)
  }

  const showPopup = (title: string, message: string) => {
    setModalTitle(title)
    setModalMessage(message)
    setShowSuccessModal(true)
  }

  const handleBuyNow = () => {
    if (cartItems.length === 0) return
    
    // Redirect to checkout page
    setIsCartOpen(false)
    router.push('/checkout')
  }

  return (
    <>
      {/* Cart Backdrop */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm z-40"></div>
      )}

      {/* Shopping Cart Drawer - Mobile Responsive */}
      <div
        ref={cartDrawerRef}
        className={`fixed top-0 right-0 h-full bg-white shadow-lg text-black transform transition-transform duration-300 z-50 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        } w-80 sm:w-80 md:w-96`} // Mobile: 320px, SM: 320px, MD+: 384px
      >
        <div className="flex flex-col h-full">
          {/* Header - Mobile Responsive */}
          <div className="px-3 md:px-4 py-3 md:py-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              <h2 className="text-base md:text-lg font-bold text-gray-700">Shopping Cart</h2>
              {cartItems.length > 0 && (
                <span className="bg-sky-500 text-white text-xs rounded-full px-2 py-1">
                  {cartItems.length}
                </span>
              )}
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              /* Empty Cart Content - Mobile Responsive */
              <div className="flex flex-col items-center justify-center py-16 md:py-20 px-4">
                <div className="text-center">
                  <CreditCard className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
                  <p className="text-sm md:text-base text-gray-500 mb-6">Add some amazing fitness packages to get started!</p>
                  
                  <Link 
                    href="/packages"
                    onClick={() => setIsCartOpen(false)}
                    className="btn-primary px-4 md:px-6 py-2 md:py-3 inline-block text-center text-sm md:text-base"
                  >
                    Start Shopping
                  </Link>
                </div>
              </div>
            ) : (
              /* Cart Items - Mobile Responsive */
              <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                {cartItems.map((item) => {
                  const program = programs.find(p => p.id === item.id)
                  return (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-3 md:p-4">
                      <div className="flex items-start gap-2 md:gap-3 mb-3">
                        {/* Program Image/Emoji - Mobile Responsive */}
                        {program && (
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-lg md:text-xl text-white">{program.emoji}</span>
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 mb-1 text-sm md:text-base truncate">{item.title}</h4>
                          <p className="text-sky-600 font-bold text-sm md:text-base">£{convertToGBP(item.price)}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      </div>
                      
                      {/* Quantity Controls - Mobile Responsive */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 md:gap-2">
                          <span className="text-xs md:text-sm text-gray-600">Qty:</span>
                          <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="p-1 md:p-2 hover:bg-gray-100 rounded-l-lg text-gray-800"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 md:px-4 py-1 md:py-2 border-x border-gray-300 min-w-[2rem] md:min-w-[3rem] text-center text-gray-800 text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="p-1 md:p-2 hover:bg-gray-100 rounded-r-lg text-gray-800"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs md:text-sm text-gray-600">Total</p>
                          <p className="font-bold text-gray-800 text-sm md:text-base">£{(convertToGBP(item.price) * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer with Total and Buy Now - Mobile Responsive */}
          {cartItems.length > 0 && (
            <div className="border-t p-3 md:p-4 bg-white">
              <div className="mb-3 md:mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm md:text-base">Subtotal:</span>
                  <span className="font-semibold text-sm md:text-base">£{convertToGBP(getTotalPrice()).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-base md:text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-sky-600">£{convertToGBP(getTotalPrice()).toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={handleBuyNow}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 md:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                Proceed to Checkout
              </button>
              
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full mt-2 border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm md:text-base"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>

      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </>
  )
}