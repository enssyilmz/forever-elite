import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'yozdzhansyonmez@gmail.com'

export async function checkAdminAuth() {
  try {
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })
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
