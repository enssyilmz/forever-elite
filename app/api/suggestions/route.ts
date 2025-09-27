import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { createSupabaseAdminClient } from '@/lib/supabaseAdminServer'

export async function POST(request: NextRequest) {
  try {
    // Auth-aware client (reads cookies) to optionally capture user metadata
    const supabase = await createSupabaseServerClient()
    // Admin client for writes to avoid any RLS/session friction on public endpoints
    let admin: ReturnType<typeof createSupabaseAdminClient> | null = null
    try {
      admin = createSupabaseAdminClient()
    } catch (e) {
      // Missing service role in local/dev – we'll fall back to RLS insert
      console.warn('suggestions: admin client unavailable, falling back to regular client')
    }
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
    
    // Insert suggestion into database (admin client bypasses RLS)
    let insertError: any = null
    if (admin) {
      const { error } = await admin
        .from('suggestions')
        .insert({
          package_id: pkgId,
          package_title: pkgTitle,
          suggestions: suggestions as string[],
          user_id: user?.id ?? providedUserId ?? null,
          user_email: user?.email ?? providedUserEmail ?? null,
          created_at: new Date().toISOString()
        })
      insertError = error
    } else {
      // Fallback path – relies on RLS policy "Anyone can submit suggestions"
      const { error } = await supabase
        .from('suggestions')
        .insert({
          package_id: pkgId,
          package_title: pkgTitle,
          suggestions: suggestions as string[],
          user_id: user?.id ?? providedUserId ?? null,
          user_email: user?.email ?? providedUserEmail ?? null,
          created_at: new Date().toISOString()
        })
      insertError = error
    }

    if (insertError) {
      console.error('Error saving suggestion:', insertError)
      return NextResponse.json({ error: 'Failed to save suggestion', details: insertError?.message || insertError?.hint || null }, { status: 500 })
    }

    return NextResponse.json({ message: 'Suggestions submitted successfully' })
  } catch (error) {
    console.error('Error in POST /api/suggestions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
