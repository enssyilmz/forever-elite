import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL'den 'next' parameter'ını kontrol et
  const next = requestUrl.searchParams.get('next')
  
  // Eğer next parameter varsa oraya yönlendir, yoksa ana sayfaya
  const redirectUrl = next ? `${requestUrl.origin}${next}` : `${requestUrl.origin}/`

  return NextResponse.redirect(redirectUrl)
}
