// app/layout.tsx

import './globals.css'
import { ReactNode } from 'react'
import Navbar from '@/components/Navbar'

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''

  const showNavbar = pathname !== '/'
  return (
    <html lang="tr">
      <body>
        {showNavbar && <Navbar />}
        {children}
      </body>
    </html>
  )
}

