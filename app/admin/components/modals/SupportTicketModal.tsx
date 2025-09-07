'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

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
  user?: {
    id: string
    email: string
  }
}

interface User {
  id: string
  email: string
}

interface SupportTicketModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: SupportTicket | null
  users: User[]
  onRespond: (ticketId: number, response: string, status: string) => Promise<void>
  isResponding: boolean
}

export default function SupportTicketModal({ 
  isOpen, 
  onClose, 
  ticket, 
  users,
  onRespond, 
  isResponding 
}: SupportTicketModalProps) {
  const [adminResponse, setAdminResponse] = useState('')

  // Initialize textarea with existing admin response when modal opens
  useEffect(() => {
    if (ticket?.admin_response) {
      setAdminResponse(ticket.admin_response)
    } else {
      setAdminResponse('')
    }
  }, [ticket])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticket || !adminResponse.trim()) return
    
    // Automatically set status to resolved when admin responds
    await onRespond(ticket.id, adminResponse, 'resolved')
    // Don't clear the response - keep it for editing
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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen || !ticket) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-3 md:p-6 border-b flex-shrink-0">
          <h2 className="text-responsive-lg font-semibold text-gray-900">
            Support Ticket #{ticket.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Ticket Details and User Message - Two Column Layout */}
          <div className="p-3 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-shrink-0">
            {/* Left Column - Ticket Details */}
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-responsive-base font-medium text-gray-900">Ticket Details</h3>
              
              <div className="space-y-2">
                <div>
                  <span className="text-responsive-sm text-gray-600">Subject:</span>
                  <p className="text-responsive-sm font-medium text-gray-900 mt-1">{ticket.subject}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-responsive-sm text-gray-600">Priority:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityClass(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-responsive-sm text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                
                <div>
                  <span className="text-responsive-sm text-gray-600">Created:</span>
                  <p className="text-responsive-sm text-gray-900 mt-1">
                    {new Date(ticket.created_at).toLocaleString('tr-TR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
                
                <div>
                  <span className="text-responsive-sm text-gray-600">User:</span>
                  <p className="text-responsive-sm text-gray-900 mt-1">
                    {(() => {
                      const user = users.find(u => u.id === ticket.user_id)
                      return user ? user.email : 'No email available'
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - User Message */}
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-responsive-base font-medium text-gray-900">User Message</h3>
              <div className="bg-gray-50 p-3 md:p-4 rounded-md min-h-[120px]">
                <p className="text-responsive-sm text-gray-800 whitespace-pre-wrap">{ticket.content}</p>
              </div>
            </div>
          </div>

          {/* Admin Response Section */}
          <div className="flex-1 flex flex-col p-3 md:p-6 border-t">
            <h3 className="text-responsive-base font-medium text-gray-900 mb-3 md:mb-4">Admin Response</h3>
            
            {/* Response Form */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col">
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="flex-1 w-full input-responsive text-black resize-none"
                  placeholder="Type your response here..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 md:gap-3 pt-3 md:pt-4 border-t mt-3 md:mt-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary-sm px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResponding || !adminResponse.trim()}
                  className="btn-primary-sm px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResponding ? 'Responding...' : 'Send Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
