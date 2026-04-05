import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: 'user' | 'business_owner';
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },
  refreshProfile: async () => {
    const user = get().user;
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (!error && data) {
      set({ profile: data as Profile });
    }
  }
}));

// Initialize auth listener
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState();
  const user = session?.user ?? null;
  store.setUser(user);
  
  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (!error && data) {
      store.setProfile(data as Profile);
    } else if (error && error.code === 'PGRST116') {
      // Profile doesn't exist yet, might be mid-signup
      console.log('Profile not found for user:', user.id);
    }
  } else {
    store.setProfile(null);
  }
  
  setAuthLoading(false);
});

function setAuthLoading(loading: boolean) {
  useAuthStore.setState({ loading });
}
