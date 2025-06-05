'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Search, User, CreditCard } from 'lucide-react'

export default function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

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
          <CreditCard className="w-5 h-5 text-gray-600 cursor-pointer" />
        </div>
      </nav>

      {isLoginOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm z-40"></div>
      )}

      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg text-black transform transition-transform duration-300 z-50 ${
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
                <button type="button" className="text-gray-600 underline">
                  Forgot password?
                </button>
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
            <button className="w-full bg-[#4285F4] text-white py-2 rounded">
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
