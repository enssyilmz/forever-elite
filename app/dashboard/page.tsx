'use client'
import { useEffect, useState, Suspense, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User as UserIcon, Mail, Package, CreditCard, Star, Headset, LogOut, ChevronDown, Plus } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { useSearchParams } from 'next/navigation'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import ReCAPTCHA from 'react-google-recaptcha'
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

interface SupportTicket {
  id: number;
  subject: string;
  content: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  admin_response?: string;
  admin_response_at?: string;
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
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
  
  // Support ticket states
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([])
  const [supportLoading, setSupportLoading] = useState(true)
  const [supportSectionExpanded, setSupportSectionExpanded] = useState({
    myTickets: false,
    newTicket: false
  })
  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    content: ''
  })
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false)
  const [recaptchaVerified, setRecaptchaVerified] = useState(false)
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Set active section from URL parameter
    const section = searchParams.get('section')
    if (section && ['profile', 'communication', 'cart', 'orders', 'favorites', 'support'].includes(section)) {
      setActiveSection(section)
    }

    // Check for body fat result from localStorage
    const savedBodyFat = localStorage.getItem('bodyFatResult')

    const getUser = async () => {
      try {
        // Get both session and user data
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
        }

        // Try to get user from session first, then from getUser
        const currentUser = user || session?.user
        
        if (currentUser) {
          setUser(currentUser)
          
          // Load user data from user_registrations table
          try {
            const { data: userData } = await supabase
              .from('user_registrations')
              .select('*')
              .eq('email', currentUser.email)
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
                fullName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
                height: userData.height || '',
                weight: userData.weight || ''
              })
              
              // İletişim tercihlerini de yükle
              setCommunicationPrefs({
                phone: userData.comm_phone || false,
                email: userData.comm_email || false,
                sms: userData.comm_sms || false,
              })
            } else {
              // Extract names from Google metadata
              const fullName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || ''
              const nameParts = fullName.split(' ')
              const firstName = currentUser.user_metadata?.first_name || nameParts[0] || ''
              const lastName = currentUser.user_metadata?.last_name || nameParts.slice(1).join(' ') || ''
              
              setFormData({
                firstName: firstName,
                lastName: lastName,
                email: currentUser.email || '',
                phone: currentUser.user_metadata?.phone || currentUser.user_metadata?.phone_number || '',
                birthdate: currentUser.user_metadata?.birthdate || currentUser.user_metadata?.birth_date || '',
                gender: currentUser.user_metadata?.gender || '',
                bodyFat: savedBodyFat || '',
                fullName: fullName,
                height: currentUser.user_metadata?.height || '',
                weight: currentUser.user_metadata?.weight || ''
              })
            }
          } catch (error) {
            console.error('Error loading user data:', error)
          }

          // İletişim tercihleri artık user_registrations tablosundan yükleniyor

          // Load favorites and support tickets in background
          Promise.all([
            // Fetch favorite products
            (async () => {
              try {
                setFavoritesLoading(true)
                const { data: favorites, error: favoritesError } = await supabase
                  .from('user_favorites')
                  .select('product_id')
                  .eq('user_id', currentUser.id)

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
                      emoji: p.emoji || '⭐'
                    }))
                  setFavoriteProducts(favoriteProgramDetails)
                }
              } catch (error) {
                console.error('Error fetching favorites:', error)
                setFavoriteProducts([])
              } finally {
                setFavoritesLoading(false)
              }
            })(),
            
            // Fetch support tickets
            (async () => {
              try {
                setSupportLoading(true)
                const { data: tickets, error: ticketsError } = await supabase
                  .from('support_tickets')
                  .select('*')
                  .eq('user_id', currentUser.id)
                  .order('created_at', { ascending: false })

                if (ticketsError) {
                  console.error('Error fetching support tickets:', ticketsError)
                  setSupportTickets([])
                } else {
                  setSupportTickets(tickets || [])
                }
              } catch (error) {
                console.error('Error fetching support tickets:', error)
                setSupportTickets([])
              } finally {
                setSupportLoading(false)
              }
            })()
          ]).catch(error => {
            console.error('Error in parallel data fetching:', error)
          })

        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error in getUser:', error)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await getUser()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setFavoriteProducts([])
          setSupportTickets([])
        } else {
          setUser(session?.user ?? null)
        }
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
      // Doğrudan formData'dan firstName ve lastName'i kullan
      const firstName = formData.firstName.trim()
      const lastName = formData.lastName.trim()

      // Önce kayıt var mı kontrol et
      const { data: existingUser } = await supabase
        .from('user_registrations')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!existingUser) {
        // Kayıt yoksa oluştur
        const { error: insertError } = await supabase
          .from('user_registrations')
          .insert({
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: lastName,
            phone: formData.phone,
            birthdate: formData.birthdate,
            gender: formData.gender,
            height: formData.height || null,
            weight: formData.weight || null,
            body_fat: formData.bodyFat || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) throw insertError
      } else {
        // Kayıt varsa güncelle
        const { error: updateError } = await supabase
          .from('user_registrations')
          .update({
            first_name: firstName,
            last_name: lastName,
            phone: formData.phone,
            birthdate: formData.birthdate,
            gender: formData.gender,
            height: formData.height || null,
            weight: formData.weight || null,
            body_fat: formData.bodyFat || null,
            updated_at: new Date().toISOString()
          })
          .eq('email', user.email)

        if (updateError) throw updateError
      }

      showPopup('Success', 'Profile updated successfully!')
    } catch (error) {
      const err = error as { message?: string; details?: string; hint?: string }
      console.error('Profile update error:', err)
      const errorMessage = err.message || err.details || err.hint || 'An unknown error occurred'
      showPopup('Error', `Error updating profile: ${errorMessage}`)
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
      const { error } = await supabase
        .from('user_registrations')
        .update({
          comm_phone: communicationPrefs.phone,
          comm_email: communicationPrefs.email,
          comm_sms: communicationPrefs.sms,
          updated_at: new Date().toISOString(),
        })
        .eq('email', user.email)
        .select()
        
      if (error) throw error
      
      showPopup('Success', 'Communication preferences saved successfully!')
    } catch (error) {
      const err = error as { message?: string; details?: string; hint?: string }
      console.error('Communication preferences save error:', err)
      const errorMessage = err.message || err.details || err.hint || 'An unknown error occurred'
      showPopup('Error', `Error saving communication preferences: ${errorMessage}`)
    } finally {
      setIsSavingPrefs(false)
    }
  }

  const showPopup = (title: string, message: string) => {
    setModalTitle(title)
    setModalMessage(message)
    setShowSuccessModal(true)
  }

  const handleNewTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return
    if (!newTicketForm.subject.trim() || !newTicketForm.content.trim()) {
      showPopup('Error', 'Please fill in all fields.')
      return
    }
    if (!recaptchaVerified) {
      showPopup('Error', 'Please verify reCAPTCHA.')
      return
    }

    setIsSubmittingTicket(true)

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: newTicketForm.subject,
          content: newTicketForm.content,
          status: 'open',
          priority: 'normal'
        })
        .select()

      if (error) throw error

      // Reset form
      setNewTicketForm({ subject: '', content: '' })
      setRecaptchaVerified(false)
      
      // Reset reCAPTCHA widget
      if (recaptchaRef.current) {
        recaptchaRef.current.reset()
      }
      
      // Refresh tickets
      const { data: tickets } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setSupportTickets(tickets || [])
      
      showPopup('Success', 'Your support ticket has been submitted successfully!')
      
      // Close new ticket form and open my tickets
      setSupportSectionExpanded({ myTickets: true, newTicket: false })
      
    } catch (error) {
      console.error('Error submitting ticket:', error)
      showPopup('Error', 'Failed to submit ticket. Please try again.')
    } finally {
      setIsSubmittingTicket(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
    { id: 'orders', label: 'My Orders', icon: Package },
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
            <h2 className="text-xl font-bold mb-6 text-gray-900">My Favorites</h2>
            {favoritesLoading ? (
              <p>Loading favorites...</p>
            ) : favoriteProducts.length === 0 ? (
              <p className="text-gray-500">You have no favorite products yet.</p>
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
      
      case 'support':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md text-black">
            <h3 className="text-xl font-bold mb-6 text-gray-900">Support</h3>
            
            <div className="space-y-4">
              {/* My Support Tickets Section */}
              <div className="border rounded-lg">
                <button
                  onClick={() => setSupportSectionExpanded(prev => ({ ...prev, myTickets: !prev.myTickets }))}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800">My Support Tickets</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${supportSectionExpanded.myTickets ? 'rotate-180' : ''}`} />
                </button>
                
                {supportSectionExpanded.myTickets && (
                  <div className="border-t p-4">
                    {supportLoading ? (
                      <p className="text-gray-500">Loading tickets...</p>
                    ) : supportTickets.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No support tickets found.</p>
                        <button
                          onClick={() => setSupportSectionExpanded({ myTickets: true, newTicket: true })}
                          className="inline-flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create New Support Ticket
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total: {supportTickets.length} tickets</span>
                          <button
                            onClick={() => setSupportSectionExpanded(prev => ({ ...prev, newTicket: !prev.newTicket }))}
                            className="inline-flex items-center px-3 py-1 text-sm bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            New Ticket
                          </button>
                        </div>
                        
                        {supportTickets.map((ticket) => (
                          <div key={ticket.id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-800">#{ticket.id} - {ticket.subject}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                                {ticket.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{ticket.content}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>Created: {dayjs(ticket.created_at).format('DD/MM/YYYY HH:mm')}</span>
                              <span>Updated: {dayjs(ticket.updated_at).format('DD/MM/YYYY HH:mm')}</span>
                            </div>
                            {ticket.admin_response && (
                              <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                <p className="text-sm text-blue-800 font-medium">Admin Response:</p>
                                <p className="text-sm text-blue-700 mt-1">{ticket.admin_response}</p>
                                <p className="text-xs text-blue-600 mt-2">
                                  Responded: {dayjs(ticket.admin_response_at).format('DD/MM/YYYY HH:mm')}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* New Support Ticket Section */}
              <div className="border rounded-lg">
                <button
                  onClick={() => setSupportSectionExpanded(prev => ({ ...prev, newTicket: !prev.newTicket }))}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800">Create New Support Ticket</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${supportSectionExpanded.newTicket ? 'rotate-180' : ''}`} />
                </button>
                
                {supportSectionExpanded.newTicket && (
                  <div className="border-t p-4">
                    <form onSubmit={handleNewTicketSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <input
                          type="text"
                          value={newTicketForm.subject}
                          onChange={(e) => setNewTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          placeholder="Brief description of your issue"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                        <textarea
                          value={newTicketForm.content}
                          onChange={(e) => setNewTicketForm(prev => ({ ...prev, content: e.target.value }))}
                          rows={6}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          placeholder="Please provide detailed information about your issue..."
                          required
                        />
                      </div>
                      
                      {/* reCAPTCHA */}
                      <div className="flex justify-center">
                        {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
                          <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                            hl="en"
                            onChange={(value) => {
                              setRecaptchaVerified(!!value)
                            }}
                            onExpired={() => {
                              setRecaptchaVerified(false)
                            }}
                          />
                        ) : (
                          <div className="text-center p-4 bg-yellow-100 border border-yellow-400 rounded">
                            <p className="text-yellow-800 text-sm">
                              ⚠️ reCAPTCHA not configured. Please add NEXT_PUBLIC_RECAPTCHA_SITE_KEY to .env.local
                            </p>
                            <button 
                              type="button"
                              onClick={() => setRecaptchaVerified(true)}
                              className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded text-xs"
                            >
                              Skip for Development
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSubmittingTicket || !recaptchaVerified}
                        className="w-full bg-sky-500 text-white py-3 px-4 rounded-lg hover:bg-sky-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubmittingTicket ? 'Submitting...' : 'Submit Support Ticket'}
                      </button>
                    </form>
                  </div>
                )}
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
    <div className="min-h-screen p-6">
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
              <p><strong>Last Sign In:</strong> {
                user.last_sign_in_at 
                  ? dayjs(user.last_sign_in_at).format('DD/MM/YYYY HH:mm:ss')
                  : user.user_metadata?.last_sign_in_at
                    ? dayjs(user.user_metadata.last_sign_in_at).format('DD/MM/YYYY HH:mm:ss')
                    : 'Not available'
              }</p>
              <p><strong>Created At:</strong> {user.created_at ? dayjs(user.created_at).format('DD/MM/YYYY HH:mm:ss') : 'Not available'}</p>
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

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
} 