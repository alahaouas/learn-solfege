// ============================================================
// SolfApp — Hook d'authentification Supabase
// Écoute les changements de session et synchronise le store Zustand
// ============================================================

import { useEffect } from 'react';
import { supabase, isSupabaseConfigured, getProfile } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import type { UserProfile } from '@/types/database';

export function useSupabaseAuth() {
  const { setUser, logout } = useUserStore();

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Charger la session existante au montage
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncProfile(session.user.id);
      }
    });

    // Écouter les changements d'état d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await syncProfile(session.user.id);
        } else {
          logout();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, logout]);

  async function syncProfile(userId: string) {
    const { data, error } = await getProfile(userId);
    if (!error && data) {
      setUser(data as UserProfile);
    }
  }
}
