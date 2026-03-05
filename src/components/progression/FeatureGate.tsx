// ============================================================
// SolfApp — FeatureGate — Verrou de fonctionnalité par niveau
// ============================================================

import type { ReactNode } from 'react';
import { useLevelStore } from '@/store/levelStore';
import type { AppLevel } from '@/types/levels';
import { LEVEL_LABELS } from '@/types/levels';

interface FeatureGateProps {
  requiredLevel: AppLevel;
  children: ReactNode;
  fallback?: ReactNode;
  showLock?: boolean;
}

const LEVEL_ORDER: Record<AppLevel, number> = {
  decouverte: 0,
  apprentissage: 1,
  pratique: 2,
  avance: 3,
};

export default function FeatureGate({
  requiredLevel,
  children,
  fallback,
  showLock = true,
}: FeatureGateProps) {
  const { level } = useLevelStore();

  if (LEVEL_ORDER[level] >= LEVEL_ORDER[requiredLevel]) {
    return <>{children}</>;
  }

  if (fallback) return <>{fallback}</>;

  if (!showLock) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-400 text-sm">
      <span>🔒</span>
      <span>Disponible au niveau {LEVEL_LABELS[requiredLevel]}</span>
    </div>
  );
}
