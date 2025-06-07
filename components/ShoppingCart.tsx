'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { CreditCard } from 'lucide-react'

interface ShoppingCartProps {
  isCartOpen: boolean
  setIsCartOpen: (isOpen: boolean) => void
}

export default function ShoppingCart({ isCartOpen, setIsCartOpen }: ShoppingCartProps) {
  const cartDrawerRef = useRef<HTMLDivElement>(null)

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

  return (
    <>
      {/* Cart Backdrop */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm z-40"></div>
      )}

      {/* Shopping Cart Drawer */}
      <div
        ref={cartDrawerRef}
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg text-black transform transition-transform duration-300 z-50 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="px-4 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-700">Shopping Cart</h2>
          
          {/* Empty Cart Content */}
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some amazing fitness programs to get started!</p>
              
              <Link 
                href="/programs"
                onClick={() => setIsCartOpen(false)}
                className="btn-primary px-6 py-3 inline-block text-center"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 