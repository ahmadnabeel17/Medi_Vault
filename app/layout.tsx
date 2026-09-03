import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MediVault',
  description: 'Secure, intelligent, and seamless health data management at your fingertips.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let dashboardUrl = '/login'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile) {
      dashboardUrl = profile.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'
    }
  }

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 dark:bg-slate-950`}>
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-emerald-500">
                MediVault
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-6">
                  <Link href={dashboardUrl} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <form action={logout}>
                    <button type="submit" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Logout
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    Login
                  </Link>
                  <Link href="/signup" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
