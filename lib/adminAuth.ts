import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

const ADMIN_EMAIL = 'yozdzhansyonmez@gmail.com'

export async function checkAdminAuth() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }
    
    if ((user.email || '').toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
    }
    
    return { user, supabase }
  } catch (error: any) {
    return { error: NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
  }
}
