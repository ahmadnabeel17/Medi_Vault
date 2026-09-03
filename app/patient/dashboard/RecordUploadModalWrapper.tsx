'use client'

import { useState } from 'react'
import RecordUploadModal from '@/components/RecordUploadModal'

export default function RecordUploadModalWrapper() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Upload Record
      </button>

      <RecordUploadModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
