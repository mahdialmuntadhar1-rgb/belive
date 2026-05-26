import { create } from 'zustand';
import { authApi, getToken, getStoredUser, setToken, setStoredUser, removeToken, type AuthUser } from '@/lib/api';

interface AuthState {
  user: AuthUser | null;
  /** @alias user — kept for backward-compat with existing components */
  profile: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: AuthUser | null) => void;
  signIn: (email: string, password: string) => Promise<{ user: AuthUser }>;
  signUp: (email: string, password: string, meta?: { full_name?: string; role?: string; business_name?: string; phone?: string; governorate?: string; category?: string; city?: string; description?: string }) => Promise<{ user: AuthUser }>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
  initAuth: () => () => void;
}

let isInitializing = false;

const withProfile = (user: AuthUser | null) => ({ user, profile: user });

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  setUser: (user) => set(withProfile(user)),

  signIn: async (email, password) => {
    const res = await authApi.login(email, password);
    setToken(res.token);
    setStoredUser(res.user);
    set(withProfile(res.user));
    return { user: res.user };
  },

  signUp: async (email, password, meta = {}) => {
    const res = await authApi.signup({ email, password, ...meta });
    setToken(res.token);
    setStoredUser(res.user);
    set(withProfile(res.user));
    return { user: res.user };
  },

  signOut: () => {
    removeToken();
    set(withProfile(null));
  },

  refreshProfile: async () => {
    try {
      const res = await authApi.me();
      setStoredUser(res.user);
      set(withProfile(res.user));
    } catch (err) {
      console.error('[AuthStore] Profile refresh error:', err);
      removeToken();
      set(withProfile(null));
    }
  },

  initAuth: () => {
    if (isInitializing) return () => {};
    isInitializing = true;

    const token = getToken();
    if (token) {
      const stored = getStoredUser();
      if (stored) {
        set({ ...withProfile(stored), loading: false, initialized: true });
        get().refreshProfile();
      } else {
        get().refreshProfile().finally(() => set({ loading: false, initialized: true }));
      }
    } else {
      set({ loading: false, initialized: true });
    }

    return () => { isInitializing = false; };
  },
}));
