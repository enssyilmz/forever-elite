'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/navigation'
import { User as AuthUser } from '@supabase/supabase-js'
import { Mail, Shield, X, RefreshCw, Plus, Trash2, Users, Dumbbell, CreditCard, Headset } from 'lucide-react'
import UsersTab from './components/UsersTab'
import ProgramsTab from './components/ProgramsTab'
import PurchasesTab from './components/PurchasesTab'
import TicketsTab from './components/TicketsTab'
import MailTab from './components/MailTab'
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
  const [activeTab, setActiveTab] = useState<'users' | 'programs' | 'purchases' | 'tickets' | 'mail'>('users')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Mail modal states
  const [isMailModalOpen, setMailModalOpen] = useState(false)
  const [mailContent, setMailContent] = useState({ subject: '', body: '' })
  const [isSending, setIsSending] = useState(false)
  const [allUserEmails, setAllUserEmails] = useState<string[]>([])
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [loadingEmails, setLoadingEmails] = useState(false)
  const [showRecipientPicker, setShowRecipientPicker] = useState(false)
  const [recipientSearch, setRecipientSearch] = useState('')
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

  const router = useRouter()

  const fetchUsers = async () => {
    try {
      setError(null)
      // RPC fonksiyonunu çağır ve JSON dönüşünü parse et
      const { data, error: rpcError } = await supabase.rpc('get_all_users')
      if (rpcError) {
        throw rpcError
      }
      
      // JSON array'ini AuthUserFromAdmin tipine çevir
      const parsedUsers: AuthUserFromAdmin[] = data || []
      setUsers(parsedUsers)
    } catch (e: any) {
      setError('Failed to fetch users: ' + e.message)
    }
  }

  const fetchPrograms = async () => {
    try {
      setError(null)
      const response = await fetch('/api/custom-programs')
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
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setPurchases(data || [])
    } catch (e: any) {
      setError('Failed to fetch purchases: ' + e.message)
    }
  }

  const fetchSupportTickets = async () => {
    try {
      setError(null)
      const response = await fetch('/api/admin/support-tickets')
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
      const { data, error } = await supabase
        .from('admin_mail_logs')
        .select('id, subject, body, recipients, sent_count, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      setMailLogs(data || [])
    } catch (e: any) {
      setError('Failed to fetch mail logs: ' + e.message)
    }
  }

  const checkUserAndFetchData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
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
      Promise.all([fetchUsers(), fetchPrograms(), fetchPurchases(), fetchSupportTickets(), fetchMailLogs()]).catch((e) => {
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
    await Promise.all([fetchUsers(), fetchPrograms(), fetchPurchases(), fetchSupportTickets(), fetchMailLogs()])
    setRefreshing(false)
  }

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    try {
      const recipients = selectedEmails.length > 0 ? selectedEmails : allUserEmails
      const response = await fetch('/api/admin/send-bulk-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: mailContent.subject, html: mailContent.body, recipients })
      })
      const result = await response.json()
      if (!response.ok || !result.ok) {
        const reason = result?.error || 'Please check your connection or configuration.'
    setMailModalOpen(false)
        setModalTitle('Email sending failed')
        setModalMessage(`Emails could not be sent. Reason: ${reason}`)
        setShowSuccessModal(true)
      } else {
        setMailModalOpen(false)
        setMailContent({ subject: '', body: '' })
        setSelectedEmails([])
        setModalTitle('Emails sent')
        setModalMessage(`Successfully sent email to ${result.sent ?? recipients.length} recipient(s).`)
        setShowSuccessModal(true)
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
    setLoadingEmails(true)
    try {
      const { data, error } = await supabase.rpc('get_all_users')
      if (error) throw error
      const emails = (data || []).map((u: any) => u.email).filter(Boolean)
      setAllUserEmails(emails)
      setSelectedEmails(emails) // varsayılan: hepsi seçili
    } catch (e) {
      console.error('load emails error', e)
      setAllUserEmails([])
    } finally {
      setLoadingEmails(false)
    }
  }

  const openTicketModal = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setAdminResponse(ticket.admin_response || '')
    setIsResponding(false)
    setTicketModalOpen(true)
  }

  const handleTicketResponse = async () => {
    if (!selectedTicket || !adminResponse.trim()) return
    
    setIsResponding(true)
    try {
      const response = await fetch('/api/admin/support-tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          adminResponse: adminResponse.trim(),
          status: 'resolved'
        })
      })

      if (!response.ok) throw new Error('Failed to respond to ticket')
      
      await fetchSupportTickets()
      setTicketModalOpen(false)
      setSelectedTicket(null)
      setAdminResponse('')
    } catch (error) {
      console.error('Error responding to ticket:', error)
    } finally {
      setIsResponding(false)
    }
  }

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/custom-programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programFormData),
      })

      if (!response.ok) throw new Error('Failed to create program')

      await fetchPrograms()
      setProgramModalOpen(false)
      resetProgramForm()
    } catch (error) {
      console.error('Error creating program:', error)
    }
  }

  const handleUpdateProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProgram) return

    try {
      const response = await fetch(`/api/custom-programs/${editingProgram.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programFormData),
      })

      if (!response.ok) throw new Error('Failed to update program')

      await fetchPrograms()
      setProgramModalOpen(false)
      setEditingProgram(null)
      resetProgramForm()
    } catch (error) {
      console.error('Error updating program:', error)
    }
  }

  const handleDeleteProgram = async (programId: number) => {
    if (!confirm('Are you sure you want to delete this program?')) return

    try {
      const response = await fetch(`/api/custom-programs/${programId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete program')

      await fetchPrograms()
    } catch (error) {
      console.error('Error deleting program:', error)
    }
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

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <ProgramsTab programs={programs} users={users} formatUserName={formatUserName} onEdit={openProgramModal} onDelete={handleDeleteProgram} />
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
      {isMailModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50" 
          onClick={() => setMailModalOpen(false)}
        >
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-8 w-full max-w-4xl md:max-w-6xl mx-4 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMailModalOpen(false)} className="absolute top-2 md:top-4 right-2 md:right-4 text-gray-500 hover:text-gray-800">
              <X size={20} className="md:w-6 md:h-6" />
            </button>
            <h2 className="text-responsive-lg md:text-responsive-xl font-bold mb-4 md:mb-6 text-black">Send Bulk Email</h2>
            <form onSubmit={handleSendMail}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recipients - moved to top */}
                <div className="flex flex-col gap-4">
                  {showRecipientPicker && (
                    <div className="mt-3 border border-black rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Search emails</label>
                        <button type="button" className="btn-secondary-sm" onClick={() => setShowRecipientPicker(false)}>Close</button>
                      </div>
                      <input
                        type="text"
                        value={recipientSearch}
                        onChange={(e) => setRecipientSearch(e.target.value)}
                        placeholder="Search emails..."
                        className="mt-1 mb-2 block w-full text-black rounded-md shadow-md p-2"
                      />
                      <div className="max-h-48 overflow-auto">
                        {allUserEmails
                          .filter(e => !selectedEmails.includes(e))
                          .filter(e => e.toLowerCase().includes(recipientSearch.toLowerCase()))
                          .map((email) => (
                            <div key={email} className="flex justify-between items-center py-1">
                              <span className="text-sm text-black">{email}</span>
                              <button type="button" className="btn-primary-sm" onClick={() => setSelectedEmails(prev => Array.from(new Set([...prev, email])))}>
                                Add
                              </button>
                            </div>
                          ))}
                        {allUserEmails.filter(e => !selectedEmails.includes(e)).length === 0 && (
                          <div className="text-sm text-gray-500">No emails to add</div>
                        )}
                      </div>
                    </div>
                  )}

                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipients ({selectedEmails.length})</label>
                  {loadingEmails ? (
                    <div className="text-sm text-gray-500">Loading emails...</div>
                  ) : (
                    <div className="flex flex-wrap gap-2 border-black rounded-md p-2 max-h-40 overflow-auto md:max-h-[50vh] md:overflow-auto">
                      {selectedEmails.map((email) => (
                        <span key={email} className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-full text-sm text-black">
                          {email}
                          <button type="button" className="text-red-600" onClick={() => setSelectedEmails(selectedEmails.filter(e => e !== email))}>×</button>
                        </span>
                      ))}
                      {selectedEmails.length === 0 && (
                        <span className="text-sm text-gray-500">No recipients selected</span>
                      )}
                    </div>
                  )}
                  <div className="mt-2 flex gap-2">
                    <button type="button" className="btn-secondary-sm" onClick={() => setSelectedEmails(allUserEmails)}>Select All</button>
                    <button type="button" className="btn-primary-sm" onClick={() => { setSelectedEmails([]); setShowRecipientPicker(true) }}>Clear</button>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    value={mailContent.subject}
                    onChange={(e) => setMailContent({ ...mailContent, subject: e.target.value })}
                    className="mt-1 block w-full border border-black text-black rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                  <div className="flex-1">
                  <label htmlFor="body" className="block text-sm font-medium text-gray-700">Body</label>
                  <textarea
                    id="body"
                      rows={16}
                    value={mailContent.body}
                    onChange={(e) => setMailContent({ ...mailContent, body: e.target.value })}
                      className="mt-1 block w-full h-full border border-black text-black rounded-md shadow-sm p-2"
                    required
                  />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isSending}
                  className="btn-fourth-sm disabled:opacity-50"
                >
                  {isSending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 overflow-y-auto"
          onClick={() => setProgramModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl p-4 md:p-8 w-full max-w-3xl md:max-w-4xl mx-4 my-4 md:my-8 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setProgramModalOpen(false)} className="absolute top-2 md:top-4 right-2 md:right-4 text-gray-500 hover:text-gray-800">
              <X size={20} className="md:w-6 md:h-6" />
            </button>
            <h2 className="text-responsive-lg md:text-responsive-xl font-bold mb-4 md:mb-6 text-black">
              {editingProgram ? 'Edit Program' : 'Create New Program'}
            </h2>
            <form onSubmit={editingProgram ? handleUpdateProgram : handleCreateProgram}>
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Program Title</label>
                    <input
                      type="text"
                      id="title"
                      value={programFormData.title}
                      onChange={(e) => setProgramFormData({ ...programFormData, title: e.target.value })}
                      className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">Select User</label>
                    <select
                      id="user_id"
                      value={programFormData.user_id}
                      onChange={(e) => setProgramFormData({ ...programFormData, user_id: e.target.value })}
                      className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm p-2"
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
                    <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700">Difficulty Level</label>
                    <select
                      id="difficulty_level"
                      value={programFormData.difficulty_level}
                      onChange={(e) => setProgramFormData({ ...programFormData, difficulty_level: e.target.value })}
                      className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm p-2"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="duration_weeks" className="block text-sm font-medium text-gray-700">Duration (weeks)</label>
                    <input
                      type="number"
                      id="duration_weeks"
                      value={programFormData.duration_weeks}
                      onChange={(e) => setProgramFormData({ ...programFormData, duration_weeks: parseInt(e.target.value) })}
                      className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm p-2"
                      min="1"
                      max="52"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="description"
                    rows={3}
                    value={programFormData.description}
                    onChange={(e) => setProgramFormData({ ...programFormData, description: e.target.value })}
                    className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm p-2"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={programFormData.notes}
                    onChange={(e) => setProgramFormData({ ...programFormData, notes: e.target.value })}
                    className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm p-2"
                  />
                </div>

                {/* Workouts Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Workout Days</h3>
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
                    <div key={workoutIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium text-gray-900">Day {workout.day_number}</h4>
                        <button
                          type="button"
                          onClick={() => removeWorkout(workoutIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Workout Name</label>
                          <input
                            type="text"
                            value={workout.workout_name}
                            onChange={(e) => updateWorkout(workoutIndex, { ...workout, workout_name: e.target.value })}
                            className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm p-2"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Week Number</label>
                          <input
                            type="number"
                            value={workout.week_number}
                            onChange={(e) => updateWorkout(workoutIndex, { ...workout, week_number: parseInt(e.target.value) })}
                            className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm p-2"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Rest Time (seconds)</label>
                          <input
                            type="number"
                            value={workout.rest_time_seconds}
                            onChange={(e) => updateWorkout(workoutIndex, { ...workout, rest_time_seconds: parseInt(e.target.value) })}
                            className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm p-2"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          value={workout.description}
                          onChange={(e) => updateWorkout(workoutIndex, { ...workout, description: e.target.value })}
                          className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm p-2"
                          rows={2}
                        />
                      </div>

                      {/* Exercises */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium text-gray-800">Exercises</h5>
                          <button
                            type="button"
                            onClick={() => addExercise(workoutIndex)}
                            className="btn-fourth-sm flex items-center gap-1"
                          >
                            <Plus size={14} />
                            Add Exercise
                          </button>
                        </div>

                        {workout.exercises.map((exercise, exerciseIndex) => (
                          <div key={exerciseIndex} className="border border-gray-100 rounded-md p-3 mb-2">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-gray-700">Exercise {exerciseIndex + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeExercise(workoutIndex, exerciseIndex)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-600">Exercise Name</label>
                                <input
                                  type="text"
                                  value={exercise.exercise_name}
                                  onChange={(e) => updateExercise(workoutIndex, exerciseIndex, { ...exercise, exercise_name: e.target.value })}
                                  className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm p-1.5 text-sm"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600">Sets</label>
                                <input
                                  type="number"
                                  value={exercise.sets}
                                  onChange={(e) => updateExercise(workoutIndex, exerciseIndex, { ...exercise, sets: parseInt(e.target.value) })}
                                  className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm p-1.5 text-sm"
                                  min="1"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600">Reps</label>
                                <input
                                  type="text"
                                  value={exercise.reps}
                                  onChange={(e) => updateExercise(workoutIndex, exerciseIndex, { ...exercise, reps: e.target.value })}
                                  className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm p-1.5 text-sm"
                                  placeholder="e.g., 8-12, 15, to failure"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600">Weight</label>
                                <input
                                  type="text"
                                  value={exercise.weight}
                                  onChange={(e) => updateExercise(workoutIndex, exerciseIndex, { ...exercise, weight: e.target.value })}
                                  className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm p-1.5 text-sm"
                                  placeholder="e.g., 20kg, bodyweight"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600">Rest (seconds)</label>
                                <input
                                  type="number"
                                  value={exercise.rest_time_seconds}
                                  onChange={(e) => updateExercise(workoutIndex, exerciseIndex, { ...exercise, rest_time_seconds: parseInt(e.target.value) })}
                                  className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm p-1.5 text-sm"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600">Notes</label>
                                <input
                                  type="text"
                                  value={exercise.notes}
                                  onChange={(e) => updateExercise(workoutIndex, exerciseIndex, { ...exercise, notes: e.target.value })}
                                  className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm p-1.5 text-sm"
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

              <div className="mt-6 flex justify-end gap-4">
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
      {isTicketModalOpen && selectedTicket && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setTicketModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-3xl md:max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto p-4 md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2 md:px-6 py-3 md:py-4 border-b flex justify-between items-center">
              <h3 className="text-responsive-base md:text-responsive-lg font-semibold text-gray-900">
                Support Ticket #{selectedTicket.id}
              </h3>
              <button
                onClick={() => setTicketModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} className="md:w-6 md:h-6" />
              </button>
            </div>
            
            <div className="p-3 md:p-6 space-y-4 md:space-y-6">
              {/* Ticket Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Ticket Details</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Subject:</span>
                      <p className="text-sm text-gray-900">{selectedTicket.subject}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Priority:</span>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        selectedTicket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        selectedTicket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        selectedTicket.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedTicket.priority}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        selectedTicket.status === 'open' ? 'bg-red-100 text-red-800' :
                        selectedTicket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedTicket.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Created:</span>
                      <p className="text-sm text-gray-900">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">User:</span>
                      <p className="text-sm text-gray-900">{selectedTicket.user?.email || (users.find(u => u.id === selectedTicket.user_id)?.email) || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">User Message</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket.content}</p>
                  </div>
                </div>
              </div>

              {/* Admin Response */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Admin Response</h4>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Type your response here..."
                  className="text-black w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setTicketModalOpen(false)}
                  className="btn-secondary-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTicketResponse}
                  type="button"
                  disabled={isResponding || !adminResponse.trim()}
                  className="btn-primary-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResponding ? 'Responding...' : 'Send Response'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
