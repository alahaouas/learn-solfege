// ============================================================
// SolfApp — ProgressionPrompt — Suggestions de progression
// Apparaît en bas d'écran, jamais intrusif, toujours ignorable
// ============================================================

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLevelStore } from '@/store/levelStore';
import { NEXT_LEVEL, LEVEL_THRESHOLDS } from '@/types/levels';
import type { AppLevel } from '@/types/levels';

interface PromptConfig {
  title: string;
  message: string;
  action: string;
  threshold: number;
}

const PROMPTS: Partial<Record<AppLevel, PromptConfig>> = {
  decouverte: {
    title: 'Prêt pour la suite ?',
    message: 'Tu as bien exploré les 7 notes. L\'Apprentissage t\'ouvre les altérations et les armures.',
    action: 'Débloquer Apprentissage',
    threshold: 100,
  },
  apprentissage: {
    title: 'Tu progresses vite !',
    message: 'Bonne maîtrise des intervalles. Le niveau Pratique t\'attend avec la clé de Fa et l\'import de partitions.',
    action: 'Débloquer Pratique',
    threshold: 500,
  },
  pratique: {
    title: 'Niveau expert à portée !',
    message: 'Tu maîtrises la lecture à plusieurs clés. Le niveau Avancé te donne accès à tous les ornements et n-olets.',
    action: 'Débloquer Avancé',
    threshold: 2000,
  },
};

export default function ProgressionPrompt() {
  const { level, xp, setLevel } = useLevelStore();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  const nextLevel = NEXT_LEVEL[level];
  const prompt = PROMPTS[level];

  useEffect(() => {
    if (!nextLevel || !prompt || dismissed) return;
    const threshold = LEVEL_THRESHOLDS[nextLevel];
    if (xp >= threshold * 0.8) {
      // Montrer le prompt quand on approche du seuil (80%)
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [xp, nextLevel, prompt, dismissed]);

  const handleUnlock = () => {
    if (nextLevel) {
      setLevel(nextLevel);
      setVisible(false);
      setDismissed(true);
    }
  };

  if (!nextLevel || !prompt || dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40
                     w-full max-w-lg mx-auto px-4"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-900 mb-1">
                  🌟 {prompt.title}
                </p>
                <p className="text-sm text-slate-600">{prompt.message}</p>
              </div>
              <button
                onClick={() => { setVisible(false); setDismissed(true); }}
                className="text-slate-400 hover:text-slate-600 p-1 -mt-1"
                aria-label="Ignorer"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleUnlock}
                className="btn-primary flex-1"
              >
                {prompt.action}
              </button>
              <button
                onClick={() => setVisible(false)}
                className="btn-secondary"
              >
                Plus tard
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
