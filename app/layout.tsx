import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MediVault',
  description: 'Secure, intelligent, and seamless health data management at your fingertips.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 dark:bg-slate-950`}>
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center px-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-emerald-500">
                MediVault
              </span>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
