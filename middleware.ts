import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  if (request.nextUrl.pathname === '/api/auth/callback') {
    const code = request.nextUrl.searchParams.get('code')
    if (code) {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('Middleware auth error:', error)
        }
      } catch (err) {
        console.error('Middleware auth exception:', err)
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/api/auth/callback', '/((?!_next/static|_next/image|favicon.ico).*)'],
}
