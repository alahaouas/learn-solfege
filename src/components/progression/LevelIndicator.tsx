// ============================================================
// SolfApp — LevelIndicator — Badge de niveau
// ============================================================

import { useLevelStore } from '@/store/levelStore';
import { LEVEL_LABELS, LEVEL_THRESHOLDS, NEXT_LEVEL } from '@/types/levels';
import type { AppLevel } from '@/types/levels';

interface LevelIndicatorProps {
  compact?: boolean;
  showXp?: boolean;
}

const LEVEL_COLORS: Record<AppLevel, string> = {
  decouverte: 'level-decouverte',
  apprentissage: 'level-apprentissage',
  pratique: 'level-pratique',
  avance: 'level-avance',
};

export default function LevelIndicator({ compact = false, showXp = false }: LevelIndicatorProps) {
  const { level, xp } = useLevelStore();
  const nextLevel = NEXT_LEVEL[level];
  const nextThreshold = nextLevel ? LEVEL_THRESHOLDS[nextLevel] : null;
  const progress = nextThreshold ? Math.min(100, (xp / nextThreshold) * 100) : 100;

  if (compact) {
    return (
      <span className={`level-badge ${LEVEL_COLORS[level]}`}>
        {LEVEL_LABELS[level]}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className={`level-badge ${LEVEL_COLORS[level]}`}>
          {LEVEL_LABELS[level]}
        </span>
        {showXp && (
          <span className="text-xs text-slate-500">
            {xp} {nextThreshold ? `/ ${nextThreshold} XP` : 'XP'}
          </span>
        )}
      </div>

      {nextLevel && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-slate-400">
            → {LEVEL_LABELS[nextLevel]}
          </span>
        </div>
      )}
    </div>
  );
}
