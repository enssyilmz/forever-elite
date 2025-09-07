'use client'

import { Edit } from 'lucide-react'

interface SupportTicket {
  id: number
  user_id: string
  subject: string
  content: string
  status: string
  priority: string
  created_at: string
}

interface User {
  id: string
  email: string
}

export default function TicketsTab({ tickets, users, getPriorityClass, getStatusClass, onOpen }: {
  tickets: SupportTicket[]
  users: User[]
  getPriorityClass: (p: string) => string
  getStatusClass: (s: string) => string
  onOpen: (ticket: SupportTicket) => void
}) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50">
        <p className="text-responsive-sm text-gray-600">Total Support Tickets: <span className="font-semibold">{tickets.length}</span></p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-responsive-sm text-left text-gray-600">
          <thead className="text-responsive-sm text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Priority</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No support tickets found</td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">#{ticket.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {(() => {
                        const user = users.find(u => u.id === ticket.user_id)
                        return user ? user.email : ticket.user_id
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-4"><div className="max-w-xs truncate" title={ticket.subject}>{ticket.subject}</div></td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityClass(ticket.priority)}`}>{ticket.priority}</span></td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(ticket.status)}`}>{ticket.status}</span></td>
                  <td className="px-6 py-4">{new Date(ticket.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => onOpen(ticket)} className="text-blue-600 hover:text-blue-800" title="View and respond to ticket">
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


