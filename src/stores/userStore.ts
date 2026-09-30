import { create } from 'zustand';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  profilePhoto: string | null;
  targetLanguage: string; // e.g., 'es', 'fr', 'pt'
  nativeLanguage: string;
  streakDays: number;
  totalXP: number;
  premiumTier: 'free' | 'pro' | 'elite';
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),
}));
