import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize client only if variables are present to avoid fatal crash at startup
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Since @supabase/supabase-js v2.39+, the default flowType changed to 'pkce',
        // which only looks for ?code= in the URL query string. Our Google OAuth
        // redirect returns tokens as a hash fragment (#access_token=...), so we must
        // explicitly use 'implicit' flow to detect and process them.
        flowType: 'implicit',
        detectSessionInUrl: true,
      },
    })
  : null as any;

