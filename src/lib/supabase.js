import { createClient } from '@supabase/supabase-js'

// Limpiar localStorage corrupto
try {
  Object.keys(localStorage)
    .filter(k => k.startsWith('sb-'))
    .forEach(k => {
      try { JSON.parse(localStorage.getItem(k)) }
      catch { localStorage.removeItem(k) }
    })
} catch {}

export const supabase = createClient(
  'https://nhnefioadroejbhwzsng.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obmVmaW9hZHJvZWpiaHd6c25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzODI3NTgsImV4cCI6MjA4Njk1ODc1OH0.0SXQfwxZ95zRWBiJ91F6PU0Bi2XBRzGFzoZ_6FAcknI',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'condominios-auth'
    }
  }
)
