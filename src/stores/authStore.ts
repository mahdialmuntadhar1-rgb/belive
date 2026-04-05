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
  
  console.log('Auth state changed:', event, user?.email);
  
  store.setUser(user);
  
  if (user) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (!error && data) {
        store.setProfile(data as Profile);
      } else if (error && error.code === 'PGRST116') {
        console.log('Profile not found for user:', user.id);
        // Might need to create profile if it was a Google signup
        if (event === 'SIGNED_IN') {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                role: user.user_metadata?.role || 'user',
              },
            ])
            .select()
            .single();
          
          if (!insertError && newProfile) {
            store.setProfile(newProfile as Profile);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  } else {
    store.setProfile(null);
  }
  
  setAuthLoading(false);
});

// Initial session check
supabase.auth.getSession().then(({ data: { session } }) => {
  const store = useAuthStore.getState();
  if (session) {
    store.setUser(session.user);
    // Profile will be fetched by onAuthStateChange which fires after getSession
  } else {
    setAuthLoading(false);
  }
});

function setAuthLoading(loading: boolean) {
  useAuthStore.setState({ loading });
}
