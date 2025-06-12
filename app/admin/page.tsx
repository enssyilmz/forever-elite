'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { User as AuthUser } from '@supabase/supabase-js'
import { Mail, Shield, User, X } from 'lucide-react'

// auth.users tablosundan gelen veriyi temsil eden tip
interface AuthUserFromAdmin {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  created_at: string
  last_sign_in_at: string | null
  provider: string | null
}

const ADMIN_EMAIL = 'yozdzhansyonmez@gmail.com'

export default function AdminPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [users, setUsers] = useState<AuthUserFromAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMailModalOpen, setMailModalOpen] = useState(false)
  const [mailContent, setMailContent] = useState({ subject: '', body: '' })
  const [isSending, setIsSending] = useState(false)

  const supabase = createClientComponentClient()
  const router = useRouter()

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

      try {
        // Güvenli RPC fonksiyonunu çağırarak tüm kullanıcıları getir
        const { data, error: rpcError } = await supabase.rpc('get_all_users')
        if (rpcError) {
          throw rpcError
        }
        setUsers(data)
      } catch (e: any) {
        setError('Failed to fetch users: ' + e.message)
      } finally {
        setLoading(false)
      }
    }
    checkUserAndFetchData()
  }, [supabase, router])

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    // Bu kısım daha sonra bir Edge Function ile doldurulacak
    console.log('Sending mail:', mailContent)
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulating network delay
    setIsSending(false)
    setMailModalOpen(false)
    alert('Mail sending functionality is not yet implemented. Check console for data.')
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
        <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Go Home</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <button
            onClick={() => setMailModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            <Mail size={18} />
            Send Mail to All Users
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                {users.map((u) => (
                  <tr key={u.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User size={20} />
                        </div>
                        <div>
                          <div>
                            {(u.first_name || u.last_name) 
                              ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
                              : <span className="text-gray-500 italic">Name not set</span>
                            }
                          </div>
                          <div className="text-xs text-gray-500">{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{u.email}</div>
                    </td>
                    <td className="px-6 py-4">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'Never'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        u.provider === 'google' ? 'bg-red-100 text-red-800' : 
                        u.provider === 'facebook' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {u.provider || 'email'}
                      </span>
                    </td>
                  </tr>
                ))}
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
