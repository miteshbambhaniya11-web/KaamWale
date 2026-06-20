import { createClient } from '@supabase/supabase-js';

// Load from environment variables if present, otherwise fall back to user's credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wjhvvtbnluhfddgpvglm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_P81qZb7Q6av9loG6EdWe8g_nF_pz3Vq';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
