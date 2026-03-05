// ============================================================
// SolfApp — userStore — Authentification et profil utilisateur
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/types/database';

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  sessionToken: string | null;

  // Actions
  setUser: (user: UserProfile | null) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setSessionToken: (token: string | null) => void;
  logout: () => void;
  updatePreferences: (prefs: Partial<UserProfile['preferences']>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      onboardingCompleted: false,
      sessionToken: null,

      setUser: (user) => set({ user, isAuthenticated: user !== null }),

      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),

      setSessionToken: (token) => set({ sessionToken: token }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          sessionToken: null,
        }),

      updatePreferences: (prefs) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                preferences: { ...state.user.preferences, ...prefs },
              }
            : null,
        })),
    }),
    {
      name: 'solfapp-user',
      partialize: (state) => ({
        onboardingCompleted: state.onboardingCompleted,
        // Ne pas persister le token — utiliser Supabase session
      }),
    }
  )
);
