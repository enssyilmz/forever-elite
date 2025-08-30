'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { User as AuthUser } from '@supabase/supabase-js'
import { Mail, Shield, User, X, RefreshCw, Plus, Edit, Trash2, Users, Dumbbell, CreditCard } from 'lucide-react'
import { CustomProgram } from '@/lib/database.types'

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
  const [activeTab, setActiveTab] = useState<'users' | 'programs' | 'purchases'>('users')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Mail modal states
  const [isMailModalOpen, setMailModalOpen] = useState(false)
  const [mailContent, setMailContent] = useState({ subject: '', body: '' })
  const [isSending, setIsSending] = useState(false)
  
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

  const supabase = createClientComponentClient()
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
      Promise.all([fetchUsers(), fetchPrograms(), fetchPurchases()]).catch((e) => {
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
    await Promise.all([fetchUsers(), fetchPrograms(), fetchPurchases()])
    setRefreshing(false)
  }

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    // TODO: Implement mail sending logic
    console.log('Sending mail:', mailContent)
    setIsSending(false)
    setMailModalOpen(false)
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

  const formatUserName = (user: AuthUserFromAdmin) => {
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
      case 'github':
        return 'bg-gray-100 text-gray-800'
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
        <h1 className="text-2xl font-bold">Error</h1>
        <p>{error}</p>
        <div className="flex gap-4 mt-4">
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Go Home</button>
          <button onClick={handleRefresh} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            {activeTab === 'users' && (
              <button
                onClick={() => setMailModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700 transition"
              >
                <Mail size={18} />
                Send Mail to All Users
              </button>
            )}
            {activeTab === 'programs' && (
              <button
                onClick={() => openProgramModal()}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg shadow hover:bg-violet-700 transition"
              >
                <Plus size={18} />
                Create Custom Program
              </button>
            )}
            {activeTab === 'purchases' && (
              <button
                onClick={() => fetchPurchases()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
              >
                <CreditCard size={18} />
                Refresh Purchases
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-gray-200">
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
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <p className="text-sm text-gray-600">Total Users: <span className="font-semibold">{users.length}</span></p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3">User</th>
                    <th scope="col" className="px-6 py-3">Email</th>
                    <th scope="col" className="px-6 py-3">Registration Date</th>
                    <th scope="col" className="px-6 py-3">Last Sign-in</th>
                    <th scope="col" className="px-6 py-3">Provider</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const displayName = formatUserName(u)
                      return (
                        <tr key={u.id} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <User size={20} />
                              </div>
                              <div>
                                <div>
                                  {displayName ? (
                                    <span className="text-gray-900">{displayName}</span>
                                  ) : (
                                    <span className="text-gray-500 italic">Name not set</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>{u.email}</div>
                          </td>
                          <td className="px-6 py-4">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 
                              <span className="text-gray-500 italic">Never</span>
                            }
                          </td>
                          <td className="px-6 py-4">
                            {renderProviders(u)}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <p className="text-sm text-gray-600">Total Programs: <span className="font-semibold">{programs.length}</span></p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3">Program</th>
                    <th scope="col" className="px-6 py-3">User</th>
                    <th scope="col" className="px-6 py-3">Difficulty</th>
                    <th scope="col" className="px-6 py-3">Duration</th>
                    <th scope="col" className="px-6 py-3">Created</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No programs found
                      </td>
                    </tr>
                  ) : (
                    programs.map((program) => {
                      const user = users.find(u => u.id === program.user_id)
                      const userName = user ? formatUserName(user) : 'Unknown User'
                      return (
                        <tr key={program.id} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            <div>
                              <div className="font-semibold">{program.title}</div>
                              {program.description && (
                                <div className="text-sm text-gray-500 mt-1">{program.description}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>{userName}</div>
                            <div className="text-sm text-gray-500">{user?.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              program.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                              program.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {program.difficulty_level}
                            </span>
                          </td>
                          <td className="px-6 py-4">{program.duration_weeks} weeks</td>
                          <td className="px-6 py-4">{new Date(program.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openProgramModal(program)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteProgram(program.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <p className="text-sm text-gray-600">Total Purchases: <span className="font-semibold">{purchases.length}</span></p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3">ID</th>
                    <th scope="col" className="px-6 py-3">User Email</th>
                    <th scope="col" className="px-6 py-3">User Name</th>
                    <th scope="col" className="px-6 py-3">Package</th>
                    <th scope="col" className="px-6 py-3">Amount</th>
                    <th scope="col" className="px-6 py-3">Currency</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Created At</th>
                    <th scope="col" className="px-6 py-3">Stripe Session ID</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                        No purchases found
                      </td>
                    </tr>
                  ) : (
                    purchases.map((purchase) => (
                      <tr key={purchase.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{purchase.id}</td>
                        <td className="px-6 py-4">{purchase.user_email}</td>
                        <td className="px-6 py-4">{purchase.user_name || 'N/A'}</td>
                        <td className="px-6 py-4">{purchase.package_name}</td>
                        <td className="px-6 py-4">{purchase.amount}</td>
                        <td className="px-6 py-4">{purchase.currency}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            purchase.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                            purchase.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {purchase.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">{new Date(purchase.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{purchase.stripe_session_id}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Send Mail Modal */}
      {isMailModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl relative">
            <button onClick={() => setMailModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-black">Send Bulk Email</h2>
            <form onSubmit={handleSendMail}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    value={mailContent.subject}
                    onChange={(e) => setMailContent({ ...mailContent, subject: e.target.value })}
                    className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="body" className="block text-sm font-medium text-gray-700">Body</label>
                  <textarea
                    id="body"
                    rows={10}
                    value={mailContent.body}
                    onChange={(e) => setMailContent({ ...mailContent, body: e.target.value })}
                    className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm p-2"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg shadow btn-primary"
                >
                  {isSending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Program Modal */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl mx-4 my-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setProgramModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-black">
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
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
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
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700"
                >
                  {editingProgram ? 'Update Program' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
