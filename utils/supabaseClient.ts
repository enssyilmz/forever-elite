import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://blzvfjwymkobljnxudei.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsenZmand5bWtvYmxqbnh1ZGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzUwMTcsImV4cCI6MjA2NDcxMTAxN30.wwSj5Hq2udY_MK6NgCBS5uMJtTRI3XIX7ajPRTte33A'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase 