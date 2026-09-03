import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RecordUploadModalWrapper from './RecordUploadModalWrapper'
import RecordCard from '@/components/RecordCard'

export default async function PatientDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch patient records
  const { data: records, error } = await supabase
    .from('records')
    .select('*')
    .eq('patient_id', user.id)
    .order('upload_date', { ascending: false })

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Hello, {profile?.full_name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
              Welcome to your personal health vault.
            </p>
          </div>
          
          <RecordUploadModalWrapper />
        </div>

        {/* Records Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            My Medical Records
            <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm py-0.5 px-2.5 rounded-full font-bold">
              {records?.length || 0}
            </span>
          </h2>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
              Failed to load records.
            </div>
          )}

          {!records || records.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl mb-4">
                📂
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No records yet</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                Securely store your lab reports, prescriptions, and visit notes here. Click the upload button to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {records.map(record => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
