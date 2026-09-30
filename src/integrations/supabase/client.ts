// Supabase Client Configuration
// Updated to use environment variables for security
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env.local file.'
  );
}

/**
 * Supabase client instance with authentication
 *
 * Import this client to interact with Supabase when authentication is needed:
 * @example
 * import { supabase } from '@/integrations/supabase/client';
 *
 * const { data, error } = await supabase
 *   .from('teachers')
 *   .select('*');
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Supabase client instance without authentication for public pages
 *
 * Use this client for public pages that don't require authentication (e.g., student schedule)
 * This avoids Navigator LockManager errors and improves performance
 * @example
 * import { supabasePublic } from '@/integrations/supabase/client';
 *
 * const { data, error } = await supabasePublic
 *   .rpc('get_available_teachers');
 */
export const supabasePublic = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
