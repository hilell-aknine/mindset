import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vrjrnnmbaankcococoeu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyanJubm1iYWFua2NvY29jb2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MDU0MTgsImV4cCI6MjA4NjE4MTQxOH0.MtBgdNjF7EyCdK0IHA9aBWZpSTk1q3IajJMuerO7vno'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
