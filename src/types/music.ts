// ============================================================
// SolfApp — Types musicaux centraux
// Source de vérité unique — toute la stack consomme ce modèle
// ============================================================

export type NoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type SolfegeName = 'Do' | 'Ré' | 'Mi' | 'Fa' | 'Sol' | 'La' | 'Si';
export type Accidental = '#' | 'b' | 'n' | '##' | 'bb' | null;

export type Duration =
  | 'whole'
  | 'half'
  | 'quarter'
  | 'eighth'
  | '16th'
  | '32nd'
  | '64th';

export type Clef =
  | 'treble'
  | 'bass'
  | 'alto'
  | 'tenor'
  | 'soprano'
  | 'mezzosoprano'
  | 'bass3'
  | 'frenchViolin';

export const DEFAULT_CLEF: Clef = 'treble';

export type TieType = 'start' | 'stop' | 'continue' | null;

export type OrnamentType =
  | 'trill'
  | 'mordent'
  | 'turn'
  | 'invertedTurn'
  | 'grace'
  | 'acciaccatura'
  | 'appoggiatura';

export type ArticulationType =
  | 'staccato'
  | 'staccatissimo'
  | 'tenuto'
  | 'accent'
  | 'strongAccent'
  | 'stress'
  | 'portato';

export type DynamicType = 'ppp' | 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff' | 'fff' | 'fp' | 'sf' | 'sfz' | 'fz' | 'rfz';

export interface Ornament {
  type: OrnamentType;
  accidental?: Accidental;
}

export interface Tuplet {
  id: string;
  type: number;        // e.g. 3 for triplet, 5 for quintuplet
  numNotes: number;    // total notes in the group
  baseDuration: Duration;
}

export interface Note {
  id: string;
  name: NoteName;
  solfege: SolfegeName;         // Do fixe — Do = C toujours
  solfegeLabel: string;         // "Ré dièse", "Mi bémol"
  octave: number;               // 4 = do central (MIDI 60 = Do4 = 261.63 Hz)
  duration: Duration;
  accidental: Accidental;
  dots: number;                 // 0, 1 (pointée), 2 (double pointée)
  midiPitch: number;            // 0–127
  frequency: number;            // Hz
  startBeat: number;            // Position dans la mesure (en temps)
  tie: TieType;                 // JAMAIS ties: boolean
  tiedToId?: string;            // ID de la note liée (pour VexFlow Tie)
  chord: boolean;               // true = accord (même startBeat)
  tuplet?: Tuplet;
  ornament?: Ornament;
  articulation?: ArticulationType[];
  restName?: string;            // 'Pause' | 'Demi-pause' | 'Soupir' | ...
  isRest?: boolean;
}

export interface Rest extends Note {
  isRest: true;
  restName: string;
}

export interface TimeSignature {
  numerator: number;
  denominator: number;
}

export interface KeySignature {
  key: string;         // 'C', 'G', 'D', 'F', 'Bb', etc.
  mode: 'major' | 'minor';
  sharps: number;      // 0–7
  flats: number;       // 0–7
}

export interface Measure {
  id: string;
  index: number;
  notes: Note[];            // Phase 1 — monophonie
  rests: Rest[];
  voices?: Note[][];        // Phase 2+ — polyphonie
  timeSignature: TimeSignature;
  keySignature: KeySignature;
  barlineStart?: 'regular' | 'double' | 'repeat-start' | 'none';
  barlineEnd?: 'regular' | 'double' | 'final' | 'repeat-end';
  dynamic?: DynamicType;
  tempo?: number;
  rehearsalMark?: string;
}

export interface Part {
  id: string;
  instrument: string;
  clef: Clef;
  measures: Measure[];
}

export interface ScoreMetadata {
  arranger?: string;
  lyricist?: string;
  copyright?: string;
  year?: number;
  genre?: string;
  difficulty?: number;       // 1–10
  source?: string;           // URL or file name
}

export interface Score {
  id: string;
  title: string;
  composer?: string;
  clef: Clef;                // Défaut : 'treble' — toujours
  tempo: number;             // BPM
  measures: Measure[];
  parts?: Part[];            // Phase 2+ : piano = 2 parts
  metadata: ScoreMetadata;
  timeSignature: TimeSignature;
  keySignature: KeySignature;
}

// ============================================================
// Nomenclature française
// ============================================================

export const NOTE_NAMES_FR: Record<NoteName, SolfegeName> = {
  C: 'Do',
  D: 'Ré',
  E: 'Mi',
  F: 'Fa',
  G: 'Sol',
  A: 'La',
  B: 'Si',
};

export const REST_NAMES_FR: Record<Duration, string> = {
  whole: 'Pause',
  half: 'Demi-pause',
  quarter: 'Soupir',
  eighth: 'Demi-soupir',
  '16th': 'Quart de soupir',
  '32nd': 'Huitième de soupir',
  '64th': 'Seizième de soupir',
};

export const DURATION_BEATS: Record<Duration, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  '16th': 0.25,
  '32nd': 0.125,
  '64th': 0.0625,
};

export const DURATION_LABELS_FR: Record<Duration, string> = {
  whole: 'Ronde',
  half: 'Blanche',
  quarter: 'Noire',
  eighth: 'Croche',
  '16th': 'Double croche',
  '32nd': 'Triple croche',
  '64th': 'Quadruple croche',
};

export const NOTE_COLORS: Record<SolfegeName, string> = {
  Do: '#FF2121',
  Ré: '#FF8C00',
  Mi: '#FFD700',
  Fa: '#00B050',
  Sol: '#00B0F0',
  La: '#7030A0',
  Si: '#FF69B4',
};

// ============================================================
// Types d'instruments
// ============================================================

export type InstrumentType = 'melodic' | 'keyboard';

// ============================================================
// Intervalles — nomenclature française complète
// ============================================================

export type IntervalQuality =
  | 'juste'
  | 'majeur'
  | 'mineur'
  | 'augmenté'
  | 'diminué'
  | 'doublement augmenté'
  | 'doublement diminué';

export interface Interval {
  semitones: number;
  degree: number;        // 1 = unisson, 2 = seconde, 8 = octave
  quality: IntervalQuality;
  nameFR: string;        // "tierce majeure", "quinte juste", etc.
}

// ============================================================
// Degrés de la gamme — nomenclature française
// ============================================================

export const SCALE_DEGREES_FR = [
  'Tonique',
  'Sus-tonique',
  'Médiante',
  'Sous-dominante',
  'Dominante',
  'Sus-dominante',
  'Sensible',  // Leading tone
] as const;

export type ScaleDegree = (typeof SCALE_DEGREES_FR)[number];
