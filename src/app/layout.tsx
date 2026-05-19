import type { Metadata } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'Recall',
  description: 'Personal knowledge tracker with spaced repetition',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Recall' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#0d0d0d" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-bg text-white">
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
