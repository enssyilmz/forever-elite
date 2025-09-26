'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Search, User, CreditCard, Check , Star, Eye, EyeOff, Headset, Dumbbell } from 'lucide-react'
import ShoppingCart from './ShoppingCart'
import SearchPackages from './SearchPackages'
import { useApp } from '@/contexts/AppContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'

export default function Navbar() {
  const router = useRouter()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [supportTickets, setSupportTickets] = useState<any[]>([])
  const drawerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const { getCartItemCount, isNavbarOpen, toggleNavbar, user, lastViewedSupportAt, updateLastViewedSupportAt, customPrograms, lastViewedProgramsAt, updateLastViewedProgramsAt } = useApp()
  const ADMIN_EMAIL = 'yozdzhansyonmez@gmail.com'

  // GOOGLE OAUTH
  const handleGoogleLogin = async () => {
    const baseUrl =
      process.env.NODE_ENV === 'development'
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.foreverelite.co.uk')

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/api/auth/callback`,
      }
    })
  }

  // FACEBOOK OAUTH
  const handleFacebookLogin = async () => {
    const baseUrl =
      process.env.NODE_ENV === 'development'
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.foreverelite.co.uk')

    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${baseUrl}/api/auth/callback`,
      }
    })
  }

  // Kullanıcıyı bir kere kontrol et (AppContext zaten dinliyor)
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
  }, [])

  // SADECE drawer (user menüsü) için dışarı tık kapatma — BUNU KORUDUK
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

  // Support ticketleri getir
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

  const hasCustomPrograms = (customPrograms?.length || 0) > 0
  const hasUnreadPrograms = (customPrograms || []).some(
    (p: any) => p?.created_at && new Date(p.created_at).getTime() > (lastViewedProgramsAt || 0)
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
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setEmail('')
      setPassword('')
      toggleNavbar()
      router.push('/')
      console.log('Logout completed successfully')
    } catch (error) {
      console.error('Logout exception:', error)
      toggleNavbar()
      router.push('/')
    }
  }

  const cartItemCount = getCartItemCount()

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 w-full bg-white shadow-md z-50">
        {/* Mobile */}
        <div className="md:hidden h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <div className="w-14 h-14 relative overflow-hidden rounded-full">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  sizes="(max-width: 768px) 56px, 64px"
                  className="object-cover"
                  priority
                />
              </div>
            </Link>
            {user && user.email === ADMIN_EMAIL && (
              <Link href="/admin" className="text-xs font-semibold text-white bg-red-600 px-2 py-1 rounded-md hover:bg-red-700">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Link href="/packages" className="text-responsive-sm font-medium text-gray-800 px-2 py-1 rounded">
              Packages
            </Link>
            <Link href="/body-fat-calculator" className="text-responsive-sm font-medium text-gray-800 px-2 py-1 rounded">
              Calculator
            </Link>
          </div>

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

        {/* Desktop */}
        <div className="hidden md:flex h-16 px-6 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-16 h-16 relative overflow-hidden rounded-full 0">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  sizes="64px"
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
            <Link href="/packages" className="font-bold text-responsive-base text-gray-800 hover:bg-sky-500 hover:text-white p-3 rounded">
              Packages
            </Link>
            <Link href="/body-fat-calculator" className="font-bold text-responsive-base text-gray-800 hover:bg-sky-500 hover:text-white p-3 rounded">
              Body fat calculator
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={searchRef}>
              <Search
                className="w-5 h-5 text-gray-600 cursor-pointer"
                onClick={() => setIsSearchOpen(true)}
              />
            </div>

            <div className="relative">
              <User
                className="w-5 h-5 text-gray-600 cursor-pointer"
                onClick={toggleNavbar}
              />
              {user && (
                <Check className="w-3 h-3 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
              )}
            </div>

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

      {/* SEARCH PACKAGES */}
      <SearchPackages
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Overlay (user drawer açıkken) */}
      {isNavbarOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm z-40"></div>
      )}

      {/* USER DRAWER */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full bg-white shadow-lg text-black transform transition-transform duration-300 z-50 ${
          isNavbarOpen ? 'translate-x-0' : 'translate-x-full'
        } w-72 sm:w-80 md:w-96`}
      >
        <div className="px-4 py-4 border-b overflow-y-auto h-full">
          {user ? (
            <>
              <div className="mb-6">
                <h2 className="text-responsive-base font-bold text-gray-700">
                  Welcome, {user.user_metadata?.first_name || user.user_metadata?.name?.split(' ')[0] || 'User'}!
                </h2>
                <p className="text-responsive-sm text-gray-500">{user.email}</p>
                <hr className="mt-3" />
              </div>

              <div className="space-y-3">
                <Link
                  href="/dashboard?section=profile"
                  className="flex items-center w-full p-3 text-left hover:bg-gray-50 rounded text-responsive-sm"
                  onClick={() => setTimeout(() => toggleNavbar(), 100)}
                >
                  <User className="w-4 h-4 mr-3 text-gray-600" />
                  Edit Profile
                </Link>

                <Link
                  href="/dashboard?section=orders"
                  className="flex items-center w-full p-3 text-left hover:bg-gray-50 rounded text-responsive-sm"
                  onClick={() => setTimeout(() => toggleNavbar(), 100)}
                >
                  <CreditCard className="w-4 h-4 mr-3 text-gray-600" />
                  View Orders
                </Link>

                <Link
                  href="/dashboard?section=favorites"
                  className="flex items-center w-full p-3 text-left hover:bg-gray-50 rounded text-responsive-sm"
                  onClick={() => setTimeout(() => toggleNavbar(), 100)}
                >
                  <Star className='w-4 h-4 mr-3 text-gray-600' />
                  My Favorites
                </Link>

                {hasCustomPrograms && (
                  <Link
                    href="/dashboard?section=programs"
                    className={`flex items-center w-full p-3 text-left rounded transition text-responsive-sm ${
                      hasUnreadPrograms
                        ? 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-400'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      if (hasUnreadPrograms) {
                        const now = Date.now()
                        updateLastViewedProgramsAt(now)
                      }
                      setTimeout(() => toggleNavbar(), 100)
                    }}
                  >
                    <Dumbbell className='w-4 h-4 mr-3 text-gray-600' />
                    <span className="flex-1">Custom Programs</span>
                    {hasUnreadPrograms && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-white">New</span>
                    )}
                  </Link>
                )}

                <Link
                  href="/dashboard?section=support"
                  className={`flex items-center w-full p-3 text-left rounded transition text-responsive-sm ${
                    hasUnreadSupport
                      ? 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-400'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    if (hasUnreadSupport) {
                      const now = Date.now()
                      updateLastViewedSupportAt(now)
                    }
                    setTimeout(() => toggleNavbar(), 100)
                  }}
                >
                  <Headset className='w-4 h-4 mr-3 text-gray-600' />
                  <span className="flex-1">Support</span>
                  {hasUnreadSupport && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-white">New</span>
                  )}
                </Link>

                <button
                  onClick={async (event) => {
                    console.log('Logout button clicked')
                    const button = event.target as HTMLButtonElement
                    if (button) {
                      button.disabled = true
                      button.textContent = 'Signing out...'
                    }
                    try {
                      await handleLogout()
                    } catch (error) {
                      console.error('Logout failed:', error)
                      if (button) {
                        button.disabled = false
                        button.textContent = 'Logout'
                      }
                    }
                  }}
                  className="btn-primary flex items-center w-full p-3 text-left transition disabled:opacity-50 text-responsive-sm"
                >
                  <Check className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-responsive-base text-gray-600">Welcome!</h2>
              <h5 className="text-responsive-sm text-gray-500">Log in for fast and secure shopping!</h5>

              <div className="py-6">
                <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-responsive w-full"
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-responsive w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                    >
                      {showPassword ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
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

                  <button type="submit" className="btn-primary mt-2">
                    Login
                  </button>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </form>
              </div>

              <h2 className="text-responsive-base text-gray-600">NOT A MEMBER YET?</h2>
              <h5 className="text-responsive-sm text-gray-500">You can easily become a member.</h5>

              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href="/signup"
                  onClick={() => toggleNavbar()}
                  className="btn-secondary mt-2 text-center"
                >
                  Sign Up
                </Link>

                <button
                  onClick={handleFacebookLogin}
                  className="w-full bg-[#3b5998] text-white rounded hover:bg-[#2d4373] transition text-sm px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3"
                >
                  Continue with Facebook
                </button>
                <button
                  onClick={handleGoogleLogin}
                  className="w-full bg-[#4285F4] text-white rounded hover:bg-[#3367D6] transition text-sm px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3"
                >
                  Continue with Google
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CART */}
      <ShoppingCart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </>
  )
}
