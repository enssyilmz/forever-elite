import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - List all active packages
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })
    
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
