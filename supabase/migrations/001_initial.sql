-- ============================================================
-- SolfApp — Migration initiale
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Table des profils utilisateurs
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level TEXT NOT NULL DEFAULT 'decouverte'
    CHECK (level IN ('decouverte', 'apprentissage', 'pratique', 'avance')),
  xp_total INTEGER NOT NULL DEFAULT 0,
  instrument TEXT NOT NULL DEFAULT 'melodic'
    CHECK (instrument IN ('melodic', 'keyboard')),
  color_coding_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  preferences JSONB NOT NULL DEFAULT '{
    "theme": "system",
    "metronome_volume": 0.7,
    "piano_sound": true,
    "show_note_labels": true,
    "audio_on_hover": false
  }'::jsonb
);

-- Index
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);

-- ============================================================
-- Table des partitions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nouvelle partition',
  composer TEXT,
  score_data JSONB NOT NULL,
  format TEXT NOT NULL DEFAULT 'json'
    CHECK (format IN ('json', 'musicxml', 'abc', 'midi')),
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  thumbnail_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS scores_user_id_idx ON public.scores (user_id);
CREATE INDEX IF NOT EXISTS scores_is_public_idx ON public.scores (is_public);

-- ============================================================
-- Table des résultats d'exercices
-- ============================================================

CREATE TABLE IF NOT EXISTS public.exercise_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  max_score INTEGER NOT NULL DEFAULT 100,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level TEXT NOT NULL DEFAULT 'decouverte'
);

CREATE INDEX IF NOT EXISTS exercise_results_user_id_idx ON public.exercise_results (user_id);
CREATE INDEX IF NOT EXISTS exercise_results_type_idx ON public.exercise_results (exercise_type);

-- ============================================================
-- Table des badges
-- ============================================================

CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,
  UNIQUE (user_id, badge_type)
);

CREATE INDEX IF NOT EXISTS badges_user_id_idx ON public.badges (user_id);

-- ============================================================
-- Table des déblocages de fonctionnalités
-- ============================================================

CREATE TABLE IF NOT EXISTS public.level_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level TEXT NOT NULL,
  UNIQUE (user_id, feature)
);

-- ============================================================
-- Trigger — Mise à jour de updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER scores_updated_at
  BEFORE UPDATE ON public.scores
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Trigger — Créer un profil à l'inscription
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_unlocks ENABLE ROW LEVEL SECURITY;

-- Profiles: chaque utilisateur accède uniquement à son profil
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Scores: propres scores + scores publics
CREATE POLICY "scores_select" ON public.scores
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "scores_insert_own" ON public.scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "scores_update_own" ON public.scores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "scores_delete_own" ON public.scores
  FOR DELETE USING (auth.uid() = user_id);

-- Exercise results: propres résultats uniquement
CREATE POLICY "exercise_results_select_own" ON public.exercise_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "exercise_results_insert_own" ON public.exercise_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badges: propres badges uniquement
CREATE POLICY "badges_select_own" ON public.badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "badges_insert_own" ON public.badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Level unlocks: propres déblocages uniquement
CREATE POLICY "level_unlocks_select_own" ON public.level_unlocks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "level_unlocks_insert_own" ON public.level_unlocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
