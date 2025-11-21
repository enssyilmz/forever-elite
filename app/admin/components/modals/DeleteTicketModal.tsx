'use client'

import { X, AlertTriangle } from 'lucide-react'

interface DeleteTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  ticketSubject?: string
}

export default function DeleteTicketModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  ticketSubject 
}: DeleteTicketModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm sm:max-w-md w-full p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <h2 className="text-responsive-base font-semibold text-gray-900">Delete Ticket</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="mb-4 sm:mb-6">
          <p className="text-responsive-sm text-gray-600 mb-2">
            Are you sure you want to delete this support ticket?
          </p>
          {ticketSubject && (
            <div className="bg-gray-50 p-2 sm:p-3 rounded-md">
              <p className="text-responsive-sm font-medium text-gray-900">{ticketSubject}</p>
            </div>
          )}
          <p className="text-xs sm:text-sm text-red-600 mt-2">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="btn-secondary-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn-danger-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
