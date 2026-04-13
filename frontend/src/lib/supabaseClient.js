// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

 const SUPABASE_URL="https://jwnrraxihfnzctktxwne.supabase.co"
 const SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3bnJyYXhpaGZuemN0a3R4d25lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzc4NDYsImV4cCI6MjA5MDYxMzg0Nn0.C48DtJWcCdYAT-tY8btxJsdGGZBRbHQCKNw8hu2JfnQ"

 export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);