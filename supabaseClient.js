import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Surfaces a clear error in the browser console instead of a cryptic one,
  // if someone forgot to set up .env.local.
  console.error(
    'Missing Supabase env vars. Copy .env.local.example to .env.local and fill in your project URL and anon key.'
  );
}

export const supabase = createClient(url, anonKey);
