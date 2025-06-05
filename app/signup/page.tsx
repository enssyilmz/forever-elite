'use client'

import { useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { supabase } from '@/utils/supabaseClient'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    gender: '',
    countryCode: '+90',
    phone: '',
    birthdate: '',
    agreeMarketing: false,
    agreeMembership: false,
    agreePrivacy: false,
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

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

    try {
      // Kullanıcı kayıt verilerini Supabase'e kaydet
      const { data, error } = await supabase
        .from('user_registrations')
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            password: formData.password, // Gerçek uygulamada şifreyi hash'lemek gerekir
            gender: formData.gender,
            country_code: formData.countryCode,
            phone: formData.phone,
            birthdate: formData.birthdate,
            agree_marketing: formData.agreeMarketing,
            agree_membership: formData.agreeMembership,
            agree_privacy: formData.agreePrivacy,
            created_at: new Date().toISOString(),
          }
        ])

      if (error) {
        console.error('Supabase error:', error)
        setMessage('Kayıt sırasında bir hata oluştu: ' + error.message)
      } else {
        setMessage('Kayıt başarıyla tamamlandı!')
        // Form verilerini temizle
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          gender: '',
          countryCode: '+90',
          phone: '',
          birthdate: '',
          agreeMarketing: false,
          agreeMembership: false,
          agreePrivacy: false,
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage('Beklenmeyen bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md mt-10 text-black">
      <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('başarıyla') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

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
          country={'tr'}
          enableSearch={true}
          value={formData.phone}
          onChange={(phone, countryData: any) => {
            setFormData({
              ...formData,
              phone,
              countryCode: '+' + (countryData?.dialCode || '90'),
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
          <label>
            <input 
              type="checkbox" 
              name="agreeMarketing"
              checked={formData.agreeMarketing}
              onChange={handleChange}
            /> I want to receive e-commerce messages.
          </label>
          <label>
            <input 
              type="checkbox" 
              name="agreeMembership"
              checked={formData.agreeMembership}
              onChange={handleChange}
              required
            /> I accept the membership agreement.
          </label>
          <label>
            <input 
              type="checkbox" 
              name="agreePrivacy"
              checked={formData.agreePrivacy}
              onChange={handleChange}
              required
            /> I have read the privacy notice.
          </label>
        </div>

        <div className="border p-4 rounded bg-gray-100">
          <p>I'm not a robot (reCAPTCHA field)</p>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
