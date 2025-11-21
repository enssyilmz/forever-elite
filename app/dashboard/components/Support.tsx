'use client'

import { useRef } from 'react'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import ReCAPTCHA from 'react-google-recaptcha'
import dayjs from 'dayjs'

interface SupportTicket {
  id: number
  subject: string
  content: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  admin_response?: string
  admin_response_at?: string
}

interface SupportProps {
  supportTickets: SupportTicket[]
  supportLoading: boolean
  supportSectionExpanded: {
    myTickets: boolean
    newTicket: boolean
  }
  newTicketForm: {
    subject: string
    content: string
  }
  isSubmittingTicket: boolean
  recaptchaVerified: boolean
  onSupportSectionToggle: (section: 'myTickets' | 'newTicket') => void
  onNewTicketFormChange: (field: string, value: string) => void
  onNewTicketSubmit: (e: React.FormEvent) => void
  onRecaptchaChange: (value: string | null) => void
  onRecaptchaExpired: () => void
  onRecaptchaSkip: () => void
  onDeleteTicket: (ticketId: number) => void
}

export default function Support({
  supportTickets,
  supportLoading,
  supportSectionExpanded,
  newTicketForm,
  isSubmittingTicket,
  recaptchaVerified,
  onSupportSectionToggle,
  onNewTicketFormChange,
  onNewTicketSubmit,
  onRecaptchaChange,
  onRecaptchaExpired,
  onRecaptchaSkip,
  onDeleteTicket
}: SupportProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-black">
      <h3 className="text-responsive-lg font-bold mb-4 md:mb-6 text-gray-900">Support</h3>
      
      <div className="space-y-3 md:space-y-4">
        {/* My Support Tickets Section */}
        <div className={`rounded-lg ${!supportSectionExpanded.myTickets ? 'border-b' : ''}`}>
          <button
            onClick={() => onSupportSectionToggle('myTickets')}
            className="w-full flex items-center justify-between p-3 md:p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-800 text-responsive-sm md:text-responsive-base">My Support Tickets</span>
            <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${supportSectionExpanded.myTickets ? 'rotate-180' : ''}`} />
          </button>
          
          {supportSectionExpanded.myTickets && (
            <div className="p-3 md:p-4">
              {supportLoading ? (
                <p className="text-responsive-sm text-gray-500">Loading tickets...</p>
              ) : supportTickets.length === 0 ? (
                <div className="text-center py-6 md:py-8">
                  <p className="text-responsive-sm text-gray-500 mb-4">No support tickets found.</p>
                  <button
                    onClick={() => onSupportSectionToggle('newTicket')}
                    className="btn-primary-sm inline-flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Support Ticket
                  </button>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <span className="text-responsive-sm text-gray-600">Total: {supportTickets.length} tickets</span>
                    <button
                       onClick={() => onSupportSectionToggle('newTicket')}
                       className="btn-primary-sm inline-flex items-center"
                     >
                       <Plus className="w-3 h-3 mr-1" />
                       New Ticket
                     </button>
                  </div>
                  
                  {supportTickets.map((ticket) => (
                    <div key={ticket.id} className="rounded-lg p-3 md:p-4 bg-gray-50 border border-gray-200">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2 gap-2">
                        <h4 className="font-semibold text-gray-800 text-responsive-sm md:text-responsive-base">{ticket.subject}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <button
                            onClick={() => onDeleteTicket(ticket.id)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete ticket"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-responsive-sm mb-2 line-clamp-2">{ticket.content}</p>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-0 text-xs text-gray-500">
                        <span>Created: {dayjs(ticket.created_at).format('DD/MM/YYYY HH:mm')}</span>
                        <span>Updated: {dayjs(ticket.updated_at).format('DD/MM/YYYY HH:mm')}</span>
                      </div>
                      {ticket.admin_response && (
                        <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                          <p className="text-responsive-sm text-blue-800 font-medium">Admin Response:</p>
                          <p className="text-responsive-sm text-blue-700 mt-1">{ticket.admin_response}</p>
                          <p className="text-xs text-blue-600 mt-2">
                            Responded: {dayjs(ticket.admin_response_at).format('DD/MM/YYYY HH:mm')}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* New Support Ticket Section */}
        <div className={`rounded-lg ${!supportSectionExpanded.newTicket ? 'border-b' : ''}`}>
          <button
            onClick={() => onSupportSectionToggle('newTicket')}
            className="w-full flex items-center justify-between p-3 md:p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-800 text-responsive-sm md:text-responsive-base">Create New Support Ticket</span>
            <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${supportSectionExpanded.newTicket ? 'rotate-180' : ''}`} />
          </button>
          
          {supportSectionExpanded.newTicket && (
            <div className="p-3 md:p-4">
              <form onSubmit={onNewTicketSubmit} className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-responsive-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={newTicketForm.subject}
                    onChange={(e) => onNewTicketFormChange('subject', e.target.value)}
                    className="input-responsive w-full"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-responsive-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    value={newTicketForm.content}
                    onChange={(e) => onNewTicketFormChange('content', e.target.value)}
                    rows={4}
                    className="input-responsive w-full"
                    placeholder="Please provide detailed information about your issue..."
                    required
                  />
                </div>
                
                {/* reCAPTCHA */}
                <div className="flex justify-center">
                  {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
                    <div className="transform scale-75 md:scale-100 origin-center">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                        hl="en"
                        onChange={onRecaptchaChange}
                        onExpired={onRecaptchaExpired}
                      />
                    </div>
                  ) : (
                    <div className="text-center p-3 md:p-4 bg-yellow-100 border border-yellow-400 rounded">
                      <p className="text-yellow-800 text-responsive-sm">
                        ⚠️ reCAPTCHA not configured. Please add NEXT_PUBLIC_RECAPTCHA_SITE_KEY to .env.local
                      </p>
                      <button 
                        type="button"
                        onClick={onRecaptchaSkip}
                        className="mt-2 px-3 md:px-4 py-2 bg-yellow-600 text-white rounded text-responsive-sm"
                      >
                        Skip for Development
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                   type="submit"
                   disabled={isSubmittingTicket || !recaptchaVerified}
                   className="btn-secondary-sm w-full disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isSubmittingTicket ? 'Submitting...' : 'Submit Support Ticket'}
                 </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
