'use client'

import { useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { supabase } from '@/utils/supabaseClient'
import ReCAPTCHA from 'react-google-recaptcha'
import SuccessModal from '../../components/SuccessModal'
import Link from 'next/link'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    gender: '',
    countryCode: '+44',
    phone: '',
    birthdate: '',
    agreeMarketing: false,
    agreeMembership: false,
    agreePrivacy: false,
  })

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
            country_code: formData.countryCode,
            phone: formData.phone,
            birthdate: formData.birthdate,
            agree_marketing: formData.agreeMarketing,
            agree_membership: formData.agreeMembership,
            agree_privacy: formData.agreePrivacy,
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
        countryCode: '+44',
        phone: '',
        birthdate: '',
        agreeMarketing: false,
        agreeMembership: false,
        agreePrivacy: false,
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
        <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input 
            name="firstName" 
            placeholder="First Name" 
            value={formData.firstName}
            onChange={handleChange} 
            className="w-full border p-2 rounded" 
            required 
          />
          <input 
            name="lastName" 
            placeholder="Last Name" 
            value={formData.lastName}
            onChange={handleChange} 
            className="w-full border p-2 rounded" 
            required 
          />
          <input 
            name="email" 
            placeholder="Email" 
            type="email" 
            value={formData.email}
            onChange={handleChange} 
            className="w-full border p-2 rounded" 
            required 
          />
          <input 
            name="password" 
            placeholder="Password" 
            type="password" 
            value={formData.password}
            onChange={handleChange} 
            className="w-full border p-2 rounded" 
            required 
          />
          
          <div className="flex gap-4 items-center">
            <label><input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} /> Male</label>
            <label><input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} /> Female</label>
            <label><input type="radio" name="gender" value="none" checked={formData.gender === 'none'} onChange={handleChange} /> Prefer not to say</label>
          </div>

          <PhoneInput
            value={`${formData.countryCode}${formData.phone}`}
            onChange={(phone, country: any) => {
              const dialCode = country.dialCode;
              const newPhone = phone.startsWith(dialCode) ? phone.substring(dialCode.length) : phone;
              setFormData(prev => ({
                ...prev,
                phone: newPhone,
                countryCode: `+${dialCode}`,
              }));
            }}
            enableSearch={true}
            inputStyle={{
              width: '100%',
              height: '44px',
              paddingLeft: '60px',
              paddingRight: '12px',
              paddingTop: '12px',
              paddingBottom: '12px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '16px',
            }}
            buttonStyle={{
              backgroundColor: 'transparent',
              border: '1px solid #ccc',
              borderRight: 'none',
              borderRadius: '8px 0 0 8px',
              paddingLeft: '12px',
              paddingRight: '8px',
            }}
            containerStyle={{ 
              width: '100%',
            }}
            dropdownStyle={{
              borderRadius: '8px',
              border: '1px solid #ccc',
            }}
            inputProps={{
              placeholder: 'Enter phone number'
            }}
            specialLabel=""
          />

          <input 
            name="birthdate" 
            type="date" 
            value={formData.birthdate}
            onChange={handleChange} 
            className="w-full border p-2 rounded" 
          />

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700 text-sm">
                I agree to the <Link href="/marketing-policy" className="text-blue-600 hover:underline">Marketing Policy</Link>.
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  name="agreeMarketing"
                  checked={formData.agreeMarketing}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700 text-sm">
                I accept the <Link href="/terms" className="text-blue-600 hover:underline">Terms and Conditions</Link>.
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  name="agreeMembership"
                  checked={formData.agreeMembership}
                  onChange={handleChange}
                  className="sr-only peer"
                  required
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700 text-sm">
                I have read and accept the <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  name="agreePrivacy"
                  checked={formData.agreePrivacy}
                  onChange={handleChange}
                  className="sr-only peer"
                  required
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>
          </div>

          <div className="flex justify-center pt-4">
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

          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary px-4">Cancel</button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary px-4 disabled:opacity-50"
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
