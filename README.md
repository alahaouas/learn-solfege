# SolfApp — Apprendre le solfège

Application web d'apprentissage du solfège à la française, orientée débutants. Principe fondamental : **Progressive Disclosure** — ne montrer que ce dont l'utilisateur a besoin maintenant.

## Stack technique

| Couche | Outils |
|--------|--------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| State | Zustand |
| Routing | React Router v6 |
| Animation | Framer Motion |
| Partition | VexFlow (SVG) + OSMD (MusicXML) |
| Audio | Tone.js + soundfont-player |
| Détection pitch | Pitchy |
| Parsers | abcjs + @tonejs/midi + JSZip |
| Backend | Supabase (auth + PostgreSQL + Storage) |
| Tests | Vitest + React Testing Library + Playwright |

## Prérequis

- Node.js 18+
- npm 9+
- Un projet Supabase (pour l'auth et la base de données)

## Installation

```bash
git clone https://github.com/alahaouas/learn-solfege.git
cd learn-solfege
npm install
```

Copier le fichier d'environnement et renseigner les clés Supabase :

```bash
cp .env.local.example .env.local
# éditer .env.local avec vos valeurs VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
```

## Commandes

```bash
npm run dev           # Serveur de développement → http://localhost:5173
npm run build         # Build de production (TypeScript strict)
npm run test          # Tests unitaires et intégration (Vitest)
npm run test:watch    # Vitest en mode watch
npm run test:coverage # Couverture de code
npm run test:e2e      # Tests end-to-end (Playwright)
npx tsc --noEmit      # Vérification des types seule
```

## Structure du projet

```
src/
├── components/
│   ├── score/        # ScoreRenderer, NoteInput
│   ├── audio/        # AudioEngine, Metronome
│   ├── exercises/    # NoteQuiz, IntervalQuiz, RhythmQuiz
│   ├── progression/  # FeatureGate, LevelIndicator
│   └── ui/           # Composants shadcn
├── hooks/            # useScore, useAudio, useFeature
├── lib/
│   └── music/        # noteUtils, intervals, scales, rhythm, chords
├── store/            # scoreStore, audioStore, userStore, levelStore
├── pages/            # Dashboard, ScoreEditor, ScoreReader, Exercises, Theory
└── types/            # music.ts, database.ts, levels.ts
```

## Niveaux d'apprentissage

| Niveau | Fonctionnalités |
|--------|----------------|
| `decouverte` | Notes Do–Si, durées whole→eighth, clé de Sol, exercices d'identification |
| `apprentissage` | + 16th, clé de Fa, armures G/D/F/Bb, intervalles |
| `pratique` | + 32nd, clés alto/ténor, import MusicXML/ABC/MIDI |
| `avance` | + 64th, toutes les clés, ornements, articulations |

## Solfège français

- **DO FIXE** : Do = C, Ré = D, … Si = B, quelle que soit la tonalité.
- **Silences** : Pause, Demi-pause, Soupir, Demi-soupir, Quart de soupir…
- **Altérations** : ♯ ♭ ♮ (jamais `#` ou `b` ASCII dans l'interface).

## Tests

Les tests sont organisés par priorité :

```
tests/
├── unit/music/        # noteUtils, rhythm, intervals, scales (100% couverture)
├── unit/featureFlags/ # defaultClef = treble dans tous les modes
├── integration/
├── components/
├── e2e/               # Playwright
└── fixtures/          # Partitions de test (.xml, .abc, .mid)
```

```bash
npm run test           # Lance tous les tests unitaires
npm run test:coverage  # Rapport de couverture
```

## Licence

MIT
