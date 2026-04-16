/**
 * // BUILD MODE ONLY
 * Detection utility for Build Mode access.
 */

export default function isBuildMode() {
  // Check for development environment, specific env flag, or query parameter
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    // Access via ?builder=1
    if (params.get('builder') === '1') {
      localStorage.setItem('belive_builder', 'true');
      return true;
    }
    // Persistence via localStorage
    if (localStorage.getItem('belive_builder') === 'true') return true;
  }
  
  return import.meta.env.VITE_BUILD_MODE === 'true' || 
         import.meta.env.DEV;
}
