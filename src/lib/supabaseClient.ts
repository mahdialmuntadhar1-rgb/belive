import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '@/config/supabase-config';

const config = getSupabaseConfig();

if (!config.url || !config.anonKey) {
  console.warn('Supabase credentials are missing. Using mock data mode.');
}

export const supabase = createClient(config.url, config.anonKey);
