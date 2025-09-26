import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

// GET - Get single package by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { id } = await params
    
    const { data: package_data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching package:', error)
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    return NextResponse.json({ package: package_data })
  } catch (error) {
    console.error('Error in GET /api/packages/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
