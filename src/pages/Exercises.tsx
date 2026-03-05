// ============================================================
// SolfApp — Exercises — Page des exercices
// ============================================================

import { useState } from 'react';
import NoteQuiz from '@/components/exercises/NoteQuiz';
import IntervalQuiz from '@/components/exercises/IntervalQuiz';
import RhythmQuiz from '@/components/exercises/RhythmQuiz';
import FeatureGate from '@/components/progression/FeatureGate';
import AudioEngine from '@/components/audio/AudioEngine';
import { useLevelStore } from '@/store/levelStore';

type ExerciseType = 'none' | 'notes' | 'intervals' | 'rhythm';

const EXERCISES = [
  {
    id: 'notes' as ExerciseType,
    icon: '🎵',
    title: 'Identification des notes',
    desc: 'Écoute et identifie les notes en solfège français',
    requiredLevel: 'decouverte' as const,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'intervals' as ExerciseType,
    icon: '🎼',
    title: 'Intervalles',
    desc: 'Identifie les intervalles entre deux notes',
    requiredLevel: 'apprentissage' as const,
    color: 'from-violet-500 to-violet-600',
  },
  {
    id: 'rhythm' as ExerciseType,
    icon: '🥁',
    title: 'Rythme',
    desc: 'Reproduis des rythmes en tapant dans le bon tempo',
    requiredLevel: 'apprentissage' as const,
    color: 'from-emerald-500 to-emerald-600',
  },
];

export default function Exercises() {
  const [activeExercise, setActiveExercise] = useState<ExerciseType>('none');
  const [lastScore, setLastScore] = useState<{ correct: number; total: number } | null>(null);
  const { addXp } = useLevelStore();

  const handleComplete = (result: { correct: number; total: number }) => {
    setLastScore(result);
    const xpEarned = result.correct * 10;
    addXp(xpEarned);
  };

  return (
    <>
      <AudioEngine />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Exercices</h1>
          <p className="text-slate-500 mt-1">
            Entraîne-toi progressivement à lire et entendre la musique
          </p>
        </div>

        {lastScore && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-emerald-800">
                Exercice terminé ! {lastScore.correct}/{lastScore.total}
              </p>
              <p className="text-sm text-emerald-600">
                +{lastScore.correct * 10} XP gagnés
              </p>
            </div>
            <button
              onClick={() => setLastScore(null)}
              className="text-emerald-500 hover:text-emerald-700"
            >
              ✕
            </button>
          </div>
        )}

        {activeExercise === 'none' ? (
          /* Sélection d'exercice */
          <div className="grid sm:grid-cols-3 gap-4">
            {EXERCISES.map((ex) => (
              <FeatureGate key={ex.id} requiredLevel={ex.requiredLevel}>
                <button
                  onClick={() => setActiveExercise(ex.id)}
                  className={`group relative overflow-hidden rounded-2xl p-6 text-white shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 w-full text-left`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${ex.color} opacity-90 group-hover:opacity-100`} />
                  <div className="relative">
                    <div className="text-4xl mb-3">{ex.icon}</div>
                    <h3 className="text-lg font-bold mb-1">{ex.title}</h3>
                    <p className="text-sm opacity-80">{ex.desc}</p>
                  </div>
                </button>
              </FeatureGate>
            ))}
          </div>
        ) : (
          /* Exercice actif */
          <div className="space-y-4">
            <button
              onClick={() => setActiveExercise('none')}
              className="btn-ghost flex items-center gap-2"
            >
              ← Retour aux exercices
            </button>

            {activeExercise === 'notes' && (
              <NoteQuiz onComplete={handleComplete} />
            )}
            {activeExercise === 'intervals' && (
              <IntervalQuiz onComplete={handleComplete} />
            )}
            {activeExercise === 'rhythm' && (
              <RhythmQuiz onComplete={(r) => handleComplete({ correct: Math.round(r.accuracy / 10), total: 10 })} />
            )}
          </div>
        )}
      </div>
    </>
  );
}
