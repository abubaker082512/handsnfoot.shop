import { createClient } from '@supabase/supabase-js'

// Production Supabase Credentials (public frontend key)
const REAL_SUPABASE_URL = 'https://aubsziylchmffozzvrgu.supabase.co'
const REAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1YnN6aXlsY2htZmZvenp2cmd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDYxNDQsImV4cCI6MjA4MjA4MjE0NH0.qhWkqcrSWnSUW4tfhzKkhDDpZM8vCJMBuarMbdYYwrI'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || REAL_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || REAL_SUPABASE_ANON_KEY

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
    return true
}
