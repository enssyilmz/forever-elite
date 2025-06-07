'use client'

import { useEffect } from 'react'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
  autoClose?: boolean
  autoCloseTime?: number
}

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  title = "Success!", 
  message = "Operation completed successfully!",
  autoClose = true,
  autoCloseTime = 2000
}: SuccessModalProps) {
  
  // Auto close functionality
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseTime)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, autoCloseTime, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          
          {/* Message */}
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="btn-primary px-6 py-2"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
} 