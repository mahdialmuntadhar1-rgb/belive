import { useAuth } from './useAuth';
import { useMemo, useEffect } from 'react';

const OWNER_EMAIL = 'mahdialmuntadhar1@gmail.com';

export function useBuildMode() {
  const { user } = useAuth();

  const isBuildModeEnabled = useMemo(() => {
    const enabled = user?.email === OWNER_EMAIL;
    console.log('[Build Mode] Check:', { userEmail: user?.email, ownerEmail: OWNER_EMAIL, enabled });
    return enabled;
  }, [user?.email]);

  useEffect(() => {
    console.log('[Build Mode] Current status:', { isBuildModeEnabled, userEmail: user?.email });
  }, [isBuildModeEnabled, user?.email]);

  return {
    isBuildModeEnabled,
  };
}
