'use client'

import { useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { supabase } from '@/utils/supabaseClient'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [captchaVerified, setCaptchaVerified] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!captchaVerified) {
      setMessage('Please complete the reCAPTCHA verification')
      setLoading(false)
      return
    }

    if (!email) {
      setMessage('Please enter your email address')
      setLoading(false)
      return
    }

    try {
      // Check if user exists in our database
      const { data: existingUser, error: checkError } = await supabase
        .from('user_registrations')
        .select('email')
        .eq('email', email)
        .single()

      if (checkError || !existingUser) {
        setMessage('No account found with this email address')
        setLoading(false)
        return
      }

      // Send password reset email (simulated for now)
      // In real implementation, you would integrate with your email service
      setMessage('Password reset link has been sent to your email address')
      
      // Reset form
      setEmail('')
      setCaptchaVerified(false)
      
    } catch (error) {
      console.error('Error:', error)
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md mt-10 text-black">
      <h1 className="text-2xl font-bold mb-4 text-center">Reset Password</h1>
      <p className="text-gray-600 mb-6 text-center">Enter your email address and we'll send you a link to reset your password.</p>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('sent') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

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
  )
} 