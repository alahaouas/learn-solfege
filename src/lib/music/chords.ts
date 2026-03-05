// ============================================================
// SolfApp — chords — accords et harmonie
// Fonctions pures, 100% testables
// ============================================================

import type { NoteName, Accidental } from '@/types/music';
import { SCALE_INTERVALS } from './scales';

// ============================================================
// Types
// ============================================================

export type ChordQuality =
  | 'major'
  | 'minor'
  | 'diminished'
  | 'augmented'
  | 'dominant7'
  | 'major7'
  | 'minor7'
  | 'diminished7'
  | 'half_diminished7'
  | 'suspended2'
  | 'suspended4'
  | 'major6'
  | 'minor6'
  | 'add9';

export interface ChordNote {
  name: NoteName;
  accidental: Accidental;
  interval: string;
}

export interface Chord {
  root: NoteName;
  rootAccidental: Accidental;
  quality: ChordQuality;
  notes: ChordNote[];
  nameFR: string;
  nameSymbol: string;   // Ex. "Cm", "G7", "Bdim"
}

// ============================================================
// Intervalles des accords (en demi-tons depuis la fondamentale)
// ============================================================

const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  dominant7: [0, 4, 7, 10],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  diminished7: [0, 3, 6, 9],
  half_diminished7: [0, 3, 6, 10],
  suspended2: [0, 2, 7],
  suspended4: [0, 5, 7],
  major6: [0, 4, 7, 9],
  minor6: [0, 3, 7, 9],
  add9: [0, 4, 7, 14],
};

const CHORD_NAMES_FR: Record<ChordQuality, string> = {
  major: 'Accord parfait majeur',
  minor: 'Accord parfait mineur',
  diminished: 'Accord diminué',
  augmented: 'Accord augmenté',
  dominant7: 'Accord de septième de dominante',
  major7: 'Accord de septième majeure',
  minor7: 'Accord de septième mineure',
  diminished7: 'Accord de septième diminuée',
  half_diminished7: 'Accord de septième demi-diminuée',
  suspended2: 'Accord suspendu (sus2)',
  suspended4: 'Accord suspendu (sus4)',
  major6: 'Accord de sixte majeure',
  minor6: 'Accord de sixte mineure',
  add9: 'Accord ajouté (add9)',
};

const CHORD_SYMBOLS: Record<ChordQuality, string> = {
  major: '',
  minor: 'm',
  diminished: 'dim',
  augmented: 'aug',
  dominant7: '7',
  major7: 'maj7',
  minor7: 'm7',
  diminished7: 'dim7',
  half_diminished7: 'ø7',
  suspended2: 'sus2',
  suspended4: 'sus4',
  major6: '6',
  minor6: 'm6',
  add9: 'add9',
};

// ============================================================
// Mapping chromatique
// ============================================================

const CHROMATIC_BASE: Record<NoteName, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

function noteToChromatic(name: NoteName, acc: Accidental): number {
  const base = CHROMATIC_BASE[name];
  const delta = acc === '#' ? 1 : acc === '##' ? 2 : acc === 'b' ? -1 : acc === 'bb' ? -2 : 0;
  return (base + delta + 12) % 12;
}

const CHROMATIC_TO_NOTE_SHARP: Array<[NoteName, Accidental]> = [
  ['C', null], ['C', '#'], ['D', null], ['D', '#'], ['E', null],
  ['F', null], ['F', '#'], ['G', null], ['G', '#'], ['A', null],
  ['A', '#'], ['B', null],
];

const CHROMATIC_TO_NOTE_FLAT: Array<[NoteName, Accidental]> = [
  ['C', null], ['D', 'b'], ['D', null], ['E', 'b'], ['E', null],
  ['F', null], ['G', 'b'], ['G', null], ['A', 'b'], ['A', null],
  ['B', 'b'], ['B', null],
];

// ============================================================
// Construction d'accords
// ============================================================

const NOTE_SOLFEGE: Record<NoteName, string> = {
  C: 'Do', D: 'Ré', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si',
};

/**
 * Construit un accord à partir de la fondamentale et de la qualité.
 */
export function buildChord(
  root: NoteName,
  rootAccidental: Accidental,
  quality: ChordQuality,
  preferSharps = true
): Chord {
  const intervals = CHORD_INTERVALS[quality];
  const rootChromatic = noteToChromatic(root, rootAccidental);
  const chromaticMap = preferSharps ? CHROMATIC_TO_NOTE_SHARP : CHROMATIC_TO_NOTE_FLAT;

  const INTERVAL_NAMES = ['Fondamentale', 'Tierce', 'Quinte', 'Septième', 'Neuvième'];

  const notes: ChordNote[] = intervals.map((semitones, i) => {
    const chroma = (rootChromatic + semitones) % 12;
    const [name, accidental] = chromaticMap[chroma];
    return {
      name,
      accidental,
      interval: INTERVAL_NAMES[i] ?? `Intervalle ${i + 1}`,
    };
  });

  const rootSolfege = NOTE_SOLFEGE[root];
  const accSuffix = rootAccidental === '#' ? '♯' : rootAccidental === 'b' ? '♭' : '';
  const symbol = CHORD_SYMBOLS[quality];

  return {
    root,
    rootAccidental,
    quality,
    notes,
    nameFR: `${rootSolfege}${accSuffix} — ${CHORD_NAMES_FR[quality]}`,
    nameSymbol: `${root}${rootAccidental === '#' ? '#' : rootAccidental === 'b' ? 'b' : ''}${symbol}`,
  };
}

// ============================================================
// Accords diatoniques d'une gamme
// ============================================================

/**
 * Retourne les 7 accords diatoniques d'une gamme majeure.
 */
export function getDiatonicChords(
  root: NoteName,
  rootAccidental: Accidental
): Chord[] {
  // Qualités des accords diatoniques en majeur
  const qualities: ChordQuality[] = [
    'major',         // I
    'minor',         // II
    'minor',         // III
    'major',         // IV
    'major',         // V
    'minor',         // VI
    'diminished',    // VII
  ];

  // Degrés de la gamme majeure (en demi-tons)
  const scaleSemitones = SCALE_INTERVALS.major.slice(0, 7);
  const rootChromatic = noteToChromatic(root, rootAccidental);
  const chromaticMap = CHROMATIC_TO_NOTE_SHARP;

  return scaleSemitones.map((semitones, i) => {
    const chroma = (rootChromatic + semitones) % 12;
    const [noteName, noteAcc] = chromaticMap[chroma];
    return buildChord(noteName, noteAcc, qualities[i]);
  });
}

// ============================================================
// Identification d'un accord depuis ses notes
// ============================================================

/**
 * Essaie d'identifier un accord à partir d'un ensemble de notes MIDI.
 */
export function identifyChord(midiNotes: number[]): string {
  if (midiNotes.length < 3) return 'Intervalle';

  const sorted = [...midiNotes].sort((a, b) => a - b);
  const intervals = sorted.slice(1).map((n, i) => (n - sorted[i]) % 12);

  // Matching simple des triades communes
  const patterns: Record<string, string> = {
    '4,3': 'Accord parfait majeur',
    '3,4': 'Accord parfait mineur',
    '3,3': 'Accord diminué',
    '4,4': 'Accord augmenté',
    '4,3,3': 'Accord de septième de dominante',
    '4,3,4': 'Accord de septième majeure',
    '3,4,3': 'Accord de septième mineure',
  };

  const key = intervals.join(',');
  return patterns[key] ?? 'Accord non identifié';
}

// ============================================================
// Export de la table des noms
// ============================================================
export { CHORD_NAMES_FR, CHORD_SYMBOLS };
