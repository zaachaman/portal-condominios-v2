import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nhnefioadroejbhwzsng.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obmVmaW9hZHJvZWpiaHd6c25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzODI3NTgsImV4cCI6MjA4Njk1ODc1OH0.0SXQfwxZ95zRWBiJ91F6PU0Bi2XBRzGFzoZ_6FAcknI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
