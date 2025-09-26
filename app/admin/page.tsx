'use client'

import { useEffect, useState } from 'react'
import { withTimeout } from '@/lib/asyncUtils'
import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/navigation'
import { User as AuthUser } from '@supabase/supabase-js'
import { Mail, Shield, X, RefreshCw, Plus, Trash2, Users, Dumbbell, CreditCard, Headset } from 'lucide-react'
import UsersTab from './components/UsersTab'
import ProgramsTab from './components/ProgramsTab'
import PurchasesTab from './components/PurchasesTab'
import TicketsTab from './components/TicketsTab'
import MailTab from './components/MailTab'
import PackagesTab from './components/PackagesTab'
import SendMailModal from './components/modals/SendMailModal'
import SupportTicketModal from './components/modals/SupportTicketModal'
import PackageModal from './components/modals/PackageModal'
import DeleteModal from './components/modals/DeleteModal'
import { CustomProgram } from '@/lib/database.types'
import SuccessModal from '@/components/SuccessModal'

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
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'programs' | 'purchases' | 'tickets' | 'mail' | 'packages'>('users')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
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
    image_url: '',
    price_usd: 0,
    price_gbp: 0,
    discounted_price_gbp: 0,
    discount_percentage: 0,
    emoji: '',
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

  const fetchUsers = async () => {
    try {
      setError(null)
      const response = await withTimeout(fetch('/api/admin/users'), 15000)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data.users || [])
    } catch (e: any) {
      setError('Failed to fetch users: ' + e.message)
    }
  }

  const fetchPrograms = async () => {
    try {
      setError(null)
      const response = await withTimeout(fetch('/api/custom-programs'), 15000)
      if (!response.ok) throw new Error('Failed to fetch programs')
      const data = await response.json()
      setPrograms(data.programs || [])
    } catch (e: any) {
      setError('Failed to fetch programs: ' + e.message)
    }
  }

  const fetchPurchases = async () => {
    try {
      setError(null)
      const response = await withTimeout(fetch('/api/admin/purchases'), 15000)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch purchases')
      }
      const data = await response.json()
      setPurchases(data.purchases || [])
    } catch (e: any) {
      setError('Failed to fetch purchases: ' + e.message)
    }
  }

  const fetchSupportTickets = async () => {
    try {
      setError(null)
      const response = await withTimeout(fetch('/api/admin/support-tickets'), 15000)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch support tickets')
      }
      const data = await response.json()
      setSupportTickets(data.tickets || [])
    } catch (e: any) {
      console.error('Support tickets fetch error:', e)
      setError('Failed to fetch support tickets: ' + e.message)
    }
  }

  const fetchMailLogs = async () => {
    try {
      setError(null)
      const response = await withTimeout(fetch('/api/admin/mail-logs'), 15000)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch mail logs')
      }
      const data = await response.json()
      setMailLogs(data.mailLogs || [])
    } catch (e: any) {
      setError('Failed to fetch mail logs: ' + e.message)
    }
  }

  const fetchPackages = async () => {
    try {
      setError(null)
      const response = await withTimeout(fetch('/api/packages'), 15000)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch packages')
      }
      const data = await response.json()
      setPackages(data.packages || [])
    } catch (e: any) {
      setError('Failed to fetch packages: ' + e.message)
    }
  }

  const checkUserAndFetchData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await withTimeout(supabase.auth.getUser(), 15000)
      
      if (!user) {
        router.push('/')
        return
      }

      setUser(user)
      
      if (user.email !== ADMIN_EMAIL) {
        router.push('/')
        return
      }

      // Loading'i daha erken false yap, data'lar background'da yüklensin
      setLoading(false)
      
      // Data'ları background'da fetch et
      Promise.all([fetchUsers(), fetchPrograms(), fetchPurchases(), fetchSupportTickets(), fetchMailLogs(), fetchPackages()]).catch((e) => {
        setError('Failed to load data: ' + e.message)
      })
    } catch (e: any) {
      setError('Failed to authenticate: ' + e.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    checkUserAndFetchData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchUsers(), fetchPrograms(), fetchPurchases(), fetchSupportTickets(), fetchMailLogs(), fetchPackages()])
    setRefreshing(false)
  }

  const handleSendMail = async (subject: string, body: string, recipients: string[]) => {
    setIsSending(true)
    try {
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
    }
  }

  const openMailModal = async () => {
    setMailModalOpen(true)
    try {
      const response = await withTimeout(fetch('/api/admin/users'), 15000)
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setAllUserEmails(data.users.map((u: any) => u.email))
    } catch (e) {
      console.error('Error fetching user emails:', e)
      setAllUserEmails([])
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
    }
  }

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await withTimeout(fetch('/api/custom-programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programFormData),
      }), 15000)

      if (!response.ok) throw new Error('Failed to create program')

      await fetchPrograms()
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
    }
  }

  const handleUpdateProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProgram) return

    try {
      const response = await withTimeout(fetch(`/api/custom-programs/${editingProgram.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programFormData),
      }), 15000)

      if (!response.ok) throw new Error('Failed to update program')

      await fetchPrograms()
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
    }
  }

  const openProgramDeleteModal = (program: CustomProgram) => {
    setProgramToDelete(program)
    setIsProgramDeleteModalOpen(true)
  }

  const handleDeleteProgram = async () => {
    if (!programToDelete) return

    try {
      const response = await withTimeout(fetch(`/api/custom-programs/${programToDelete.id}`, { method: 'DELETE' }), 15000)

      if (!response.ok) throw new Error('Failed to delete program')

      await fetchPrograms()
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
        image_url: packageData.image_url || '',
        price_usd: packageData.price_usd || 0,
        price_gbp: packageData.price_gbp || 0,
        discounted_price_gbp: packageData.discounted_price_gbp || 0,
        discount_percentage: packageData.discount_percentage || 0,
        emoji: packageData.emoji || '',
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
        image_url: '',
        price_usd: 0,
        price_gbp: 0,
        discounted_price_gbp: 0,
        discount_percentage: 0,
        emoji: '',
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
    }
  }

  const handleCreatePackage = async (data: any) => {
    // Validation: all fields must be filled
    const requiredStringFields = ['title','body_fat_range','description','long_description','emoji','image_url']
    for (const f of requiredStringFields) {
      if (!data[f] || String(data[f]).trim().length === 0) {
        setModalTitle('Validation error')
        setModalMessage(`Please fill the field: ${f}`)
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
    }
  }

  const handleDeletePackage = async () => {
    if (!packageToDelete) return
    try {
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

  const addWorkoutDay = () => {
    const newWorkout: WorkoutDay = {
      day_number: programFormData.workouts.length + 1,
      week_number: 1,
      workout_name: '',
      description: '',
      rest_time_seconds: 60,
      exercises: []
    }
    setProgramFormData({
      ...programFormData,
      workouts: [...programFormData.workouts, newWorkout]
    })
  }

  const updateWorkout = (index: number, workout: WorkoutDay) => {
    const updatedWorkouts = [...programFormData.workouts]
    updatedWorkouts[index] = workout
    setProgramFormData({
      ...programFormData,
      workouts: updatedWorkouts
    })
  }

  const removeWorkout = (index: number) => {
    const updatedWorkouts = programFormData.workouts.filter((_, i) => i !== index)
    setProgramFormData({
      ...programFormData,
      workouts: updatedWorkouts
    })
  }

  const addExercise = (workoutIndex: number) => {
    const newExercise: Exercise = {
      exercise_name: '',
      sets: 3,
      reps: '8-12',
      weight: '',
      rest_time_seconds: 60,
      notes: ''
    }
    const updatedWorkouts = [...programFormData.workouts]
    updatedWorkouts[workoutIndex].exercises.push(newExercise)
    setProgramFormData({
      ...programFormData,
      workouts: updatedWorkouts
    })
  }

  const updateExercise = (workoutIndex: number, exerciseIndex: number, exercise: Exercise) => {
    const updatedWorkouts = [...programFormData.workouts]
    updatedWorkouts[workoutIndex].exercises[exerciseIndex] = exercise
    setProgramFormData({
      ...programFormData,
      workouts: updatedWorkouts
    })
  }

  const removeExercise = (workoutIndex: number, exerciseIndex: number) => {
    const updatedWorkouts = [...programFormData.workouts]
    updatedWorkouts[workoutIndex].exercises = updatedWorkouts[workoutIndex].exercises.filter((_, i) => i !== exerciseIndex)
    setProgramFormData({
      ...programFormData,
      workouts: updatedWorkouts
    })
  }

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
              <button
                onClick={() => openProgramModal()}
                className="btn-tertiary-sm flex items-center gap-2"
              >
                <Plus size={18} />
                Create Custom Program
              </button>
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

        {/* Tab Navigation - Responsive */}
        <div className="mb-6 border-b border-gray-200">
          {/* Desktop: Horizontal tabs */}
          <div className="hidden md:flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-3 font-medium ${
                activeTab === 'users' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users size={20} />
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('mail')}
              className={`flex items-center gap-2 px-6 py-3 font-medium ${
                activeTab === 'mail' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mail size={20} />
              Mail ({mailLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('programs')}
              className={`flex items-center gap-2 px-6 py-3 font-medium ${
                activeTab === 'programs' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Dumbbell size={20} />
              Custom Programs ({programs.length})
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`flex items-center gap-2 px-6 py-3 font-medium ${
                activeTab === 'purchases' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CreditCard size={20} />
              Purchases ({purchases.length})
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-2 px-6 py-3 font-medium ${
                activeTab === 'tickets' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Headset size={20} />
              Support Tickets ({supportTickets.length})
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`flex items-center gap-2 px-6 py-3 font-medium ${
                activeTab === 'packages' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Dumbbell size={20} />
              Packages ({packages.length})
            </button>
          </div>

          {/* Mobile: Vertical tabs */}
          <div className="md:hidden space-y-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 font-medium rounded text-xs ${
                activeTab === 'users' 
                  ? 'text-blue-600 bg-blue-50 border border-blue-200' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users size={14} />
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('mail')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 font-medium rounded text-xs ${
                activeTab === 'mail' 
                  ? 'text-blue-600 bg-blue-50 border border-blue-200' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Mail size={14} />
              Mail ({mailLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('programs')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 font-medium rounded text-xs ${
                activeTab === 'programs' 
                  ? 'text-blue-600 bg-blue-50 border border-blue-200' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Dumbbell size={14} />
              Custom Programs ({programs.length})
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 font-medium rounded text-xs ${
                activeTab === 'purchases' 
                  ? 'text-blue-600 bg-blue-50 border border-blue-200' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CreditCard size={14} />
              Purchases ({purchases.length})
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 font-medium rounded text-xs ${
                activeTab === 'tickets' 
                  ? 'text-blue-600 bg-blue-50 border border-blue-200' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Headset size={14} />
              Support Tickets ({supportTickets.length})
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 font-medium rounded text-xs ${
                activeTab === 'packages'
                  ? 'text-blue-600 bg-blue-50 border border-blue-200' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Dumbbell size={14} />
              Packages ({packages.length})
            </button>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <UsersTab users={users as any} renderProviders={(u:any)=>renderProviders(u as any)} formatUserName={(u:any)=>formatUserName(u as any)} />
        )}

        {/* Mail Tab */}
        {activeTab === 'mail' && (
          <MailTab logs={mailLogs} />
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <PackagesTab 
            packages={packages} 
            onEdit={openPackageModal} 
            onDelete={openDeleteModal}
          />
        )}

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <ProgramsTab programs={programs} users={users} formatUserName={formatUserName} onEdit={openProgramModal} onDelete={openProgramDeleteModal} />
        )}

        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          <PurchasesTab purchases={purchases} />
        )}

        {/* Support Tickets Tab */}
        {activeTab === 'tickets' && (
          <TicketsTab
            tickets={supportTickets as any}
            users={users as any}
            getPriorityClass={(p) => p === 'urgent' ? 'bg-red-100 text-red-800' : p === 'high' ? 'bg-orange-100 text-orange-800' : p === 'normal' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
            getStatusClass={(s) => s === 'open' ? 'bg-red-100 text-red-800' : s === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : s === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
            onOpen={openTicketModal as any}
          />
        )}
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
      {isProgramModalOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-md flex justify-center items-center z-50 overflow-y-auto"
          onClick={() => setProgramModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-2 sm:mx-4 my-2 sm:my-4 md:my-8 relative max-h-[90vh] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b flex-shrink-0">
              <h2 className="text-responsive-lg font-semibold text-gray-900">
                {editingProgram ? 'Edit Program' : 'Create New Program'}
              </h2>
              <button onClick={() => setProgramModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            <form onSubmit={editingProgram ? handleUpdateProgram : handleCreateProgram} className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 overflow-y-auto">
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <div>
                    <label htmlFor="title" className="block text-responsive-sm font-medium text-gray-700">Program Title</label>
                    <input
                      type="text"
                      id="title"
                      value={programFormData.title}
                      onChange={(e) => setProgramFormData({ ...programFormData, title: e.target.value })}
                      className="input-responsive-sm mt-1 block w-full text-black"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="user_id" className="block text-responsive-sm font-medium text-gray-700">Select User</label>
                    <select
                      id="user_id"
                      value={programFormData.user_id}
                      onChange={(e) => setProgramFormData({ ...programFormData, user_id: e.target.value })}
                      className="input-responsive-sm mt-1 block w-full text-black"
                      required
                    >
                      <option value="">Select a user...</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {formatUserName(user) || 'No name'} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="difficulty_level" className="block text-responsive-sm font-medium text-gray-700">Difficulty Level</label>
                    <select
                      id="difficulty_level"
                      value={programFormData.difficulty_level}
                      onChange={(e) => setProgramFormData({ ...programFormData, difficulty_level: e.target.value })}
                      className="input-responsive-sm mt-1 block w-full text-black"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="duration_weeks" className="block text-responsive-sm font-medium text-gray-700">Duration (weeks)</label>
                    <input
                      type="number"
                      id="duration_weeks"
                      value={programFormData.duration_weeks}
                      onChange={(e) => setProgramFormData({ ...programFormData, duration_weeks: parseInt(e.target.value) })}
                      className="input-responsive-sm mt-1 block w-full text-black"
                      min="1"
                      max="52"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-responsive-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="description"
                    rows={3}
                    value={programFormData.description}
                    onChange={(e) => setProgramFormData({ ...programFormData, description: e.target.value })}
                    className="input-responsive-sm mt-1 block w-full text-black"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-responsive-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={programFormData.notes}
                    onChange={(e) => setProgramFormData({ ...programFormData, notes: e.target.value })}
                    className="input-responsive-sm mt-1 block w-full text-black"
                  />
                </div>

                {/* Workouts Section */}
                <div>
                  <div className="flex justify-between items-center mb-2 sm:mb-3 md:mb-4">
                    <h3 className="text-responsive-base font-medium text-gray-900">Workout Days</h3>
                    <button
                      type="button"
                      onClick={addWorkoutDay}
                      className="btn-tertiary-sm flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add Workout Day
                    </button>
                  </div>

                  {programFormData.workouts.map((workout, workoutIndex) => (
                    <div key={workoutIndex} className="border border-gray-200 rounded-lg p-2 sm:p-3 md:p-4 mb-2 sm:mb-3 md:mb-4">
                      <div className="flex justify-between items-start mb-2 sm:mb-3 md:mb-4">
                        <h4 className="text-responsive-sm font-medium text-gray-900">Day {workout.day_number}</h4>
                        <button
                          type="button"
                          onClick={() => removeWorkout(workoutIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
                        <div>
                          <label className="block text-responsive-sm font-medium text-gray-700">Workout Name</label>
                          <input
                            type="text"
                            value={workout.workout_name}
                            onChange={(e) => updateWorkout(workoutIndex, { ...workout, workout_name: e.target.value })}
                            className="input-responsive-sm mt-1 block w-full text-black"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-responsive-sm font-medium text-gray-700">Week Number</label>
                          <input
                            type="number"
                            value={workout.week_number}
                            onChange={(e) => updateWorkout(workoutIndex, { ...workout, week_number: parseInt(e.target.value) })}
                            className="input-responsive-sm mt-1 block w-full text-black"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-responsive-sm font-medium text-gray-700">Rest Time (seconds)</label>
                          <input
                            type="number"
                            value={workout.rest_time_seconds}
                            onChange={(e) => updateWorkout(workoutIndex, { ...workout, rest_time_seconds: parseInt(e.target.value) })}
                            className="input-responsive-sm mt-1 block w-full text-black"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="mb-2 sm:mb-3 md:mb-4">
                        <label className="block text-responsive-sm font-medium text-gray-700">Description</label>
                        <textarea
                          value={workout.description}
                          onChange={(e) => updateWorkout(workoutIndex, { ...workout, description: e.target.value })}
                          className="input-responsive-sm mt-1 block w-full text-black"
                          rows={2}
                        />
                      </div>

                      {/* Exercises */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-responsive-sm font-medium text-gray-800">Exercises</h5>
                          <button
                            type="button"
                            onClick={() => addExercise(workoutIndex)}
                            className="btn-fourth-sm flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            Add Exercise
                          </button>
                        </div>

                        {workout.exercises.map((exercise, exerciseIndex) => (
                          <div key={exerciseIndex} className="border border-gray-100 rounded-md p-2 sm:p-3 mb-2">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-responsive-sm font-medium text-gray-700">Exercise {exerciseIndex + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeExercise(workoutIndex, exerciseIndex)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2">
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600">Exercise Name</label>
                                <input
                                  type="text"
                                  value={exercise.exercise_name}
                                  onChange={(e) => updateExercise(workoutIndex, exerciseIndex, { ...exercise, exercise_name: e.target.value })}
                                  className="input-responsive-sm mt-1 block w-full text-black"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600">Sets</label>
                                <input
                                  type="number"
                                  value={exercise.sets}
                                  onChange={(e) => updateExercise(workoutIndex, exerciseIndex, { ...exercise, sets: parseInt(e.target.value) })}
                                  className="input-responsive-sm mt-1 block w-full text-black"
                                  min="1"
                                />
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600">Reps</label>
                                <input
                                  type="text"
                                  value={exercise.reps}
                                  onChange={(e) => updateExercise(workoutIndex, exerciseIndex, { ...exercise, reps: e.target.value })}
                                  className="input-responsive-sm mt-1 block w-full text-black"
                                  placeholder="e.g., 8-12, 15, to failure"
                                />
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600">Weight</label>
                                <input
                                  type="text"
                                  value={exercise.weight}
                                  onChange={(e) => updateExercise(workoutIndex, exerciseIndex, { ...exercise, weight: e.target.value })}
                                  className="input-responsive-sm mt-1 block w-full text-black"
                                  placeholder="e.g., 20kg, bodyweight"
                                />
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600">Rest (seconds)</label>
                                <input
                                  type="number"
                                  value={exercise.rest_time_seconds}
                                  onChange={(e) => updateExercise(workoutIndex, exerciseIndex, { ...exercise, rest_time_seconds: parseInt(e.target.value) })}
                                  className="input-responsive-sm mt-1 block w-full text-black"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600">Notes</label>
                                <input
                                  type="text"
                                  value={exercise.notes}
                                  onChange={(e) => updateExercise(workoutIndex, exerciseIndex, { ...exercise, notes: e.target.value })}
                                  className="input-responsive-sm mt-1 block w-full text-black"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 md:pt-4 border-t mt-3 md:mt-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setProgramModalOpen(false)}
                  className="btn-secondary-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-sm"
                >
                  {editingProgram ? 'Update Program' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
      
    </div>
  )
}
