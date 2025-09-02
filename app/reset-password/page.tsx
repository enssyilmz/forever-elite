'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import SuccessModal from '@/components/SuccessModal'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Check if user exists and get their provider
      const { data, error: fetchError } = await supabase
        .from('auth.users')
        .select('id, raw_app_meta_data')
        .eq('email', email)
        .single()

      if (fetchError) throw fetchError

      if (!data) {
        setError('No account found with this email address.')
        return
      }

      // Check if user signed up with Google
      const isGoogleUser = data.raw_app_meta_data?.provider === 'google'
      
      if (isGoogleUser) {
        setError('This account uses Google Sign-In. Please reset your password through Google.')
        return
      }

      // If not a Google user, proceed with password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (error) throw error

      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error:', error)
      setError('Error sending password reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
        </form>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Check your email"
        message="We've sent you a link to reset your password. Please check your email."
      />
    </div>
  )
} 