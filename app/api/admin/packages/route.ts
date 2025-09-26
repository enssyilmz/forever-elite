import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkAdminAuth } from '@/lib/adminAuth'

export async function POST(request: Request) {
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

    const requiredStringFields = [
      'title',
      'body_fat_range',
      'description',
      'long_description',
      'emoji',
    ]
    for (const f of requiredStringFields) {
      if (!body[f] || String(body[f]).trim().length === 0) {
        return NextResponse.json({ error: `Missing field: ${f}` }, { status: 400 })
      }
    }

    const requiredNumberFields = [
      'price_usd',
      'price_gbp',
      'discounted_price_gbp',
      'discount_percentage',
      'duration_weeks',
      'sort_order',
    ]
    for (const f of requiredNumberFields) {
      if (body[f] === undefined || body[f] === null || Number.isNaN(Number(body[f]))) {
        return NextResponse.json({ error: `Missing/invalid field: ${f}` }, { status: 400 })
      }
    }

    const { data, error } = await adminSupabase
      .from('packages')
      .insert({
        title: body.title,
        body_fat_range: body.body_fat_range,
        description: body.description,
        long_description: body.long_description,
        features: body.features || [],
        image_url: body.image_url,
        image_url_1: body.image_url_1,
        image_url_2: body.image_url_2,
        price_usd: body.price_usd,
        price_gbp: body.price_gbp,
        discounted_price_gbp: body.discounted_price_gbp,
        discount_percentage: body.discount_percentage,
        emoji: body.emoji,
        specifications: body.specifications || [],
        recommendations: body.recommendations || [],
        duration_weeks: body.duration_weeks,
        is_active: body.is_active,
        sort_order: body.sort_order,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error('Error creating package:', error)
      return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
    }

    return NextResponse.json({ package: data?.[0] })
  } catch (error: any) {
    console.error('Error in POST /api/admin/packages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


