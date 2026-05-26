import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook to initialize auth and expose all auth actions.
 * Safe for React StrictMode — init is singleton in store.
 */
export function useAuth() {
  const initAuth = useAuthStore((state) => state.initAuth);
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const initialized = useAuthStore((state) => state.initialized);
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signOut);
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);

  useEffect(() => {
    const cleanup = initAuth();
    return cleanup;
  }, [initAuth]);

  return { user, profile, loading, initialized, signOut, signIn, signUp };
}

export default useAuth;
