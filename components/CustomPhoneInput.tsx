'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Search } from 'lucide-react'

interface Country {
  code: string
  label: string
  phone: string
  phoneLength: string | string[]
  suggested?: boolean
  min?: string
  max?: string
}

interface CustomPhoneInputProps {
  value: string
  onChange: (value: string, countryCode: string) => void
  placeholder?: string
  className?: string
  required?: boolean
  disabled?: boolean
}

export default function CustomPhoneInput({
  value,
  onChange,
  placeholder = "Enter phone number",
  className = "",
  required = false,
  disabled = false
}: CustomPhoneInputProps) {
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load countries from JSON
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch('/Countries.json')
        const countryData: Country[] = await response.json()
        setCountries(countryData)
        
        // Set default to UK
        const defaultCountry = countryData.find(country => country.code === 'GB')
        if (defaultCountry) {
          setSelectedCountry(defaultCountry)
        }
      } catch (error) {
        console.error('Error loading countries:', error)
      }
    }
    
    loadCountries()
  }, [])

  // Parse initial value
  useEffect(() => {
    if (value && countries.length > 0) {
      // Find country by dial code
      for (const country of countries) {
        if (value.startsWith(country.phone)) {
          setSelectedCountry(country)
          setPhoneNumber(value.substring(country.phone.length))
          break
        }
      }
    }
  }, [value, countries])

  // Get phone length for validation
  const getPhoneLength = (country: Country): { min: number; max: number } => {
    if (country.min && country.max) {
      return { min: parseInt(country.min), max: parseInt(country.max) }
    }
    
    if (Array.isArray(country.phoneLength)) {
      const lengths = country.phoneLength.map(l => parseInt(l))
      return { min: Math.min(...lengths), max: Math.max(...lengths) }
    }
    
    const length = parseInt(country.phoneLength)
    return { min: length, max: length }
  }

  // Handle phone number change with validation
  const handlePhoneChange = (newPhoneNumber: string) => {
    // Only allow numbers
    const numbersOnly = newPhoneNumber.replace(/\D/g, '')
    
    if (selectedCountry) {
      const { max } = getPhoneLength(selectedCountry)
      
      // Limit input to phone length
      const limitedNumber = numbersOnly.slice(0, max)
      
      setPhoneNumber(limitedNumber)
      const fullNumber = selectedCountry.phone + limitedNumber
      onChange(fullNumber, selectedCountry.phone)
    }
  }

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setIsDropdownOpen(false)
    setSearchTerm('')
    
    // Clear phone number when changing country and apply length validation
    const { max } = getPhoneLength(country)
    const limitedNumber = phoneNumber.slice(0, max)
    setPhoneNumber(limitedNumber)
    
    const fullNumber = country.phone + limitedNumber
    onChange(fullNumber, country.phone)
  }

  // Filter countries based on search
  const filteredCountries = countries.filter(country =>
    country.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.phone.includes(searchTerm)
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get flag emoji
  const getFlagEmoji = (countryCode: string) => {
    return countryCode
      .toUpperCase()
      .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex">
        {/* Country Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className="flex items-center px-3 py-3 border border-r-0 border-gray-300 rounded-l-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {selectedCountry && (
              <>
                <span className="text-lg mr-2">
                  {getFlagEmoji(selectedCountry.code)}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  +{selectedCountry.phone}
                </span>
              </>
            )}
            <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Countries List */}
              <div className="max-h-40 overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="w-full flex items-center px-3 py-2 hover:bg-gray-50 text-left"
                    >
                      <span className="text-lg mr-3">
                        {getFlagEmoji(country.code)}
                      </span>
                      <span className="flex-1 text-sm">
                        {country.label}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">
                        +{country.phone}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-gray-500 text-sm">
                    No countries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder={selectedCountry ? `${getPhoneLength(selectedCountry).max} digits` : placeholder}
          required={required}
          disabled={disabled}
          className="flex-1 px-3 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  )
}
