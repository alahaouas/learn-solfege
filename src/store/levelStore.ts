// ============================================================
// SolfApp — levelStore — Niveaux et feature flags
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppLevel, FeatureFlags } from '@/types/levels';
import { FEATURES, NEXT_LEVEL, LEVEL_THRESHOLDS } from '@/types/levels';
import type { InstrumentType } from '@/types/music';

interface LevelState {
  level: AppLevel;
  xp: number;
  instrument: InstrumentType;
  colorCodingEnabled: boolean;
  noteLabelEnabled: boolean;
  unlockedFeatures: string[];

  // Getters
  features: FeatureFlags;

  // Actions
  setLevel: (level: AppLevel) => void;
  addXp: (amount: number) => void;
  setInstrument: (instrument: InstrumentType) => void;
  setColorCoding: (enabled: boolean) => void;
  setNoteLabel: (enabled: boolean) => void;
  unlockFeature: (feature: string) => void;
  checkLevelUp: () => AppLevel | null;  // retourne le nouveau niveau si déblocage
}

export const useLevelStore = create<LevelState>()(
  persist(
    (set, get) => ({
      level: 'decouverte',
      xp: 0,
      instrument: 'melodic',
      colorCodingEnabled: true,
      noteLabelEnabled: true,
      unlockedFeatures: [],

      get features() {
        const { level, instrument, colorCodingEnabled, noteLabelEnabled } = get();
        const base = FEATURES[level];
        return {
          ...base,
          // Grand portée si instrument = keyboard
          showGrandStaff: instrument === 'keyboard' ? true : base.showGrandStaff,
          colorCoding: colorCodingEnabled && base.colorCoding,
          noteLabels: noteLabelEnabled && base.noteLabels,
        };
      },

      setLevel: (level) => set({ level }),

      addXp: (amount) => {
        set((state) => ({ xp: state.xp + amount }));
      },

      setInstrument: (instrument) => set({ instrument }),

      setColorCoding: (enabled) => set({ colorCodingEnabled: enabled }),

      setNoteLabel: (enabled) => set({ noteLabelEnabled: enabled }),

      unlockFeature: (feature) => {
        set((state) => ({
          unlockedFeatures: state.unlockedFeatures.includes(feature)
            ? state.unlockedFeatures
            : [...state.unlockedFeatures, feature],
        }));
      },

      checkLevelUp: () => {
        const { level, xp } = get();
        const nextLevel = NEXT_LEVEL[level];
        if (!nextLevel) return null;

        if (xp >= LEVEL_THRESHOLDS[nextLevel]) {
          set({ level: nextLevel });
          return nextLevel;
        }
        return null;
      },
    }),
    {
      name: 'solfapp-level',
      partialize: (state) => ({
        level: state.level,
        xp: state.xp,
        instrument: state.instrument,
        colorCodingEnabled: state.colorCodingEnabled,
        noteLabelEnabled: state.noteLabelEnabled,
        unlockedFeatures: state.unlockedFeatures,
      }),
    }
  )
);
