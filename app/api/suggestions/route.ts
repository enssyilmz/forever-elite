import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    
    const { packageId, packageTitle, suggestions } = body

    if (!packageId || !packageTitle || !suggestions || !Array.isArray(suggestions)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user info if authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    // Insert suggestion into database
    const { error } = await supabase
      .from('suggestions')
      .insert({
        package_id: packageId,
        package_title: packageTitle,
        suggestions: suggestions,
        user_id: user?.id || null,
        user_email: user?.email || null,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error saving suggestion:', error)
      return NextResponse.json({ error: 'Failed to save suggestion' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Suggestions submitted successfully' })
  } catch (error) {
    console.error('Error in POST /api/suggestions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
