import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkAdminAuth } from '@/lib/adminAuth'

export async function GET() {
  try {
    const authResult = await checkAdminAuth()
    if (authResult.error) return authResult.error

    // Service role key ile admin client oluştur
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Doğrudan auth.users tablosundan veri çek
    const { data, error } = await adminSupabase.auth.admin.listUsers()
    
    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Veriyi frontend formatına çevir
    const formattedUsers = data.users.map(user => {
      // İsim bilgilerini user_metadata'dan al
      const firstName = user.user_metadata?.first_name || null
      const lastName = user.user_metadata?.last_name || null
      const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name || null
      
      // Provider bilgilerini topla (duplicate'ları önle)
      const providers = new Set()
      
      if (user.app_metadata?.provider) {
        providers.add(user.app_metadata.provider)
      }
      if (user.app_metadata?.providers && Array.isArray(user.app_metadata.providers)) {
        user.app_metadata.providers.forEach(provider => providers.add(provider))
      }
      // Email provider'ı her zaman ekle (eğer yoksa)
      if (user.email) {
        providers.add('email')
      }
      
      // Set'i array'e çevir
      const uniqueProviders = Array.from(providers)
      
      return {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        display_name: displayName || 
                     (firstName && lastName ? `${firstName} ${lastName}` : null),
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        providers: uniqueProviders.length > 0 ? uniqueProviders : ['email'],
        primary_provider: user.app_metadata?.provider || 'email'
      }
    })

    return NextResponse.json({ users: formattedUsers })
  } catch (error: any) {
    console.error('Error in GET /api/admin/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
