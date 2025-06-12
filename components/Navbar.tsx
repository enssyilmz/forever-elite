'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Search, User, CreditCard, Check , Star, X } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User as SupabaseUser } from '@supabase/supabase-js'
import ShoppingCart from './ShoppingCart'
import { useApp } from '@/contexts/AppContext'
import { programs } from '@/lib/programsData'

export default function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(programs.slice(0, 3)) // Show first 3 by default
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const drawerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()
  const { getCartItemCount } = useApp()

  const convertToGBP = (usdPrice: number) => {
    // Convert USD to GBP (approximate exchange rate: 1 USD = 0.79 GBP)
    return Math.round(usdPrice * 0.79)
  }

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults(programs.slice(0, 3)) // Show first 3 programs when no search
    } else {
      const filtered = programs.filter(program => 
        program.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(filtered)
    }
  }, [searchQuery])

  // Handle click outside for search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false)
      }
    }

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSearchOpen])

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

  const cartItemCount = getCartItemCount()

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
          {/* Search Component */}
          <div className="relative" ref={searchRef}>
            <Search 
              className="w-5 h-5 text-gray-600 cursor-pointer" 
              onClick={() => setIsSearchOpen(true)}
            />
            
            {/* Search Dropdown */}
            {isSearchOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-60">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Search Programs</h3>
                    <X 
                      className="w-5 h-5 text-gray-600 cursor-pointer" 
                      onClick={() => setIsSearchOpen(false)}
                    />
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Search for programs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    autoFocus
                  />
                  
                  <div className="mt-4 max-h-64 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((program) => (
                        <Link
                          key={program.id}
                          href={`/programs/${program.id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="text-2xl mr-3">{program.emoji}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{program.title}</h4>
                            <p className="text-sm text-gray-600">{program.bodyFatRange}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400 line-through">£{convertToGBP(program.originalPrice)}</div>
                            <div className="font-bold text-sky-600">£{convertToGBP(program.discountedPrice)}</div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No programs found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <Link
                        href="/programs"
                        onClick={() => setIsSearchOpen(false)}
                        className="block w-full text-center text-sky-600 hover:text-sky-700 font-semibold"
                      >
                        View All Programs →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
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
          
          {/* Shopping Cart with Badge */}
          <div className="relative">
            <CreditCard 
              className="w-5 h-5 text-gray-600 cursor-pointer" 
              onClick={() => setIsCartOpen(true)} 
            />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </div>
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
                  onClick={() => {
                    setTimeout(() => setIsLoginOpen(false), 100)
                  }}
                >
                  <User className="w-5 h-5 mr-3 text-gray-600" />
                  Edit Profile
                </Link>
                
                <Link 
                  href="/dashboard?section=orders" 
                  className="flex items-center w-full p-3 text-left hover:bg-gray-50 rounded"
                  onClick={() => {
                    setTimeout(() => setIsLoginOpen(false), 100)
                  }}
                >
                  <CreditCard className="w-5 h-5 mr-3 text-gray-600" />
                  View Orders
                </Link>
                
                <Link 
                  href="/dashboard?section=favorites" 
                  className="flex items-center w-full p-3 text-left hover:bg-gray-50 rounded"
                  onClick={() => {
                    setTimeout(() => setIsLoginOpen(false), 100)
                  }}
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
