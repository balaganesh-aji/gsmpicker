import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '⚠️  Supabase env vars missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local'
  )
}

const RESOLVED_URL = supabaseUrl || 'https://msntcyzcqrgcgajltlil.supabase.co'
const RESOLVED_KEY = supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zbnRjeXpjcXJnY2dhamx0bGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNDU0NjUsImV4cCI6MjA4OTkyMTQ2NX0.MHQg9eafPV44_99gMeilulAqVucbCZIOcQogowkOjMw'

// Exported so hooks can detect whether a real project is configured
export const SUPABASE_ACTIVE = !RESOLVED_URL.includes('placeholder')

export const supabase = createClient(
  RESOLVED_URL,
  RESOLVED_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  }
)

export default supabase
