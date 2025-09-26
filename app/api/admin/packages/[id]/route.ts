import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkAdminAuth } from '@/lib/adminAuth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params

    const { data, error } = await adminSupabase
      .from('packages')
      .update({
        title: body.title,
        body_fat_range: body.body_fat_range,
        description: body.description,
        long_description: body.long_description,
        features: body.features,
        image_url: body.image_url,
        image_url_1: body.image_url_1,
        image_url_2: body.image_url_2,
        price_usd: body.price_usd,
        price_gbp: body.price_gbp,
        discounted_price_gbp: body.discounted_price_gbp,
        discount_percentage: body.discount_percentage,
        emoji: body.emoji,
        duration_weeks: body.duration_weeks,
        is_active: body.is_active,
        sort_order: body.sort_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating package:', error)
      return NextResponse.json({ error: 'Failed to update package' }, { status: 500 })
    }

    return NextResponse.json({ package: data[0] })
  } catch (error: any) {
    console.error('Error in PUT /api/admin/packages/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const { error } = await adminSupabase
      .from('packages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting package:', error)
      return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/packages/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
