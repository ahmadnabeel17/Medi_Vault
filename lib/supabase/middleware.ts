import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/patient') || request.nextUrl.pathname.startsWith('/doctor')

  if (!user && isProtectedRoute) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If there's a user, check role for protected routes
  if (user && isProtectedRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    if (request.nextUrl.pathname.startsWith('/patient') && role !== 'patient') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'doctor' ? '/doctor/dashboard' : '/login'
      return NextResponse.redirect(url)
    }

    if (request.nextUrl.pathname.startsWith('/doctor')) {
      if (role !== 'doctor') {
        const url = request.nextUrl.clone()
        url.pathname = role === 'patient' ? '/patient/dashboard' : '/login'
        return NextResponse.redirect(url)
      }

      // Enforce doctor verification gate
      const { data: verification } = await supabase
        .from('doctor_verifications')
        .select('verification_status')
        .eq('doctor_id', user.id)
        .single()
      
      const status = verification?.verification_status
      const isVerified = status === 'ai_verified' || status === 'manually_verified'
      const pathname = request.nextUrl.pathname

      if (!isVerified) {
        // If not verified, they can only access /doctor/verify or /doctor/pending
        if (pathname !== '/doctor/verify' && pathname !== '/doctor/pending') {
          const url = request.nextUrl.clone()
          url.pathname = status ? '/doctor/pending' : '/doctor/verify'
          return NextResponse.redirect(url)
        }
      } else {
        // If verified, they shouldn't access verify or pending pages
        if (pathname === '/doctor/verify' || pathname === '/doctor/pending') {
          const url = request.nextUrl.clone()
          url.pathname = '/doctor/dashboard'
          return NextResponse.redirect(url)
        }
      }
    }
  }

  // Prevent logged-in users from visiting login/signup
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role
    const url = request.nextUrl.clone()
    url.pathname = role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
