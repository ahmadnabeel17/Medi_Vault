import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DoctorDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: verification } = await supabase
    .from('doctor_verifications')
    .select('degree, verification_status')
    .eq('doctor_id', user.id)
    .single()

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              Dr. {profile?.full_name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Doctor Dashboard</p>
          </div>
          
          {verification && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800/30">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-sm">Verified — {verification.degree}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Appointments</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">0</p>
            <p className="text-sm text-slate-500 mt-1">Upcoming today</p>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Total Patients</h3>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">0</p>
            <p className="text-sm text-slate-500 mt-1">Registered in vault</p>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Pending Reports</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">0</p>
            <p className="text-sm text-slate-500 mt-1">Require review</p>
          </div>
        </div>

      </div>
    </main>
  )
}
