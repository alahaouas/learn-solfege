// ============================================================
// SolfApp — Client Supabase
// ============================================================
// Note : les types précis seront générés par `supabase gen types typescript`
// une fois le projet Supabase connecté. En attendant, les helpers
// retournent des types explicites définis dans @/types/database.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import type {
  UserProfile,
  SavedScore,
  ExerciseResult,
  Badge,
} from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  supabaseUrl !== 'https://xxxx.supabase.co' &&
  Boolean(supabaseAnonKey) &&
  supabaseAnonKey !== 'eyJhbGci...';

if (!isSupabaseConfigured) {
  console.warn(
    '[SolfApp] Supabase non configuré.\n' +
      'Copiez .env.local.example → .env.local et renseignez\n' +
      'VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.\n' +
      "L'authentification et la persistence cloud sont désactivées."
  );
}

// createClient sans générique Database : les types seront affinés après
// `supabase gen types typescript --project-id <id> > src/types/database.ts`
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    auth: {
      persistSession: isSupabaseConfigured,
      autoRefreshToken: isSupabaseConfigured,
    },
  }
);

// ============================================================
// Auth helpers
// ============================================================

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signInWithGitHub() {
  return supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });
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
  return supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single<UserProfile>();
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>
) {
  return supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);
}

// ============================================================
// Score helpers
// ============================================================

export async function saveScore(
  scoreData: Omit<SavedScore, 'id' | 'created_at' | 'updated_at'>
) {
  return supabase
    .from('scores')
    .insert(scoreData)
    .select()
    .single<SavedScore>();
}

export async function getUserScores(userId: string) {
  return supabase
    .from('scores')
    .select('id, title, composer, created_at, updated_at, tags')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .returns<Pick<SavedScore, 'id' | 'title' | 'composer' | 'created_at' | 'updated_at' | 'tags'>[]>();
}

export async function loadScore(scoreId: string) {
  return supabase
    .from('scores')
    .select('*')
    .eq('id', scoreId)
    .single<SavedScore>();
}

export async function deleteScore(scoreId: string) {
  return supabase.from('scores').delete().eq('id', scoreId);
}

// ============================================================
// Exercise results
// ============================================================

export async function saveExerciseResult(
  result: Omit<ExerciseResult, 'id'>
) {
  return supabase.from('exercise_results').insert(result);
}

export async function getUserStats(userId: string) {
  return supabase
    .from('exercise_results')
    .select('exercise_type, score, max_score, completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(100)
    .returns<Pick<ExerciseResult, 'exercise_type' | 'score' | 'max_score' | 'completed_at'>[]>();
}

// ============================================================
// Badges
// ============================================================

export async function getUserBadges(userId: string) {
  return supabase
    .from('badges')
    .select('*')
    .eq('user_id', userId)
    .returns<Badge[]>();
}

export async function awardBadge(userId: string, badgeType: string) {
  return supabase.from('badges').insert({
    user_id: userId,
    badge_type: badgeType,
    earned_at: new Date().toISOString(),
  });
}
