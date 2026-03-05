// ============================================================
// SolfApp — intervals — nomenclature française des intervalles
// Fonctions pures, 100% testables
// ============================================================

import type { Note, NoteName, Interval, IntervalQuality } from '@/types/music';
import { CHROMATIC_INDEX, DIATONIC_NOTES } from './noteUtils';

// ============================================================
// Tables d'intervalles
// ============================================================

/** Nombre de demi-tons pour chaque degré diatonique (dans une gamme majeure) */
const DIATONIC_SEMITONES = [0, 2, 4, 5, 7, 9, 11, 12];

/** Qualités par défaut pour chaque degré (dans une gamme majeure) */
const DEFAULT_QUALITIES: Record<number, IntervalQuality> = {
  1: 'juste',
  2: 'majeur',
  3: 'majeur',
  4: 'juste',
  5: 'juste',
  6: 'majeur',
  7: 'majeur',
  8: 'juste',
};

/** Labels français des intervalles */
const INTERVAL_DEGREE_NAMES: Record<number, string> = {
  1: 'unisson',
  2: 'seconde',
  3: 'tierce',
  4: 'quarte',
  5: 'quinte',
  6: 'sixte',
  7: 'septième',
  8: 'octave',
  9: 'neuvième',
  10: 'dixième',
  11: 'onzième',
  12: 'douzième',
  13: 'treizième',
};

/** Genre grammatical — féminin pour accord en -e des qualités */
const INTERVAL_DEGREE_FEMININE: Record<number, boolean> = {
  1: false, // unisson (m)
  2: true,  // seconde (f)
  3: true,  // tierce (f)
  4: true,  // quarte (f)
  5: true,  // quinte (f)
  6: true,  // sixte (f)
  7: true,  // septième (f)
  8: true,  // octave (f)
  9: true,  // neuvième (f)
  10: true, // dixième (f)
  11: true, // onzième (f)
  12: true, // douzième (f)
  13: true, // treizième (f)
};

// ============================================================
// Calcul d'intervalles
// ============================================================

/**
 * Calcule le degré diatonique entre deux notes.
 * Ex. : C→E = tierce (3), C→G = quinte (5)
 */
export function diatonicDegree(fromName: NoteName, toName: NoteName): number {
  const fromIdx = DIATONIC_NOTES.indexOf(fromName);
  const toIdx = DIATONIC_NOTES.indexOf(toName);
  const diff = (toIdx - fromIdx + 7) % 7;
  return diff + 1; // 1 = unisson, 2 = seconde, etc.
}

/**
 * Calcule l'intervalle en demi-tons entre deux MIDI.
 */
export function semitoneDifference(midiA: number, midiB: number): number {
  return Math.abs(midiB - midiA);
}

/**
 * Retourne la qualité d'un intervalle à partir du degré et du nombre de demi-tons.
 */
export function getIntervalQuality(degree: number, semitones: number): IntervalQuality {
  const normalizedDegree = ((degree - 1) % 7) + 1;
  const expected = DIATONIC_SEMITONES[normalizedDegree - 1];
  const diff = semitones % 12 - expected;

  const defaultQuality = DEFAULT_QUALITIES[normalizedDegree];
  const isPerfect = defaultQuality === 'juste';

  if (diff === 0) return defaultQuality;
  if (isPerfect) {
    if (diff === 1) return 'augmenté';
    if (diff === 2) return 'doublement augmenté';
    if (diff === -1) return 'diminué';
    if (diff === -2) return 'doublement diminué';
  } else {
    if (diff === 1) return 'augmenté';
    if (diff === 2) return 'doublement augmenté';
    if (diff === -1) return 'mineur';
    if (diff === -2) return 'diminué';
    if (diff === -3) return 'doublement diminué';
  }
  return defaultQuality;
}

/**
 * Calcule l'intervalle complet entre deux notes.
 */
export function calculateInterval(noteA: Note, noteB: Note): Interval {
  const semitones = semitoneDifference(noteA.midiPitch, noteB.midiPitch);
  const octaveDiff = Math.floor(semitones / 12);
  const semitonesMod = semitones % 12;

  const degree = diatonicDegree(noteA.name, noteB.name) + octaveDiff * 7;
  const quality = getIntervalQuality(degree, semitonesMod);

  return {
    semitones,
    degree,
    quality,
    nameFR: getIntervalNameFR(degree, quality),
  };
}

/**
 * Accorde la qualité en genre selon le nom de l'intervalle.
 * tierce majeure (féminin) vs unisson majeur (masculin)
 */
function agreeFR(quality: IntervalQuality, isFeminine: boolean): string {
  if (!isFeminine) return quality;
  // Ajouter -e pour le féminin sur les qualités concernées
  switch (quality) {
    case 'majeur': return 'majeure';
    case 'mineur': return 'mineure';
    case 'augmenté': return 'augmentée';
    case 'diminué': return 'diminuée';
    case 'doublement augmenté': return 'doublement augmentée';
    case 'doublement diminué': return 'doublement diminuée';
    default: return quality; // 'juste' est invariable
  }
}

/**
 * Retourne le nom français complet d'un intervalle avec accord grammatical.
 * Ex. : degree=3, quality='majeur' → "tierce majeure"
 */
export function getIntervalNameFR(degree: number, quality: IntervalQuality): string {
  const normalizedDegree = ((degree - 1) % 7) + 1;
  const degreeName = INTERVAL_DEGREE_NAMES[degree] ?? `${degree}e`;
  const isFeminine = INTERVAL_DEGREE_FEMININE[normalizedDegree] ?? true;
  return `${degreeName} ${agreeFR(quality, isFeminine)}`;
}

// ============================================================
// Inversion d'intervalle
// ============================================================

/**
 * Retourne l'inversion d'un intervalle (règle des 9).
 * Ex. : tierce → sixte, quarte → quinte
 */
export function invertInterval(interval: Interval): Interval {
  const invertedDegree = 9 - interval.degree;
  const invertedSemitones = 12 - interval.semitones;

  const qualityInversion: Record<IntervalQuality, IntervalQuality> = {
    'juste': 'juste',
    'majeur': 'mineur',
    'mineur': 'majeur',
    'augmenté': 'diminué',
    'diminué': 'augmenté',
    'doublement augmenté': 'doublement diminué',
    'doublement diminué': 'doublement augmenté',
  };

  const invertedQuality = qualityInversion[interval.quality];

  return {
    semitones: invertedSemitones,
    degree: invertedDegree,
    quality: invertedQuality,
    nameFR: getIntervalNameFR(invertedDegree, invertedQuality),
  };
}

// ============================================================
// Intervalles nommés
// ============================================================

/** Intervalles en demi-tons → description */
export const NAMED_INTERVALS: Record<number, string> = {
  0: 'Unisson juste',
  1: 'Seconde mineure (demi-ton)',
  2: 'Seconde majeure (ton)',
  3: 'Tierce mineure',
  4: 'Tierce majeure',
  5: 'Quarte juste',
  6: 'Triton (quarte augmentée / quinte diminuée)',
  7: 'Quinte juste',
  8: 'Sixte mineure',
  9: 'Sixte majeure',
  10: 'Septième mineure',
  11: 'Septième majeure',
  12: 'Octave juste',
};

/**
 * Détermine si un intervalle est un triton.
 * Le triton peut s'écrire quarte augmentée OU quinte diminuée.
 */
export function isTritone(interval: Interval): boolean {
  return interval.semitones % 12 === 6;
}

// ============================================================
// Construction d'intervalles depuis une note
// ============================================================

/**
 * Retourne le nombre de demi-tons attendu pour un intervalle
 * diatonique dans une gamme majeure.
 */
export function getSemitonesForDiatonicInterval(degree: number): number {
  return DIATONIC_SEMITONES[(degree - 1) % 7] + Math.floor((degree - 1) / 7) * 12;
}

/**
 * Identifie l'intervalle depuis son nombre de demi-tons (0-12).
 * 12 demi-tons = Octave juste (et non unisson).
 */
export function identifyInterval(semitones: number): string {
  // Chercher d'abord la valeur exacte (gère 12 = octave avant mod)
  if (NAMED_INTERVALS[semitones] !== undefined) {
    return NAMED_INTERVALS[semitones];
  }
  const mod12 = semitones % 12;
  return NAMED_INTERVALS[mod12] ?? `Intervalle de ${semitones} demi-tons`;
}

// ============================================================
// Export de la table complète des altérations
// ============================================================

export const CHROMATIC_INDEX_EXPORT = CHROMATIC_INDEX;
