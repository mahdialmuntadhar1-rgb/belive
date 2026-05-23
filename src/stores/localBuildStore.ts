import { create } from 'zustand';

interface LocalBuildModeState {
  isBuildMode: boolean;
  setBuildMode: (enabled: boolean) => void;
  canEdit: (email: string | undefined, role: string | undefined) => boolean;
}

export const OWNER_EMAIL = 'mahdialmuntadhar1@gmail.com';

export const useLocalBuildStore = create<LocalBuildModeState>((set) => ({
  isBuildMode: false,
  setBuildMode: (enabled) => set({ isBuildMode: enabled }),
  canEdit: (email, role) => email === OWNER_EMAIL || role === 'admin'
}));
