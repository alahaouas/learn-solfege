// ============================================================
// Tests unitaires — intervals
// Couverture requise : 100%
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  diatonicDegree,
  semitoneDifference,
  getIntervalQuality,
  calculateInterval,
  getIntervalNameFR,
  invertInterval,
  isTritone,
  getSemitonesForDiatonicInterval,
  identifyInterval,
  NAMED_INTERVALS,
} from '@/lib/music/intervals';
import { createNote } from '@/lib/music/noteUtils';

// ============================================================
// diatonicDegree
// ============================================================

describe('diatonicDegree', () => {
  it('C→C = unisson (1)', () => expect(diatonicDegree('C', 'C')).toBe(1));
  it('C→D = seconde (2)', () => expect(diatonicDegree('C', 'D')).toBe(2));
  it('C→E = tierce (3)', () => expect(diatonicDegree('C', 'E')).toBe(3));
  it('C→F = quarte (4)', () => expect(diatonicDegree('C', 'F')).toBe(4));
  it('C→G = quinte (5)', () => expect(diatonicDegree('C', 'G')).toBe(5));
  it('C→A = sixte (6)', () => expect(diatonicDegree('C', 'A')).toBe(6));
  it('C→B = septième (7)', () => expect(diatonicDegree('C', 'B')).toBe(7));
  it('D→F = tierce (3)', () => expect(diatonicDegree('D', 'F')).toBe(3));
  it('G→D = quinte (5)', () => expect(diatonicDegree('G', 'D')).toBe(5));
});

// ============================================================
// semitoneDifference
// ============================================================

describe('semitoneDifference', () => {
  it('C4 (60) → G4 (67) = 7 demi-tons', () => {
    expect(semitoneDifference(60, 67)).toBe(7);
  });

  it('C4 → C5 = 12 demi-tons', () => {
    expect(semitoneDifference(60, 72)).toBe(12);
  });

  it('A4 (69) → C4 (60) = 9 demi-tons (valeur absolue)', () => {
    expect(semitoneDifference(69, 60)).toBe(9);
  });

  it('C4 → C4 = 0 demi-tons', () => {
    expect(semitoneDifference(60, 60)).toBe(0);
  });
});

// ============================================================
// getIntervalQuality
// ============================================================

describe('getIntervalQuality', () => {
  it('degré 5, 7 demi-tons → quinte juste', () => {
    expect(getIntervalQuality(5, 7)).toBe('juste');
  });

  it('degré 3, 4 demi-tons → tierce majeure', () => {
    expect(getIntervalQuality(3, 4)).toBe('majeur');
  });

  it('degré 3, 3 demi-tons → tierce mineure', () => {
    expect(getIntervalQuality(3, 3)).toBe('mineur');
  });

  it('degré 5, 6 demi-tons → quinte diminuée', () => {
    expect(getIntervalQuality(5, 6)).toBe('diminué');
  });

  it('degré 5, 8 demi-tons → quinte augmentée', () => {
    expect(getIntervalQuality(5, 8)).toBe('augmenté');
  });

  it('degré 4, 6 demi-tons → quarte augmentée', () => {
    expect(getIntervalQuality(4, 6)).toBe('augmenté');
  });
});

// ============================================================
// getIntervalNameFR
// ============================================================

describe('getIntervalNameFR', () => {
  it('degré 5, juste → "quinte juste"', () => {
    expect(getIntervalNameFR(5, 'juste')).toBe('quinte juste');
  });

  it('degré 3, majeur → "tierce majeure"', () => {
    expect(getIntervalNameFR(3, 'majeur')).toBe('tierce majeure');
  });

  it('degré 3, mineur → "tierce mineure"', () => {
    expect(getIntervalNameFR(3, 'mineur')).toBe('tierce mineure');
  });

  it('degré 1, juste → "unisson juste"', () => {
    expect(getIntervalNameFR(1, 'juste')).toBe('unisson juste');
  });

  it('degré 8, juste → "octave juste"', () => {
    expect(getIntervalNameFR(8, 'juste')).toBe('octave juste');
  });
});

// ============================================================
// calculateInterval
// ============================================================

describe('calculateInterval', () => {
  it('C4→G4 = quinte juste (7 demi-tons)', () => {
    const c4 = createNote('C', 4, 'quarter');
    const g4 = createNote('G', 4, 'quarter');
    const interval = calculateInterval(c4, g4);
    expect(interval.semitones).toBe(7);
    expect(interval.quality).toBe('juste');
  });

  it('C4→E4 = tierce majeure (4 demi-tons)', () => {
    const c4 = createNote('C', 4, 'quarter');
    const e4 = createNote('E', 4, 'quarter');
    const interval = calculateInterval(c4, e4);
    expect(interval.semitones).toBe(4);
    expect(interval.quality).toBe('majeur');
  });

  it('C4→C4 = unisson juste (0 demi-tons)', () => {
    const c4 = createNote('C', 4, 'quarter');
    const interval = calculateInterval(c4, c4);
    expect(interval.semitones).toBe(0);
  });
});

// ============================================================
// invertInterval
// ============================================================

describe('invertInterval', () => {
  it('tierce → sixte (règle des 9)', () => {
    const tierce = { semitones: 4, degree: 3, quality: 'majeur' as const, nameFR: 'tierce majeure' };
    const inverted = invertInterval(tierce);
    expect(inverted.degree).toBe(6);
    expect(inverted.quality).toBe('mineur');
  });

  it('quinte juste → quarte juste', () => {
    const quinte = { semitones: 7, degree: 5, quality: 'juste' as const, nameFR: 'quinte juste' };
    const inverted = invertInterval(quinte);
    expect(inverted.degree).toBe(4);
    expect(inverted.quality).toBe('juste');
    expect(inverted.semitones).toBe(5);
  });

  it('augmenté ↔ diminué', () => {
    const aug = { semitones: 6, degree: 4, quality: 'augmenté' as const, nameFR: 'quarte augmentée' };
    const inverted = invertInterval(aug);
    expect(inverted.quality).toBe('diminué');
  });

  it('majeur ↔ mineur', () => {
    const maj = { semitones: 4, degree: 3, quality: 'majeur' as const, nameFR: '' };
    const inverted = invertInterval(maj);
    expect(inverted.quality).toBe('mineur');
  });
});

// ============================================================
// isTritone
// ============================================================

describe('isTritone', () => {
  it('6 demi-tons = triton', () => {
    const tritone = { semitones: 6, degree: 4, quality: 'augmenté' as const, nameFR: '' };
    expect(isTritone(tritone)).toBe(true);
  });

  it('7 demi-tons ≠ triton', () => {
    const quinte = { semitones: 7, degree: 5, quality: 'juste' as const, nameFR: '' };
    expect(isTritone(quinte)).toBe(false);
  });

  it('18 demi-tons (6+12) = triton', () => {
    const aug = { semitones: 18, degree: 11, quality: 'augmenté' as const, nameFR: '' };
    expect(isTritone(aug)).toBe(true);
  });
});

// ============================================================
// getSemitonesForDiatonicInterval
// ============================================================

describe('getSemitonesForDiatonicInterval', () => {
  it('degré 1 = 0 demi-tons', () => expect(getSemitonesForDiatonicInterval(1)).toBe(0));
  it('degré 2 = 2 demi-tons', () => expect(getSemitonesForDiatonicInterval(2)).toBe(2));
  it('degré 3 = 4 demi-tons', () => expect(getSemitonesForDiatonicInterval(3)).toBe(4));
  it('degré 4 = 5 demi-tons', () => expect(getSemitonesForDiatonicInterval(4)).toBe(5));
  it('degré 5 = 7 demi-tons', () => expect(getSemitonesForDiatonicInterval(5)).toBe(7));
  it('degré 8 = 12 demi-tons (octave)', () => expect(getSemitonesForDiatonicInterval(8)).toBe(12));
});

// ============================================================
// identifyInterval
// ============================================================

describe('identifyInterval', () => {
  it('0 → Unisson juste', () => expect(identifyInterval(0)).toContain('Unisson'));
  it('12 → Octave', () => expect(identifyInterval(12)).toContain('Octave'));
  it('7 → Quinte', () => expect(identifyInterval(7)).toContain('Quinte'));
  it('6 → Triton', () => expect(identifyInterval(6)).toContain('riton'));
});

// ============================================================
// NAMED_INTERVALS
// ============================================================

describe('NAMED_INTERVALS', () => {
  it('contient 13 entrées (0-12)', () => {
    expect(Object.keys(NAMED_INTERVALS)).toHaveLength(13);
  });

  it('0 = Unisson juste', () => expect(NAMED_INTERVALS[0]).toContain('Unisson'));
  it('12 = Octave', () => expect(NAMED_INTERVALS[12]).toContain('Octave'));
  it('7 = Quinte juste', () => expect(NAMED_INTERVALS[7]).toContain('Quinte'));
});
