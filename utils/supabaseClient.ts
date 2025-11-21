import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      // Use localStorage for persistence across tabs
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'supabase.auth.token',
      // Enable automatic token refresh
      autoRefreshToken: true,
      // Persist session across tabs
      persistSession: true,
      // Detect session changes in other tabs
      detectSessionInUrl: true,
      // Flow type for better compatibility
      flowType: 'pkce'
    },
    // Enable realtime for cross-tab communication
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)

export default supabase
