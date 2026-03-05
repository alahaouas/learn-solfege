// ============================================================
// Tests unitaires — Feature Flags par niveau
// Couverture requise : 100%
// Garantit que chaque niveau expose exactement les bonnes fonctions
// ============================================================

import { describe, it, expect } from 'vitest';
import { FEATURES, LEVEL_LABELS, LEVEL_THRESHOLDS, NEXT_LEVEL } from '@/types/levels';
import type { AppLevel } from '@/types/levels';

const ALL_LEVELS: AppLevel[] = ['decouverte', 'apprentissage', 'pratique', 'avance'];

// ============================================================
// Règle critique #1 : defaultClef = 'treble' dans TOUS les niveaux
// ============================================================

describe('defaultClef = treble dans tous les niveaux', () => {
  for (const level of ALL_LEVELS) {
    it(`niveau "${level}" → defaultClef = 'treble'`, () => {
      expect(FEATURES[level].defaultClef).toBe('treble');
    });
  }
});

// ============================================================
// Règle #2 : Contenu du niveau Découverte
// ============================================================

describe('Niveau Découverte', () => {
  const features = FEATURES.decouverte;

  it('contient les 7 notes diatoniques', () => {
    expect(features.notes).toHaveLength(7);
    expect(features.notes).toContain('C');
    expect(features.notes).toContain('B');
  });

  it('n\'a PAS d\'altérations', () => {
    expect(features.accidentals).toHaveLength(0);
  });

  it('n\'a PAS de clé de Fa', () => {
    expect(features.clefs).not.toContain('bass');
  });

  it('n\'a que la clé de Sol', () => {
    expect(features.clefs).toEqual(['treble']);
  });

  it('a uniquement Do majeur comme armure', () => {
    expect(features.keySignatures).toEqual(['C']);
  });

  it('n\'a pas les noms des silences', () => {
    expect(features.showRestNames).toBe(false);
  });

  it('a le code couleur activé', () => {
    expect(features.colorCoding).toBe(true);
  });

  it('a les étiquettes de notes', () => {
    expect(features.noteLabels).toBe(true);
  });

  it('n\'a PAS l\'import de partitions', () => {
    expect(features.importEnabled).toBe(false);
  });

  it('a uniquement l\'exercice d\'identification de notes', () => {
    expect(features.exercises).toContain('note-identification');
    expect(features.exercises).not.toContain('interval');
    expect(features.exercises).not.toContain('rhythm');
  });

  it('n\'a PAS les durées avancées (32nd, 64th)', () => {
    expect(features.durations).not.toContain('32nd');
    expect(features.durations).not.toContain('64th');
  });

  it('n\'a PAS les intervalles', () => {
    expect(features.showIntervals).toBe(false);
  });

  it('n\'a PAS les degrés de gamme', () => {
    expect(features.showScaleDegrees).toBe(false);
  });

  it('n\'a PAS les accords', () => {
    expect(features.showChords).toBe(false);
  });

  it('n\'a PAS les n-olets', () => {
    expect(features.tuplets).toBe(false);
  });
});

// ============================================================
// Règle #3 : Contenu du niveau Apprentissage
// ============================================================

describe('Niveau Apprentissage', () => {
  const features = FEATURES.apprentissage;

  it('a les altérations (#, b, n)', () => {
    expect(features.accidentals).toContain('#');
    expect(features.accidentals).toContain('b');
    expect(features.accidentals).toContain('n');
  });

  it('a la clé de Sol ET la clé de Fa', () => {
    expect(features.clefs).toContain('treble');
    expect(features.clefs).toContain('bass');
  });

  it('n\'a PAS la clé d\'Ut (alto, ténor)', () => {
    expect(features.clefs).not.toContain('alto');
    expect(features.clefs).not.toContain('tenor');
  });

  it('n\'a PAS la triple croche (32nd) — seulement jusqu\'à la double croche (16th)', () => {
    expect(features.durations).toContain('16th');
    expect(features.durations).not.toContain('32nd');
  });

  it('a les noms des silences', () => {
    expect(features.showRestNames).toBe(true);
  });

  it('n\'a PAS l\'import de partitions', () => {
    expect(features.importEnabled).toBe(false);
  });

  it('a les exercices d\'intervalles et de rythme', () => {
    expect(features.exercises).toContain('interval');
    expect(features.exercises).toContain('rhythm');
  });

  it('a les intervalles et les degrés de gamme', () => {
    expect(features.showIntervals).toBe(true);
    expect(features.showScaleDegrees).toBe(true);
  });

  it('n\'a PAS les accords', () => {
    expect(features.showChords).toBe(false);
  });

  it('n\'a PAS les n-olets', () => {
    expect(features.tuplets).toBe(false);
  });
});

// ============================================================
// Règle #4 : Contenu du niveau Pratique
// ============================================================

describe('Niveau Pratique', () => {
  const features = FEATURES.pratique;

  it('a ACTIVÉ l\'import de partitions', () => {
    expect(features.importEnabled).toBe(true);
  });

  it('a la triple croche (32nd)', () => {
    expect(features.durations).toContain('32nd');
  });

  it('n\'a PAS la quadruple croche (64th)', () => {
    expect(features.durations).not.toContain('64th');
  });

  it('a les clés d\'Ut (alto, ténor)', () => {
    expect(features.clefs).toContain('alto');
    expect(features.clefs).toContain('tenor');
  });

  it('n\'a PAS les clés rares (soprano, mezzo-soprano, etc.)', () => {
    expect(features.clefs).not.toContain('soprano');
    expect(features.clefs).not.toContain('frenchViolin');
  });

  it('a les accords', () => {
    expect(features.showChords).toBe(true);
  });

  it('a les ornements', () => {
    expect(features.showOrnaments).toBe(true);
  });

  it('a les n-olets', () => {
    expect(features.tuplets).toBe(true);
  });

  it('a les armures jusqu\'à 6 dièses/bémols', () => {
    expect(features.maxSharpsFlats).toBeGreaterThanOrEqual(6);
  });
});

// ============================================================
// Règle #5 : Contenu du niveau Avancé
// ============================================================

describe('Niveau Avancé', () => {
  const features = FEATURES.avance;

  it('a la quadruple croche (64th)', () => {
    expect(features.durations).toContain('64th');
  });

  it('a toutes les clés y compris les rares', () => {
    expect(features.clefs).toContain('soprano');
    expect(features.clefs).toContain('mezzosoprano');
    expect(features.clefs).toContain('bass3');
    expect(features.clefs).toContain('frenchViolin');
  });

  it('a les armures jusqu\'à 7 dièses/bémols', () => {
    expect(features.maxSharpsFlats).toBe(7);
  });

  it('a tous les exercices y compris la lecture à vue', () => {
    expect(features.exercises).toContain('sight-reading');
  });
});

// ============================================================
// Règle #6 : Progression des niveaux (chaque niveau est ≥ au précédent)
// ============================================================

describe('Progression des niveaux — les fonctions s\'accumulent', () => {
  it('Apprentissage a plus de durées que Découverte', () => {
    expect(FEATURES.apprentissage.durations.length).toBeGreaterThan(
      FEATURES.decouverte.durations.length
    );
  });

  it('Pratique a plus de clés que Apprentissage', () => {
    expect(FEATURES.pratique.clefs.length).toBeGreaterThan(
      FEATURES.apprentissage.clefs.length
    );
  });

  it('Avancé a plus de clés que Pratique', () => {
    expect(FEATURES.avance.clefs.length).toBeGreaterThan(
      FEATURES.pratique.clefs.length
    );
  });

  it('Avancé a plus de durées que Pratique', () => {
    expect(FEATURES.avance.durations.length).toBeGreaterThan(
      FEATURES.pratique.durations.length
    );
  });
});

// ============================================================
// LEVEL_LABELS
// ============================================================

describe('LEVEL_LABELS', () => {
  it('contient les 4 niveaux', () => {
    expect(Object.keys(LEVEL_LABELS)).toHaveLength(4);
  });

  it('decouverte → "Découverte"', () => {
    expect(LEVEL_LABELS.decouverte).toBe('Découverte');
  });

  it('apprentissage → "Apprentissage"', () => {
    expect(LEVEL_LABELS.apprentissage).toBe('Apprentissage');
  });

  it('pratique → "Pratique"', () => {
    expect(LEVEL_LABELS.pratique).toBe('Pratique');
  });

  it('avance → "Avancé"', () => {
    expect(LEVEL_LABELS.avance).toBe('Avancé');
  });
});

// ============================================================
// LEVEL_THRESHOLDS
// ============================================================

describe('LEVEL_THRESHOLDS', () => {
  it('découverte = 0 XP', () => {
    expect(LEVEL_THRESHOLDS.decouverte).toBe(0);
  });

  it('les seuils sont croissants', () => {
    expect(LEVEL_THRESHOLDS.apprentissage).toBeGreaterThan(LEVEL_THRESHOLDS.decouverte);
    expect(LEVEL_THRESHOLDS.pratique).toBeGreaterThan(LEVEL_THRESHOLDS.apprentissage);
    expect(LEVEL_THRESHOLDS.avance).toBeGreaterThan(LEVEL_THRESHOLDS.pratique);
  });
});

// ============================================================
// NEXT_LEVEL
// ============================================================

describe('NEXT_LEVEL', () => {
  it('découverte → apprentissage', () => {
    expect(NEXT_LEVEL.decouverte).toBe('apprentissage');
  });

  it('apprentissage → pratique', () => {
    expect(NEXT_LEVEL.apprentissage).toBe('pratique');
  });

  it('pratique → avancé', () => {
    expect(NEXT_LEVEL.pratique).toBe('avance');
  });

  it('avancé n\'a pas de niveau suivant', () => {
    expect(NEXT_LEVEL.avance).toBeUndefined();
  });
});

// ============================================================
// Règle critique : import désactivé avant niveau Pratique
// ============================================================

describe('importEnabled — désactivé avant Pratique', () => {
  it('Découverte : import désactivé', () => {
    expect(FEATURES.decouverte.importEnabled).toBe(false);
  });

  it('Apprentissage : import désactivé', () => {
    expect(FEATURES.apprentissage.importEnabled).toBe(false);
  });

  it('Pratique : import ACTIVÉ', () => {
    expect(FEATURES.pratique.importEnabled).toBe(true);
  });

  it('Avancé : import ACTIVÉ', () => {
    expect(FEATURES.avance.importEnabled).toBe(true);
  });
});
