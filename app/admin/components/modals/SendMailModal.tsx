'use client'

import { useState } from 'react'
import { X, Mail, Users, Search } from 'lucide-react'

interface SendMailModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (subject: string, body: string, recipients: string[]) => Promise<void>
  allUserEmails: string[]
  isSending: boolean
}

export default function SendMailModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  allUserEmails, 
  isSending 
}: SendMailModalProps) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [showRecipientPicker, setShowRecipientPicker] = useState(false)
  const [recipientSearch, setRecipientSearch] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const recipients = selectedEmails.length > 0 ? selectedEmails : allUserEmails
    await onSubmit(subject, body, recipients)
    setSubject('')
    setBody('')
    setSelectedEmails([])
  }

  const filteredEmails = allUserEmails.filter(email =>
    email.toLowerCase().includes(recipientSearch.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Bulk Email
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Recipients
              </label>
              <button
                type="button"
                onClick={() => setShowRecipientPicker(!showRecipientPicker)}
                className="text-sm text-sky-600 hover:text-sky-800 flex items-center gap-1"
              >
                <Users className="w-4 h-4" />
                {selectedEmails.length > 0 ? `${selectedEmails.length} selected` : `All users (${allUserEmails.length})`}
              </button>
            </div>

            {showRecipientPicker && (
              <div className="border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search emails..."
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="space-y-2">
                  {filteredEmails.map((email) => (
                    <label key={email} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(email)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmails([...selectedEmails, email])
                          } else {
                            setSelectedEmails(selectedEmails.filter(e => e !== email))
                          }
                        }}
                        className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-sm text-gray-700">{email}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
