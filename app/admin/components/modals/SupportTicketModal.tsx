'use client'

import { useState } from 'react'
import { X, MessageSquare, User, Calendar, AlertCircle } from 'lucide-react'

interface SupportTicket {
  id: number
  user_id: string
  subject: string
  content: string
  status: string
  priority: string
  created_at: string
  admin_response?: string
  admin_response_at?: string
}

interface SupportTicketModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: SupportTicket | null
  onRespond: (ticketId: number, response: string, status: string) => Promise<void>
  isResponding: boolean
}

export default function SupportTicketModal({ 
  isOpen, 
  onClose, 
  ticket, 
  onRespond, 
  isResponding 
}: SupportTicketModalProps) {
  const [adminResponse, setAdminResponse] = useState('')
  const [status, setStatus] = useState('in_progress')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticket || !adminResponse.trim()) return
    
    await onRespond(ticket.id, adminResponse, status)
    setAdminResponse('')
    setStatus('in_progress')
  }

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isOpen || !ticket) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Support Ticket #{ticket.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Ticket Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">User ID:</span>
              <span className="text-sm font-medium">{ticket.user_id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Created:</span>
              <span className="text-sm font-medium">{new Date(ticket.created_at).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Priority:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityClass(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
          </div>

          {/* Current Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(ticket.status)}`}>
              {ticket.status}
            </span>
          </div>

          {/* Subject */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.subject}</h3>
          </div>

          {/* Content */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Message:</h4>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-800 whitespace-pre-wrap">{ticket.content}</p>
            </div>
          </div>

          {/* Admin Response */}
          {ticket.admin_response && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Admin Response:</h4>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-gray-800 whitespace-pre-wrap">{ticket.admin_response}</p>
                {ticket.admin_response_at && (
                  <p className="text-xs text-gray-500 mt-2">
                    Responded: {new Date(ticket.admin_response_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Response Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Response
              </label>
              <textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Type your response here..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="open">Reopen</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isResponding || !adminResponse.trim()}
                className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isResponding ? 'Responding...' : 'Send Response'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
