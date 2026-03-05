// ============================================================
// Tests unitaires — scales
// Couverture requise : 100%
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  buildScale,
  getRelativeMinor,
  getKeySignatureNotes,
  isNoteAlteredInKey,
  getDegreeNameFR,
  getNoteScaleDegree,
  SCALE_INTERVALS,
  SCALE_NAMES_FR,
  KEY_SIGNATURES,
  SHARPS_ORDER,
  FLATS_ORDER,
  ALL_NOTES,
} from '@/lib/music/scales';

// ============================================================
// buildScale
// ============================================================

describe('buildScale — Do majeur', () => {
  const scale = buildScale('C', null, 'major');

  it('a 8 notes (tonique + octave)', () => {
    expect(scale.notes).toHaveLength(8);
  });

  it('commence par Do (C)', () => {
    expect(scale.notes[0].name).toBe('C');
    expect(scale.notes[0].accidental).toBeNull();
  });

  it('contient Re (D) en 2ème position', () => {
    expect(scale.notes[1].name).toBe('D');
  });

  it('contient Mi (E) en 3ème position', () => {
    expect(scale.notes[2].name).toBe('E');
  });

  it('finit par Do (C) à l\'octave', () => {
    expect(scale.notes[7].name).toBe('C');
  });

  it('nameFR contient "Do"', () => {
    expect(scale.nameFR).toContain('Do');
  });

  it('nameFR contient "majeure"', () => {
    expect(scale.nameFR.toLowerCase()).toContain('majeure');
  });
});

describe('buildScale — Sol majeur', () => {
  const scale = buildScale('G', null, 'major');

  it('la 7ème note est F# (Fa dièse)', () => {
    expect(scale.notes[6].name).toBe('F');
    expect(scale.notes[6].accidental).toBe('#');
  });
});

describe('buildScale — Fa majeur', () => {
  const scale = buildScale('F', null, 'major', false);

  it('la 4ème note est Bb (Si bémol)', () => {
    const bNote = scale.notes.find((n) => n.accidental === 'b');
    expect(bNote).toBeTruthy();
    expect(bNote?.name).toBe('B');
  });
});

describe('buildScale — La mineur naturel', () => {
  const scale = buildScale('A', null, 'minor_natural');

  it('a 8 notes', () => expect(scale.notes).toHaveLength(8));
  it('commence par La (A)', () => expect(scale.notes[0].name).toBe('A'));
});

describe('buildScale — gamme chromatique', () => {
  const scale = buildScale('C', null, 'chromatic');
  it('a 13 notes (12 demi-tons + octave)', () => {
    expect(scale.notes).toHaveLength(13);
  });
});

describe('buildScale — pentatonique majeure', () => {
  const scale = buildScale('C', null, 'pentatonic_major');
  it('a 6 notes (5 + octave)', () => {
    expect(scale.notes).toHaveLength(6);
  });
});

// ============================================================
// SCALE_INTERVALS
// ============================================================

describe('SCALE_INTERVALS', () => {
  it('gamme majeure commence par 0', () => {
    expect(SCALE_INTERVALS.major[0]).toBe(0);
  });

  it('gamme majeure finit par 12 (octave)', () => {
    expect(SCALE_INTERVALS.major[7]).toBe(12);
  });

  it('gamme majeure a la bonne structure diatonique', () => {
    expect(SCALE_INTERVALS.major).toEqual([0, 2, 4, 5, 7, 9, 11, 12]);
  });

  it('gamme mineure naturelle', () => {
    expect(SCALE_INTERVALS.minor_natural).toEqual([0, 2, 3, 5, 7, 8, 10, 12]);
  });

  it('gamme mineure harmonique', () => {
    expect(SCALE_INTERVALS.minor_harmonic).toEqual([0, 2, 3, 5, 7, 8, 11, 12]);
  });
});

// ============================================================
// KEY_SIGNATURES
// ============================================================

describe('KEY_SIGNATURES', () => {
  it('C majeur = 0 dièse, 0 bémol', () => {
    expect(KEY_SIGNATURES['C'].sharps).toBe(0);
    expect(KEY_SIGNATURES['C'].flats).toBe(0);
  });

  it('G majeur = 1 dièse', () => {
    expect(KEY_SIGNATURES['G'].sharps).toBe(1);
    expect(KEY_SIGNATURES['G'].flats).toBe(0);
  });

  it('F majeur = 1 bémol', () => {
    expect(KEY_SIGNATURES['F'].sharps).toBe(0);
    expect(KEY_SIGNATURES['F'].flats).toBe(1);
  });

  it('C# majeur = 7 dièses', () => {
    expect(KEY_SIGNATURES['C#'].sharps).toBe(7);
  });

  it('Cb majeur = 7 bémols', () => {
    expect(KEY_SIGNATURES['Cb'].flats).toBe(7);
  });

  it('chaque tonalité a une relative mineure', () => {
    for (const [key, sig] of Object.entries(KEY_SIGNATURES)) {
      expect(sig.relative).toBeTruthy();
    }
  });
});

// ============================================================
// getRelativeMinor
// ============================================================

describe('getRelativeMinor', () => {
  it('C majeur → La mineur (Am)', () => {
    expect(getRelativeMinor('C')).toBe('Am');
  });

  it('G majeur → Mi mineur (Em)', () => {
    expect(getRelativeMinor('G')).toBe('Em');
  });

  it('F majeur → Ré mineur (Dm)', () => {
    expect(getRelativeMinor('F')).toBe('Dm');
  });
});

// ============================================================
// getKeySignatureNotes
// ============================================================

describe('getKeySignatureNotes', () => {
  it('C → [] (aucune altération)', () => {
    expect(getKeySignatureNotes('C')).toHaveLength(0);
  });

  it('G → 1 dièse [F#]', () => {
    const notes = getKeySignatureNotes('G');
    expect(notes).toHaveLength(1);
    expect(notes[0][0]).toBe('F');
    expect(notes[0][1]).toBe('#');
  });

  it('D → 2 dièses [F#, C#]', () => {
    const notes = getKeySignatureNotes('D');
    expect(notes).toHaveLength(2);
    expect(notes[0][0]).toBe('F');
    expect(notes[1][0]).toBe('C');
  });

  it('F → 1 bémol [Bb]', () => {
    const notes = getKeySignatureNotes('F');
    expect(notes).toHaveLength(1);
    expect(notes[0][0]).toBe('B');
    expect(notes[0][1]).toBe('b');
  });

  it('Bb → 2 bémols [Bb, Eb]', () => {
    const notes = getKeySignatureNotes('Bb');
    expect(notes).toHaveLength(2);
  });
});

// ============================================================
// isNoteAlteredInKey
// ============================================================

describe('isNoteAlteredInKey', () => {
  it('F est altéré en Sol majeur', () => {
    expect(isNoteAlteredInKey('F', 'G')).toBe(true);
  });

  it('C n\'est pas altéré en Sol majeur', () => {
    expect(isNoteAlteredInKey('C', 'G')).toBe(false);
  });

  it('aucune note n\'est altérée en Do majeur', () => {
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
    for (const n of notes) {
      expect(isNoteAlteredInKey(n, 'C')).toBe(false);
    }
  });
});

// ============================================================
// getDegreeNameFR
// ============================================================

describe('getDegreeNameFR', () => {
  it('degré 1 = Tonique', () => expect(getDegreeNameFR(1)).toBe('Tonique'));
  it('degré 2 = Sus-tonique', () => expect(getDegreeNameFR(2)).toBe('Sus-tonique'));
  it('degré 3 = Médiante', () => expect(getDegreeNameFR(3)).toBe('Médiante'));
  it('degré 4 = Sous-dominante', () => expect(getDegreeNameFR(4)).toBe('Sous-dominante'));
  it('degré 5 = Dominante', () => expect(getDegreeNameFR(5)).toBe('Dominante'));
  it('degré 6 = Sus-dominante', () => expect(getDegreeNameFR(6)).toBe('Sus-dominante'));
  it('degré 7 = Sensible', () => expect(getDegreeNameFR(7)).toBe('Sensible'));
});

// ============================================================
// getNoteScaleDegree
// ============================================================

describe('getNoteScaleDegree', () => {
  const cMajor = buildScale('C', null, 'major');

  it('C dans Do majeur = degré 1', () => {
    expect(getNoteScaleDegree('C', null, cMajor)).toBe(1);
  });

  it('G dans Do majeur = degré 5', () => {
    expect(getNoteScaleDegree('G', null, cMajor)).toBe(5);
  });

  it('F# n\'est pas dans Do majeur → null', () => {
    expect(getNoteScaleDegree('F', '#', cMajor)).toBeNull();
  });
});

// ============================================================
// Constantes
// ============================================================

describe('SHARPS_ORDER', () => {
  it('ordre correct des dièses : F, C, G, D, A, E, B', () => {
    const names = SHARPS_ORDER.map((n) => n[0]);
    expect(names).toEqual(['F', 'C', 'G', 'D', 'A', 'E', 'B']);
  });

  it('tous sont des dièses', () => {
    expect(SHARPS_ORDER.every((n) => n[1] === '#')).toBe(true);
  });
});

describe('FLATS_ORDER', () => {
  it('ordre correct des bémols : B, E, A, D, G, C, F', () => {
    const names = FLATS_ORDER.map((n) => n[0]);
    expect(names).toEqual(['B', 'E', 'A', 'D', 'G', 'C', 'F']);
  });
});

describe('SCALE_NAMES_FR', () => {
  it('contient "major"', () => expect(SCALE_NAMES_FR.major).toBeTruthy());
  it('gamme majeure est nommée en français', () => {
    expect(SCALE_NAMES_FR.major).toContain('majeure');
  });
});

describe('ALL_NOTES', () => {
  it('contient 7 notes diatoniques', () => expect(ALL_NOTES).toHaveLength(7));
  it('commence par C', () => expect(ALL_NOTES[0]).toBe('C'));
});
