'use client'

import { useState, useEffect } from 'react'
import { withTimeout } from '@/lib/asyncUtils'
import { Users, Mail, Dumbbell, CreditCard, Headset, Shield } from 'lucide-react'
import { CustomProgram } from '@/lib/database.types'

interface AdminTabsProps {
  activeTab: string
  onTabChange: (tab: 'users' | 'programs' | 'purchases' | 'tickets' | 'mail' | 'packages') => void
  loadingStates: {
    users: boolean
    mail: boolean
    programs: boolean
    purchases: boolean
    tickets: boolean
    packages: boolean
  }
}

export default function AdminTabs({ activeTab, onTabChange, loadingStates }: AdminTabsProps) {
  const tabs = [
    { id: 'users', label: 'Users', icon: Users, loading: loadingStates.users },
    { id: 'mail', label: 'Mail', icon: Mail, loading: loadingStates.mail },
    { id: 'programs', label: 'Custom Programs', icon: Dumbbell, loading: loadingStates.programs },
    { id: 'purchases', label: 'Purchases', icon: CreditCard, loading: loadingStates.purchases },
    { id: 'tickets', label: 'Support Tickets', icon: Headset, loading: loadingStates.tickets },
    { id: 'packages', label: 'Packages', icon: Shield, loading: loadingStates.packages }
  ]

  return (
    <div className="mb-6 border-b border-gray-200">
      {/* Desktop: Horizontal tabs */}
      <div className="hidden md:flex">
        {tabs.map(({ id, label, icon: Icon, loading }) => (
          <button
            key={id}
            onClick={() => onTabChange(id as 'users' | 'programs' | 'purchases' | 'tickets' | 'mail' | 'packages')}
            className={`flex items-center gap-2 px-6 py-3 font-medium ${
              activeTab === id 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={20} />
            {label}
            {loading && <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin ml-1"></div>}
          </button>
        ))}
      </div>

      {/* Mobile: Vertical tabs */}
      <div className="md:hidden space-y-1">
        {tabs.map(({ id, label, icon: Icon, loading }) => (
          <button
            key={id}
            onClick={() => onTabChange(id as 'users' | 'programs' | 'purchases' | 'tickets' | 'mail' | 'packages')}
            className={`w-full flex items-center gap-2 px-2 py-1.5 font-medium rounded text-xs ${
              activeTab === id 
                ? 'text-blue-600 bg-blue-50 border border-blue-200' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon size={14} />
            {label}
            {loading && <div className="w-2 h-2 border border-blue-500 border-t-transparent rounded-full animate-spin ml-1"></div>}
          </button>
        ))}
      </div>
    </div>
  )
}
