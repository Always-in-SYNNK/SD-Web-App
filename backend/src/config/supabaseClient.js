//DON'T CHANGE THIS FOR FILE DEPLOYMENT TO WORK

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ENV DEBUG:", {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: supabaseKey ? "exists" : "missing"
  });

  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);

export const supabase = createClient(supabaseUrl, supabaseKey);
