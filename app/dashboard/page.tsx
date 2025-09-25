'use client'
import { useEffect, useState, Suspense, useRef } from 'react'
import { withTimeout, TimeoutError } from '@/lib/asyncUtils'
import { supabase } from '@/utils/supabaseClient'
import { User as UserIcon, Mail, Package, CreditCard, Star, Headset, LogOut, Menu, X } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { useSearchParams } from 'next/navigation'
import SuccessModal from '@/components/SuccessModal'
import { programs as allPrograms } from '@/lib/packagesData'
import { Purchase } from '@/lib/database.types'
import Link from 'next/link'
import dayjs from 'dayjs'
import { useApp } from '@/contexts/AppContext'
import MemberInformation from './components/MemberInformation'
import CommunicationPreferences from './components/CommunicationPreferences'
import MyOrders from './components/MyOrders'
import Favorites from './components/Favorites'
import Support from './components/Support'
import CustomPrograms from './components/CustomPrograms'

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
  const { user, lastViewedSupportAt, updateLastViewedSupportAt, lastViewedProgramsAt, updateLastViewedProgramsAt, fetchCustomPrograms, customPrograms } = useApp()
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
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [purchasesLoading, setPurchasesLoading] = useState(true)
  
  // Custom programs states
  const [customProgramsLoading, setCustomProgramsLoading] = useState(true)
  const [hasPurchases, setHasPurchases] = useState(false)
  const hasCustomPrograms = customPrograms.length > 0
  
  
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)


  const hasUnreadSupport = supportTickets.some(
    (t) => t.admin_response_at && new Date(t.admin_response_at).getTime() > lastViewedSupportAt
  )
  
  const hasUnreadPrograms = customPrograms.some(
    (p) => new Date(p.created_at).getTime() > lastViewedProgramsAt
  )
  
  // Paylaşılan Supabase client kullan

  useEffect(() => {
    // Set active section from URL parameter
    const section = searchParams.get('section')
    if (section && ['profile', 'communication', 'cart', 'orders', 'favorites', 'support', 'programs'].includes(section)) {
      setActiveSection(section)
    }

    // Check for body fat result from localStorage
    const savedBodyFat = localStorage.getItem('bodyFatResult')

    const loadUserData = async () => {
      if (user) {
        console.log('Dashboard: Loading user data for:', user.email, 'User ID:', user.id)
          
        // Load user data from auth.users metadata
        try {
          // Extract names from user metadata
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
            bodyFat: savedBodyFat || user.user_metadata?.body_fat || '',
            fullName: fullName,
            height: user.user_metadata?.height || '',
            weight: user.user_metadata?.weight || ''
          })

          // Load communication preferences from user_communication_preferences table
          const { data: commPrefs } = await withTimeout(
            supabase
            .from('user_communication_preferences')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),
            15000
          )
            
          if (commPrefs) {
            setCommunicationPrefs({
              phone: commPrefs.phone_notifications || true,
              email: commPrefs.email_notifications || true,
              sms: commPrefs.sms_notifications || true,
            })
          }
        } catch (error) {
          console.error('Error loading user data:', error)
        }


          // Load favorites, purchases and support tickets in background
        Promise.all([
          // Fetch favorite products
          (async () => {
            try {
              setFavoritesLoading(true)
              const { data: favorites, error: favoritesError } = await withTimeout(
                supabase
                .from('user_favorites')
                .select('product_id')
                .eq('user_id', user.id),
                15000
              )

              if (favoritesError) {
                console.error('Error fetching favorites:', favoritesError)
                setFavoriteProducts([])
              } else {
                const favoriteProductIds = favorites.map((fav: any) => fav.product_id)
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

          // Fetch purchases
          (async () => {
            try {
              setPurchasesLoading(true)
              const { data: userPurchases, error: purchasesError } = await withTimeout(
                supabase
                .from('purchases')
                .select('*')
                .eq('user_email', user.email)
                .order('created_at', { ascending: false }),
                15000
              )

              if (purchasesError) {
                console.error('dashboard: Error fetching purchases:', purchasesError)
                setPurchases([])
              } else {
                setPurchases(userPurchases || [])
                setHasPurchases((userPurchases || []).length > 0)
              }
            } catch (error) {
              console.error('dashboard: Error fetching purchases:', error)
              setPurchases([])
            } finally {
              setPurchasesLoading(false)
            }
          })(),
          
          // Fetch support tickets
          (async () => {
            try {
              setSupportLoading(true)
              const { data: tickets, error: ticketsError } = await withTimeout(
                supabase
                .from('support_tickets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false }),
                15000
              )

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
          })(),
          
          // Custom programs are fetched via AppContext
          setCustomProgramsLoading(false)
        ]).catch(error => {
          console.error('Error in parallel data fetching:', error)
        })
      }
    }

    loadUserData()
  }, [user, searchParams])

  const handleLogout = async () => {
    try {
      console.log('Dashboard logout started...')
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Dashboard logout error:', error)
        throw error
      }
      
      console.log('Dashboard logout successful')
      
      // Ana sayfaya yönlendir
      window.location.href = '/'
      
    } catch (error) {
      console.error('Dashboard logout failed:', error)
      // Hata olsa bile ana sayfaya yönlendir
      window.location.href = '/'
    }
  }

  const handleSelectSection = (id: string) => {
    if (id === 'logout') {
      handleLogout()
      return
    }
    setActiveSection(id)
    if (id === 'support') {
      const now = Date.now()
      updateLastViewedSupportAt(now)
    }
    if (id === 'programs') {
      const now = Date.now()
      updateLastViewedProgramsAt(now)
    }
    // Close mobile sidebar when selecting a section
    setIsMobileSidebarOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdate = async () => {
    if (!user) return
    setIsUpdating(true)

    try {
      // Prepare updated user metadata
      const firstName = formData.firstName.trim()
      const lastName = formData.lastName.trim()
      
      const updatedMetadata = {
        ...user.user_metadata,
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        phone: formData.phone,
        phone_number: formData.phone,
        birthdate: formData.birthdate,
        birth_date: formData.birthdate,
        gender: formData.gender,
        height: formData.height || null,
        weight: formData.weight || null,
        body_fat: formData.bodyFat || null
      }

      // Update user metadata using Supabase Auth
      const { error: updateError } = await withTimeout(
        supabase.auth.updateUser({
          data: updatedMetadata
        }),
        15000
      )

      if (updateError) throw updateError

      // Update local state
      setFormData(prev => ({
        ...prev,
        fullName: `${firstName} ${lastName}`.trim()
      }))

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
      // First, check if user has existing preferences
      const { data: existingPrefs } = await withTimeout(
        supabase
        .from('user_communication_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle(),
        15000
      )

      if (!existingPrefs) {
        // Create new preferences
        const { error } = await withTimeout(
          supabase
          .from('user_communication_preferences')
          .insert({
            user_id: user.id,
            phone_notifications: communicationPrefs.phone,
            email_notifications: communicationPrefs.email,
            sms_notifications: communicationPrefs.sms,
          }),
          15000
        )
        
        if (error) throw error
      } else {
        // Update existing preferences
        const { error } = await withTimeout(
          supabase
          .from('user_communication_preferences')
          .update({
            phone_notifications: communicationPrefs.phone,
            email_notifications: communicationPrefs.email,
            sms_notifications: communicationPrefs.sms,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id),
          15000
        )
        
        if (error) throw error
      }
      
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
      const { data, error } = await withTimeout(
        supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: newTicketForm.subject,
          content: newTicketForm.content,
          status: 'open',
          priority: 'normal'
        })
        .select(),
        15000
      )

      if (error) throw error

      // Reset form
      setNewTicketForm({ subject: '', content: '' })
      setRecaptchaVerified(false)
      
      // Reset reCAPTCHA widget (handled in Support component)
      
      // Refresh tickets
      const { data: tickets } = await withTimeout(
        supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
        15000
      )
      
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
          <h1 className="text-responsive-xl font-bold mb-4 text-gray-600">Loading...</h1>
          <p className="text-gray-600 mb-4">Please wait while we load your dashboard.</p>
        </div>
      </div>
    )
  }

  const menuItems = [
    { id: 'profile', label: 'Member Information', icon: UserIcon },
    { id: 'communication', label: 'Communication Preferences', icon: Mail },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'favorites', label: 'Favorites Products', icon: Star },
    ...(hasCustomPrograms ? [{ id: 'programs', label: 'Custom Programs', icon: CreditCard, hasNotification: hasUnreadPrograms }] : []),
    { id: 'support', label: 'Support', icon: Headset },
    { id: 'logout', label: 'Logout', icon: LogOut }
  ]
  
  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <MemberInformation
            user={user}
            formData={formData}
            message={message}
            isUpdating={isUpdating}
            onInputChange={handleInputChange}
            onPhoneChange={(phone: string, countryCode: string) => {
              setFormData(prev => ({ ...prev, phone }));
            }}
            onUpdate={handleUpdate}
            onCancel={handleCancel}
          />
        )
      
      case 'communication':
        return (
          <CommunicationPreferences
            message={message}
            communicationPrefs={communicationPrefs}
            isSavingPrefs={isSavingPrefs}
            onPrefsChange={setCommunicationPrefs}
            onSavePreferences={handleSavePreferences}
          />
        )
      
      case 'favorites':
        return (
          <Favorites
            favoriteProducts={favoriteProducts}
            favoritesLoading={favoritesLoading}
          />
        )

      case 'orders':
        return (
          <MyOrders
            purchases={purchases}
            purchasesLoading={purchasesLoading}
          />
        )
      
      case 'programs':
        return (
          <CustomPrograms
            programs={customPrograms}
            loading={customProgramsLoading}
          />
        )
      
      case 'support':
        return (
          <Support
            supportTickets={supportTickets}
            supportLoading={supportLoading}
            supportSectionExpanded={supportSectionExpanded}
            newTicketForm={newTicketForm}
            isSubmittingTicket={isSubmittingTicket}
            recaptchaVerified={recaptchaVerified}
            onSupportSectionToggle={(section: 'myTickets' | 'newTicket') => {
              if (section === 'myTickets') {
                setSupportSectionExpanded(prev => ({ ...prev, myTickets: !prev.myTickets }))
                const now = Date.now()
                updateLastViewedSupportAt(now)
              } else {
                setSupportSectionExpanded(prev => ({ ...prev, newTicket: !prev.newTicket }))
              }
            }}
            onNewTicketFormChange={(field: string, value: string) => {
              setNewTicketForm(prev => ({ ...prev, [field]: value }))
            }}
            onNewTicketSubmit={handleNewTicketSubmit}
            onRecaptchaChange={(value: string | null) => setRecaptchaVerified(!!value)}
            onRecaptchaExpired={() => setRecaptchaVerified(false)}
            onRecaptchaSkip={() => setRecaptchaVerified(true)}
          />
        )
      
      default:
        return (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-black">
            <h3 className="text-responsive-lg font-bold mb-4">{menuItems.find(item => item.id === activeSection)?.label}</h3>
            <p className="text-responsive-sm text-gray-600">This section is under development...</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center mb-6">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-lg bg-white shadow-md hover:bg-gray-50 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex gap-6">
          {/* Desktop Left Sidebar */}
          <div className="hidden md:block w-80 space-y-6">
            {/* User Information */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 text-black">
              <h2 className="text-responsive-sm md:text-responsive-base font-semibold mb-3 md:mb-4">User Information</h2>
              <div className="space-y-2 text-responsive-sm">
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
                    onClick={() => handleSelectSection(item.id)}
                    className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition ${
                      activeSection === item.id 
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                        : item.id === 'support' && hasUnreadSupport
                          ? 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-400'
                          : (item as any).hasNotification
                            ? 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-400'
                            : 'hover:bg-gray-50 text-gray-700'
                    } ${item.id === 'logout' ? 'hover:bg-red-50 hover:text-red-600' : ''}`}
                  >
                    <item.icon className="mr-3 w-4 h-4 md:w-5 md:h-5" />
                    <span className="font-medium text-responsive-sm">{item.label}</span>
                    {item.id === 'support' && hasUnreadSupport && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-white">New</span>
                    )}
                    {(item as any).hasNotification && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-white">New</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full md:w-auto">
            {renderContent()}
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-opacity-20 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="relative flex flex-col w-80 h-full bg-white shadow-xl">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-3 md:p-4 border-b">
                <h2 className="text-responsive-base md:text-responsive-lg font-bold text-gray-800">My Account</h2>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                </button>
              </div>

              {/* User Information */}
              <div className="p-3 md:p-4 border-b bg-gray-50">
                <h3 className="text-responsive-sm font-semibold mb-2 md:mb-3 text-gray-700">User Information</h3>
                <div className="space-y-1 text-responsive-sm text-gray-600">
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

              {/* Navigation Menu */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4">
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectSection(item.id)}
                      className={`w-full flex items-center px-2 md:px-3 py-2 md:py-3 text-left rounded-lg transition ${
                        activeSection === item.id 
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                          : item.id === 'support' && hasUnreadSupport
                            ? 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-400'
                            : (item as any).hasNotification
                              ? 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-400'
                              : 'hover:bg-gray-50 text-gray-700'
                      } ${item.id === 'logout' ? 'hover:bg-red-50 hover:text-red-600' : ''}`}
                    >
                      <item.icon className="mr-3 w-4 h-4 md:w-5 md:h-5" />
                      <span className="font-medium text-responsive-sm">{item.label}</span>
                      {item.id === 'support' && hasUnreadSupport && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-white">New</span>
                      )}
                      {(item as any).hasNotification && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-white">New</span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
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