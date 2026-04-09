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
  
  console.log('[Auth] State changed:', event, user?.email);
  
  store.setUser(user);
  
  if (user) {
    try {
      // Try to fetch profile with a small delay for trigger to complete on new signups
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (!error && data) {
        console.log('[Auth] Profile loaded:', data.full_name);
        store.setProfile(data as Profile);
      } else if (error) {
        console.warn('[Auth] Profile fetch error:', error.code, error.message);
        
        // Profile doesn't exist - try to create it (fallback for edge cases)
        if (error.code === 'PGRST116' || error.code === '23505') {
          console.log('[Auth] Creating missing profile for user:', user.id);
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
            console.log('[Auth] Profile created on signin:', newProfile.full_name);
            store.setProfile(newProfile as Profile);
          } else if (insertError) {
            console.error('[Auth] Failed to create profile on signin:', insertError);
            // Don't throw - user can still use auth features
            store.setProfile({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              role: user.user_metadata?.role || 'user',
            });
          }
        }
      }
    } catch (err) {
      console.error('[Auth] Error in profile management:', err);
      // Set minimal profile so UI doesn't break
      store.setProfile({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        role: user.user_metadata?.role || 'user',
      });
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
