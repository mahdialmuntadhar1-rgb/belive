/**
 * // BUILD MODE ONLY
 * Helper for controlling access to Build Mode in production.
 * 
 * OWNER ACCESS STEPS:
 * 1. Open Browser Console (F12)
 * 2. Run: localStorage.setItem('owner_builder_access', 'true')
 * 3. Visit URL with: ?builder=1
 * 
 * Requirement: URL ?builder=1 AND localStorage owner_builder_access="true"
 */

const ACCESS_KEY = 'owner_builder_access';

export const canAccessBuildMode = (search?: string): boolean => {
  if (typeof window === 'undefined') return false;

  // Check URL for ?builder=1
  // Use provided search string or fallback to window.location.search
  const params = new URLSearchParams(search ?? window.location.search);
  const hasUrlParam = params.get('builder') === '1';

  // Check localStorage for persisted access
  const hasStorageFlag = localStorage.getItem(ACCESS_KEY) === 'true';

  // Dual requirement: Both must be true simultaneously
  // This ensures Build Mode is isolated and only accessible to owners with the secret URL
  const isAuthorized = hasUrlParam && hasStorageFlag;

  return isAuthorized;
};

export const enableBuildModeAccess = () => {
  localStorage.setItem(ACCESS_KEY, 'true');
};

export const disableBuildModeAccess = () => {
  localStorage.removeItem(ACCESS_KEY);
};
