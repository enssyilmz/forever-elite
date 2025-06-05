'use client'

import { useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

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
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md mt-10 text-black">
      <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
      <form className="space-y-4">
        <input name="firstName" placeholder="First Name" onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="lastName" placeholder="Last Name" onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="email" placeholder="Email" type="email" onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="password" placeholder="Password" type="password" onChange={handleChange} className="w-full border p-2 rounded" />
        
        <div className="flex gap-4 items-center">
          <label><input type="radio" name="gender" value="male" onChange={handleChange} /> Male</label>
          <label><input type="radio" name="gender" value="female" onChange={handleChange} /> Female</label>
          <label><input type="radio" name="gender" value="none" onChange={handleChange} /> Prefer not to say</label>
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

        <input name="birthdate" type="date" onChange={handleChange} className="w-full border p-2 rounded" />

        <div className="space-y-2 text-sm text-gray-700">
          <label><input type="checkbox" /> I want to receive e-commerce messages.</label>
          <label><input type="checkbox" /> I accept the membership agreement.</label>
          <label><input type="checkbox" /> I have read the privacy notice.</label>
        </div>

        <div className="border p-4 rounded bg-gray-100">
          <p>I'm not a robot (reCAPTCHA field)</p>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-black text-white rounded">Save</button>
        </div>
      </form>
    </div>
  )
}
