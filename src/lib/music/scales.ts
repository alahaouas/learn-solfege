// ============================================================
// SolfApp — scales — gammes et armures
// Fonctions pures, 100% testables
// ============================================================

import type { NoteName, Accidental } from '@/types/music';
import { DIATONIC_NOTES } from './noteUtils';

// ============================================================
// Types
// ============================================================

export type ScaleType =
  | 'major'
  | 'minor_natural'
  | 'minor_harmonic'
  | 'minor_melodic'
  | 'pentatonic_major'
  | 'pentatonic_minor'
  | 'blues'
  | 'chromatic'
  | 'whole_tone'
  | 'diminished'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'locrian';

export interface ScaleNote {
  name: NoteName;
  accidental: Accidental;
  solfege: string;
  degree: number;
}

export interface Scale {
  root: NoteName;
  rootAccidental: Accidental;
  type: ScaleType;
  notes: ScaleNote[];
  nameFR: string;
}

// ============================================================
// Intervalles des gammes (en demi-tons depuis la tonique)
// ============================================================

export const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11, 12],
  minor_natural: [0, 2, 3, 5, 7, 8, 10, 12],
  minor_harmonic: [0, 2, 3, 5, 7, 8, 11, 12],
  minor_melodic: [0, 2, 3, 5, 7, 9, 11, 12],  // ascendante
  pentatonic_major: [0, 2, 4, 7, 9, 12],
  pentatonic_minor: [0, 3, 5, 7, 10, 12],
  blues: [0, 3, 5, 6, 7, 10, 12],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  whole_tone: [0, 2, 4, 6, 8, 10, 12],
  diminished: [0, 2, 3, 5, 6, 8, 9, 11, 12],
  dorian: [0, 2, 3, 5, 7, 9, 10, 12],
  phrygian: [0, 1, 3, 5, 7, 8, 10, 12],
  lydian: [0, 2, 4, 6, 7, 9, 11, 12],
  mixolydian: [0, 2, 4, 5, 7, 9, 10, 12],
  locrian: [0, 1, 3, 5, 6, 8, 10, 12],
};

export const SCALE_NAMES_FR: Record<ScaleType, string> = {
  major: 'Gamme majeure',
  minor_natural: 'Gamme mineure naturelle',
  minor_harmonic: 'Gamme mineure harmonique',
  minor_melodic: 'Gamme mineure mélodique',
  pentatonic_major: 'Pentatonique majeure',
  pentatonic_minor: 'Pentatonique mineure',
  blues: 'Gamme blues',
  chromatic: 'Gamme chromatique',
  whole_tone: 'Gamme par tons',
  diminished: 'Gamme diminuée',
  dorian: 'Mode dorien',
  phrygian: 'Mode phrygien',
  lydian: 'Mode lydien',
  mixolydian: 'Mode mixolydien',
  locrian: 'Mode locrien',
};

// ============================================================
// Armures — Table complète dièses et bémols
// ============================================================

/** Ordre des dièses */
export const SHARPS_ORDER: Array<[NoteName, '#']> = [
  ['F', '#'], ['C', '#'], ['G', '#'], ['D', '#'],
  ['A', '#'], ['E', '#'], ['B', '#'],
];

/** Ordre des bémols */
export const FLATS_ORDER: Array<[NoteName, 'b']> = [
  ['B', 'b'], ['E', 'b'], ['A', 'b'], ['D', 'b'],
  ['G', 'b'], ['C', 'b'], ['F', 'b'],
];

/** Table des armures */
export const KEY_SIGNATURES: Record<string, { sharps: number; flats: number; relative?: string }> = {
  'C': { sharps: 0, flats: 0, relative: 'Am' },
  'G': { sharps: 1, flats: 0, relative: 'Em' },
  'D': { sharps: 2, flats: 0, relative: 'Bm' },
  'A': { sharps: 3, flats: 0, relative: 'F#m' },
  'E': { sharps: 4, flats: 0, relative: 'C#m' },
  'B': { sharps: 5, flats: 0, relative: 'G#m' },
  'F#': { sharps: 6, flats: 0, relative: 'D#m' },
  'C#': { sharps: 7, flats: 0, relative: 'A#m' },
  'F': { sharps: 0, flats: 1, relative: 'Dm' },
  'Bb': { sharps: 0, flats: 2, relative: 'Gm' },
  'Eb': { sharps: 0, flats: 3, relative: 'Cm' },
  'Ab': { sharps: 0, flats: 4, relative: 'Fm' },
  'Db': { sharps: 0, flats: 5, relative: 'Bbm' },
  'Gb': { sharps: 0, flats: 6, relative: 'Ebm' },
  'Cb': { sharps: 0, flats: 7, relative: 'Abm' },
};

// ============================================================
// Chromatic note mapping (used internally)
// ============================================================

/** Mapping chromatique (C=0) avec altérations préférées en dièses */
const CHROMATIC_TO_NOTE_SHARP: Array<[NoteName, Accidental]> = [
  ['C', null], ['C', '#'], ['D', null], ['D', '#'], ['E', null],
  ['F', null], ['F', '#'], ['G', null], ['G', '#'], ['A', null],
  ['A', '#'], ['B', null],
];

/** Mapping chromatique (C=0) avec altérations préférées en bémols */
const CHROMATIC_TO_NOTE_FLAT: Array<[NoteName, Accidental]> = [
  ['C', null], ['D', 'b'], ['D', null], ['E', 'b'], ['E', null],
  ['F', null], ['G', 'b'], ['G', null], ['A', 'b'], ['A', null],
  ['B', 'b'], ['B', null],
];

/** Index chromatique d'une note (C=0) */
function chromaticIndex(name: NoteName, accidental: Accidental = null): number {
  const base: Record<NoteName, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const acc = accidental === '#' ? 1 : accidental === '##' ? 2
    : accidental === 'b' ? -1 : accidental === 'bb' ? -2 : 0;
  return (base[name] + acc + 12) % 12;
}

// ============================================================
// Génération de gammes
// ============================================================

/**
 * Génère les notes d'une gamme.
 * @param root - Tonique
 * @param rootAccidental - Altération de la tonique
 * @param type - Type de gamme
 * @param preferSharps - Préférer les dièses (défaut: selon la tonalité)
 */
export function buildScale(
  root: NoteName,
  rootAccidental: Accidental,
  type: ScaleType,
  preferSharps?: boolean
): Scale {
  const intervals = SCALE_INTERVALS[type];
  const rootChromatic = chromaticIndex(root, rootAccidental);

  // Détermine si on préfère les dièses ou les bémols
  const key = `${root}${rootAccidental === '#' ? '#' : rootAccidental === 'b' ? 'b' : ''}`;
  const keySig = KEY_SIGNATURES[key];
  const useSharps = preferSharps ?? (keySig ? keySig.sharps > 0 || keySig.flats === 0 : true);

  const chromaticMap = useSharps ? CHROMATIC_TO_NOTE_SHARP : CHROMATIC_TO_NOTE_FLAT;

  const notes: ScaleNote[] = intervals.map((semitones, i) => {
    const chromatic = (rootChromatic + semitones) % 12;
    const [name, accidental] = chromaticMap[chromatic];
    const degree = i + 1;

    // Nom solfège (Do fixe)
    const solfegeNames: Record<NoteName, string> = {
      C: 'Do', D: 'Ré', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si',
    };
    const accSuffix = accidental === '#' ? '♯' : accidental === 'b' ? '♭' : '';
    const solfege = `${solfegeNames[name]}${accSuffix}`;

    return { name, accidental, solfege, degree };
  });

  const rootSolfege: Record<NoteName, string> = {
    C: 'Do', D: 'Ré', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si',
  };
  const rootAcc = rootAccidental === '#' ? '♯' : rootAccidental === 'b' ? '♭' : '';
  const nameFR = `${rootSolfege[root]}${rootAcc} — ${SCALE_NAMES_FR[type]}`;

  return { root, rootAccidental, type, notes, nameFR };
}

// ============================================================
// Gamme relative
// ============================================================

/**
 * Retourne la tonalité relative mineure d'une tonalité majeure.
 * Ex. : C major → A minor
 */
export function getRelativeMinor(majorKey: string): string {
  return KEY_SIGNATURES[majorKey]?.relative ?? 'Am';
}

/**
 * Retourne la tonalité parallèle (même tonique, mode opposé).
 */
export function getParallelMode(key: string, currentType: 'major' | 'minor'): string {
  if (currentType === 'major') {
    // Ex. : C major → C minor
    return `${key}m`;
  }
  return key.replace('m', '');
}

// ============================================================
// Détermination des altérations d'une armure
// ============================================================

/**
 * Retourne les notes altérées pour une armure donnée.
 */
export function getKeySignatureNotes(key: string): Array<[NoteName, '#' | 'b']> {
  const sig = KEY_SIGNATURES[key];
  if (!sig) return [];

  if (sig.sharps > 0) {
    return SHARPS_ORDER.slice(0, sig.sharps);
  }
  if (sig.flats > 0) {
    return FLATS_ORDER.slice(0, sig.flats);
  }
  return [];
}

/**
 * Vérifie si une note est altérée dans une armure donnée.
 */
export function isNoteAlteredInKey(name: NoteName, key: string): boolean {
  const alteredNotes = getKeySignatureNotes(key);
  return alteredNotes.some(([n]) => n === name);
}

// ============================================================
// Degrés de la gamme
// ============================================================

const DEGREE_NAMES_FR = [
  'Tonique',
  'Sus-tonique',
  'Médiante',
  'Sous-dominante',
  'Dominante',
  'Sus-dominante',
  'Sensible',
];

export function getDegreeNameFR(degree: number): string {
  return DEGREE_NAMES_FR[(degree - 1) % 7] ?? `${degree}e degré`;
}

/**
 * Retourne le degré d'une note dans une gamme.
 */
export function getNoteScaleDegree(
  noteName: NoteName,
  noteAccidental: Accidental,
  scale: Scale
): number | null {
  const noteChromatic = chromaticIndex(noteName, noteAccidental);
  const idx = scale.notes.findIndex(
    (n) => chromaticIndex(n.name, n.accidental) === noteChromatic
  );
  return idx >= 0 ? idx + 1 : null;
}

// ============================================================
// Liste des notes diatoniques (re-export)
// ============================================================
export const ALL_NOTES = DIATONIC_NOTES;
