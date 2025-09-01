import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    
    // Middleware zaten auth işlemini yapıyor, sadece yönlendirme yap
    console.log('Auth callback successful, redirecting to home')
    
    // Ana sayfaya yönlendir
    return NextResponse.redirect(`${requestUrl.origin}/`)
    
  } catch (error) {
    console.error('Auth callback exception:', error)
    // Hata durumunda da ana sayfaya yönlendir
    const requestUrl = new URL(request.url)
    return NextResponse.redirect(`${requestUrl.origin}/`)
  }
}
