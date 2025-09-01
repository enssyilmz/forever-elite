import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    // Auth callback route'unda session'ı yenile
    if (req.nextUrl.pathname === '/api/auth/callback') {
      const { searchParams } = req.nextUrl
      const code = searchParams.get('code')
      
      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Middleware auth error:', error)
            // Hata olsa bile devam et
          }
        } catch (error) {
          console.error('Middleware auth exception:', error)
          // Hata olsa bile devam et
        }
      }
    }

    return res
  } catch (error) {
    console.error('Middleware general error:', error)
    // Genel hata durumunda da devam et
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/api/auth/callback',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
