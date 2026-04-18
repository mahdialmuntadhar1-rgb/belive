import { useAuthStore } from '@/stores/authStore';
import { useMemo, useState } from 'react';

/**
 * useAdminMode - Role-based admin access hook
 * Only users with role = 'admin' can edit
 */
export function useAdminMode() {
  const { profile } = useAuthStore();
  const [isEditModeOn, setIsEditModeOn] = useState(false);

  const canEditContent = useMemo(() => {
    return profile?.role === 'admin';
  }, [profile?.role]);

  const isAdminEditModeActive = canEditContent && isEditModeOn;

  return {
    canEditContent,
    isAdminEditModeActive,
    isEditModeOn,
    setIsEditModeOn,
  };
}
