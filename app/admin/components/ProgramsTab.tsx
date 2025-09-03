'use client'

import { Edit, Trash2 } from 'lucide-react'
import { CustomProgram } from '@/lib/database.types'

interface AuthUserFromAdmin {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
}

export default function ProgramsTab({ programs, users, formatUserName, onEdit, onDelete }: {
  programs: CustomProgram[]
  users: AuthUserFromAdmin[]
  formatUserName: (u: AuthUserFromAdmin) => string | null
  onEdit: (p: CustomProgram) => void
  onDelete: (id: number) => void
}) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50">
        <p className="text-sm text-gray-600">Total Programs: <span className="font-semibold">{programs.length}</span></p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">Program</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Difficulty</th>
              <th className="px-6 py-3">Duration</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No programs found</td>
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
                        <button onClick={() => onEdit(program)} className="text-blue-600 hover:text-blue-800">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => onDelete(program.id)} className="text-red-600 hover:text-red-800">
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
  )
}


