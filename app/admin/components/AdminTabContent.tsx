'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import UsersTab from './UsersTab'
import MailTab from './MailTab'
import ProgramsTab from './ProgramsTab'
import PurchasesTab from './PurchasesTab'
import TicketsTab from './TicketsTab'
import PackagesTab from './PackagesTab'
import { CustomProgram } from '@/lib/database.types'

interface AdminTabContentProps {
  activeTab: string
  loadingStates: {
    users: boolean
    mail: boolean
    programs: boolean
    purchases: boolean
    tickets: boolean
    packages: boolean
  }
  data: {
    users: any[]
    mailLogs: any[]
    programs: CustomProgram[]
    purchases: any[]
    supportTickets: any[]
    packages: any[]
  }
  handlers: {
    formatUserName: (user: any) => string | null
    renderProviders: (user: any) => any
    openProgramModal: (program?: CustomProgram) => void
    openProgramDeleteModal: (program: CustomProgram) => void
    openTicketModal: (ticket: any) => void
    openDeleteModal: (pkg: any) => void
    openPackageModal: (pkg?: any) => void
    openTicketDeleteModal: (ticket: any) => void
  }
}

const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center py-12">
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-gray-600">{message}</span>
    </div>
  </div>
)

export default function AdminTabContent({ 
  activeTab, 
  loadingStates, 
  data, 
  handlers 
}: AdminTabContentProps) {
  switch (activeTab) {
    case 'users':
      return loadingStates.users ? (
        <LoadingSpinner message="Loading users..." />
      ) : (
        <UsersTab 
          users={data.users} 
          renderProviders={handlers.renderProviders} 
          formatUserName={handlers.formatUserName} 
        />
      )

    case 'mail':
      return loadingStates.mail ? (
        <LoadingSpinner message="Loading mail logs..." />
      ) : (
        <MailTab logs={data.mailLogs} />
      )

    case 'programs':
      return loadingStates.programs ? (
        <LoadingSpinner message="Loading programs..." />
      ) : (
        <ProgramsTab 
          programs={data.programs} 
          users={data.users} 
          formatUserName={handlers.formatUserName} 
          onEdit={handlers.openProgramModal} 
          onDelete={handlers.openProgramDeleteModal} 
        />
      )

    case 'purchases':
      return loadingStates.purchases ? (
        <LoadingSpinner message="Loading purchases..." />
      ) : (
        <PurchasesTab purchases={data.purchases} />
      )

    case 'tickets':
      return loadingStates.tickets ? (
        <LoadingSpinner message="Loading support tickets..." />
      ) : (
        <TicketsTab
          tickets={data.supportTickets}
          users={data.users}
          getPriorityClass={(p) => p === 'urgent' ? 'bg-red-100 text-red-800' : p === 'high' ? 'bg-orange-100 text-orange-800' : p === 'normal' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
          getStatusClass={(s) => s === 'open' ? 'bg-red-100 text-red-800' : s === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : s === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
          onOpen={handlers.openTicketModal}
          onDelete={handlers.openTicketDeleteModal}
        />
      )

    case 'packages':
      return loadingStates.packages ? (
        <LoadingSpinner message="Loading packages..." />
      ) : (
        <PackagesTab 
          packages={data.packages} 
          onEdit={handlers.openPackageModal}
          onDelete={handlers.openDeleteModal}
        />
      )

    default:
      return <div>Tab not found</div>
  }
}
