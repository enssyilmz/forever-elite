'use client'

import { useEffect, useState } from 'react'
import { withTimeout } from '@/lib/asyncUtils'
import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/navigation'
import { User as AuthUser } from '@supabase/supabase-js'
import { Mail, Shield, X, RefreshCw, Plus, Trash2 } from 'lucide-react'
import AdminTabs from './components/AdminTabs'
import AdminTabContent from './components/AdminTabContent'
import SendMailModal from './components/modals/SendMailModal'
import SupportTicketModal from './components/modals/SupportTicketModal'
import ProgramModal from './components/modals/ProgramModal'
import PackageModal from './components/modals/PackageModal'
import DeleteModal from './components/modals/DeleteModal'
import { CustomProgram } from '@/lib/database.types'
import SuccessModal from '@/components/SuccessModal'
import { useApp } from '@/contexts/AppContext'

// RPC fonksiyonundan gelen JSON dönüş tipini temsil eden interface
interface AuthUserFromAdmin {
  id: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  email: string
  created_at: string
  last_sign_in_at: string | null
  providers: string[] | null
  primary_provider: string | null
}

interface Purchase {
  id: string
  user_email: string
  user_name: string | null
  package_name: string
  amount: number
  currency: string
  status: string
  created_at: string
  stripe_session_id: string
}

interface SupportTicket {
  id: number
  user_id: string
  subject: string
  content: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  admin_response?: string
  admin_response_at?: string
  user?: {
    id: string
    email: string
  }
}

interface WorkoutDay {
  day_number: number
  week_number: number
  workout_name: string
  description: string
  rest_time_seconds: number
  exercises: Exercise[]
}

interface Exercise {
  exercise_name: string
  sets: number
  reps: string
  weight: string
  rest_time_seconds: number
  notes: string
}

const ADMIN_EMAIL = 'yozdzhansyonmez@gmail.com'

export default function AdminPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [users, setUsers] = useState<AuthUserFromAdmin[]>([])
  const [programs, setPrograms] = useState<CustomProgram[]>([])
  // Program filtering
  const [programsFilterUserId, setProgramsFilterUserId] = useState<string>('') // '' = all users (admin only)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'programs' | 'purchases' | 'tickets' | 'mail' | 'packages'>('users')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Loading states for each tab
  const [usersLoading, setUsersLoading] = useState(false)
  const [programsLoading, setProgramsLoading] = useState(false)
  const [purchasesLoading, setPurchasesLoading] = useState(false)
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [mailLoading, setMailLoading] = useState(false)
  const [packagesLoading, setPackagesLoading] = useState(false)
  
  // Track which tabs have been loaded
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(['users']))
  
  
  // Mail modal states
  const [isMailModalOpen, setMailModalOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [allUserEmails, setAllUserEmails] = useState<string[]>([])
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [mailLogs, setMailLogs] = useState<Array<{ id: string, subject: string, body: string, recipients: string[], sent_count: number, created_at: string }>>([])
  
  // Support ticket modal states
  const [isTicketModalOpen, setTicketModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [adminResponse, setAdminResponse] = useState('')
  const [isResponding, setIsResponding] = useState(false)
  
  // Program modal states
  const [isProgramModalOpen, setProgramModalOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<CustomProgram | null>(null)
  const [programFormData, setProgramFormData] = useState({
    title: '',
    description: '',
    user_id: '',
    difficulty_level: 'beginner',
    duration_weeks: 4,
    notes: '',
    workouts: [] as WorkoutDay[]
  })

  // Package modal states
  const [isPackageModalOpen, setPackageModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<any | null>(null)
  const [packageFormData, setPackageFormData] = useState({
    title: '',
    body_fat_range: '',
    description: '',
    long_description: '',
    features: [] as string[],
    image_url_1: '',
    image_url_2: '',
    price_usd: 0,
    price_gbp: 0,
    discounted_price_gbp: 0,
    discount_percentage: 0,
    specifications: [] as string[],
    recommendations: [] as string[],
    duration_weeks: 0,
    is_active: true,
    sort_order: 0
  })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [packageToDelete, setPackageToDelete] = useState<any | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  
  // Program delete modal states
  const [isProgramDeleteModalOpen, setIsProgramDeleteModalOpen] = useState(false)
  const [programToDelete, setProgramToDelete] = useState<CustomProgram | null>(null)

  const router = useRouter()

  // Use global loading helpers
  const { startLoading: startGlobalLoading, stopLoading: stopGlobalLoading } = useApp()


  const fetchUsers = async () => {
    if (usersLoading) return
    try {
      startGlobalLoading()
      setUsersLoading(true)
      setError(null)
      const response = await withTimeout(fetch('/api/admin/users'), 15000)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data.users || [])
      setLoadedTabs(prev => new Set([...prev, 'users']))
    } catch (e: any) {
      setError('Failed to fetch users: ' + e.message)
    } finally {
      setUsersLoading(false)
      stopGlobalLoading()
    }
  }

  const fetchPrograms = async (userIdForFilter?: string) => {
    if (programsLoading) return
    try {
      startGlobalLoading()
      setProgramsLoading(true)
      setError(null)
      const paramUserId = userIdForFilter ?? programsFilterUserId
      const base = '/api/custom-programs?scope=admin'
      const url = paramUserId ? `${base}&user_id=${encodeURIComponent(paramUserId)}` : base
      const response = await withTimeout(fetch(url), 15000)
      if (!response.ok) throw new Error('Failed to fetch programs')
      const data = await response.json()
      setPrograms(data.programs || [])
      setLoadedTabs(prev => new Set([...prev, 'programs']))
    } catch (e: any) {
      setError('Failed to fetch programs: ' + e.message)
    } finally {
      setProgramsLoading(false)
      stopGlobalLoading()
    }
  }

  const fetchPurchases = async () => {
    if (purchasesLoading) return
    try {
      startGlobalLoading()
      setPurchasesLoading(true)
      setError(null)
      const response = await withTimeout(fetch('/api/admin/purchases'), 15000)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch purchases')
      }
      const data = await response.json()
      setPurchases(data.purchases || [])
      setLoadedTabs(prev => new Set([...prev, 'purchases']))
    } catch (e: any) {
      setError('Failed to fetch purchases: ' + e.message)
    } finally {
      setPurchasesLoading(false)
      stopGlobalLoading()
    }
  }

  const fetchSupportTickets = async () => {
    if (ticketsLoading) return
    try {
      startGlobalLoading()
      setTicketsLoading(true)
      setError(null)
      const response = await withTimeout(fetch('/api/admin/support-tickets'), 15000)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch support tickets')
      }
      const data = await response.json()
      setSupportTickets(data.tickets || [])
      setLoadedTabs(prev => new Set([...prev, 'tickets']))
    } catch (e: any) {
      console.error('Support tickets fetch error:', e)
      setError('Failed to fetch support tickets: ' + e.message)
    } finally {
      setTicketsLoading(false)
      stopGlobalLoading()
    }
  }

  const fetchMailLogs = async () => {
    if (mailLoading) return
    try {
      startGlobalLoading()
      setMailLoading(true)
      setError(null)
      const response = await withTimeout(fetch('/api/admin/mail-logs'), 15000)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch mail logs')
      }
      const data = await response.json()
      setMailLogs(data.mailLogs || [])
      setLoadedTabs(prev => new Set([...prev, 'mail']))
    } catch (e: any) {
      setError('Failed to fetch mail logs: ' + e.message)
    } finally {
      setMailLoading(false)
      stopGlobalLoading()
    }
  }

  const fetchPackages = async () => {
    if (packagesLoading) return
    try {
      startGlobalLoading()
      setPackagesLoading(true)
      setError(null)
      const response = await withTimeout(fetch('/api/packages'), 15000)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch packages')
      }
      const data = await response.json()
      setPackages(data.packages || [])
      setLoadedTabs(prev => new Set([...prev, 'packages']))
    } catch (e: any) {
      setError('Failed to fetch packages: ' + e.message)
    } finally {
      setPackagesLoading(false)
      stopGlobalLoading()
    }
  }

  const checkUserAndFetchData = async () => {
    try {
      setLoading(true)
      // Prefer local session (instant) to avoid network-induced timeouts
      const { data: sessionData } = await supabase.auth.getSession()
      let authUser = sessionData.session?.user || null

      // Fallback to network call only if absolutely necessary
      if (!authUser) {
        try {
          const { data: getUserData } = await supabase.auth.getUser()
          authUser = getUserData.user || null
        } catch {
          // Ignore network errors here; we'll treat as unauthenticated below
        }
      }

      if (!authUser) {
        router.push('/')
        return
      }

      setUser(authUser as AuthUser)
      
      if ((authUser as any).email !== ADMIN_EMAIL) {
        router.push('/')
        return
      }

      // Render the shell immediately; load first tab data in background
      setLoading(false)
      startGlobalLoading()
      fetchUsers().finally(() => stopGlobalLoading())
    } catch (e: any) {
      // Do not block the UI with a hard error; show a friendly message
      setError('Failed to authenticate. Please try again.')
      setLoading(false)
    }
  }

  useEffect(() => {
    checkUserAndFetchData()
  }, [])

  // Handle tab switching with lazy loading
  const handleTabChange = (tab: 'users' | 'programs' | 'purchases' | 'tickets' | 'mail' | 'packages') => {
    setActiveTab(tab)
    
    // Only fetch data if this tab hasn't been loaded yet
    if (!loadedTabs.has(tab)) {
      switch (tab) {
        case 'users':
          fetchUsers()
          break
        case 'programs':
          fetchPrograms(programsFilterUserId)
          break
        case 'purchases':
          fetchPurchases()
          break
        case 'tickets':
          fetchSupportTickets()
          break
        case 'mail':
          fetchMailLogs()
          break
        case 'packages':
          fetchPackages()
          break
      }
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    
    // Refresh current active tab data only
    switch (activeTab) {
      case 'users':
        await fetchUsers()
        break
      case 'programs':
        await fetchPrograms(programsFilterUserId)
        break
      case 'purchases':
        await fetchPurchases()
        break
      case 'tickets':
        await fetchSupportTickets()
        break
      case 'mail':
        await fetchMailLogs()
        break
      case 'packages':
        await fetchPackages()
        break
    }
    
    setRefreshing(false)
  }

  const handleSendMail = async (subject: string, body: string, recipients: string[]) => {
    setIsSending(true)
    try {
      startGlobalLoading()
      const response = await withTimeout(fetch('/api/admin/send-bulk-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, html: body, recipients })
      }), 15000)
      const result = await response.json()
      if (!response.ok || !result.ok) {
        const reason = result?.error || 'Please check your connection or configuration.'
    setMailModalOpen(false)
        setModalTitle('Email sending failed')
        setModalMessage(`Emails could not be sent. Reason: ${reason}`)
        setShowSuccessModal(true)
      } else {
        setMailModalOpen(false)
        setModalTitle('Emails sent')
        setModalMessage(`Successfully sent email to ${result.sent ?? recipients.length} recipient(s).`)
        setShowSuccessModal(true)
        fetchMailLogs()
      }
    } catch (err) {
      console.error('bulk mail error', err)
      setMailModalOpen(false)
      setModalTitle('Email sending failed')
      setModalMessage(`Emails could not be sent. Reason: ${(err as any)?.message || 'Unknown error'}`)
      setShowSuccessModal(true)
    } finally {
      setIsSending(false)
      stopGlobalLoading()
    }
  }

  const openMailModal = async () => {
    setMailModalOpen(true)
    try {
      startGlobalLoading()
      const response = await withTimeout(fetch('/api/admin/users'), 15000)
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setAllUserEmails(data.users.map((u: any) => u.email))
    } catch (e) {
      console.error('Error fetching user emails:', e)
      setAllUserEmails([])
    } finally {
      stopGlobalLoading()
    }
  }

  const openTicketModal = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setAdminResponse(ticket.admin_response || '')
    setIsResponding(false)
    setTicketModalOpen(true)
  }

  const handleTicketResponse = async (ticketId: number, response: string, status: string) => {
    setIsResponding(true)
    try {
      startGlobalLoading()
      const apiResponse = await fetch('/api/admin/support-tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          adminResponse: response.trim(),
          status
        })
      })

      if (!apiResponse.ok) throw new Error('Failed to respond to ticket')
      
      await fetchSupportTickets()
      setTicketModalOpen(false)
      setSelectedTicket(null)
      setAdminResponse('')
      setModalTitle('Response sent')
      setModalMessage('Your response has been sent successfully.')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error responding to ticket:', error)
      setModalTitle('Error')
      setModalMessage('Failed to send response. Please try again.')
      setShowSuccessModal(true)
    } finally {
      setIsResponding(false)
      stopGlobalLoading()
    }
  }

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault()

    // Ensure numeric values are numbers, not strings
    const formDataToSend = {
      ...programFormData,
      duration_weeks: parseInt(programFormData.duration_weeks.toString()) || 4
    }

    try {
      startGlobalLoading()
      const response = await withTimeout(fetch('/api/custom-programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataToSend),
      }), 15000)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        throw new Error(errorData.error || 'Failed to create program')
      }

      const responseData = await response.json()

  await fetchPrograms(programsFilterUserId)
      setProgramModalOpen(false)
      resetProgramForm()
      setModalTitle('Program created')
      setModalMessage('The program has been created successfully.')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error creating program:', error)
      setModalTitle('Error')
      setModalMessage('Failed to create program. Please try again.')
      setShowSuccessModal(true)
    } finally {
      stopGlobalLoading()
    }
  }

  const handleUpdateProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProgram) return

    try {
      startGlobalLoading()
      const response = await withTimeout(fetch(`/api/custom-programs/${editingProgram.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programFormData),
      }), 15000)

      if (!response.ok) throw new Error('Failed to update program')

  await fetchPrograms(programsFilterUserId)
      setProgramModalOpen(false)
      setEditingProgram(null)
      resetProgramForm()
      setModalTitle('Program updated')
      setModalMessage('The program has been updated successfully.')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error updating program:', error)
      setModalTitle('Error')
      setModalMessage('Failed to update program. Please try again.')
      setShowSuccessModal(true)
    } finally {
      stopGlobalLoading()
    }
  }

  const openProgramDeleteModal = (program: CustomProgram) => {
    setProgramToDelete(program)
    setIsProgramDeleteModalOpen(true)
  }

  const handleDeleteProgram = async () => {
    if (!programToDelete) return

    try {
      startGlobalLoading()
      const response = await withTimeout(fetch(`/api/custom-programs/${programToDelete.id}`, { method: 'DELETE' }), 15000)

      if (!response.ok) throw new Error('Failed to delete program')

  await fetchPrograms(programsFilterUserId)
      setIsProgramDeleteModalOpen(false)
      setProgramToDelete(null)
      setModalTitle('Program deleted')
      setModalMessage('The program has been deleted successfully.')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error deleting program:', error)
      setModalTitle('Error')
      setModalMessage('Failed to delete program.')
      setShowSuccessModal(true)
    } finally {
      stopGlobalLoading()
    }
  }

  const openPackageModal = (packageData?: any) => {
    if (packageData) {
      setEditingPackage(packageData)
      setPackageFormData({
        title: packageData.title || '',
        body_fat_range: packageData.body_fat_range || '',
        description: packageData.description || '',
        long_description: packageData.long_description || '',
        features: packageData.features || [],
        image_url_1: packageData.image_url_1 || '',
        image_url_2: packageData.image_url_2 || '',
        price_usd: packageData.price_usd || 0,
        price_gbp: packageData.price_gbp || 0,
        discounted_price_gbp: packageData.discounted_price_gbp || 0,
        discount_percentage: packageData.discount_percentage || 0,
        specifications: packageData.specifications || [],
        recommendations: packageData.recommendations || [],
        duration_weeks: packageData.duration_weeks || 0,
        is_active: packageData.is_active ?? true,
        sort_order: packageData.sort_order || 0
      })
    } else {
      setEditingPackage(null)
      setIsCreating(true)
      setPackageFormData({
        title: '',
        body_fat_range: '',
        description: '',
        long_description: '',
        features: ['', '', '', ''], // Default empty features for new package
        image_url_1: '',
        image_url_2: '',
        price_usd: 0,
        price_gbp: 0,
        discounted_price_gbp: 0,
        discount_percentage: 0,
        specifications: ['', '', '', ''], // Default empty specifications for new package
        recommendations: ['', '', ''], // Default empty recommendations for new package
        duration_weeks: 0,
        is_active: true,
        sort_order: 0
      })
    }
    setPackageModalOpen(true)
  }

  const handleUpdatePackage = async (updatedData: any) => {
    try {
      startGlobalLoading()
      const response = await withTimeout(fetch(`/api/admin/packages/${editingPackage?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      }), 15000)
      if (!response.ok) throw new Error('Failed to update package')
      await fetchPackages()
      setPackageModalOpen(false)
      setModalTitle('Package updated')
      setModalMessage('The package has been updated successfully.')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error updating package:', error)
      setModalTitle('Error')
      setModalMessage('Failed to update package.')
      setShowSuccessModal(true)
    } finally {
      stopGlobalLoading()
    }
  }

  const handleCreatePackage = async (data: any) => {
    // Validation: all fields must be filled
    const requiredStringFields = ['title','body_fat_range','description','long_description','image_url_1','image_url_2']
    for (const f of requiredStringFields) {
      if (!data[f] || String(data[f]).trim().length === 0) {
        setModalTitle('Validation error')
        setModalMessage(`Please fill the field: ${f.replace('_', ' ')}`)
        setShowSuccessModal(true)
        return
      }
    }
    const requiredNumberFields = ['price_usd','price_gbp','discounted_price_gbp','discount_percentage','duration_weeks','sort_order']
    for (const f of requiredNumberFields) {
      if (data[f] === undefined || data[f] === null || Number.isNaN(Number(data[f]))) {
        setModalTitle('Validation error')
        setModalMessage(`Please provide a valid number for: ${f}`)
        setShowSuccessModal(true)
        return
      }
    }
    
    // Validate features, specifications, recommendations arrays - all must be non-empty
    if (data.features && data.features.some((f: string) => !f || f.trim().length === 0)) {
      setModalTitle('Validation error')
      setModalMessage('All feature fields must be filled')
      setShowSuccessModal(true)
      return
    }
    if (data.specifications && data.specifications.some((s: string) => !s || s.trim().length === 0)) {
      setModalTitle('Validation error')
      setModalMessage('All specification fields must be filled')
      setShowSuccessModal(true)
      return
    }
    if (data.recommendations && data.recommendations.some((r: string) => !r || r.trim().length === 0)) {
      setModalTitle('Validation error')
      setModalMessage('All recommendation fields must be filled')
      setShowSuccessModal(true)
      return
    }

    try {
      startGlobalLoading()
      const response = await withTimeout(fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }), 15000)
      if (!response.ok) {
        const e = await response.json().catch(() => ({}))
        throw new Error(e.error || 'Failed to create package')
      }
      await fetchPackages()
      setPackageModalOpen(false)
      setIsCreating(false)
      setModalTitle('Package created')
      setModalMessage('The package has been created successfully.')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error creating package:', error)
      setModalTitle('Error')
      setModalMessage('Failed to create package.')
      setShowSuccessModal(true)
    } finally {
      stopGlobalLoading()
    }
  }

  const handleDeletePackage = async () => {
    if (!packageToDelete) return
    try {
      startGlobalLoading()
      const response = await withTimeout(fetch(`/api/admin/packages/${packageToDelete.id}`, { method: 'DELETE' }), 15000)
      if (!response.ok) throw new Error('Failed to delete package')
      await fetchPackages()
      setIsDeleteModalOpen(false)
      setPackageToDelete(null)
      setModalTitle('Package deleted')
      setModalMessage('The package has been deleted successfully.')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error deleting package:', error)
      setModalTitle('Error')
      setModalMessage('Failed to delete package.')
      setShowSuccessModal(true)
    } finally {
      stopGlobalLoading()
    }
  }

  const openDeleteModal = (packageData: any) => {
    setPackageToDelete(packageData)
    setIsDeleteModalOpen(true)
  }

  const openProgramModal = (program?: CustomProgram) => {
    if (program) {
      setEditingProgram(program)
      setProgramFormData({
        title: program.title,
        description: program.description || '',
        user_id: program.user_id,
        difficulty_level: program.difficulty_level,
        duration_weeks: program.duration_weeks,
        notes: program.notes || '',
        workouts: program.workouts?.map(w => ({
          day_number: w.day_number,
          week_number: w.week_number,
          workout_name: w.workout_name,
          description: w.description || '',
          rest_time_seconds: w.rest_time_seconds,
          exercises: w.exercises?.map(e => ({
            exercise_name: e.exercise_name,
            sets: e.sets,
            reps: e.reps || '',
            weight: e.weight || '',
            rest_time_seconds: e.rest_time_seconds,
            notes: e.notes || ''
          })) || []
        })) || []
      })
    } else {
      setEditingProgram(null)
      resetProgramForm()
    }
    setProgramModalOpen(true)
  }

  const resetProgramForm = () => {
    setProgramFormData({
      title: '',
      description: '',
      user_id: '',
      difficulty_level: 'beginner',
      duration_weeks: 4,
      notes: '',
      workouts: []
    })
  }

  // Workout/exercise handlers moved into ProgramModal component

  const formatUserName = (user: any) => {
    if (user.display_name) {
      return user.display_name
    }
    
    const firstName = user.first_name || ''
    const lastName = user.last_name || ''
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    }
    
    return firstName || lastName || null
  }

  const formatProvider = (provider: string | null) => {
    if (!provider) return 'Unknown'
    return provider.charAt(0).toUpperCase() + provider.slice(1)
  }

  const getProviderColorClass = (provider: string | null) => {
    switch (provider) {
      case 'google':
        return 'bg-red-100 text-red-800'
      case 'email':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderProviders = (user: AuthUserFromAdmin) => {
    const providers = user.providers || []
    const primaryProvider = user.primary_provider
    
    if (providers.length === 0) {
      return <span className="text-gray-500 italic">No providers</span>
    }
    
    if (providers.length === 1) {
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProviderColorClass(providers[0])}`}>
          {formatProvider(providers[0])}
        </span>
      )
    }
    
    // Birden fazla provider varsa
    return (
      <div className="flex flex-wrap gap-1">
        {providers.map((provider, index) => (
          <span 
            key={index}
            className={`px-2 py-1 text-xs font-medium rounded-full ${getProviderColorClass(provider)} ${
              provider === primaryProvider ? 'ring-2 ring-blue-500' : ''
            }`}
            title={provider === primaryProvider ? 'Primary provider' : ''}
          >
            {formatProvider(provider)}
          </span>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mb-4"></div>
        <p className="text-gray-600">Loading admin panel...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 text-red-700">
        <Shield size={64} className="mb-4" />
        <h1 className="text-responsive-xl font-bold">Error</h1>
        <p>{error}</p>
        <div className="flex gap-4 mt-4">
          <button onClick={() => router.push('/')} className="btn-secondary-sm">Go Home</button>
          <button onClick={handleRefresh} className="btn-primary-sm">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      {/* Page uses global top loading bar from AppContext */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-responsive-2xl font-bold text-gray-800">Admin Panel</h1>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-fourth-sm flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            {activeTab === 'mail' && (
              <button
                onClick={openMailModal}
                className="btn-primary-sm flex items-center gap-2"
              >
                <Mail size={18} />
                Send Mail to All Users
              </button>
            )}
            {activeTab === 'programs' && (
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-600 whitespace-nowrap">User:</label>
                  <select
                    value={programsFilterUserId}
                    onChange={async (e) => {
                      const val = e.target.value
                      setProgramsFilterUserId(val)
                      await fetchPrograms(val)
                    }}
                    className="border-gray-300 text-sm rounded-md p-1.5 text-black bg-white shadow-sm"
                  >
                    <option value="">All Users</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : (u.display_name || u.email)}
                      </option>
                    ))}
                  </select>
                </div>
              <button
                onClick={() => openProgramModal()}
                className="btn-tertiary-sm flex items-center gap-2"
              >
                <Plus size={18} />
                Create Custom Program
              </button>
          </div>
            )}
            {activeTab === 'packages' && (
            <button
                onClick={() => openPackageModal()}
                className="btn-tertiary-sm flex items-center gap-2"
              >
                <Plus size={18} />
                Add Package
            </button>
            )}

          </div>
        </div>

        <AdminTabs 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          loadingStates={{
            users: usersLoading,
            mail: mailLoading,
            programs: programsLoading,
            purchases: purchasesLoading,
            tickets: ticketsLoading,
            packages: packagesLoading
          }}
        />

        <AdminTabContent
          activeTab={activeTab}
          loadingStates={{
            users: usersLoading,
            mail: mailLoading,
            programs: programsLoading,
            purchases: purchasesLoading,
            tickets: ticketsLoading,
            packages: packagesLoading
          }}
          data={{
            users,
            mailLogs,
            programs,
            purchases,
            supportTickets,
            packages
          }}
          handlers={{
            formatUserName,
            renderProviders,
            openProgramModal,
            openProgramDeleteModal,
            openTicketModal,
            openPackageModal,
            openDeleteModal
          }}
        />
      </div>

      {/* Send Mail Modal */}
      <SendMailModal
        isOpen={isMailModalOpen}
        onClose={() => setMailModalOpen(false)}
        onSubmit={handleSendMail}
        allUserEmails={allUserEmails}
        isSending={isSending}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={modalTitle}
        message={modalMessage}
      />

      {/* Create/Edit Program Modal */}
      <ProgramModal
        isOpen={isProgramModalOpen}
        onClose={() => setProgramModalOpen(false)}
        formData={programFormData as any}
        setFormData={setProgramFormData as any}
        users={users as any}
        formatUserName={formatUserName as any}
        onSubmit={editingProgram ? handleUpdateProgram : handleCreateProgram}
        editingProgram={editingProgram}
      />

      {/* Support Ticket Modal */}
      <SupportTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        ticket={selectedTicket}
        users={users}
        onRespond={handleTicketResponse}
        isResponding={isResponding}
      />

      <PackageModal
        isOpen={isPackageModalOpen}
        onClose={() => {
          setPackageModalOpen(false)
          setIsCreating(false)
        }}
        onSubmit={isCreating ? handleCreatePackage : handleUpdatePackage}
        formData={packageFormData}
        setFormData={setPackageFormData}
        isEditing={!!editingPackage}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePackage}
        title="Delete Package"
        message="Are you sure you want to delete this package? This action cannot be undone."
        itemName={packageToDelete?.title}
      />

      <DeleteModal
        isOpen={isProgramDeleteModalOpen}
        onClose={() => setIsProgramDeleteModalOpen(false)}
        onConfirm={handleDeleteProgram}
        title="Delete Program"
        message="Are you sure you want to delete this program? This action cannot be undone."
        itemName={programToDelete?.title}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={modalTitle}
        message={modalMessage}
      />
      
    </div>
  )
}
