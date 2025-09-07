'use client'

import { useState } from 'react'
import { X, Search } from 'lucide-react'

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
  const [recipientSearch, setRecipientSearch] = useState('')
  const [showRecipientPicker, setShowRecipientPicker] = useState(true)

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

  const addEmail = (email: string) => {
    if (!selectedEmails.includes(email)) {
      setSelectedEmails([...selectedEmails, email])
    }
  }

  const removeEmail = (email: string) => {
    setSelectedEmails(selectedEmails.filter(e => e !== email))
  }

  const selectAll = () => {
    setSelectedEmails(filteredEmails)
  }

  const clearAll = () => {
    setSelectedEmails([])
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] md:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-6 border-b flex-shrink-0">
          <h2 className="text-responsive-lg font-semibold text-gray-900">
            Send Bulk Email
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row flex-1 min-h-0">
          {/* Left Column - Recipient Management */}
          <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200 p-3 md:p-6 flex flex-col">
            {/* Search Section */}
            <div className="mb-3 md:mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-responsive-sm font-medium text-gray-700">
                  Search emails
                </label>
                <button
                  type="button"
                  onClick={() => setShowRecipientPicker(!showRecipientPicker)}
                  className="btn-secondary-sm text-xs px-2 py-1"
                >
                  Close
                </button>
              </div>
              {showRecipientPicker && (
                <div className="relative">
                  <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4" />
                  <input
                    type="text"
                    placeholder="Search emails..."
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    className="input-responsive-sm w-full pl-8 md:pl-10 text-black"
                  />
                </div>
              )}
            </div>

            {/* Email List */}
            {showRecipientPicker && (
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md mb-3 md:mb-4">
                <div className="p-2 md:p-3">
                  {filteredEmails.map((email) => (
                    <div key={email} className="flex items-center justify-between py-1 md:py-2 px-2 md:px-3 hover:bg-gray-50 rounded">
                      <span className="text-responsive-sm text-gray-700 flex-1 truncate">{email}</span>
                      <button
                        type="button"
                        onClick={() => addEmail(email)}
                        disabled={selectedEmails.includes(email)}
                        className="btn-primary-sm text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {selectedEmails.includes(email) ? 'Added' : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recipients Section */}
            <div className="mb-3 md:mb-4">
              <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
                Recipients ({selectedEmails.length})
              </label>
              <div className="border border-gray-200 rounded-md p-2 md:p-3 min-h-[80px] md:min-h-[100px] max-h-[100px] md:max-h-[120px] overflow-y-auto">
                {selectedEmails.length === 0 ? (
                  <p className="text-gray-500 text-responsive-sm">No recipients selected</p>
                ) : (
                  <div className="space-y-1">
                    {selectedEmails.map((email) => (
                      <div key={email} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded">
                        <span className="text-responsive-sm text-gray-700 truncate">{email}</span>
                        <button
                          type="button"
                          onClick={() => removeEmail(email)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="btn-secondary-sm flex-1"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="btn-primary-sm flex-1"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Right Column - Email Composition */}
          <div className="w-full md:w-1/2 p-3 md:p-6 flex flex-col">
            {/* Subject Field */}
            <div className="mb-4 md:mb-6">
              <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-responsive w-full text-black"
                required
              />
            </div>

            {/* Body Field */}
            <div className="flex-1 flex flex-col">
              <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
                Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="flex-1 w-full input-responsive resize-none text-black"
                required
              />
            </div>
          </div>
        </form>

        {/* Footer with Send Button */}
        <div className="flex justify-end gap-2 md:gap-3 p-3 md:p-6 border-t flex-shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary-sm px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSending}
            className="btn-primary px-4 py-2 md:px-6 md:py-3 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  )
}
