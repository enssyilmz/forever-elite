import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    
    // Support both camelCase (old) and snake_case (new) payloads
    const {
      packageId,
      packageTitle,
      package_id,
      package_title,
      suggestions,
      user_id: providedUserId,
      user_email: providedUserEmail,
    } = body

    const pkgId = packageId ?? package_id
    const pkgTitle = packageTitle ?? package_title

    if (!pkgId || !pkgTitle || !suggestions || !Array.isArray(suggestions)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user info if authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    // Insert suggestion into database
    const { error } = await supabase
      .from('suggestions')
      .insert({
        package_id: pkgId,
        package_title: pkgTitle,
        suggestions: suggestions,
        user_id: user?.id ?? providedUserId ?? null,
        user_email: user?.email ?? providedUserEmail ?? null,
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
