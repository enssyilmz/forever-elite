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
  autoCloseTime = 10000
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
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-4 md:p-8 max-w-sm md:max-w-md w-full mx-4 shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          {/* Title */}
          <h3 className="text-responsive-base md:text-responsive-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
            
          {/* Message */}
          <p className="text-gray-600 mb-4 md:mb-6 text-responsive-sm">
            {message}
          </p>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="btn-primary-sm px-4 md:px-6 py-2"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
} 