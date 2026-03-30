import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

if (supabaseUrl === 'https://placeholder.supabase.co' || !supabaseUrl.startsWith('https://')) {
  console.warn('Supabase URL is not configured or invalid. Please check your environment variables.');
}

if (supabaseAnonKey === 'placeholder') {
  console.warn('Supabase Anon Key is not configured. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
