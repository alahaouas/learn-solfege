// ============================================================
// SolfApp — noteUtils — fonctions pures sur les notes
// 100% testables, sans effets de bord
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import type {
  Note,
  NoteName,
  Accidental,
  Duration,
  Clef,
} from '@/types/music';
import {
  NOTE_NAMES_FR,
  REST_NAMES_FR,
  DURATION_BEATS,
  DEFAULT_CLEF,
} from '@/types/music';

// ============================================================
// Tables de correspondance
// ============================================================

/** Séquence chromatique — C = 0 */
export const CHROMATIC_INDEX: Record<NoteName, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

/** Ordre des notes diatoniques */
export const DIATONIC_NOTES: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const ACCIDENTAL_SEMITONES: Record<NonNullable<Accidental>, number> = {
  '#': 1,
  '##': 2,
  b: -1,
  bb: -2,
  n: 0,
};

/** Labels français des altérations */
export const ACCIDENTAL_LABELS_FR: Record<NonNullable<Accidental>, string> = {
  '#': 'dièse',
  '##': 'double dièse',
  b: 'bémol',
  bb: 'double bémol',
  n: 'naturel',
};

/** Symboles unicode des altérations */
export const ACCIDENTAL_SYMBOLS: Record<NonNullable<Accidental>, string> = {
  '#': '♯',
  '##': '𝄪',
  b: '♭',
  bb: '𝄫',
  n: '♮',
};

// ============================================================
// Calcul MIDI
// ============================================================

/**
 * Calcule le numéro MIDI d'une note.
 * MIDI 60 = Do4 = C4 = 261.63 Hz
 */
export function noteToMidi(name: NoteName, octave: number, accidental: Accidental = null): number {
  const base = CHROMATIC_INDEX[name];
  const acc = accidental ? ACCIDENTAL_SEMITONES[accidental] : 0;
  // C4 = MIDI 60 → (octave + 1) * 12 + chroma
  return (octave + 1) * 12 + base + acc;
}

/**
 * Calcule la fréquence en Hz à partir du numéro MIDI.
 * A4 = MIDI 69 = 440 Hz
 */
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Fréquence directe depuis nom + octave + altération.
 */
export function noteToFrequency(name: NoteName, octave: number, accidental: Accidental = null): number {
  return midiToFrequency(noteToMidi(name, octave, accidental));
}

// ============================================================
// Labels français
// ============================================================

/**
 * Nom solfège complet avec altération en français.
 * Ex. : D, '#' → "Ré dièse"
 */
export function getSolfegeLabel(name: NoteName, accidental: Accidental): string {
  const solfege = NOTE_NAMES_FR[name];
  if (!accidental || accidental === 'n') return solfege;
  return `${solfege} ${ACCIDENTAL_LABELS_FR[accidental]}`;
}

/**
 * Symbole unicode de l'altération.
 */
export function getAccidentalSymbol(accidental: Accidental): string {
  if (!accidental) return '';
  return ACCIDENTAL_SYMBOLS[accidental] ?? '';
}

/**
 * Tooltip complet pour le survol d'une note.
 * Format : "Ré♯4 — Croche"
 */
export function getNoteTooltip(note: Note): string {
  const solfege = NOTE_NAMES_FR[note.name];
  const accSym = getAccidentalSymbol(note.accidental);
  const durLabel = getDurationLabel(note.duration, note.dots);
  let tooltip = `${solfege}${accSym}${note.octave} — ${durLabel}`;
  if (note.tuplet) {
    tooltip += ` (triolet)`;
  }
  return tooltip;
}

// ============================================================
// Durées et rythme
// ============================================================

/**
 * Durée en temps (noire = 1 temps) avec prise en compte des points.
 */
export function durationToBeats(duration: Duration, dots = 0): number {
  const base = DURATION_BEATS[duration];
  if (dots === 0) return base;
  if (dots === 1) return base * 1.5;
  if (dots === 2) return base * 1.75;
  return base;
}

/**
 * Label français de la durée (avec point(s) éventuels).
 * Ex. : 'quarter', 1 → "Noire pointée"
 */
export function getDurationLabel(duration: Duration, dots = 0): string {
  const labels: Record<Duration, string> = {
    whole: 'Ronde',
    half: 'Blanche',
    quarter: 'Noire',
    eighth: 'Croche',
    '16th': 'Double croche',
    '32nd': 'Triple croche',
    '64th': 'Quadruple croche',
  };
  const base = labels[duration];
  if (dots === 1) return `${base} pointée`;
  if (dots === 2) return `${base} doublement pointée`;
  return base;
}

/**
 * Nom français du silence.
 */
export function getRestName(duration: Duration): string {
  return REST_NAMES_FR[duration];
}

// ============================================================
// Construction de notes
// ============================================================

/**
 * Crée un objet Note complet avec tous les champs calculés.
 */
export function createNote(
  name: NoteName,
  octave: number,
  duration: Duration,
  options: {
    accidental?: Accidental;
    dots?: number;
    startBeat?: number;
    chord?: boolean;
    clef?: Clef;
  } = {}
): Note {
  const {
    accidental = null,
    dots = 0,
    startBeat = 0,
    chord = false,
    clef: _clef = DEFAULT_CLEF,
  } = options;

  const midiPitch = noteToMidi(name, octave, accidental);
  const frequency = midiToFrequency(midiPitch);
  const solfege = NOTE_NAMES_FR[name];
  const solfegeLabel = getSolfegeLabel(name, accidental);

  return {
    id: uuidv4(),
    name,
    solfege,
    solfegeLabel,
    octave,
    duration,
    accidental,
    dots,
    midiPitch,
    frequency,
    startBeat,
    tie: null,
    chord,
    isRest: false,
  };
}

/**
 * Crée un silence.
 */
export function createRest(
  duration: Duration,
  options: { dots?: number; startBeat?: number } = {}
): Note {
  const { dots = 0, startBeat = 0 } = options;
  return {
    id: uuidv4(),
    name: 'C',
    solfege: 'Do',
    solfegeLabel: getRestName(duration),
    octave: 4,
    duration,
    accidental: null,
    dots,
    midiPitch: 0,
    frequency: 0,
    startBeat,
    tie: null,
    chord: false,
    isRest: true,
    restName: getRestName(duration),
  };
}

// ============================================================
// Validation
// ============================================================

/**
 * Vérifie si une note est dans la plage MIDI valide (0–127).
 */
export function isValidMidiRange(midi: number): boolean {
  return midi >= 0 && midi <= 127;
}

/**
 * Vérifie si un nom de note est valide.
 */
export function isValidNoteName(name: string): name is NoteName {
  return DIATONIC_NOTES.includes(name as NoteName);
}

/**
 * Vérifie si une altération est valide.
 */
export function isValidAccidental(acc: string | null): acc is Accidental {
  if (acc === null) return true;
  return ['#', '##', 'b', 'bb', 'n'].includes(acc);
}

// ============================================================
// Comparaison et tri
// ============================================================

/**
 * Compare deux notes par hauteur (MIDI).
 * Retourne < 0 si a < b, 0 si égal, > 0 si a > b.
 */
export function compareNotesByPitch(a: Note, b: Note): number {
  return a.midiPitch - b.midiPitch;
}

/**
 * Compare deux notes par position dans la mesure.
 */
export function compareNotesByBeat(a: Note, b: Note): number {
  return a.startBeat - b.startBeat;
}

// ============================================================
// Enharmonie
// ============================================================

/**
 * Retourne le nom enharmonique équivalent.
 * Ex. : C# ↔ Db, F# ↔ Gb
 */
export function getEnharmonicEquivalent(
  name: NoteName,
  accidental: Accidental
): { name: NoteName; accidental: Accidental } | null {
  const enharmonics: Array<[NoteName, Accidental, NoteName, Accidental]> = [
    ['C', '#', 'D', 'b'],
    ['D', '#', 'E', 'b'],
    ['E', null, 'F', 'b'],
    ['F', null, 'E', '#'],
    ['F', '#', 'G', 'b'],
    ['G', '#', 'A', 'b'],
    ['A', '#', 'B', 'b'],
    ['B', null, 'C', 'b'],
  ];

  for (const [n1, a1, n2, a2] of enharmonics) {
    if (n1 === name && a1 === accidental) return { name: n2, accidental: a2 };
    if (n2 === name && a2 === accidental) return { name: n1, accidental: a1 };
  }
  return null;
}

// ============================================================
// Clé de sol — tessiture standard
// ============================================================

/** Tessiture par clé — notes affichées sur la portée (C4 = Do4) */
export const CLEF_RANGES: Record<Clef, { min: number; max: number; label: string }> = {
  treble: { min: noteToMidi('E', 4), max: noteToMidi('F', 6), label: 'Clé de Sol' },
  bass: { min: noteToMidi('G', 2), max: noteToMidi('A', 4), label: 'Clé de Fa' },
  alto: { min: noteToMidi('C', 3), max: noteToMidi('D', 5), label: 'Clé de Ut (Alto)' },
  tenor: { min: noteToMidi('D', 3), max: noteToMidi('E', 5), label: 'Clé de Ut (Ténor)' },
  soprano: { min: noteToMidi('B', 3), max: noteToMidi('C', 6), label: 'Clé de Ut (Soprano)' },
  mezzosoprano: { min: noteToMidi('A', 3), max: noteToMidi('B', 5), label: 'Clé de Ut (Mezzo-soprano)' },
  bass3: { min: noteToMidi('F', 2), max: noteToMidi('G', 4), label: 'Clé de Fa (3e ligne)' },
  frenchViolin: { min: noteToMidi('G', 4), max: noteToMidi('A', 6), label: 'Clé de Sol (Violon FR)' },
};

/** Retourne la clé recommandée pour une note donnée.
 * C4 (MIDI 60) et au-dessus → clé de Sol (treble).
 * Seuil = C4 pour couvrir la zone centrale de la portée. */
export function recommendClef(midiPitch: number): Clef {
  const C4 = noteToMidi('C', 4); // MIDI 60
  if (midiPitch >= C4) return 'treble';
  if (midiPitch >= CLEF_RANGES.alto.min) return 'alto';
  return 'bass';
}
