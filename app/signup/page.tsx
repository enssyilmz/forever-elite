'use client'

import { useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { supabase } from '@/utils/supabaseClient'
import ReCAPTCHA from 'react-google-recaptcha'
import SuccessModal from '../../components/SuccessModal'

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
      // First create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            gender: formData.gender,
            phone: formData.phone,
            birthdate: formData.birthdate,
          }
        }
      })

      if (authError) {
        console.error('Supabase Auth error:', authError)
        showPopup('Registration Error', 'An error occurred during registration: ' + authError.message)
        setLoading(false)
        return
      }

      // The trigger will handle creating the user profile in user_registrations.
      // So we don't need to insert it from the client side anymore.
      showPopup('Success!', 'Registration completed successfully! Please check your email to confirm your account.')

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
          country={'gb'}
          onlyCountries={['gb']}
          disableDropdown={true}
          value={formData.phone}
          onChange={(phone, countryData: any) => {
            setFormData({
              ...formData,
              phone,
              countryCode: '+44',
            });
          }}
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
            autoFocus: false,
            placeholder: 'Enter phone number'
          }}
          enableAreaCodes={true}
          countryCodeEditable={false}
          specialLabel=""
        />

        <input 
          name="birthdate" 
          type="date" 
          value={formData.birthdate}
          onChange={handleChange} 
          className="w-full border p-2 rounded" 
        />

        <div className="space-y-2 text-sm text-gray-700">
          <label className='block'>
            <input 
              type="checkbox" 
              name="agreeMarketing"
              checked={formData.agreeMarketing}
              onChange={handleChange}
            /> I want to receive e-commerce messages.
          </label>
          <label className='block'>
            <input 
              type="checkbox" 
              name="agreeMembership"
              checked={formData.agreeMembership}
              onChange={handleChange}
              required
            /> I accept the membership agreement.
          </label>
          <label className='block'>
            <input 
              type="checkbox" 
              name="agreePrivacy"
              checked={formData.agreePrivacy}
              onChange={handleChange}
              required
            /> I have read the privacy notice.
          </label>
        </div>

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
      onClose={() => {
        setShowModal(false)
        // After successful registration, redirect to homepage
        if (modalTitle === 'Success!') {
          window.location.href = '/'
        }
      }}
      title={modalTitle}
      message={modalMessage}
    />
  </>
  )
}
