import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook to initialize auth and load profile.
 * Safe for React StrictMode — auth subscription is singleton.
 */
export function useAuth() {
  const initAuth = useAuthStore((state) => state.initAuth);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const initialized = useAuthStore((state) => state.initialized);
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);
  const signOut = useAuthStore((state) => state.signOut);

  // Initialize auth listener ONCE (singleton in store)
  useEffect(() => {
    const cleanup = initAuth();
    return typeof cleanup === 'function' ? cleanup : undefined;
  }, [initAuth]);

  // Load profile AFTER user is set (outside onAuthStateChange callback)
  useEffect(() => {
    if (user && !profile) {
      refreshProfile();
    }
  }, [user, profile, refreshProfile]);

  return { user, profile, loading, initialized, signIn, signUp, signOut, refreshProfile };
}

export default useAuth;
