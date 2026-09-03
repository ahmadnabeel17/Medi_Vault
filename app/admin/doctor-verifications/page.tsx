import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export default async function AdminDoctorVerificationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Simple hardcoded admin email check for hackathon purposes
  if (!user || user.email !== 'admin@medivault.com') {
    redirect('/')
  }

  // Fetch pending or flagged verifications
  const { data: verifications, error } = await supabase
    .from('doctor_verifications')
    .select('*, profiles(full_name, email)')
    .in('verification_status', ['pending', 'ai_flagged'])
    .order('created_at', { ascending: false })

  // Admin Actions
  async function updateStatus(id: string, status: 'manually_verified' | 'rejected') {
    'use server'
    // We need to bypass RLS for this admin action. We'll use the service role key.
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    await adminSupabase
      .from('doctor_verifications')
      .update({ verification_status: status, updated_at: new Date().toISOString() })
      .eq('id', id)
      
    revalidatePath('/admin/doctor-verifications')
  }

  return (
    <main className="min-h-screen p-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Doctor Verifications</h1>
          <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium text-sm">Admin View</span>
        </div>

        {error && <div className="text-red-500">Error fetching verifications: {error.message}</div>}

        <div className="grid gap-6">
          {verifications?.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
              No pending verifications to review.
            </div>
          ) : (
            verifications?.map((v) => (
              <div key={v.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-8">
                
                {/* Details Section */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Dr. {v.profiles?.full_name}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${v.verification_status === 'ai_flagged' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                      {v.verification_status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Degree claimed</p>
                      <p className="text-slate-900 dark:text-white">{v.degree}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Registration No.</p>
                      <p className="text-slate-900 dark:text-white">{v.registration_number}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Council</p>
                      <p className="text-slate-900 dark:text-white">{v.registration_council}</p>
                    </div>
                  </div>

                  {v.ai_verification_notes && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        🤖 AI Analysis Notes
                      </h3>
                      <pre className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-mono">
                        {v.ai_verification_notes}
                      </pre>
                    </div>
                  )}

                  <div className="pt-4 flex gap-3">
                    <form action={updateStatus.bind(null, v.id, 'manually_verified')}>
                      <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                        Approve Doctor
                      </button>
                    </form>
                    <form action={updateStatus.bind(null, v.id, 'rejected')}>
                      <button className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg font-medium transition-colors">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>

                {/* Document View Section */}
                <div className="w-full md:w-1/3 flex flex-col gap-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Uploaded Document</p>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center p-4 overflow-hidden relative min-h-[200px]">
                    {/* Note: In a real app we'd fetch a signed URL or serve via an API since the bucket is private. 
                        For this simple admin view, we'll construct a route to fetch the file securely, 
                        or just rely on the fact that if we can't display it directly via public URL, we show a download link. */}
                    <a 
                      href={`/api/admin/download-certificate?path=${v.certificate_file_url}`}
                      target="_blank"
                      className="flex flex-col items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-medium text-sm">View Certificate</span>
                    </a>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
