// app/layout.tsx

import './globals.css'
import { ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import { AppProvider } from '@/contexts/AppContext'

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''

  const showNavbar = pathname !== '/'
  return (
    <html lang="tr">
      <body>
        <AppProvider>
          {showNavbar && <Navbar />}
          {children}
        </AppProvider>
      </body>
    </html>
  )
}

