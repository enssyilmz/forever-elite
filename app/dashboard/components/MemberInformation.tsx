'use client'

import { useState } from 'react'
import CustomPhoneInput from '@/components/CustomPhoneInput'

interface MemberInformationProps {
  user: any
  formData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    birthdate: string
    gender: string
    bodyFat: string
  }
  message: string
  isUpdating: boolean
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onPhoneChange: (phone: string, countryCode: string) => void
  onUpdate: () => void
  onCancel: () => void
}

export default function MemberInformation({
  user,
  formData,
  message,
  isUpdating,
  onInputChange,
  onPhoneChange,
  onUpdate,
  onCancel
}: MemberInformationProps) {
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-black">
      <h3 className="text-responsive-lg font-bold mb-4 md:mb-6">Member Information</h3>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      
      <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
        <div>
          <label className="block text-responsive-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={onInputChange}
            className="input-responsive w-full"
          />
        </div>
        
        <div>
          <label className="block text-responsive-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={onInputChange}
            className="input-responsive w-full"
          />
        </div>
        
        <div>
          <label className="block text-responsive-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onInputChange}
            className="input-responsive w-full bg-gray-100"
            disabled
          />
        </div>
        
        <div>
          <label className="block text-responsive-sm font-medium text-gray-700 mb-1">Phone</label>
          <CustomPhoneInput
            value={formData.phone}
            onChange={onPhoneChange}
            placeholder="Enter phone number"
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-responsive-sm font-medium text-gray-700 mb-1">Birth Date</label>
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={onInputChange}
            className="input-responsive w-full"
          />
        </div>
        
        <div>
          <label className="block text-responsive-sm font-medium text-gray-700 mb-1">Gender</label>
          <div className="flex flex-wrap gap-3 md:gap-4 items-center">
            <label className="flex items-center text-responsive-sm">
              <input 
                type="radio" 
                name="gender" 
                value="male" 
                checked={formData.gender === 'male'} 
                onChange={onInputChange}
                className="mr-2"
              /> 
              Male
            </label>
            <label className="flex items-center text-responsive-sm">
              <input 
                type="radio" 
                name="gender" 
                value="female" 
                checked={formData.gender === 'female'} 
                onChange={onInputChange}
                className="mr-2"
              /> 
              Female
            </label>
            <label className="flex items-center text-responsive-sm">
              <input 
                type="radio" 
                name="gender" 
                value="none" 
                checked={formData.gender === 'none'} 
                onChange={onInputChange}
                className="mr-2"
              /> 
              Prefer not to say
            </label>
          </div>
        </div>
        
        <div>
          <label className="block text-responsive-sm font-medium text-gray-700 mb-1">Body Fat Percentage</label>
          <input
            type="text"
            name="bodyFat"
            value={formData.bodyFat}
            onChange={onInputChange}
            className="input-responsive w-full bg-gray-100"
            placeholder="Calculate from Body Fat Calculator"
            readOnly
          />
          <p className="text-responsive-sm text-gray-500 mt-1">
            Use our Body Fat Calculator to update this value automatically
          </p>
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="btn-secondary-sm"
        >
          Cancel
        </button>
        <button
          onClick={onUpdate}
          disabled={isUpdating}
          className="btn-primary-sm disabled:opacity-50"
        >
          {isUpdating ? 'Updating...' : 'Update'}
        </button>
      </div>
    </div>
  )
}
