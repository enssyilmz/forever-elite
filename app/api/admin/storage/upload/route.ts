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

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucket = (formData.get('bucket') as string) || 'package-image'
    let path = (formData.get('path') as string) || undefined

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    if (!path) {
      const fileExt = (file.name.split('.').pop() || 'bin')
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      path = `packages/${fileName}`
    }

    const { error } = await adminSupabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: urlData } = adminSupabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error: any) {
    console.error('Error in upload route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


