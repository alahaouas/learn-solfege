# SolfApp — Claude Code Instructions

## Project Overview

**SolfApp** is a French-language web application for learning music theory (solfège). It targets absolute beginners first and progressively unlocks advanced features as users progress. The UI is entirely in French.

PRD & Architecture: `SolfApp_PRD_Architecture.docx`

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 18.x |
| Language | TypeScript | 5.x |
| Build | Vite | 5.x |
| Styles | Tailwind CSS | 3.x |
| UI components | shadcn/ui | latest |
| Routing | React Router | v6 |
| State | Zustand | 4.x |
| Animations | Framer Motion | 11.x |
| Score rendering | VexFlow | 4.x |
| MusicXML import | OpenSheetMusicDisplay (OSMD) | 1.x |
| Audio | Tone.js | 15.x |
| MIDI | @tonejs/midi | 2.x |
| Soundfonts | soundfont-player | 0.x |
| Pitch detection | Pitchy | 4.x |
| ABC notation | abcjs | 6.x |
| MXL decompression | JSZip | 3.x |
| Backend/Auth/DB | Supabase (PostgreSQL) | latest |
| Tests | Vitest | 1.x |

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (Vite HMR)
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run Vitest unit tests
npm run lint         # ESLint
npm run typecheck    # TypeScript type check
```

## Project Structure

```
solfapp/
├── src/
│   ├── components/
│   │   ├── score/          # VexFlow & OSMD rendering
│   │   │   ├── ScoreRenderer.tsx
│   │   │   ├── NoteInput.tsx
│   │   │   └── PlaybackCursor.tsx
│   │   ├── audio/          # Tone.js wrappers
│   │   │   ├── AudioEngine.tsx
│   │   │   ├── Metronome.tsx
│   │   │   └── PitchDetector.tsx
│   │   ├── exercises/      # Exercise modules
│   │   │   ├── NoteQuiz.tsx
│   │   │   ├── IntervalQuiz.tsx
│   │   │   ├── RhythmQuiz.tsx
│   │   │   └── Dictation.tsx
│   │   ├── theory/         # Theory lessons
│   │   │   ├── CircleOfFifths.tsx
│   │   │   ├── ScaleBuilder.tsx
│   │   │   └── ChordBuilder.tsx
│   │   └── ui/             # Generic shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   │   ├── useScore.ts
│   │   ├── useAudio.ts
│   │   └── usePitchDetection.ts
│   ├── lib/
│   │   ├── music/          # Pure music utility functions (unit-tested)
│   │   │   ├── noteUtils.ts
│   │   │   ├── intervals.ts
│   │   │   ├── scales.ts
│   │   │   ├── chords.ts
│   │   │   └── rhythm.ts
│   │   └── parsers/
│   │       ├── musicXmlParser.ts
│   │       └── abcParser.ts
│   ├── store/              # Zustand stores
│   │   ├── scoreStore.ts
│   │   ├── audioStore.ts
│   │   └── userStore.ts
│   ├── pages/              # React Router pages
│   │   ├── Dashboard.tsx
│   │   ├── ScoreReader.tsx
│   │   ├── ScoreEditor.tsx
│   │   ├── Exercises.tsx
│   │   └── Theory.tsx
│   └── types/              # Global TypeScript types
│       ├── music.ts
│       └── database.ts
├── supabase/
│   └── migrations/         # SQL migrations
├── public/
│   └── soundfonts/         # .sf2 audio files
└── tests/                  # Vitest tests
```

## Core Architecture Principles

### 1. Progressive Disclosure (Most Important Rule)
The #1 design rule. New users only see 7 notes, 4 durations, 1 clef. Advanced features unlock progressively based on usage milestones. **Never show advanced UI to beginners.**

### 2. Four Interface Modes
| Mode | Level | Visible features |
|------|-------|-----------------|
| 🌱 Découverte | Absolute beginner | 7 notes, 4 durations, treble clef, color coding |
| 📖 Apprentissage | Advanced beginner | Sharps/flats, bass clef, named rests, key signatures |
| 🎵 Pratique | Intermediate | All clefs, all key signatures, full editor, import |
| 🎓 Avancé | Expert | Everything unlocked |

Default mode is always **Découverte**. Never ask the user their level upfront.

### 3. Feature Flags via Zustand
Access features through the `useFeature(flag)` hook — never hardcode level checks in UI components directly.

```typescript
// Good
const canImport = useFeature('importEnabled');

// Bad
const { level } = useAppStore();
if (level === 'pratique' || level === 'avance') { ... }
```

### 4. Instrument Type (set at onboarding)
- `melodic`: Single treble clef
- `keyboard`: Grand staff (treble + bass), set via `showGrandStaff` flag in store

### 5. State Management — insertNote, not addNote
Always use `insertNote()` from the store — it handles beat positioning, rests, and audio feedback. Never use a raw `addNote` pattern.

### 6. Audio/Visual Sync (Critical)
Synchronization flow:
1. User clicks Play
2. `AudioEngine.playScore()` reads Score from store
3. `Tone.Transport` schedules each note
4. Each played note updates `playbackPosition` in store via callback
5. `ScoreRenderer` subscribes to store → moves SVG cursor

Do not bypass this flow.

## Data Model

```typescript
type AppLevel = 'decouverte' | 'apprentissage' | 'pratique' | 'avance';
type InstrumentType = 'melodic' | 'keyboard';
type Duration = 'whole' | 'half' | 'quarter' | 'eighth' | '16th' | '32nd' | '64th';
type Clef = 'treble' | 'bass' | 'bass3' | 'alto' | 'tenor' | 'soprano' | 'mezzosoprano' | 'frenchViolin';

const DEFAULT_CLEF: Clef = 'treble'; // Always — never change without explicit user action
```

The `Note` interface is the single source of truth. It contains both `name` (English: C/D/E) and `solfege` (French: Do/Ré/Mi). Always display French names in the UI.

## Database (Supabase)

| Table | Key columns | Purpose |
|-------|-------------|---------|
| users | id, email, level, instrument | User profiles |
| scores | id, user_id, data (JSONB), source_file_path | Sheet music — `data` = serialized `Score` JSON |
| exercises | id, type, level, config (JSONB), score_id | Exercises |
| progress | id, user_id, exercise_id, result, score | Progress history |
| badges | id, user_id, badge_type | Achievement system |
| lessons | id, title, level, content (JSONB), order | Lesson content |

**Storage rule:** `scores.data` (JSONB) = app's working copy. `score-sources` bucket = original imported file, read-only, never modified.

## Music Library (lib/music/) — Pure Functions

All functions in `lib/music/` must be **pure** (no side effects), independently testable with Vitest.

Key functions:
- `noteToMidi(note, octave)` → MIDI number 0-127
- `midiToFrequency(midi)` → Hz (A4 = 440 Hz)
- `noteToSolfege(name, accidental)` → French name (e.g. "Do dièse", "Mi bémol")
- `calculateInterval(note1, note2)` → interval name in French
- `buildScale(root, mode)` → note array
- `buildChord(root, quality)` → note array
- `getKeySignature(key)` → accidentals array
- `getRhythmicValue(duration)` → beat value (quarter=1, half=2, whole=4)
- `transposeNote(note, semitones)` → transposed note
- `quantizeRhythm(noteEvents)` → quantized note events

## UI/UX Rules

- **Language**: All user-facing text in French
- **Note names**: French solfège system (Do Ré Mi Fa Sol La Si), never English (C D E F G A B) in the UI (English names can be shown in parentheses optionally)
- **Color coding** (Découverte mode): Do=red, Ré=orange, Mi=yellow, Fa=green, Sol=blue, La=indigo, Si=violet (Boomwhackers / Montessori standard)
- **Progression prompts**: Non-intrusive toast at bottom of screen, never a blocking modal. User can dismiss with ×. Don't show same message within 7 days.
- **"Simplifier l'interface"**: Always available in settings to go back to Découverte mode
- **Once unlocked, always unlocked**: Never revoke a feature once a user has earned it

## Note on Tuplets / Floating Point

When using tuplets (triolets, etc.), `startBeat` must be stored as a rational number (e.g. `{ num: 1, den: 3 }`) or use `Fraction.js` — never use raw floating point (0.333... causes bugs).

## Testing

Unit tests live in `tests/`. Focus on `lib/music/` — pure functions. All music logic (intervals, scales, MIDI conversion, rhythm values) must have test coverage.

```bash
npm run test             # Run all tests
npm run test -- --watch  # Watch mode
```
