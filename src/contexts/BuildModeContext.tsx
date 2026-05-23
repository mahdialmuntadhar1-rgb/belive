import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface BuildModeContextValue {
  isEditingEnabled: boolean;
  toggleEditing: () => void;
  isAdmin: boolean;
}

const BuildModeContext = createContext<BuildModeContextValue | undefined>(undefined);

export function BuildModeProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [isEditingEnabled, setIsEditingEnabled] = useState(false);

  // Default to enabled when admin is logged in
  useEffect(() => {
    if (isAdmin) {
      setIsEditingEnabled(true);
    } else {
      setIsEditingEnabled(false);
    }
  }, [isAdmin]);

  const toggleEditing = () => {
    setIsEditingEnabled(prev => !prev);
  };

  return (
    <BuildModeContext.Provider value={{ isEditingEnabled, toggleEditing, isAdmin }}>
      {children}
    </BuildModeContext.Provider>
  );
}

export function useBuildModeContext() {
  const context = useContext(BuildModeContext);
  if (context === undefined) {
    throw new Error('useBuildModeContext must be used within a BuildModeProvider');
  }
  return context;
}
