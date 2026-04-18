import { useAuth } from './useAuth';
import { useMemo, useState } from 'react';

/**
 * useAdminMode - Email-based admin access hook
 * Only mahdialmuntadhar1@gmail.com can edit
 */
const ADMIN_EMAIL = 'mahdialmuntadhar1@gmail.com';

export function useAdminMode() {
  const { user } = useAuth();
  const [isEditModeOn, setIsEditModeOn] = useState(false);

  const canEditContent = useMemo(() => {
    return user?.email === ADMIN_EMAIL;
  }, [user?.email]);

  const isAdminEditModeActive = canEditContent && isEditModeOn;

  return {
    canEditContent,
    isAdminEditModeActive,
    isEditModeOn,
    setIsEditModeOn,
  };
}
