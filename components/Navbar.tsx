'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Search, User, CreditCard, Check , Star, X, Eye, EyeOff, Headset } from 'lucide-react'
import ShoppingCart from './ShoppingCart'
import { useApp } from '@/contexts/AppContext'
import { programs } from '@/lib/packagesData'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(programs.slice(0, 3)) // Show first 3 by default
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [supportTickets, setSupportTickets] = useState<any[]>([])
  const drawerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const { getCartItemCount, isNavbarOpen, toggleNavbar, user, lastViewedSupportAt, updateLastViewedSupportAt } = useApp()
  const router = useRouter()
  const ADMIN_EMAIL = 'yozdzhansyonmez@gmail.com'

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
    // Localhost'ta dinamik port kullan, production'da environment variable kullan
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.foreverelite.co.uk')
    
    console.log('Google login redirect URL:', `${baseUrl}/api/auth/callback`)
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/api/auth/callback`,
      }
    })
  }

  const handleFacebookLogin = async () => {
    // Localhost'ta dinamik port kullan, production'da environment variable kullan
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.foreverelite.co.uk')
    
    console.log('Facebook login redirect URL:', `${baseUrl}/api/auth/callback`)
    
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${baseUrl}/api/auth/callback`,
      }
    })
  }

    // Get user on component mount
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const { data: { user } } = await supabase.auth.getUser()
        const currentUser = user || session?.user
        console.log('Current user in Navbar:', currentUser)
      } catch (error) {
        console.error('Error getting user:', error)
      }
    }

    getUser()
    // Navbar kendi auth listener'ını kurmuyor; AppContext dinliyor
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        toggleNavbar()
      }
    }

    if (isNavbarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isNavbarOpen, toggleNavbar])

  // Fetch support tickets when user is logged in
  useEffect(() => {
    if (user) {
      const fetchSupportTickets = async () => {
        try {
          const response = await fetch('/api/support-tickets')
          if (response.ok) {
            const data = await response.json()
            setSupportTickets(data.tickets || [])
          }
        } catch (error) {
          console.error('Error fetching support tickets:', error)
        }
      }
      
      fetchSupportTickets()
    }
  }, [user])

  const hasUnreadSupport = supportTickets.some(
    (t) => t.admin_response_at && new Date(t.admin_response_at).getTime() > lastViewedSupportAt
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      if (error.message === 'Invalid login credentials') {
        setError('Incorrect email or password.')
      } else {
        setError(error.message)
      }
    } else {
      toggleNavbar()
      if (data.user?.email === ADMIN_EMAIL) {
        router.push('/admin')
      }
    }
  }

  const handleLogout = async () => {
    try {
      console.log('Logout attempt started...')
      
      // Supabase logout'u önce yap
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Supabase logout error:', error)
        throw error
      }
      
      console.log('Supabase logout successful')
      
      // Local state'i temizle
      setEmail('')
      setPassword('')
      
      // Navbar'ı kapat
      toggleNavbar()
      
      // Ana sayfaya yönlendir
      router.push('/')
      
      console.log('Logout completed successfully')
      
    } catch (error) {
      console.error('Logout exception:', error)
      
      // Even if there is an error, the user is logged out
      toggleNavbar()
      router.push('/')
    }
  }

  const cartItemCount = getCartItemCount()

  return (
    <>
      {/* Mobile & Desktop Responsive Navbar */}
      <nav className="fixed top-0 left-0 right-0 w-full bg-white shadow-md z-50">
        {/* Mobile Layout (md breakpoint altı) */}
        <div className="md:hidden h-14 px-4 flex items-center justify-between">
          {/* Mobile Left: Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-8 h-8 relative overflow-hidden rounded-full border-2 border-gray-200">
              <Image
                src="/logo.jpg"
                alt="Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </Link>
          
          {/* Mobile Center: Compact Navigation */}
          <div className="flex items-center gap-1">
            <Link href="/packages" className="text-xs font-medium text-gray-800 px-2 py-1 rounded hover:bg-sky-50">
              Packages
            </Link>
            <Link href="/bodyfc" className="text-xs font-medium text-gray-800 px-2 py-1 rounded hover:bg-sky-50">
              Calculator
            </Link>
          </div>
          
          {/* Mobile Right: Icons */}
          <div className="flex items-center gap-3">
            <Search 
              className="w-4 h-4 text-gray-600 cursor-pointer" 
              onClick={() => setIsSearchOpen(true)}
            />
            
            <div className="relative">
              <User 
                className="w-4 h-4 text-gray-600 cursor-pointer" 
                onClick={toggleNavbar} 
              />
              {user && (
                <Check className="w-2 h-2 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
              )}
            </div>
            
            <div className="relative">
              <CreditCard 
                className="w-4 h-4 text-gray-600 cursor-pointer" 
                onClick={() => setIsCartOpen(true)} 
              />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {cartItemCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout (md breakpoint ve üstü) */}
        <div className="hidden md:flex h-16 px-6 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 relative overflow-hidden rounded-full border-2 border-gray-200 hover:border-sky-500 transition-colors">
                <Image
                  src="/logo.jpg"
                  alt="Özcan-fit Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </Link>
            {user && user.email === ADMIN_EMAIL && (
              <Link href="/admin" className="text-sm font-semibold text-white bg-red-600 px-3 py-1 rounded-md hover:bg-red-700">
                Admin Panel
              </Link>
            )}
          </div>
          
          <div className="flex gap-6">
            <Link href="/packages" className="font-bold text-gray-800 hover:bg-sky-500 hover:text-white p-3 rounded">
              Packages
            </Link>
            <Link href="/bodyfc" className="font-bold text-gray-800 hover:bg-sky-500 hover:text-white p-3 rounded">
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
            </div>
            
            {/* User Icon with Login Status */}
            <div className="relative">
              <User 
                className="w-5 h-5 text-gray-600 cursor-pointer" 
                onClick={toggleNavbar} 
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
        </div>
      </nav>

      {/* Search Dropdown - Mobile Responsive */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm z-40" onClick={() => setIsSearchOpen(false)}>
          <div className="absolute right-2 top-16 w-80 md:w-96 bg-white rounded-lg shadow-xl border z-60" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Search Packages</h3>
                <X 
                  className="w-5 h-5 text-gray-600 cursor-pointer" 
                  onClick={() => setIsSearchOpen(false)}
                />
              </div>
              
              <input
                type="text"
                placeholder="Search for packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-black"
                autoFocus
              />
              
              <div className="mt-4 max-h-64 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((program) => (
                    <Link
                      key={program.id}
                      href={`/packages/${program.id}`}
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
                    No packages found for "{searchQuery}"
                  </div>
                )}
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <Link
                    href="/packages"
                    onClick={() => setIsSearchOpen(false)}
                    className="block w-full text-center text-sky-600 hover:text-sky-700 font-semibold"
                  >
                    View All Packages →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile & Desktop Sidebar with Responsive Width */}
      {isNavbarOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm z-40"></div>
      )}

      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full bg-white shadow-lg text-black transform transition-transform duration-300 z-50 ${
          isNavbarOpen ? 'translate-x-0' : 'translate-x-full'
        } w-72 sm:w-80 md:w-96`} // Mobile: 288px, SM: 320px, MD+: 384px
      >
        <div className="px-4 py-4 border-b overflow-y-auto h-full">
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
                    setTimeout(() => toggleNavbar(), 100)
                  }}
                >
                  <User className="w-5 h-5 mr-3 text-gray-600" />
                  Edit Profile
                </Link>
                
                <Link 
                  href="/dashboard?section=orders" 
                  className="flex items-center w-full p-3 text-left hover:bg-gray-50 rounded"
                  onClick={() => {
                    setTimeout(() => toggleNavbar(), 100)
                  }}
                >
                  <CreditCard className="w-5 h-5 mr-3 text-gray-600" />
                  View Orders
                </Link>
                
                <Link 
                  href="/dashboard?section=favorites" 
                  className="flex items-center w-full p-3 text-left hover:bg-gray-50 rounded"
                  onClick={() => {
                    setTimeout(() => toggleNavbar(), 100)
                  }}
                >
                  <Star className='w-5 h-5 mr-3 text-gray-600' />
                  My Favorites
                </Link>
                
                <Link 
                  href="/dashboard?section=support" 
                  className={`flex items-center w-full p-3 text-left rounded transition ${
                    hasUnreadSupport 
                      ? 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-400' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    // Mark support tickets as read when clicked
                    if (hasUnreadSupport) {
                      const now = Date.now()
                      updateLastViewedSupportAt(now)
                    }
                    setTimeout(() => toggleNavbar(), 100)
                  }}
                >
                  <Headset className='w-5 h-5 mr-3 text-gray-600' />
                  <span className="flex-1">Support</span>
                  {hasUnreadSupport && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-white">New</span>
                  )}
                </Link>
                
                                 <button 
                   onClick={async (event) => {
                     console.log('Logout button clicked')
                     // Disable button
                     const button = event.target as HTMLButtonElement
                     if (button) {
                       button.disabled = true
                       button.textContent = 'Signing out...'
                     }
                     
                     try {
                       await handleLogout()
                     } catch (error) {
                       console.error('Logout failed:', error)
                       // Butonu tekrar aktif et
                       if (button) {
                         button.disabled = false
                         button.textContent = 'Logout'
                       }
                     }
                   }}
                   className="btn-primary flex items-center w-full p-3 text-left transition disabled:opacity-50"
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
                <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 rounded"
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border p-2 rounded w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-black"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      Remember me
                    </label>
                    <Link 
                      href="/forgot-password" 
                      className="text-gray-600 underline"
                      onClick={() => toggleNavbar()}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="bg-sky-500 text-white py-2 rounded mt-2 hover:bg-white hover:text-sky-500"
                  >
                    Login
                  </button>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </form>
              </div>

              <h2 className="text-lg text-gray-600">NOT A MEMBER YET?</h2>
              <h5 className="text-lg text-gray-500">You can easily become a member.</h5>

              <div className="mt-4 flex flex-col gap-3">
                <Link href="/signup"
                onClick={() => toggleNavbar()}
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