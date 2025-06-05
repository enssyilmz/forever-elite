'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Search, User, CreditCard } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const cartDrawerRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      }
    })
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Login drawer
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setIsLoginOpen(false)
      }
      
      // Cart drawer
      if (
        cartDrawerRef.current &&
        !cartDrawerRef.current.contains(event.target as Node)
      ) {
        setIsCartOpen(false)
      }
    }

    if (isLoginOpen || isCartOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isLoginOpen, isCartOpen])

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 w-full h-16 bg-white shadow-md px-6 flex items-center justify-between z-50">
        <div className="flex gap-6">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-black">
            Özcan-fit
          </Link>
        </div>
        <div className="flex gap-6">
          <Link href="/programs" className="font-bold text-gray-800 font-small hover:bg-sky-500 hover:text-white p-3 ">
            Programs
          </Link>
          <Link href="/bodyfc" className="font-bold text-gray-800 font-small hover:bg-sky-500 hover:text-white p-3">
            Body fat calculator
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 text-gray-600 cursor-pointer" />
          <User className="w-5 h-5 text-gray-600 cursor-pointer" onClick={() => setIsLoginOpen(true)} />
          <CreditCard className="w-5 h-5 text-gray-600 cursor-pointer" onClick={() => setIsCartOpen(true)} />
        </div>
      </nav>

      {isLoginOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm z-40"></div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm z-40"></div>
      )}

      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg text-black transform transition-transform duration-300 z-50 ${
          isLoginOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="px-4 py-4 border-b">
          <h2 className="text-lg text-gray-600">Welcome!</h2>
          <h5 className="text-lg text-gray-500">Log in for fast and secure shopping!</h5>

          <div className="py-6">
            <form className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="E-mail"
                className="border p-2 rounded"
              />
              <input
                type="password"
                placeholder="Password"
                className="border p-2 rounded"
              />

              <div className="flex items-center justify-between text-sm text-gray-600">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-black" />
                  Remember me
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-gray-600 underline"
                  onClick={() => setIsLoginOpen(false)}
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="bg-sky-500 text-white py-2 rounded mt-2 hover:bg-white hover:text-sky-500"
                onSubmit={() => {
                  setIsLoginOpen(false);
                }}>
                Login
              </button>
              
            </form>
          </div>

          <h2 className="text-lg text-gray-600">NOT A MEMBER YET?</h2>
          <h5 className="text-lg text-gray-500">You can easily become a member.</h5>

          <div className="mt-4 flex flex-col gap-3">
            <Link href="/signup"
            onClick={() => setIsLoginOpen(false)}
            className="bg-black text-white py-2 rounded mt-2 text-center hover:bg-white hover:text-black">
              Sign Up
            </Link>

            <button className="w-full bg-[#3b5998] text-white py-2 rounded">
              Continue with Facebook
            </button>
            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-[#4285F4] text-white py-2 rounded hover:bg-[#3367D6] transition"
            >
              Continue with Google
            </button>
          </div>
        </div>
      </div>

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
