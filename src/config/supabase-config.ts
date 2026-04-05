// Supabase configuration for BELIVE Iraqi Directory
export const SUPABASE_CONFIG = {
  url: 'https://hsadukhmcclwixuntqwu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODMzNjgsImV4cCI6MjA4ODY1OTM2OH0.XWDbzIPZNPk6j1GXixcIJKUb4lp48ipC7jExG2Q09Ns'
};

// Environment variables fallback
export const getSupabaseConfig = () => {
  return {
    url: (import.meta.env as any).VITE_SUPABASE_URL || SUPABASE_CONFIG.url,
    anonKey: (import.meta.env as any).VITE_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey
  };
};
