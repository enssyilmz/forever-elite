import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function checkAdminAuth() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { error: NextResponse.json({ error: 'Service role key not configured' }, { status: 500 }) }
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Get admin UID from environment or database
    const adminUid = process.env.ADMIN_UID
    
    if (!adminUid) {
      return { error: NextResponse.json({ error: 'Admin UID not configured' }, { status: 500 }) }
    }

    return { success: true, adminUid }
  } catch (error) {
    console.error('Admin auth error:', error)
    return { error: NextResponse.json({ error: 'Authentication failed' }, { status: 401 }) }
  }
}
