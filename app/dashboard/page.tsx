'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User as UserIcon, Mail, Contact, Package, CreditCard, Star, Headset, LogOut, ShoppingCart } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { useSearchParams } from 'next/navigation'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import SuccessModal from '../../components/SuccessModal'

export default function Dashboard() {
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('profile')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthdate: '',
    gender: '',
    bodyFat: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState('')
  const [communicationPrefs, setCommunicationPrefs] = useState({
    phone: false,
    email: false,
    sms: false
  })
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Handle OAuth code from Google login
    const code = searchParams.get('code')
    if (code) {
      console.log('🔄 OAuth code detected, letting Supabase handle it')
      // Clean the URL to remove the code parameter
      window.history.replaceState({}, '', '/dashboard')
    }

    // Set active section from URL parameter
    const section = searchParams.get('section')
    if (section && ['profile', 'communication', 'cart', 'orders', 'payments', 'favorites', 'support'].includes(section)) {
      setActiveSection(section)
    }

    // Check for body fat result from localStorage
    const savedBodyFat = localStorage.getItem('bodyFatResult')
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Load user data from user_registrations table
        const { data: userData } = await supabase
          .from('user_registrations')
          .select('*')
          .eq('email', user.email)
          .single()
          
        if (userData) {
          setFormData({
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            birthdate: userData.birthdate || '',
            gender: userData.gender || '',
            bodyFat: savedBodyFat || userData.body_fat || ''
          })
        } else {
          // Extract names from Google metadata
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''
          const nameParts = fullName.split(' ')
          const firstName = user.user_metadata?.first_name || nameParts[0] || ''
          const lastName = user.user_metadata?.last_name || nameParts.slice(1).join(' ') || ''
          
          setFormData({
            firstName: firstName,
            lastName: lastName,
            email: user.email || '',
            phone: user.user_metadata?.phone || user.user_metadata?.phone_number || '',
            birthdate: user.user_metadata?.birthdate || user.user_metadata?.birth_date || '',
            gender: user.user_metadata?.gender || '',
            bodyFat: savedBodyFat || ''
          })
        }
      }
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, searchParams])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdate = async () => {
    if (!user) return
    
    setIsUpdating(true)
    setMessage('')
    
    try {
      // Check if user exists in user_registrations
      const { data: existingUser } = await supabase
        .from('user_registrations')
        .select('id')
        .eq('email', user.email)
        .single()
      
      if (existingUser) {
        // Update existing record
        const { error } = await supabase
          .from('user_registrations')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            birthdate: formData.birthdate,
            gender: formData.gender,
            body_fat: formData.bodyFat,
            updated_at: new Date().toISOString()
          })
          .eq('email', user.email)
          
        if (error) throw error
      } else {
        // Create new record
        const { error } = await supabase
          .from('user_registrations')
          .insert({
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            birthdate: formData.birthdate,
            gender: formData.gender,
            body_fat: formData.bodyFat,
            created_at: new Date().toISOString()
          })
          
        if (error) throw error
      }
      
      setMessage('Profile updated successfully!')
      // Clear localStorage body fat result after successful update
      localStorage.removeItem('bodyFatResult')
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage('Error updating profile. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    // Reset form to original data
    setMessage('')
    window.location.reload()
  }

  const handleSavePreferences = () => {
    // Here you can add logic to save preferences to database
    setShowSuccessModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to access the dashboard.</p>
          <p className="text-gray-500 text-sm mb-6">
            If you just signed up, please check your email to verify your account before logging in.
          </p>
          <a href="/" className="btn-primary px-6 py-2 rounded">Go to Home Page</a>
        </div>
      </div>
    )
  }

  const menuItems = [
    { id: 'profile', label: 'Member Information', icon: UserIcon },
    { id: 'communication', label: 'Communication Preferences', icon: Mail },
    { id: 'cart', label: 'Shopping Cart', icon: ShoppingCart },
    { id: 'orders', label: 'Order and Return', icon: Package },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'favorites', label: 'Favorites Products', icon: Star },
    { id: 'support', label: 'Support', icon: Headset },
    { id: 'logout', label: 'Logout', icon: LogOut }
  ]
  
  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md text-black">
            <h3 className="text-xl font-bold mb-6">Member Information</h3>
            
            {message && (
              <div className={`mb-4 p-3 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message}
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full border p-3 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full border p-3 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border p-3 rounded-lg bg-gray-100"
                  disabled
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <PhoneInput
                  country={'gb'}
                  onlyCountries={['gb']}
                  disableDropdown={true}
                  value={formData.phone}
                  onChange={(phone) => {
                    setFormData(prev => ({ ...prev, phone }));
                  }}
                  inputStyle={{
                    width: '100%',
                    height: '48px',
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
                  inputProps={{
                    placeholder: 'Enter phone number'
                  }}
                  enableAreaCodes={true}
                  countryCodeEditable={false}
                  specialLabel=""
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleInputChange}
                  className="w-full border p-3 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <div className="flex gap-4 items-center">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="male" 
                      checked={formData.gender === 'male'} 
                      onChange={handleInputChange}
                      className="mr-2"
                    /> 
                    Male
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="female" 
                      checked={formData.gender === 'female'} 
                      onChange={handleInputChange}
                      className="mr-2"
                    /> 
                    Female
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="none" 
                      checked={formData.gender === 'none'} 
                      onChange={handleInputChange}
                      className="mr-2"
                    /> 
                    Prefer not to say
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body Fat Percentage</label>
                <input
                  type="text"
                  name="bodyFat"
                  value={formData.bodyFat}
                  onChange={handleInputChange}
                  className="w-full border p-3 rounded-lg bg-gray-100"
                  placeholder="Calculate from Body Fat Calculator"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use our Body Fat Calculator to update this value automatically
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="btn-secondary px-6 py-3"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="btn-primary px-6 py-3 disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        )
      
      case 'communication':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md text-black">
            <h3 className="text-xl font-bold mb-6">Communication Preferences</h3>
            
            <div className="space-y-6">
              <div className="border-b pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">Phone Notifications</h4>
                    <p className="text-sm text-gray-600">Receive calls and voice messages on your phone number</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={communicationPrefs.phone}
                      onChange={(e) => setCommunicationPrefs(prev => ({...prev, phone: e.target.checked}))}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
              
              <div className="border-b pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive updates and notifications via email</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={communicationPrefs.email}
                      onChange={(e) => setCommunicationPrefs(prev => ({...prev, email: e.target.checked}))}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
              
              <div className="border-b pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">SMS Notifications</h4>
                    <p className="text-sm text-gray-600">Receive text messages on your mobile phone</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={communicationPrefs.sms}
                      onChange={(e) => setCommunicationPrefs(prev => ({...prev, sms: e.target.checked}))}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setCommunicationPrefs({phone: false, email: false, sms: false})}
                  className="btn-secondary px-6 py-3"
                >
                  Reset
                </button>
                <button
                  className="btn-primary px-6 py-3"
                  onClick={handleSavePreferences}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md text-black">
            <h3 className="text-xl font-bold mb-4">{menuItems.find(item => item.id === activeSection)?.label}</h3>
            <p className="text-gray-600">This section is under development...</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Left Sidebar */}
        <div className="w-80 space-y-6">
          {/* User Information */}
          <div className="bg-white rounded-lg shadow-md p-6 text-black">
            <h2 className="text-lg font-semibold mb-4">User Information</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.user_metadata?.full_name || user.user_metadata?.first_name || 'Not provided'}</p>
              <p><strong>Provider:</strong> {user.app_metadata?.provider || 'Unknown'}</p>
              <p><strong>Last Sign In:</strong> {new Date(user.last_sign_in_at || '').toLocaleDateString()}</p>
            </div>
          </div>

          {/* My Account Menu */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">My Account</h2>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.id === 'logout' ? handleLogout() : setActiveSection(item.id)}
                  className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition ${
                    activeSection === item.id 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50 text-gray-700'
                  } ${item.id === 'logout' ? 'hover:bg-red-50 hover:text-red-600' : ''}`}
                >
                  <item.icon className="mr-3 w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success!"
        message="Your preferences have been saved successfully!"
      />
    </div>
  )
} 