// ============================================================
// SolfApp — Système de niveaux progressifs
// Progressive Disclosure — Feature Flags par niveau
// ============================================================

import type { Duration, Clef, NoteName, Accidental } from './music';

export type AppLevel = 'decouverte' | 'apprentissage' | 'pratique' | 'avance';

export type ExerciseType =
  | 'note-identification'
  | 'interval'
  | 'rhythm'
  | 'scale-degrees'
  | 'dictation'
  | 'sight-reading';

export interface FeatureFlags {
  notes: NoteName[];
  accidentals: Accidental[];
  durations: Duration[];
  clefs: Clef[];
  defaultClef: Clef;
  showGrandStaff: boolean;
  keySignatures: string[];
  showRestNames: boolean;
  colorCoding: boolean;
  noteLabels: boolean;
  importEnabled: boolean;
  exercises: ExerciseType[];
  showIntervals: boolean;
  showScaleDegrees: boolean;
  showChords: boolean;
  showOrnaments: boolean;
  showDynamics: boolean;
  showArticulations: boolean;
  maxSharpsFlats: number;   // max armure en dièses/bémols
  tuplets: boolean;
}

export const FEATURES: Record<AppLevel, FeatureFlags> = {
  decouverte: {
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    accidentals: [],
    durations: ['whole', 'half', 'quarter', 'eighth'],
    clefs: ['treble'],
    defaultClef: 'treble',
    showGrandStaff: false,   // true si instrument = 'keyboard'
    keySignatures: ['C'],
    showRestNames: false,
    colorCoding: true,
    noteLabels: true,
    importEnabled: false,
    exercises: ['note-identification'],
    showIntervals: false,
    showScaleDegrees: false,
    showChords: false,
    showOrnaments: false,
    showDynamics: false,
    showArticulations: false,
    maxSharpsFlats: 0,
    tuplets: false,
  },
  apprentissage: {
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    accidentals: ['#', 'b', 'n'],
    durations: ['whole', 'half', 'quarter', 'eighth', '16th'],
    // NOTE: '32nd' triple croche = niveau Pratique — PAS Apprentissage
    clefs: ['treble', 'bass'],
    defaultClef: 'treble',
    showGrandStaff: false,
    keySignatures: ['C', 'G', 'D', 'F', 'Bb'],
    showRestNames: true,
    colorCoding: false,
    noteLabels: false,
    importEnabled: false,
    exercises: ['note-identification', 'interval', 'rhythm', 'scale-degrees'],
    showIntervals: true,
    showScaleDegrees: true,
    showChords: false,
    showOrnaments: false,
    showDynamics: true,
    showArticulations: true,
    maxSharpsFlats: 2,
    tuplets: false,
  },
  pratique: {
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    accidentals: ['#', 'b', 'n', '##', 'bb'],
    durations: ['whole', 'half', 'quarter', 'eighth', '16th', '32nd'],
    clefs: ['treble', 'bass', 'alto', 'tenor'],
    defaultClef: 'treble',
    showGrandStaff: true,
    keySignatures: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'],
    showRestNames: true,
    colorCoding: false,
    noteLabels: false,
    importEnabled: true,   // Import activé ICI — pas avant
    exercises: ['note-identification', 'interval', 'rhythm', 'scale-degrees', 'dictation'],
    showIntervals: true,
    showScaleDegrees: true,
    showChords: true,
    showOrnaments: true,
    showDynamics: true,
    showArticulations: true,
    maxSharpsFlats: 6,
    tuplets: true,
  },
  avance: {
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    accidentals: ['#', 'b', 'n', '##', 'bb'],
    durations: ['whole', 'half', 'quarter', 'eighth', '16th', '32nd', '64th'],
    clefs: ['treble', 'bass', 'alto', 'tenor', 'soprano', 'mezzosoprano', 'bass3', 'frenchViolin'],
    defaultClef: 'treble',
    showGrandStaff: true,
    keySignatures: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'],
    showRestNames: true,
    colorCoding: false,
    noteLabels: false,
    importEnabled: true,
    exercises: ['note-identification', 'interval', 'rhythm', 'scale-degrees', 'dictation', 'sight-reading'],
    showIntervals: true,
    showScaleDegrees: true,
    showChords: true,
    showOrnaments: true,
    showDynamics: true,
    showArticulations: true,
    maxSharpsFlats: 7,
    tuplets: true,
  },
};

export const LEVEL_LABELS: Record<AppLevel, string> = {
  decouverte: 'Découverte',
  apprentissage: 'Apprentissage',
  pratique: 'Pratique',
  avance: 'Avancé',
};

export const LEVEL_DESCRIPTIONS: Record<AppLevel, string> = {
  decouverte: 'Première approche — Les 7 notes et les durées simples',
  apprentissage: 'Altérations, armures et exercices d\'intervalles',
  pratique: 'Clé de Fa, import de partitions et polyphonie',
  avance: 'Toutes les clés, ornements, n-olets et lecture à vue',
};

// Points requis pour chaque niveau
export const LEVEL_THRESHOLDS: Record<AppLevel, number> = {
  decouverte: 0,
  apprentissage: 100,
  pratique: 500,
  avance: 2000,
};

// Niveau suivant
export const NEXT_LEVEL: Partial<Record<AppLevel, AppLevel>> = {
  decouverte: 'apprentissage',
  apprentissage: 'pratique',
  pratique: 'avance',
};
