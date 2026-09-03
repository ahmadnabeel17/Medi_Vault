'use client'

import { useState } from 'react'
import { uploadRecord } from '@/app/actions/records'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function RecordUploadModal({ isOpen, onClose }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await uploadRecord(formData)
    
    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      setIsSubmitting(false)
      onClose() // close modal on success
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Upload New Record</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Record Type
            </label>
            <select
              name="type"
              required
              className="w-full rounded-lg border border-slate-300 bg-transparent px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:text-white dark:bg-slate-900"
            >
              <option value="">Select type...</option>
              <option value="Lab Report">Lab Report</option>
              <option value="Prescription">Prescription</option>
              <option value="Scan/Imaging">Scan/Imaging</option>
              <option value="Vaccination">Vaccination</option>
              <option value="Visit Note">Visit Note</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Record Date (Optional)
            </label>
            <input
              name="upload_date"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full rounded-lg border border-slate-300 bg-transparent px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Upload File (PDF, JPG, PNG)
            </label>
            <input
              name="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              required
              className="w-full text-sm text-slate-700 dark:text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-blue-600 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Uploading...' : 'Upload Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
