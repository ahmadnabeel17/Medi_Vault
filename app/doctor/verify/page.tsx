'use client'

import { useState } from 'react'
import { submitDoctorVerification } from '@/app/actions/verify'
import { useRouter } from 'next/navigation'

export default function DoctorVerifyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    
    // Submit the form data to our server action
    const result = await submitDoctorVerification(formData)
    
    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    // Now trigger the AI verification API route in the background
    try {
      // We don't await this because we want to show the pending screen immediately
      // The API route will process and update the database row.
      fetch('/api/verify-doctor', {
        method: 'POST'
      }).catch(console.error)
      
      router.push('/doctor/pending')
    } catch (err) {
      console.error(err)
      router.push('/doctor/pending')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Doctor Verification</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Please provide your medical credentials to verify your account and gain access to the dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Medical Degree
            </label>
            <select
              name="degree"
              required
              className="w-full rounded-lg border border-slate-300 bg-transparent px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:text-white dark:bg-slate-900"
            >
              <option value="">Select a degree</option>
              <option value="MBBS">MBBS</option>
              <option value="BAMS">BAMS</option>
              <option value="BUMS">BUMS</option>
              <option value="BHMS">BHMS</option>
              <option value="BDS">BDS</option>
              <option value="MD">MD</option>
              <option value="MS">MS</option>
              <option value="DO">DO</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Registration Number
            </label>
            <input
              name="registration_number"
              type="text"
              required
              className="w-full rounded-lg border border-slate-300 bg-transparent px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:text-white"
              placeholder="e.g. 123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Registration Council / Authority
            </label>
            <input
              name="registration_council"
              type="text"
              required
              className="w-full rounded-lg border border-slate-300 bg-transparent px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:text-white"
              placeholder="e.g. State Medical Council"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Certificate Upload (PDF or Image)
            </label>
            <input
              name="certificate"
              type="file"
              accept=".pdf,image/*"
              required
              className="w-full text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting & Verifying...' : 'Submit Verification'}
          </button>
        </form>
      </div>
    </div>
  )
}
