import { createClient } from '@supabase/supabase-js'

// Admin (service role) Supabase client - ONLY use on server (API routes)
// Bypasses RLS, so must be protected by your own auth checks before querying.
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE URL or SERVICE ROLE KEY in environment variables')
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
