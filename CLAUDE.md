# SolfApp — Contexte projet pour Claude Code

## Ce qu'est ce projet

Application web d'apprentissage du solfège à la française, orientée débutants. Principe fondamental : **Progressive Disclosure** — ne montrer que ce dont l'utilisateur a besoin maintenant. L'architecture complète est dans `docs/PRD_Architecture.md` (référence principale).

## Stack technique

```
Frontend  : React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
State     : Zustand
Routing   : React Router v6
Animation : Framer Motion
Partition : VexFlow (rendu SVG) + OSMD (import MusicXML)
Audio     : Tone.js + soundfont-player
Détection : Pitchy (hauteur micro)
Parsers   : abcjs + @tonejs/midi + JSZip
Backend   : Supabase (auth + PostgreSQL + Storage)
Tests     : Vitest + React Testing Library + Playwright
```

## Commandes essentielles

```bash
npm run dev          # Serveur dev → http://localhost:5173
npm run test         # Vitest (unitaires + intégration)
npm run test:watch   # Vitest mode watch
npm run test:coverage
npm run build        # Build prod TypeScript strict
npm run test:e2e     # Playwright
npx tsc --noEmit     # Vérification types seule
```

## Règles architecturales — NE JAMAIS déroger

1. **Le store Zustand est la seule source de vérité.** VexFlow et Tone.js ne communiquent jamais directement. Toute modification passe par une action du store.

2. **`insertNote` — pas `addNote`.** L'action s'appelle `insertNote(measureId, beat, note)`. Elle gère le beat, supprime le silence, joue le son.

3. **Clé de Sol = défaut absolu.** `DEFAULT_CLEF = 'treble'` partout, dans tous les modes. Ne jamais créer une partition sans clé explicite `treble`.

4. **Feature flags par niveau.** Chaque composant filtre ses options via `FEATURES[level]` avant le rendu. Ne jamais afficher une fonction verrouillée.

5. **Timing audio via `Tone.Transport`.** Jamais `setTimeout`. Planifier avec `scheduleRepeat` ou `scheduleOnce`.

6. **VexFlow = rendu seul.** Superposer des zones SVG transparentes pour les clics. Ne pas modifier le SVG VexFlow directement.

## Modèle de données central (source de vérité)

```typescript
type InstrumentType = 'melodic' | 'keyboard';
type AppLevel = 'decouverte' | 'apprentissage' | 'pratique' | 'avance';
type Duration = 'whole' | 'half' | 'quarter' | 'eighth' | '16th' | '32nd' | '64th';
type Clef = 'treble' | 'bass' | 'alto' | 'tenor' | 'soprano' | 'mezzosoprano' | 'bass3' | 'frenchViolin';
const DEFAULT_CLEF: Clef = 'treble';

interface Note {
  id: string;
  name: NoteName;           // C, D, E, F, G, A, B
  solfege: string;          // Do, Ré, Mi, Fa, Sol, La, Si (DO FIXE — jamais movable-do)
  solfegeLabel: string;     // "Ré dièse", "Mi bémol"
  octave: number;           // 4 = do central (MIDI 60 = Do4 = 261.63 Hz)
  duration: Duration;
  accidental: '#' | 'b' | 'n' | null;
  dots: number;             // 0, 1 (pointée), 2 (double pointée)
  midiPitch: number;        // 0-127
  frequency: number;        // Hz
  startBeat: number;        // Position dans la mesure
  tie: 'start' | 'stop' | 'continue' | null;  // JAMAIS ties: boolean
  tiedToId?: string;        // ID de la note liée (pour VexFlow Tie)
  chord: boolean;           // true = accord (même startBeat)
  tuplet?: { id: string; type: number; numNotes: number; baseDuration: Duration };
  ornament?: Ornament;
  articulation?: Articulation[];
  restName?: string;        // 'Pause' | 'Demi-pause' | 'Soupir' | 'Demi-soupir'…
}

interface Measure {
  id: string;
  index: number;
  notes: Note[];            // Phase 1 — monophonie
  rests: Rest[];
  voices?: Note[][];        // Phase 2+ — polyphonie
  timeSignature: TimeSignature;
  keySignature: KeySignature;
}

interface Part {            // Phase 2+ — portée d'instrument
  id: string;
  instrument: string;
  clef: Clef;
  measures: Measure[];
}

interface Score {
  id: string;
  title: string;
  composer?: string;
  clef: Clef;               // Défaut : 'treble' — toujours
  tempo: number;
  measures: Measure[];
  parts?: Part[];           // Phase 2+ : piano = 2 parts
  metadata: ScoreMetadata;
}
```

## Store Zustand — actions disponibles

```typescript
interface AppStore {
  instrument: InstrumentType;
  showGrandStaff: boolean;
  currentScore: Score | null;
  selectedNoteId: string | null;
  playbackPosition: number;
  isPlaying: boolean;
  mode: 'read' | 'write' | 'exercise';
  level: AppLevel;
  selectedDuration: Duration;
  selectedAccidental: Accidental;
  history: Score[];
  historyIndex: number;

  // Actions partition
  loadScore: (score: Score) => void;
  insertNote: (measureId: string, beat: number, note: Partial<Note>) => void;
  deleteNote: (noteId: string) => void;
  moveNote: (noteId: string, newBeat: number) => void;
  splitMeasure: (measureId: string) => void;  // débordement rythmique → tie auto
  setSelectedNote: (noteId: string | null) => void;
  setMode: (mode: 'read' | 'write' | 'exercise') => void;

  // Audio
  playScore: () => void;
  stopPlayback: () => void;
  setTempo: (bpm: number) => void;

  // Historique
  undo: () => void;
  redo: () => void;

  // Niveau
  setLevel: (level: AppLevel) => void;
  unlockFeature: (feature: keyof FeatureFlags) => void;
  setInstrument: (instrument: InstrumentType) => void;
}
```

## Feature flags par niveau

```typescript
const FEATURES: Record<AppLevel, FeatureFlags> = {
  decouverte: {
    notes: ['C','D','E','F','G','A','B'],
    accidentals: [],
    durations: ['whole','half','quarter','eighth'],
    // blanche pointée si timeSignature = 3/4
    clefs: ['treble'],
    defaultClef: 'treble',
    showGrandStaff: false,   // true si instrument = 'keyboard'
    keySignatures: ['C'],
    showRestNames: false,
    colorCoding: true,
    noteLabels: true,
    importEnabled: false,
    exercises: ['note-identification'],
  },
  apprentissage: {
    durations: ['whole','half','quarter','eighth','16th'],
    // '32nd' triple croche = niveau Pratique — PAS Apprentissage
    clefs: ['treble','bass'],
    defaultClef: 'treble',
    importEnabled: false,
    keySignatures: ['C','G','D','F','Bb'],
    showRestNames: true,
    exercises: ['note-identification','interval','rhythm','scale-degrees'],
  },
  pratique: {
    durations: ['whole','half','quarter','eighth','16th','32nd'],
    clefs: ['treble','bass','alto','tenor'],
    defaultClef: 'treble',
    importEnabled: true,   // Import activé ICI — pas avant
  },
  avance: {
    durations: ['whole','half','quarter','eighth','16th','32nd','64th'],
    clefs: ['treble','bass','alto','tenor','soprano','mezzosoprano','bass3','frenchViolin'],
    defaultClef: 'treble',
    importEnabled: true,
  },
};
```

## Solfège français — règles absolues

- **DO FIXE** : Do = C toujours, quelle que soit la tonalité. Jamais de movable-do.
- **SI (pas Ti)** : la 7e note s'appelle Si en français.
- **Noms des silences** : Pause (whole), Demi-pause (half), Soupir (quarter), Demi-soupir (eighth), Quart de soupir (16th), Huitième de soupir (32nd), Seizième de soupir (64th).
- **Symboles** : ♯ ♭ ♮ × 𝄫 — jamais `#` ou `b` ASCII dans l'UI.
- **Tooltip minimal** : nom solfège FR + octave + durée + altération.

```typescript
const NOTE_NAMES_FR = { C:'Do', D:'Ré', E:'Mi', F:'Fa', G:'Sol', A:'La', B:'Si' };
const REST_NAMES_FR  = {
  whole:'Pause', half:'Demi-pause', quarter:'Soupir',
  eighth:'Demi-soupir', '16th':'Quart de soupir',
  '32nd':'Huitième de soupir', '64th':'Seizième de soupir',
};
```

## Structure des dossiers cible

```
solfapp/
├── src/
│   ├── components/
│   │   ├── score/        # ScoreRenderer, NoteInput, PlaybackCursor, GhostNote
│   │   ├── audio/        # AudioEngine, Metronome, PitchDetector
│   │   ├── exercises/    # NoteQuiz, IntervalQuiz, RhythmQuiz
│   │   ├── theory/       # CircleOfFifths, ScaleBuilder, ChordBuilder
│   │   ├── progression/  # ProgressionPrompt, LevelIndicator, FeatureGate
│   │   └── ui/           # shadcn composants
│   ├── hooks/            # useScore, useAudio, useFeature, usePitchDetection
│   ├── lib/
│   │   ├── music/        # noteUtils, intervals, scales, rhythm, chords (fonctions PURES)
│   │   └── parsers/      # musicXmlParser, abcParser, midiParser
│   ├── store/            # scoreStore, audioStore, userStore, levelStore
│   ├── pages/            # Dashboard, ScoreReader, ScoreEditor, Exercises, Theory
│   └── types/            # music.ts, database.ts, levels.ts
├── supabase/migrations/
├── public/soundfonts/
├── tests/
│   ├── unit/music/       # 100% couverture obligatoire
│   ├── unit/parsers/
│   ├── unit/featureFlags/
│   ├── integration/
│   ├── components/
│   ├── e2e/
│   └── fixtures/         # Partitions de test (.xml, .abc, .mid)
├── docs/
│   └── PRD_Architecture.md
├── CLAUDE.md             # ce fichier
└── .env.local            # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
```

## Priorités de tests (ordre d'écriture)

| Priorité | Fichier | Seuil |
|----------|---------|-------|
| P1 | `lib/music/noteUtils` | 100% |
| P1 | `lib/music/rhythm` + `REST_NAMES_FR` | 100% |
| P1 | `store/featureFlags` — `defaultClef = treble` dans tous les modes | 100% |
| P2 | `lib/music/intervals`, `scales` | 100% |
| P2 | Tooltip FR au survol (RTL) | — |
| P3 | `lib/parsers/musicXmlParser` | 95% |
| P3 | Undo/Redo store | 90% |
| P4 | E2E onboarding Playwright | — |

## Pièges techniques connus

1. **`tie` ≠ boolean** — VexFlow a besoin de `'start' | 'stop' | 'continue' | null` + `tiedToId` pour construire l'objet `Tie`. Un booléen ne suffit pas.

2. **Virgule flottante avec tuplets** — `startBeat` en Float64 donne `0.333...` pour un triolet. Utiliser `Fraction.js` dès que les n-olets sont activés (niveau Avancé).

3. **Piano grand-portée** — Quand `instrument = 'keyboard'`, les 2 Parts (treble + bass) doivent être planifiées dans le même `Tone.Transport`. Ne jamais lancer deux Transport séparés.

4. **VexFlow = rendu uniquement** — Superposer des zones `<rect>` SVG transparentes (`pointer-events: all`) pour capturer les clics et les mapper aux objets `Note` du store.

5. **Web Audio et geste utilisateur** — `Tone.start()` doit être appelé dans un handler `onClick`, jamais au montage du composant.

6. **Import désactivé avant niveau Pratique** — Vérifier `FEATURES[level].importEnabled` avant d'afficher tout composant d'import.

## Variables d'environnement

```bash
# .env.local
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# .env.test
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=test-anon-key
```

## Pour démarrer un nouveau projet depuis zéro

```bash
npm create vite@latest solfapp -- --template react-ts
cd solfapp
npm install vexflow osmd tone @tonejs/midi soundfont-player pitchy abcjs jszip
npm install zustand react-router-dom framer-motion fraction.js
npm install -D tailwindcss @supabase/supabase-js vitest @playwright/test
npm install -D @testing-library/react @testing-library/user-event msw
npx tailwindcss init
mkdir -p docs && cp /path/to/PRD_Architecture.md docs/
mkdir -p .claude/commands
```

---

Référence complète : `docs/PRD_Architecture.md` — architecture exhaustive.
