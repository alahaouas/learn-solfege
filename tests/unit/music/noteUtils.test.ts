// ============================================================
// Tests unitaires — noteUtils
// Couverture requise : 100%
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  noteToMidi,
  midiToFrequency,
  noteToFrequency,
  getSolfegeLabel,
  getAccidentalSymbol,
  getNoteTooltip,
  durationToBeats,
  getDurationLabel,
  getRestName,
  createNote,
  createRest,
  isValidMidiRange,
  isValidNoteName,
  isValidAccidental,
  compareNotesByPitch,
  compareNotesByBeat,
  getEnharmonicEquivalent,
  recommendClef,
  CHROMATIC_INDEX,
  DIATONIC_NOTES,
  ACCIDENTAL_LABELS_FR,
  ACCIDENTAL_SYMBOLS,
  CLEF_RANGES,
} from '@/lib/music/noteUtils';

// ============================================================
// MIDI / Fréquences
// ============================================================

describe('noteToMidi', () => {
  it('C4 = MIDI 60', () => {
    expect(noteToMidi('C', 4)).toBe(60);
  });

  it('A4 = MIDI 69', () => {
    expect(noteToMidi('A', 4)).toBe(69);
  });

  it('C5 = MIDI 72', () => {
    expect(noteToMidi('C', 5)).toBe(72);
  });

  it('C#4 = MIDI 61', () => {
    expect(noteToMidi('C', 4, '#')).toBe(61);
  });

  it('Db4 = MIDI 61', () => {
    expect(noteToMidi('D', 4, 'b')).toBe(61);
  });

  it('G4 = MIDI 67', () => {
    expect(noteToMidi('G', 4)).toBe(67);
  });

  it('B4 = MIDI 71', () => {
    expect(noteToMidi('B', 4)).toBe(71);
  });

  it('C0 = MIDI 12', () => {
    expect(noteToMidi('C', 0)).toBe(12);
  });

  it('double dièse C## = MIDI 62', () => {
    expect(noteToMidi('C', 4, '##')).toBe(62);
  });

  it('double bémol Dbb4 = MIDI 60', () => {
    expect(noteToMidi('D', 4, 'bb')).toBe(60);
  });

  it('naturel n n\'applique pas d\'altération', () => {
    expect(noteToMidi('C', 4, 'n')).toBe(60);
  });
});

describe('midiToFrequency', () => {
  it('A4 = 440 Hz', () => {
    expect(midiToFrequency(69)).toBeCloseTo(440, 1);
  });

  it('C4 ≈ 261.63 Hz', () => {
    expect(midiToFrequency(60)).toBeCloseTo(261.63, 1);
  });

  it('A3 = 220 Hz', () => {
    expect(midiToFrequency(57)).toBeCloseTo(220, 1);
  });

  it('A5 = 880 Hz', () => {
    expect(midiToFrequency(81)).toBeCloseTo(880, 1);
  });
});

describe('noteToFrequency', () => {
  it('A4 = 440 Hz', () => {
    expect(noteToFrequency('A', 4)).toBeCloseTo(440, 1);
  });

  it('C4 ≈ 261.63 Hz', () => {
    expect(noteToFrequency('C', 4)).toBeCloseTo(261.63, 1);
  });
});

// ============================================================
// Labels français
// ============================================================

describe('getSolfegeLabel', () => {
  it('C sans altération → "Do"', () => {
    expect(getSolfegeLabel('C', null)).toBe('Do');
  });

  it('D dièse → "Ré dièse"', () => {
    expect(getSolfegeLabel('D', '#')).toBe('Ré dièse');
  });

  it('E bémol → "Mi bémol"', () => {
    expect(getSolfegeLabel('E', 'b')).toBe('Mi bémol');
  });

  it('F double dièse → "Fa double dièse"', () => {
    expect(getSolfegeLabel('F', '##')).toBe('Fa double dièse');
  });

  it('G naturel → "Sol"', () => {
    expect(getSolfegeLabel('G', 'n')).toBe('Sol');
  });

  it('A double bémol → "La double bémol"', () => {
    expect(getSolfegeLabel('A', 'bb')).toBe('La double bémol');
  });

  it('B sans altération → "Si"', () => {
    expect(getSolfegeLabel('B', null)).toBe('Si');
  });
});

describe('getAccidentalSymbol', () => {
  it('null → ""', () => expect(getAccidentalSymbol(null)).toBe(''));
  it('# → "♯"', () => expect(getAccidentalSymbol('#')).toBe('♯'));
  it('b → "♭"', () => expect(getAccidentalSymbol('b')).toBe('♭'));
  it('n → "♮"', () => expect(getAccidentalSymbol('n')).toBe('♮'));
  it('## → "𝄪"', () => expect(getAccidentalSymbol('##')).toBe('𝄪'));
  it('bb → "𝄫"', () => expect(getAccidentalSymbol('bb')).toBe('𝄫'));
});

// ============================================================
// Durées
// ============================================================

describe('durationToBeats', () => {
  it('ronde = 4 temps', () => expect(durationToBeats('whole')).toBe(4));
  it('blanche = 2 temps', () => expect(durationToBeats('half')).toBe(2));
  it('noire = 1 temps', () => expect(durationToBeats('quarter')).toBe(1));
  it('croche = 0.5 temps', () => expect(durationToBeats('eighth')).toBe(0.5));
  it('double croche = 0.25 temps', () => expect(durationToBeats('16th')).toBe(0.25));
  it('triple croche = 0.125 temps', () => expect(durationToBeats('32nd')).toBe(0.125));
  it('quadruple croche = 0.0625 temps', () => expect(durationToBeats('64th')).toBe(0.0625));

  it('noire pointée = 1.5 temps', () => expect(durationToBeats('quarter', 1)).toBe(1.5));
  it('blanche pointée = 3 temps', () => expect(durationToBeats('half', 1)).toBe(3));
  it('noire doublement pointée = 1.75 temps', () => expect(durationToBeats('quarter', 2)).toBe(1.75));
});

describe('getDurationLabel', () => {
  it('whole → "Ronde"', () => expect(getDurationLabel('whole')).toBe('Ronde'));
  it('half → "Blanche"', () => expect(getDurationLabel('half')).toBe('Blanche'));
  it('quarter → "Noire"', () => expect(getDurationLabel('quarter')).toBe('Noire'));
  it('eighth → "Croche"', () => expect(getDurationLabel('eighth')).toBe('Croche'));
  it('16th → "Double croche"', () => expect(getDurationLabel('16th')).toBe('Double croche'));
  it('32nd → "Triple croche"', () => expect(getDurationLabel('32nd')).toBe('Triple croche'));
  it('64th → "Quadruple croche"', () => expect(getDurationLabel('64th')).toBe('Quadruple croche'));
  it('quarter pointée → "Noire pointée"', () => expect(getDurationLabel('quarter', 1)).toBe('Noire pointée'));
  it('half doublement pointée → "Blanche doublement pointée"', () =>
    expect(getDurationLabel('half', 2)).toBe('Blanche doublement pointée'));
});

describe('getRestName', () => {
  it('whole → "Pause"', () => expect(getRestName('whole')).toBe('Pause'));
  it('half → "Demi-pause"', () => expect(getRestName('half')).toBe('Demi-pause'));
  it('quarter → "Soupir"', () => expect(getRestName('quarter')).toBe('Soupir'));
  it('eighth → "Demi-soupir"', () => expect(getRestName('eighth')).toBe('Demi-soupir'));
  it('16th → "Quart de soupir"', () => expect(getRestName('16th')).toBe('Quart de soupir'));
  it('32nd → "Huitième de soupir"', () => expect(getRestName('32nd')).toBe('Huitième de soupir'));
  it('64th → "Seizième de soupir"', () => expect(getRestName('64th')).toBe('Seizième de soupir'));
});

// ============================================================
// Création de notes
// ============================================================

describe('createNote', () => {
  it('crée une note avec les champs corrects', () => {
    const note = createNote('C', 4, 'quarter');
    expect(note.name).toBe('C');
    expect(note.octave).toBe(4);
    expect(note.duration).toBe('quarter');
    expect(note.solfege).toBe('Do');
    expect(note.midiPitch).toBe(60);
    expect(note.frequency).toBeCloseTo(261.63, 1);
    expect(note.accidental).toBeNull();
    expect(note.dots).toBe(0);
    expect(note.tie).toBeNull();
    expect(note.chord).toBe(false);
    expect(note.isRest).toBe(false);
    expect(note.id).toBeTruthy();
  });

  it('crée une note avec altération', () => {
    const note = createNote('D', 4, 'half', { accidental: '#' });
    expect(note.name).toBe('D');
    expect(note.accidental).toBe('#');
    expect(note.solfegeLabel).toBe('Ré dièse');
    expect(note.midiPitch).toBe(63); // D4=62, +1 dièse=63
  });

  it('crée une note pointée', () => {
    const note = createNote('G', 4, 'quarter', { dots: 1 });
    expect(note.dots).toBe(1);
  });

  it('crée un accord (chord=true)', () => {
    const note = createNote('E', 4, 'quarter', { chord: true });
    expect(note.chord).toBe(true);
  });
});

describe('createRest', () => {
  it('crée un silence', () => {
    const rest = createRest('quarter');
    expect(rest.isRest).toBe(true);
    expect(rest.restName).toBe('Soupir');
    expect(rest.duration).toBe('quarter');
  });

  it('crée une pause (whole rest)', () => {
    const rest = createRest('whole');
    expect(rest.restName).toBe('Pause');
  });
});

// ============================================================
// Validation
// ============================================================

describe('isValidMidiRange', () => {
  it('0 est valide', () => expect(isValidMidiRange(0)).toBe(true));
  it('127 est valide', () => expect(isValidMidiRange(127)).toBe(true));
  it('60 est valide', () => expect(isValidMidiRange(60)).toBe(true));
  it('-1 est invalide', () => expect(isValidMidiRange(-1)).toBe(false));
  it('128 est invalide', () => expect(isValidMidiRange(128)).toBe(false));
});

describe('isValidNoteName', () => {
  it('C est valide', () => expect(isValidNoteName('C')).toBe(true));
  it('G est valide', () => expect(isValidNoteName('G')).toBe(true));
  it('B est valide', () => expect(isValidNoteName('B')).toBe(true));
  it('H est invalide', () => expect(isValidNoteName('H')).toBe(false));
  it('c minuscule est invalide', () => expect(isValidNoteName('c')).toBe(false));
});

describe('isValidAccidental', () => {
  it('null est valide', () => expect(isValidAccidental(null)).toBe(true));
  it('# est valide', () => expect(isValidAccidental('#')).toBe(true));
  it('b est valide', () => expect(isValidAccidental('b')).toBe(true));
  it('n est valide', () => expect(isValidAccidental('n')).toBe(true));
  it('## est valide', () => expect(isValidAccidental('##')).toBe(true));
  it('bb est valide', () => expect(isValidAccidental('bb')).toBe(true));
  it('x est invalide', () => expect(isValidAccidental('x')).toBe(false));
});

// ============================================================
// Comparaison
// ============================================================

describe('compareNotesByPitch', () => {
  it('trie correctement C4 < G4', () => {
    const c4 = createNote('C', 4, 'quarter');
    const g4 = createNote('G', 4, 'quarter');
    expect(compareNotesByPitch(c4, g4)).toBeLessThan(0);
    expect(compareNotesByPitch(g4, c4)).toBeGreaterThan(0);
    expect(compareNotesByPitch(c4, c4)).toBe(0);
  });
});

describe('compareNotesByBeat', () => {
  it('trie correctement par beat', () => {
    const n1 = createNote('C', 4, 'quarter', { startBeat: 0 });
    const n2 = createNote('D', 4, 'quarter', { startBeat: 1 });
    expect(compareNotesByBeat(n1, n2)).toBeLessThan(0);
  });
});

// ============================================================
// Enharmonie
// ============================================================

describe('getEnharmonicEquivalent', () => {
  it('C# → Db', () => {
    const eq = getEnharmonicEquivalent('C', '#');
    expect(eq).toEqual({ name: 'D', accidental: 'b' });
  });

  it('Db → C#', () => {
    const eq = getEnharmonicEquivalent('D', 'b');
    expect(eq).toEqual({ name: 'C', accidental: '#' });
  });

  it('C sans altération retourne null', () => {
    expect(getEnharmonicEquivalent('C', null)).toBeNull();
  });
});

// ============================================================
// Clés
// ============================================================

describe('recommendClef', () => {
  it('Do4 (MIDI 60) → treble', () => {
    expect(recommendClef(60)).toBe('treble');
  });

  it('note grave → bass', () => {
    expect(recommendClef(40)).toBe('bass');
  });
});

// ============================================================
// Tables de constantes
// ============================================================

describe('CHROMATIC_INDEX', () => {
  it('C = 0', () => expect(CHROMATIC_INDEX.C).toBe(0));
  it('D = 2', () => expect(CHROMATIC_INDEX.D).toBe(2));
  it('G = 7', () => expect(CHROMATIC_INDEX.G).toBe(7));
  it('B = 11', () => expect(CHROMATIC_INDEX.B).toBe(11));
});

describe('DIATONIC_NOTES', () => {
  it('contient 7 notes', () => expect(DIATONIC_NOTES).toHaveLength(7));
  it('commence par C', () => expect(DIATONIC_NOTES[0]).toBe('C'));
  it('finit par B', () => expect(DIATONIC_NOTES[6]).toBe('B'));
});

describe('getNoteTooltip', () => {
  it('retourne le tooltip complet', () => {
    const note = createNote('D', 4, 'quarter', { accidental: '#' });
    const tooltip = getNoteTooltip(note);
    expect(tooltip).toContain('Ré');
    expect(tooltip).toContain('♯');
    expect(tooltip).toContain('4');
    expect(tooltip).toContain('Noire');
  });
});
