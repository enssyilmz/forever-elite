import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

// GET - List all active packages
export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { data: packages, error } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching packages:', error)
      return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
    }

    return NextResponse.json({ packages })
  } catch (error) {
    console.error('Error in GET /api/packages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
