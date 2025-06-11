'use client'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User as UserIcon, Mail, Package, CreditCard, Star, Headset, LogOut, ShoppingCart } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { useSearchParams } from 'next/navigation'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import SuccessModal from '@/components/SuccessModal'
import { programs as allPrograms } from '@/lib/programsData'
import Link from 'next/link'
import dayjs from 'dayjs'

interface Product {
  id: number;
  name: string;
  description: string;
  emoji: string;
}

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
    bodyFat: '',
    fullName: '',
    height: '',
    weight: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSavingPrefs, setIsSavingPrefs] = useState(false)
  const [message, setMessage] = useState('')
  const [communicationPrefs, setCommunicationPrefs] = useState({
    phone: false,
    email: false,
    sms: false
  })
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([])
  const [favoritesLoading, setFavoritesLoading] = useState(true)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
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
            bodyFat: savedBodyFat || userData.body_fat || '',
            fullName: userData.first_name || userData.last_name || '',
            height: userData.height || '',
            weight: userData.weight || ''
          })
          setCommunicationPrefs({
            phone: userData.comm_phone || false,
            email: userData.comm_email || false,
            sms: userData.comm_sms || false,
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
            bodyFat: savedBodyFat || '',
            fullName: fullName,
            height: user.user_metadata?.height || '',
            weight: user.user_metadata?.weight || ''
          })
        }

        // Fetch favorite products
        setFavoritesLoading(true)
        const { data: favorites, error: favoritesError } = await supabase
          .from('user_favorites')
          .select('product_id')
          .eq('user_id', user.id)

        if (favoritesError) {
          console.error('Error fetching favorites:', favoritesError)
          setFavoriteProducts([])
        } else {
          const favoriteProductIds = favorites.map(fav => fav.product_id)
          const favoriteProgramDetails = allPrograms
            .filter(p => favoriteProductIds.includes(p.id))
            .map(p => ({
              id: p.id,
              name: p.title,
              description: p.bodyFatRange,
              emoji: p.emoji || '⭐' // Use emoji, with a fallback
            }))
          setFavoriteProducts(favoriteProgramDetails)
        }
        setFavoritesLoading(false)
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

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          birthdate: formData.birthdate,
          gender: formData.gender,
          height: formData.height,
          weight: formData.weight,
          body_fat: formData.bodyFat,
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) throw error

      showPopup('Success', 'Your profile has been updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      showPopup('Error', 'There was an error updating your profile. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    // Reset form to original data
    setMessage('')
    window.location.reload()
  }

  const handleSavePreferences = async () => {
    if (!user) return

    setIsSavingPrefs(true)
    setMessage('')

    try {
      // Check if user exists in user_registrations
      const { data: existingUser } = await supabase
        .from('user_registrations')
        .select('id')
        .eq('email', user.email)
        .single()
      
      const prefsData = {
        comm_phone: communicationPrefs.phone,
        comm_email: communicationPrefs.email,
        comm_sms: communicationPrefs.sms,
        updated_at: new Date().toISOString(),
      }

      if (existingUser) {
        // Update existing record
        const { error } = await supabase
          .from('user_registrations')
          .update(prefsData)
          .eq('email', user.email)
        if (error) throw error
      } else {
        // Create new record if none exists
        const { error } = await supabase
          .from('user_registrations')
          .insert({ email: user.email, ...prefsData })
        if (error) throw error
      }
      
      setShowSuccessModal(true)
    } catch (error) {
      const err = error as { message?: string }
      console.error('Error saving preferences:', err)
      setMessage(err.message || 'Error saving preferences. Please try again.')
    } finally {
      setIsSavingPrefs(false)
    }
  }

  const showPopup = (title: string, message: string) => {
    setModalTitle(title)
    setModalMessage(message)
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
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to access the dashboard.</p>
          <a href="/" className="btn-primary px-4 py-2 rounded">Go Home</a>
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
            
            {message && !message.includes('successfully') && (
              <div className={`mb-4 p-3 rounded bg-red-100 text-red-700`}>
                {message}
              </div>
            )}

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
                  disabled={isSavingPrefs}
                >
                  Reset
                </button>
                <button
                  className="btn-primary px-6 py-3"
                  onClick={handleSavePreferences}
                  disabled={isSavingPrefs}
                >
                  {isSavingPrefs ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </div>
        )
      
      case 'favorites':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">My Favorites</h2>
            {favoritesLoading ? (
              <p>Loading favorites...</p>
            ) : favoriteProducts.length === 0 ? (
              <p>You have no favorite products yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteProducts.map((product) => (
                  <Link href={`/programs/${product.id}`} key={product.id}>
                    <div className="border rounded-lg overflow-hidden shadow-sm group transform hover:-translate-y-1 transition-transform duration-300 h-full flex flex-col cursor-pointer">
                      {/* Program Emoji */}
                      <div className="w-full h-48 bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center">
                         <span className="text-7xl opacity-90">{product.emoji}</span>
                      </div>
                      <div className="p-4 flex-grow">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-sky-600 transition-colors">{product.name}</h3>
                        <p className="text-gray-600 mt-2 text-sm">{product.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
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
              <p>
                <strong>Last Sign In:</strong> {user?.last_sign_in_at ? dayjs(user.last_sign_in_at).format('DD MMM, YYYY HH:mm') : 'Not available'}
              </p>
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
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  )
} 