// app/layout.tsx

import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AppProvider } from '@/contexts/AppContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Ozcan Fit',
  description: 'Transform your body with personalized fitness programs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <Navbar />
          {children}
          <Footer />
        </AppProvider>
      </body>
    </html>
  )
}

