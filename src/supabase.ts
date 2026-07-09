import { createClient } from '@supabase/supabase-js';

// ============================================================================
// 🔧 SUPABASE CONFIGURATION
// ============================================================================
// To set up your own Supabase project:
//   1. Go to https://supabase.com/ and create a free account
//   2. Create a new project
//   3. Go to Project Settings → API
//   4. Copy the "Project URL" and "anon/public" key
//   5. Create a .env file from .env.example and paste the values
// ============================================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
