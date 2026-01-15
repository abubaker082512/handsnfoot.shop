import { createClient } from '@supabase/supabase-js'

// Use environment variables or fallback to placeholder values
// This allows the app to run even without Supabase configured
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'

// Create Supabase client
// Note: This will use mock data if credentials are not properly configured
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
    return supabaseUrl !== 'https://placeholder.supabase.co' &&
        !supabaseUrl.includes('YOUR_SUPABASE') &&
        !supabaseAnonKey.includes('YOUR_SUPABASE') &&
        !supabaseAnonKey.includes('placeholder')
}
