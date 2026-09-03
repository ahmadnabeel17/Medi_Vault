'use client'

import { signup } from '@/app/actions/auth'

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create an account</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Join MediVault today</p>
        </div>

        <form action={signup} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Full Name
            </label>
            <input
              name="fullName"
              type="text"
              required
              className="w-full rounded-lg border border-slate-300 bg-transparent px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:text-white dark:focus:border-blue-400"
              placeholder="Dr. John Doe / John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-slate-300 bg-transparent px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:text-white dark:focus:border-blue-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-slate-300 bg-transparent px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:text-white dark:focus:border-blue-400"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              I am a...
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <input type="radio" name="role" value="patient" required className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                <span className="text-slate-900 dark:text-white font-medium">Patient</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <input type="radio" name="role" value="doctor" required className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                <span className="text-slate-900 dark:text-white font-medium">Doctor</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
