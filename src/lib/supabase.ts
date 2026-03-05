// ============================================================
// SolfApp — Client Supabase
// ============================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials manquantes. Copier .env.local.example vers .env.local et renseigner les valeurs.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ============================================================
// Auth helpers
// ============================================================

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}

// ============================================================
// Profile helpers
// ============================================================

export async function getProfile(userId: string) {
  return supabase.from('profiles').select('*').eq('id', userId).single();
}

export async function updateProfile(
  userId: string,
  updates: Database['public']['Tables']['profiles']['Update']
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  return client
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);
}

// ============================================================
// Score helpers
// ============================================================

export async function saveScore(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scoreData: any
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return supabase.from('scores').insert(scoreData as any).select().single();
}

export async function getUserScores(userId: string) {
  return supabase
    .from('scores')
    .select('id, title, composer, created_at, updated_at, tags')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
}

export async function loadScore(scoreId: string) {
  return supabase.from('scores').select('*').eq('id', scoreId).single();
}

export async function deleteScore(scoreId: string) {
  return supabase.from('scores').delete().eq('id', scoreId);
}

// ============================================================
// Exercise results
// ============================================================

export async function saveExerciseResult(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return supabase.from('exercise_results').insert(result as any);
}

export async function getUserStats(userId: string) {
  return supabase
    .from('exercise_results')
    .select('exercise_type, score, max_score, completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(100);
}

// ============================================================
// Badges
// ============================================================

export async function getUserBadges(userId: string) {
  return supabase.from('badges').select('*').eq('user_id', userId);
}

export async function awardBadge(userId: string, badgeType: string) {
  return supabase
    .from('badges')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert({ user_id: userId, badge_type: badgeType, earned_at: new Date().toISOString() } as any);
}
