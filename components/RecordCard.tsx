'use client'

import { useState } from 'react'
import { deleteRecord, getSignedUrl } from '@/app/actions/records'

interface Record {
  id: string
  type: string
  file_url: string
  upload_date: string
}

export default function RecordCard({ record }: { record: Record }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpening, setIsOpening] = useState(false)

  // Map record types to simple emoji or icons
  const typeIcons: Record<string, string> = {
    'Lab Report': '🧪',
    'Prescription': '💊',
    'Scan/Imaging': '🩻',
    'Vaccination': '💉',
    'Visit Note': '📝'
  }
  const icon = typeIcons[record.type] || '📄'

  // Format date nicely
  const dateStr = new Date(record.upload_date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  async function handleOpen() {
    setIsOpening(true)
    const result = await getSignedUrl(record.file_url)
    setIsOpening(false)
    
    if (result.signedUrl) {
      window.open(result.signedUrl, '_blank')
    } else {
      alert('Failed to open file. Please try again.')
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete this ${record.type}?`)) return
    
    setIsDeleting(true)
    const result = await deleteRecord(record.id, record.file_url)
    if (result.error) {
      alert(result.error)
      setIsDeleting(false)
    }
    // if successful, the server action revalidates the path, causing a refresh
  }

  return (
    <div className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-2xl flex items-center justify-center shadow-inner">
          {icon}
        </div>
        <button 
          onClick={handleDelete}
          className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg transition-colors"
          title="Delete Record"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1">
        <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">{record.type}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {dateStr}
        </p>
      </div>

      <button 
        onClick={handleOpen}
        disabled={isOpening}
        className="mt-6 w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
      >
        {isOpening ? 'Opening...' : (
          <>
            View Document
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </>
        )}
      </button>
    </div>
  )
}
