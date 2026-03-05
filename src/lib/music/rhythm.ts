// ============================================================
// SolfApp — rhythm — calculs rythmiques
// Fonctions pures, 100% testables
// ============================================================

import type { Duration, TimeSignature, Note } from '@/types/music';
import { DURATION_BEATS, REST_NAMES_FR } from '@/types/music';
import { createRest } from './noteUtils';

// ============================================================
// Calcul des durées
// ============================================================

/**
 * Durée en temps (noire = 1 temps).
 * Avec points : 1 point = ×1.5, 2 points = ×1.75
 */
export function durationInBeats(duration: Duration, dots = 0): number {
  const base = DURATION_BEATS[duration];
  if (dots === 0) return base;
  if (dots === 1) return base * 1.5;
  if (dots === 2) return base * 1.75;
  return base;
}

/**
 * Durée totale d'une mesure en temps.
 */
export function measureDuration(ts: TimeSignature): number {
  // numerator temps, chacun valant 1/denominator de ronde (4 temps)
  return (ts.numerator * 4) / ts.denominator;
}

/**
 * Vérifie si une liste de notes remplit exactement une mesure.
 */
export function isMeasureFull(notes: Note[], ts: TimeSignature): boolean {
  const total = notes.reduce((acc, n) => acc + durationInBeats(n.duration, n.dots), 0);
  return Math.abs(total - measureDuration(ts)) < 0.001;
}

/**
 * Calcule le temps restant dans une mesure.
 */
export function remainingBeats(notes: Note[], ts: TimeSignature): number {
  const used = notes.reduce((acc, n) => acc + durationInBeats(n.duration, n.dots), 0);
  return Math.max(0, measureDuration(ts) - used);
}

// ============================================================
// Silences de remplissage
// ============================================================

/**
 * Retourne la liste des durées nécessaires pour remplir `beats` temps.
 * Algorithme glouton — plus grande durée possible d'abord.
 * Priorité : sans point > pointée > doublement pointée.
 */
export function beatsToRestDurations(beats: number): Array<{ duration: Duration; dots: number }> {
  const result: Array<{ duration: Duration; dots: number }> = [];
  const durations: Duration[] = ['whole', 'half', 'quarter', 'eighth', '16th', '32nd', '64th'];

  // Construire toutes les options triées du plus grand au plus petit
  // On préfère sans point pour simplifier la lecture
  const options: Array<{ duration: Duration; dots: number; beats: number }> = [];
  for (const dur of durations) {
    options.push({ duration: dur, dots: 0, beats: durationInBeats(dur, 0) });
    options.push({ duration: dur, dots: 1, beats: durationInBeats(dur, 1) });
    options.push({ duration: dur, dots: 2, beats: durationInBeats(dur, 2) });
  }
  options.sort((a, b) => b.beats - a.beats);

  let remaining = Math.round(beats * 10000) / 10000;
  let safety = 0;

  while (remaining > 0.001 && safety++ < 128) {
    let found = false;
    for (const opt of options) {
      if (opt.beats <= remaining + 0.0001) {
        result.push({ duration: opt.duration, dots: opt.dots });
        remaining = Math.round((remaining - opt.beats) * 10000) / 10000;
        found = true;
        break;
      }
    }
    if (!found) break;
  }

  return result;
}

/**
 * Remplit une mesure avec des silences pour atteindre la durée totale.
 */
export function fillMeasureWithRests(notes: Note[], ts: TimeSignature): Note[] {
  const remaining = remainingBeats(notes, ts);
  if (remaining < 0.001) return [];

  let currentBeat = notes.reduce((acc, n) => acc + durationInBeats(n.duration, n.dots), 0);
  const restDurations = beatsToRestDurations(remaining);

  return restDurations.map(({ duration, dots }) => {
    const rest = createRest(duration, { dots, startBeat: currentBeat });
    currentBeat += durationInBeats(duration, dots);
    return rest;
  });
}

// ============================================================
// Ligatures (beaming)
// ============================================================

/**
 * Détermine si une note doit être liée par ligature (croche ou plus courte).
 */
export function shouldBeam(duration: Duration): boolean {
  const beamed: Duration[] = ['eighth', '16th', '32nd', '64th'];
  return beamed.includes(duration);
}

/**
 * Groupe les notes en groupes de ligature selon la mesure.
 * Règle standard : grouper par temps dans une mesure simple.
 */
export function groupNotesForBeaming(notes: Note[], ts: TimeSignature): Note[][] {
  const groups: Note[][] = [];
  let currentGroup: Note[] = [];

  const beatUnit = 4 / ts.denominator; // durée d'un temps en "noires"

  for (const note of notes) {
    if (!shouldBeam(note.duration)) {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      }
      groups.push([note]);
    } else {
      currentGroup.push(note);
      // Si on franchit un temps, on coupe le groupe
      const endBeat = note.startBeat + durationInBeats(note.duration, note.dots);
      if (Math.floor(endBeat / beatUnit) > Math.floor(note.startBeat / beatUnit)) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

// ============================================================
// Validation rythmique
// ============================================================

/**
 * Vérifie si une durée est valide dans un contexte de mesure.
 */
export function isDurationValidInMeasure(
  duration: Duration,
  dots: number,
  currentBeat: number,
  ts: TimeSignature
): boolean {
  const noteDuration = durationInBeats(duration, dots);
  const measureTotal = measureDuration(ts);
  return currentBeat + noteDuration <= measureTotal + 0.001;
}

/**
 * Vérifie si une mesure est bien formée (pas de chevauchement, pas de trous).
 */
export function validateMeasure(notes: Note[], ts: TimeSignature): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const total = measureDuration(ts);
  let expectedBeat = 0;

  for (const note of notes) {
    if (Math.abs(note.startBeat - expectedBeat) > 0.001) {
      errors.push(`Note ${note.id}: startBeat attendu ${expectedBeat}, trouvé ${note.startBeat}`);
    }
    expectedBeat += durationInBeats(note.duration, note.dots);
  }

  if (expectedBeat > total + 0.001) {
    errors.push(`Mesure trop pleine: ${expectedBeat} temps pour ${total} attendus`);
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================
// Upbeat / Anacrouse
// ============================================================

/**
 * Détermine si la première mesure est une anacrouse (incomplète).
 */
export function isUpbeat(notes: Note[], ts: TimeSignature): boolean {
  const used = notes.reduce((acc, n) => acc + durationInBeats(n.duration, n.dots), 0);
  return used < measureDuration(ts) - 0.001;
}

// ============================================================
// Nom des silences (ré-export pour commodité)
// ============================================================
export { REST_NAMES_FR };

/**
 * Retourne le nom français d'un silence selon sa durée.
 */
export function getRestNameFR(duration: Duration): string {
  return REST_NAMES_FR[duration];
}
