import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: 'user' | 'business_owner' | 'admin';
  avatar_url?: string;
}

interface AuthResult {
  user: User | null;
  session: Session | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  initAuth: () => () => void;
}

// Module-level singleton state — survives React StrictMode
let subscription: { unsubscribe: () => void } | null = null;
let authInitConsumers = 0;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  signUp: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  refreshProfile: async () => {
    const user = get().user;
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (!error && data) {
        set({ profile: data as Profile });
      }
    } catch (err) {
      console.error('[AuthStore] Profile fetch error:', err);
    }
  },

  initAuth: () => {
    authInitConsumers += 1;

    // Subscribe once across all useAuth consumers. The callback must stay
    // synchronous to avoid Supabase auth lock contention.
    if (!subscription) {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          const user = session?.user ?? null;
          set({ user, loading: false, initialized: true });
          if (!user) {
            set({ profile: null });
          }
        }
      );

      subscription = sub;
    }

    // Always return a function so React effect cleanup can never call an
    // undefined value, even under StrictMode double mounting.
    return () => {
      authInitConsumers = Math.max(0, authInitConsumers - 1);
      if (authInitConsumers === 0 && subscription) {
        subscription.unsubscribe();
        subscription = null;
      }
    };
  },
}));
