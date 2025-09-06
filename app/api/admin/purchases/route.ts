import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkAdminAuth } from '@/lib/adminAuth'

export async function GET() {
  try {
    const authResult = await checkAdminAuth()
    if (authResult.error) return authResult.error

    // Service role key ile admin client oluştur
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Purchases'ları çek
    const { data, error } = await adminSupabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching purchases:', error)
      return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 })
    }

    return NextResponse.json({ purchases: data || [] })
  } catch (error: any) {
    console.error('Error in GET /api/admin/purchases:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
