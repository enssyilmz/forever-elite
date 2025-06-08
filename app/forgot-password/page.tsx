'use client'

import { useState } from 'react'
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
      // Send password reset email using Supabase Auth
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        showPopup('Error', error.message)
        setLoading(false)
        return
      }

      showPopup('Email Sent!', 'Password reset link has been sent to your email address')
      
      // Reset form
      setEmail('')
      setCaptchaVerified(false)
      
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
          <ReCAPTCHA
            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test key for development
            onChange={(value) => {
              setCaptchaVerified(!!value)
            }}
            onExpired={() => {
              setCaptchaVerified(false)
            }}
          />
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