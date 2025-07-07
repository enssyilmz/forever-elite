'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { User as AuthUser } from '@supabase/supabase-js'
import { Mail, Shield, User, X, RefreshCw } from 'lucide-react'

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

const ADMIN_EMAIL = 'yozdzhansyonmez@gmail.com'

export default function AdminPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [users, setUsers] = useState<AuthUserFromAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMailModalOpen, setMailModalOpen] = useState(false)
  const [mailContent, setMailContent] = useState({ subject: '', body: '' })
  const [isSending, setIsSending] = useState(false)

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
      console.error('Error fetching users:', e)
    }
  }

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/') // Giriş yapmamışsa anasayfaya yönlendir
        return
      }
      if (user.email !== ADMIN_EMAIL) {
        setError('Access Denied. You are not authorized to view this page.')
        setLoading(false)
        return
      }
      
      setUser(user)
      await fetchUsers()
      setLoading(false)
    }
    
    checkUserAndFetchData()
  }, [supabase, router])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchUsers()
    setRefreshing(false)
  }

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    
    try {
      const response = await fetch('/api/send-bulk-mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: mailContent.subject,
          body: mailContent.body
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert(`✅ ${result.message}`)
        setMailContent({ subject: '', body: '' })
        setMailModalOpen(false)
      } else {
        throw new Error(result.error || 'Failed to send email')
      }
    } catch (error) {
      console.error('Error sending bulk email:', error)
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to send email'}`)
    } finally {
      setIsSending(false)
    }
  }

  // İsim formatlaması - display_name'i öncelik ver, sonra first/last name
  const formatUserName = (user: AuthUserFromAdmin) => {
    // Önce display_name kontrol et
    if (user.display_name && user.display_name.trim()) {
      return user.display_name.trim()
    }
    
    // Sonra first_name ve last_name'i birleştir
    const firstName = user.first_name
    const lastName = user.last_name
    
    if (firstName || lastName) {
      return `${firstName || ''} ${lastName || ''}`.trim()
    }
    
    return null
  }

  // Provider formatlaması
  const formatProvider = (provider: string | null) => {
    if (!provider || provider === 'email') return 'Email'
    if (provider === 'google') return 'Google'
    if (provider === 'facebook') return 'Facebook'
    return provider.charAt(0).toUpperCase() + provider.slice(1)
  }

  // Provider renk sınıfı
  const getProviderColorClass = (provider: string | null) => {
    switch (provider) {
      case 'google':
        return 'bg-red-100 text-red-800'
      case 'facebook':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Birden fazla provider'ı render et
  const renderProviders = (user: AuthUserFromAdmin) => {
    const providers = user.providers || []
    const primaryProvider = user.primary_provider
    
    if (providers.length === 0) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          Email
        </span>
      )
    }
    
    if (providers.length === 1) {
      const provider = providers[0]
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProviderColorClass(provider)}`}>
          {formatProvider(provider)}
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
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => setMailModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              <Mail size={18} />
              Send Mail to All Users
            </button>
          </div>
        </div>

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
    </div>
  )
}
