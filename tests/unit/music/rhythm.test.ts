// ============================================================
// Tests unitaires — rhythm
// Couverture requise : 100%
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  durationInBeats,
  measureDuration,
  isMeasureFull,
  remainingBeats,
  beatsToRestDurations,
  fillMeasureWithRests,
  shouldBeam,
  groupNotesForBeaming,
  isDurationValidInMeasure,
  validateMeasure,
  isUpbeat,
  getRestNameFR,
  REST_NAMES_FR,
} from '@/lib/music/rhythm';
import { createNote, createRest } from '@/lib/music/noteUtils';
import type { TimeSignature } from '@/types/music';

const TS_4_4: TimeSignature = { numerator: 4, denominator: 4 };
const TS_3_4: TimeSignature = { numerator: 3, denominator: 4 };
const TS_6_8: TimeSignature = { numerator: 6, denominator: 8 };

// ============================================================
// durationInBeats
// ============================================================

describe('durationInBeats', () => {
  it('whole = 4 temps', () => expect(durationInBeats('whole')).toBe(4));
  it('half = 2 temps', () => expect(durationInBeats('half')).toBe(2));
  it('quarter = 1 temps', () => expect(durationInBeats('quarter')).toBe(1));
  it('eighth = 0.5 temps', () => expect(durationInBeats('eighth')).toBe(0.5));
  it('16th = 0.25 temps', () => expect(durationInBeats('16th')).toBe(0.25));
  it('32nd = 0.125 temps', () => expect(durationInBeats('32nd')).toBe(0.125));
  it('64th = 0.0625 temps', () => expect(durationInBeats('64th')).toBe(0.0625));

  it('quarter pointée = 1.5 temps', () => expect(durationInBeats('quarter', 1)).toBe(1.5));
  it('half pointée = 3 temps', () => expect(durationInBeats('half', 1)).toBe(3));
  it('quarter doublement pointée = 1.75 temps', () => expect(durationInBeats('quarter', 2)).toBe(1.75));
  it('whole pointée = 6 temps', () => expect(durationInBeats('whole', 1)).toBe(6));
});

// ============================================================
// measureDuration
// ============================================================

describe('measureDuration', () => {
  it('4/4 = 4 temps', () => expect(measureDuration(TS_4_4)).toBe(4));
  it('3/4 = 3 temps', () => expect(measureDuration(TS_3_4)).toBe(3));
  it('6/8 = 3 temps (6 croches = 3 noires)', () => expect(measureDuration(TS_6_8)).toBe(3));
  it('2/4 = 2 temps', () => {
    const ts: TimeSignature = { numerator: 2, denominator: 4 };
    expect(measureDuration(ts)).toBe(2);
  });
  it('12/8 = 6 temps', () => {
    const ts: TimeSignature = { numerator: 12, denominator: 8 };
    expect(measureDuration(ts)).toBe(6);
  });
});

// ============================================================
// isMeasureFull
// ============================================================

describe('isMeasureFull', () => {
  it('mesure 4/4 pleine avec 4 noires', () => {
    const notes = [
      createNote('C', 4, 'quarter', { startBeat: 0 }),
      createNote('D', 4, 'quarter', { startBeat: 1 }),
      createNote('E', 4, 'quarter', { startBeat: 2 }),
      createNote('F', 4, 'quarter', { startBeat: 3 }),
    ];
    expect(isMeasureFull(notes, TS_4_4)).toBe(true);
  });

  it('mesure 4/4 incomplète avec 2 noires', () => {
    const notes = [
      createNote('C', 4, 'quarter', { startBeat: 0 }),
      createNote('D', 4, 'quarter', { startBeat: 1 }),
    ];
    expect(isMeasureFull(notes, TS_4_4)).toBe(false);
  });

  it('mesure 3/4 pleine avec 1 blanche + 1 noire', () => {
    const notes = [
      createNote('C', 4, 'half', { startBeat: 0 }),
      createNote('D', 4, 'quarter', { startBeat: 2 }),
    ];
    expect(isMeasureFull(notes, TS_3_4)).toBe(true);
  });
});

// ============================================================
// remainingBeats
// ============================================================

describe('remainingBeats', () => {
  it('3 noires dans 4/4 → 1 temps restant', () => {
    const notes = [
      createNote('C', 4, 'quarter', { startBeat: 0 }),
      createNote('D', 4, 'quarter', { startBeat: 1 }),
      createNote('E', 4, 'quarter', { startBeat: 2 }),
    ];
    expect(remainingBeats(notes, TS_4_4)).toBeCloseTo(1);
  });

  it('mesure vide → 4 temps restants (4/4)', () => {
    expect(remainingBeats([], TS_4_4)).toBe(4);
  });
});

// ============================================================
// beatsToRestDurations
// ============================================================

describe('beatsToRestDurations', () => {
  it('4 temps → 1 pause (ronde)', () => {
    const rests = beatsToRestDurations(4);
    expect(rests).toHaveLength(1);
    expect(rests[0].duration).toBe('whole');
    expect(rests[0].dots).toBe(0);
  });

  it('2 temps → 1 demi-pause (blanche)', () => {
    const rests = beatsToRestDurations(2);
    expect(rests).toHaveLength(1);
    expect(rests[0].duration).toBe('half');
  });

  it('1 temps → 1 soupir (noire)', () => {
    const rests = beatsToRestDurations(1);
    expect(rests).toHaveLength(1);
    expect(rests[0].duration).toBe('quarter');
  });

  it('0 temps → tableau vide', () => {
    expect(beatsToRestDurations(0)).toHaveLength(0);
  });

  it('3 temps → 1 blanche + 1 noire', () => {
    const rests = beatsToRestDurations(3);
    const totalBeats = rests.reduce(
      (acc, r) => acc + durationInBeats(r.duration, r.dots), 0
    );
    expect(totalBeats).toBeCloseTo(3);
  });
});

// ============================================================
// fillMeasureWithRests
// ============================================================

describe('fillMeasureWithRests', () => {
  it('3 noires dans 4/4 → 1 soupir de remplissage', () => {
    const notes = [
      createNote('C', 4, 'quarter', { startBeat: 0 }),
      createNote('D', 4, 'quarter', { startBeat: 1 }),
      createNote('E', 4, 'quarter', { startBeat: 2 }),
    ];
    const rests = fillMeasureWithRests(notes, TS_4_4);
    const restBeats = rests.reduce((acc, r) => acc + durationInBeats(r.duration, r.dots), 0);
    expect(restBeats).toBeCloseTo(1);
  });

  it('mesure pleine → aucun silence', () => {
    const notes = [
      createNote('C', 4, 'whole', { startBeat: 0 }),
    ];
    const rests = fillMeasureWithRests(notes, TS_4_4);
    expect(rests).toHaveLength(0);
  });
});

// ============================================================
// shouldBeam
// ============================================================

describe('shouldBeam', () => {
  it('croche doit être liée', () => expect(shouldBeam('eighth')).toBe(true));
  it('double croche doit être liée', () => expect(shouldBeam('16th')).toBe(true));
  it('triple croche doit être liée', () => expect(shouldBeam('32nd')).toBe(true));
  it('noire ne doit PAS être liée', () => expect(shouldBeam('quarter')).toBe(false));
  it('blanche ne doit PAS être liée', () => expect(shouldBeam('half')).toBe(false));
  it('ronde ne doit PAS être liée', () => expect(shouldBeam('whole')).toBe(false));
});

// ============================================================
// isDurationValidInMeasure
// ============================================================

describe('isDurationValidInMeasure', () => {
  it('noire au beat 0 dans 4/4 est valide', () => {
    expect(isDurationValidInMeasure('quarter', 0, 0, TS_4_4)).toBe(true);
  });

  it('ronde au beat 0 dans 4/4 est valide', () => {
    expect(isDurationValidInMeasure('whole', 0, 0, TS_4_4)).toBe(true);
  });

  it('blanche au beat 3 dans 4/4 est invalide (dépasse)', () => {
    expect(isDurationValidInMeasure('half', 0, 3, TS_4_4)).toBe(false);
  });
});

// ============================================================
// validateMeasure
// ============================================================

describe('validateMeasure', () => {
  it('4 noires dans 4/4 → valide', () => {
    const notes = [
      createNote('C', 4, 'quarter', { startBeat: 0 }),
      createNote('D', 4, 'quarter', { startBeat: 1 }),
      createNote('E', 4, 'quarter', { startBeat: 2 }),
      createNote('F', 4, 'quarter', { startBeat: 3 }),
    ];
    const result = validateMeasure(notes, TS_4_4);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('5 noires dans 4/4 → invalide (trop plein)', () => {
    const notes = Array.from({ length: 5 }, (_, i) =>
      createNote('C', 4, 'quarter', { startBeat: i })
    );
    const result = validateMeasure(notes, TS_4_4);
    expect(result.valid).toBe(false);
  });
});

// ============================================================
// isUpbeat
// ============================================================

describe('isUpbeat', () => {
  it('1 noire dans 4/4 → anacrouse', () => {
    const notes = [createNote('C', 4, 'quarter', { startBeat: 0 })];
    expect(isUpbeat(notes, TS_4_4)).toBe(true);
  });

  it('4 noires dans 4/4 → pas anacrouse', () => {
    const notes = Array.from({ length: 4 }, (_, i) =>
      createNote('C', 4, 'quarter', { startBeat: i })
    );
    expect(isUpbeat(notes, TS_4_4)).toBe(false);
  });
});

// ============================================================
// Noms des silences
// ============================================================

describe('getRestNameFR', () => {
  it('whole → "Pause"', () => expect(getRestNameFR('whole')).toBe('Pause'));
  it('half → "Demi-pause"', () => expect(getRestNameFR('half')).toBe('Demi-pause'));
  it('quarter → "Soupir"', () => expect(getRestNameFR('quarter')).toBe('Soupir'));
  it('eighth → "Demi-soupir"', () => expect(getRestNameFR('eighth')).toBe('Demi-soupir'));
  it('16th → "Quart de soupir"', () => expect(getRestNameFR('16th')).toBe('Quart de soupir'));
  it('32nd → "Huitième de soupir"', () => expect(getRestNameFR('32nd')).toBe('Huitième de soupir'));
  it('64th → "Seizième de soupir"', () => expect(getRestNameFR('64th')).toBe('Seizième de soupir'));
});

describe('REST_NAMES_FR (constante exportée)', () => {
  it('contient les 7 durées', () => {
    expect(Object.keys(REST_NAMES_FR)).toHaveLength(7);
  });

  it('whole = "Pause"', () => expect(REST_NAMES_FR.whole).toBe('Pause'));
  it('64th = "Seizième de soupir"', () => expect(REST_NAMES_FR['64th']).toBe('Seizième de soupir'));
});
