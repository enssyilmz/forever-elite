'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Search, User, CreditCard, Check , Star } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User as SupabaseUser } from '@supabase/supabase-js'
import ShoppingCart from './ShoppingCart'

export default function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const drawerRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      }
    })
  }

  const handleFacebookLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      }
    })
  }

  // Get user on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setIsLoginOpen(false)
      }
    }

    if (isLoginOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isLoginOpen])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsLoginOpen(false)
  }

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
          
          {/* User Icon with Login Status */}
          <div className="relative">
            <User 
              className="w-5 h-5 text-gray-600 cursor-pointer" 
              onClick={() => setIsLoginOpen(true)} 
            />
            {user && (
              <Check className="w-3 h-3 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
            )}
          </div>
          
          <CreditCard className="w-5 h-5 text-gray-600 cursor-pointer" onClick={() => setIsCartOpen(true)} />
        </div>
      </nav>

      {isLoginOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm z-40"></div>
      )}

      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg text-black transform transition-transform duration-300 z-50 ${
          isLoginOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="px-4 py-4 border-b">
          {user ? (
            /* Logged In User Menu */
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-700">
                  Welcome, {user.user_metadata?.first_name || user.user_metadata?.name?.split(' ')[0] || 'User'}!
                </h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                <hr className="mt-3" />
              </div>

              <div className="space-y-3">
                <Link 
                  href="/dashboard?section=profile" 
                  className="flex items-center w-full p-3 text-left hover:bg-gray-50 rounded"
                  onClick={() => setIsLoginOpen(false)}
                >
                  <User className="w-5 h-5 mr-3 text-gray-600" />
                  Edit Profile
                </Link>
                
                <Link 
                  href="/dashboard?section=orders" 
                  className="flex items-center w-full p-3 text-left hover:bg-gray-50 rounded"
                  onClick={() => setIsLoginOpen(false)}
                >
                  <CreditCard className="w-5 h-5 mr-3 text-gray-600" />
                  View Orders
                </Link>
                
                <Link 
                  href="/dashboard?section=favorites" 
                  className="flex items-center w-full p-3 text-left hover:bg-gray-50 rounded"
                  onClick={() => setIsLoginOpen(false)}
                >
                  <Star className='w-5 h-5 mr-3 text-gray-600' />
                  My Favorites
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="btn-primary flex items-center w-full p-3 text-left transition"
                >
                  <Check className="w-5 h-5 mr-3" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            /* Login Form */
            <>
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

                <button 
                  onClick={handleFacebookLogin}
                  className="w-full bg-[#3b5998] text-white py-2 rounded hover:bg-[#2d4373] transition"
                >
                  Continue with Facebook
                </button>
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full bg-[#4285F4] text-white py-2 rounded hover:bg-[#3367D6] transition"
                >
                  Continue with Google
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Shopping Cart Component */}
      <ShoppingCart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </>
  )
}
