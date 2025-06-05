'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
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

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="btn-secondary px-4 py-2"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">User Information</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.user_metadata?.full_name || 'Not provided'}</p>
            <p><strong>Provider:</strong> {user.app_metadata?.provider || 'Unknown'}</p>
            <p><strong>Last Sign In:</strong> {new Date(user.last_sign_in_at || '').toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Programs</h3>
            <p className="text-blue-600 text-sm">Access your training programs</p>
            <a href="/programs" className="text-blue-500 hover:underline text-sm">View Programs →</a>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Body Fat Calculator</h3>
            <p className="text-green-600 text-sm">Calculate your body fat percentage</p>
            <a href="/bodyfc" className="text-green-500 hover:underline text-sm">Calculate →</a>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Profile Settings</h3>
            <p className="text-purple-600 text-sm">Manage your account settings</p>
            <span className="text-purple-500 text-sm">Coming soon...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
