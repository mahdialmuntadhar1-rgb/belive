import { useAuthStore } from '@/stores/authStore';

export const canAccessBuildMode = (): boolean => {
  const { profile } = useAuthStore.getState();
  return profile?.role === 'admin';
};
