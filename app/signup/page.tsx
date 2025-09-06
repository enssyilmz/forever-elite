'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import ReCAPTCHA from 'react-google-recaptcha'
import SuccessModal from '../../components/SuccessModal'
import CustomPhoneInput from '../../components/CustomPhoneInput'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    gender: '',
    phone: '+44',
    birthdate: '',
    agreeAllPolicies: false,
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const showPopup = (title: string, message: string) => {
    setModalTitle(title)
    setModalMessage(message)
    setShowModal(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    })
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

    try {
      // Step 1: Sign up the user with Supabase Auth, passing all data
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            gender: formData.gender,
            phone: formData.phone,
            birthdate: formData.birthdate,
            agree_marketing: formData.agreeAllPolicies,
            agree_membership: formData.agreeAllPolicies,
            agree_privacy: formData.agreeAllPolicies,
          }
        }
      });

      if (authError) {
        console.error('Supabase auth error:', authError)
        showPopup('Registration Error', 'An error occurred during authentication: ' + authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        showPopup('Registration Error', 'Could not create user account.')
        setLoading(false)
        return
      }

      // The trigger now handles inserting into user_registrations.
      // So, the manual insert logic is no longer needed.

      showPopup('Success!', 'Registration successful! Please check your email to confirm your account.')
      // Clear form data
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        gender: '',
        phone: '+44',
        birthdate: '',
        agreeAllPolicies: false,
      })
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
        <h1 className="text-responsive-xl font-bold mb-4 text-center">Sign Up</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input 
            name="firstName" 
            placeholder="First Name" 
            value={formData.firstName}
            onChange={handleChange} 
            className="input-responsive w-full" 
            required 
          />
          <input 
            name="lastName" 
            placeholder="Last Name" 
            value={formData.lastName}
            onChange={handleChange} 
            className="input-responsive w-full" 
            required 
          />
          <input 
            name="email" 
            placeholder="Email" 
            type="email" 
            value={formData.email}
            onChange={handleChange} 
            className="input-responsive w-full" 
            required 
          />
          <div className="relative">
            <input 
              name="password" 
              placeholder="Password" 
              type={showPassword ? 'text' : 'password'} 
              value={formData.password}
              onChange={handleChange} 
              className="input-responsive w-full" 
              required 
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setShowPassword(!showPassword)
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3 md:gap-4 items-center">
            <label className="flex items-center text-responsive-sm">
              <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} className="mr-2" /> 
              Male
            </label>
            <label className="flex items-center text-responsive-sm">
              <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} className="mr-2" /> 
              Female
            </label>
            <label className="flex items-center text-responsive-sm">
              <input type="radio" name="gender" value="none" checked={formData.gender === 'none'} onChange={handleChange} className="mr-2" /> 
              Prefer not to say
            </label>
          </div>

          <CustomPhoneInput
            value={formData.phone}
            onChange={(phone, countryCode) => {
              setFormData(prev => ({
                ...prev,
                phone: phone,
              }));
            }}
            placeholder="Enter phone number"
            className="w-full"
          />

          <input 
            name="birthdate" 
            type="date" 
            value={formData.birthdate}
            onChange={handleChange} 
            className="input-responsive w-full" 
          />

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700 text-responsive-sm">
                I agree to the <Link href="/marketing-policy" className="text-blue-600 hover:underline">Marketing Policy</Link>, <Link href="/terms" className="text-blue-600 hover:underline">Terms and Conditions</Link>, and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  name="agreeAllPolicies"
                  checked={formData.agreeAllPolicies}
                  onChange={handleChange}
                  className="sr-only peer"
                  required
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>
          </div>

          <div className="flex justify-center pt-4">
            {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
              <div className="transform scale-75 md:scale-100 origin-center">
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                  hl="en"
                  onChange={(value) => {
                    setCaptchaVerified(!!value)
                  }}
                  onExpired={() => {
                    setCaptchaVerified(false)
                  }}
                />
              </div>
            ) : (
              <div className="text-center p-3 md:p-4 bg-yellow-100 border border-yellow-400 rounded">
                <p className="text-yellow-800 text-responsive-sm">
                  ⚠️ reCAPTCHA not configured. Please add NEXT_PUBLIC_RECAPTCHA_SITE_KEY to .env.local
                </p>
                <button 
                  type="button"
                  onClick={() => setCaptchaVerified(true)}
                  className="mt-2 px-3 md:px-4 py-2 bg-yellow-600 text-white rounded text-responsive-sm"
                >
                  Skip for Development
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary">Cancel</button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
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
