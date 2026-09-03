import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DoctorPendingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: verification } = await supabase
    .from('doctor_verifications')
    .select('verification_status, ai_verification_notes')
    .eq('doctor_id', user.id)
    .single()

  if (!verification) {
    redirect('/doctor/verify')
  }

  if (verification.verification_status === 'ai_verified' || verification.verification_status === 'manually_verified') {
    redirect('/doctor/dashboard')
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-lg text-center space-y-6 bg-white dark:bg-slate-900 p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
        
        {verification.verification_status === 'pending' && (
          <>
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Verification in Progress</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Our AI is currently analyzing your medical credentials. This usually takes just a few moments. Please hold on...
            </p>
          </>
        )}

        {verification.verification_status === 'ai_flagged' && (
          <>
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⚠️</div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Verification Under Review</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Our automated system flagged your submission for manual review. An administrator will review your credentials shortly.
            </p>
          </>
        )}

        {verification.verification_status === 'rejected' && (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">❌</div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Verification Rejected</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Unfortunately, we could not verify your medical credentials. Please contact support if you believe this is a mistake.
            </p>
          </>
        )}

        <button 
          onClick={() => window.location.reload()} 
          className="mt-8 px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Refresh Status
        </button>
      </div>
    </main>
  )
}
