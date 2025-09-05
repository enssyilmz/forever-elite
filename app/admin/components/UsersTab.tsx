'use client'

import React from 'react'
import { User as UserIcon } from 'lucide-react'

export default function UsersTab({ users, renderProviders, formatUserName }: {
  users: any[]
  renderProviders: (u: any) => React.ReactNode
  formatUserName: (u: any) => string | null
}) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50">
        <p className="text-responsive-sm text-gray-600">Total Users: <span className="font-semibold">{users.length}</span></p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-responsive-sm text-left text-gray-600">
          <thead className="text-responsive-sm text-gray-700 uppercase bg-gray-100">
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
                <td colSpan={5} className="px-6 py-8 text-center text-responsive-sm text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const displayName = formatUserName(u)
                return (
                  <tr key={u.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-responsive-sm text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserIcon size={20} />
                        </div>
                        <div>
                          <div>
                            {displayName ? (
                              <span className="text-responsive-sm text-gray-900">{displayName}</span>
                            ) : (
                              <span className="text-responsive-sm text-gray-500 italic">Name not set</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-responsive-sm">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 text-responsive-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {u.last_sign_in_at ? <span className="text-responsive-sm">{new Date(u.last_sign_in_at).toLocaleString()}</span> : 
                        <span className="text-responsive-sm text-gray-500 italic">Never</span>
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
  )
}


