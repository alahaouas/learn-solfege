// ============================================================
// SolfApp — Types base de données (Supabase / PostgreSQL)
// ============================================================

import type { AppLevel } from './levels';
import type { Score } from './music';

export interface UserProfile {
  id: string;               // UUID = auth.uid()
  email: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  level: AppLevel;
  xp_total: number;
  instrument: 'melodic' | 'keyboard';
  color_coding_enabled: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  metronome_volume: number;   // 0–1
  piano_sound: boolean;
  show_note_labels: boolean;
  audio_on_hover: boolean;
}

export interface SavedScore {
  id: string;
  user_id: string;
  title: string;
  composer?: string;
  score_data: Score;          // JSONB
  format: 'json' | 'musicxml' | 'abc' | 'midi';
  is_public: boolean;
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
  tags: string[];
}

export interface ExerciseResult {
  id: string;
  user_id: string;
  exercise_type: string;
  score: number;              // 0–100
  max_score: number;
  duration_seconds: number;
  answers: ExerciseAnswer[];
  completed_at: string;
  level: AppLevel;
}

export interface ExerciseAnswer {
  question: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  response_time_ms: number;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  earned_at: string;
  metadata?: Record<string, unknown>;
}

export type BadgeType =
  | 'first_note'           // Première note jouée
  | 'first_score'          // Première partition lue
  | 'first_exercise'       // Premier exercice complété
  | 'perfect_exercise'     // Exercice parfait (100%)
  | 'level_apprentissage'  // Niveau Apprentissage atteint
  | 'level_pratique'       // Niveau Pratique atteint
  | 'level_avance'         // Niveau Avancé atteint
  | 'streak_7'             // 7 jours consécutifs
  | 'streak_30'            // 30 jours consécutifs
  | 'score_100'            // 100 partitions lues
  | 'composer';            // 10 partitions créées

export interface LevelUnlock {
  id: string;
  user_id: string;
  feature: string;
  unlocked_at: string;
  level: AppLevel;
}

// Supabase Database type helper
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      scores: {
        Row: SavedScore;
        Insert: Omit<SavedScore, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SavedScore, 'id' | 'user_id' | 'created_at'>>;
      };
      exercise_results: {
        Row: ExerciseResult;
        Insert: Omit<ExerciseResult, 'id'>;
        Update: never;
      };
      badges: {
        Row: Badge;
        Insert: Omit<Badge, 'id'>;
        Update: never;
      };
      level_unlocks: {
        Row: LevelUnlock;
        Insert: Omit<LevelUnlock, 'id'>;
        Update: never;
      };
    };
  };
}
