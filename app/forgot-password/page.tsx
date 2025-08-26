'use client'

import { useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { supabase } from '@/utils/supabaseClient'
import Link from 'next/link'
import SuccessModal from '../../components/SuccessModal'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const showPopup = (title: string, message: string) => {
    setModalTitle(title)
    setModalMessage(message)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!captchaVerified) {
      showPopup('Verification Required', 'Please complete the reCAPTCHA verification')
      setLoading(false)
      return
    }

    if (!email) {
      showPopup('Email Required', 'Please enter your email address')
      setLoading(false)
      return
    }

    try {
      // Use Supabase auth to send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (resetError) {
        console.error('Password reset error:', resetError)
        showPopup('Error', 'Failed to send password reset email. Please check your email address.')
        setLoading(false)
        return
      }

      showPopup('Email Sent!', 'Password reset link has been sent to your email address')
      
      // Reset form and reCAPTCHA
      setEmail('')
      setCaptchaVerified(false)
      
      // Reset reCAPTCHA widget
      if (recaptchaRef.current) {
        recaptchaRef.current.reset()
      }
      
    } catch (error) {
      console.error('Error:', error)
      showPopup('Unexpected Error', 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md mt-10 text-black">
        <h1 className="text-2xl font-bold mb-4 text-center">Reset Password</h1>
        <p className="text-gray-600 mb-6 text-center">Enter your email address and we'll send you a link to reset your password.</p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded" 
          required 
        />

        <div className="flex justify-center">
          {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
              hl="en"
              onChange={(value) => {
                setCaptchaVerified(!!value)
              }}
              onExpired={() => {
                setCaptchaVerified(false)
              }}
            />
          ) : (
            <div className="text-center p-4 bg-yellow-100 border border-yellow-400 rounded">
              <p className="text-yellow-800 text-sm">
                ⚠️ reCAPTCHA not configured.
              </p>
              <button 
                type="button"
                onClick={() => setCaptchaVerified(true)}
                className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded text-xs"
              >
                Skip for Development
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-2">
          <Link href="/" className="btn-secondary px-4 text-center">
            Back
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary px-4 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>

    <SuccessModal 
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title={modalTitle}
      message={modalMessage}
    />
  </>
  )
} 