import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkAdminAuth } from '@/lib/adminAuth'

export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (authResult.error) return authResult.error

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const body = await request.json()
    const { url, bucket = 'package-image' } = body
    if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 })

    const urlParts = String(url).split(`/${bucket}/`)
    if (urlParts.length < 2) return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    const path = urlParts[1]

    const { error } = await adminSupabase.storage.from(bucket).remove([path])
    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in delete route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


