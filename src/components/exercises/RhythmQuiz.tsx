// ============================================================
// SolfApp — RhythmQuiz — Exercice de rythme
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Duration } from '@/types/music';
import { DURATION_LABELS_FR, DURATION_BEATS } from '@/types/music';
import { durationInBeats } from '@/lib/music/rhythm';
import { useLevelStore } from '@/store/levelStore';

interface RhythmPattern {
  durations: Duration[];
  label: string;
}

function generatePattern(availableDurations: Duration[]): RhythmPattern {
  const count = 3 + Math.floor(Math.random() * 3); // 3–5 notes
  const durations: Duration[] = [];
  for (let i = 0; i < count; i++) {
    durations.push(availableDurations[Math.floor(Math.random() * availableDurations.length)]);
  }
  const label = durations.map((d) => DURATION_LABELS_FR[d]).join(' — ');
  return { durations, label };
}

interface TapResult {
  expected: number;
  actual: number;
  delta: number;
}

interface RhythmQuizProps {
  onComplete?: (result: { accuracy: number }) => void;
}

export default function RhythmQuiz({ onComplete }: RhythmQuizProps) {
  const { features } = useLevelStore();
  const [pattern, setPattern] = useState<RhythmPattern>(() =>
    generatePattern(features.durations.filter((d) => d !== 'whole'))
  );
  const [phase, setPhase] = useState<'listen' | 'tap' | 'result'>('listen');
  const [tapResults, setTapResults] = useState<TapResult[]>([]);
  const [currentNote, setCurrentNote] = useState(-1);
  const tapTimesRef = useRef<number[]>([]);
  const startTimeRef = useRef(0);
  const TEMPO_BPS = 2; // 120 BPM = 2 beats/sec

  // Phase "écoute" — métronome visuel
  const playPattern = useCallback(() => {
    setPhase('listen');
    setCurrentNote(0);
    let noteIdx = 0;
    const tempo = TEMPO_BPS;

    const playNext = () => {
      if (noteIdx >= pattern.durations.length) {
        setCurrentNote(-1);
        setTimeout(() => setPhase('tap'), 800);
        return;
      }
      setCurrentNote(noteIdx);
      const beats = durationInBeats(pattern.durations[noteIdx]);
      noteIdx++;
      setTimeout(playNext, beats * (1000 / tempo));
    };

    playNext();
  }, [pattern]);

  useEffect(() => { playPattern(); }, [playPattern]);

  // Phase "tap" — l'utilisateur frappe le rythme
  const handleTap = useCallback(() => {
    if (phase !== 'tap') return;

    const now = Date.now();
    if (tapTimesRef.current.length === 0) {
      startTimeRef.current = now;
    }
    tapTimesRef.current.push(now);

    // Si suffisamment de taps, analyser
    if (tapTimesRef.current.length >= pattern.durations.length) {
      const taps = tapTimesRef.current;
      const results: TapResult[] = [];
      let expectedTime = 0;

      for (let i = 0; i < pattern.durations.length; i++) {
        const expected = expectedTime;
        const actual = (taps[i] - taps[0]);
        results.push({
          expected: expected * 1000,
          actual,
          delta: Math.abs(actual - expected * 1000),
        });
        expectedTime += durationInBeats(pattern.durations[i]) * (1000 / TEMPO_BPS);
      }

      setTapResults(results);
      setPhase('result');
      tapTimesRef.current = [];

      const avgDelta = results.reduce((a, r) => a + r.delta, 0) / results.length;
      const accuracy = Math.max(0, 100 - avgDelta / 50);
      onComplete?.({ accuracy });
    }
  }, [phase, pattern, onComplete]);

  const accuracy = tapResults.length > 0
    ? Math.max(0, 100 - tapResults.reduce((a, r) => a + r.delta, 0) / tapResults.length / 50)
    : 0;

  return (
    <div className="card max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Exercice de rythme</h3>
      <p className="text-sm text-slate-500 mb-6">
        Écoute le rythme, puis reproduis-le en tapant au bon moment.
      </p>

      {/* Pattern affiché */}
      <div className="flex items-center justify-center gap-3 mb-8 min-h-16">
        {pattern.durations.map((dur, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center gap-1 transition-all ${
              currentNote === idx ? 'scale-125' : 'scale-100'
            }`}
          >
            <div
              className={`w-6 rounded transition-colors ${
                currentNote === idx
                  ? 'bg-primary-600'
                  : 'bg-slate-200'
              }`}
              style={{ height: `${DURATION_BEATS[dur] * 24 + 8}px` }}
            />
            <span className="text-xs text-slate-500">
              {DURATION_LABELS_FR[dur]}
            </span>
          </div>
        ))}
      </div>

      {/* Zone de tap */}
      {phase === 'tap' && (
        <div className="space-y-4">
          <p className="text-center text-sm font-medium text-primary-700">
            À toi ! Tape le rythme →
          </p>
          <button
            onClick={handleTap}
            className="w-full h-24 bg-primary-50 border-2 border-primary-300 rounded-2xl
                       text-primary-700 font-bold text-lg hover:bg-primary-100 active:scale-95
                       transition-all cursor-pointer select-none"
          >
            TAP
          </button>
          <p className="text-center text-xs text-slate-400">
            {tapTimesRef.current.length} / {pattern.durations.length} frappes
          </p>
        </div>
      )}

      {/* Résultat */}
      {phase === 'result' && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-2">
              {accuracy >= 80 ? '🌟' : accuracy >= 60 ? '👍' : '💪'}
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {Math.round(accuracy)}%
            </p>
            <p className="text-slate-500 text-sm">de précision rythmique</p>
          </div>

          <div className="flex gap-3">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                setPattern(generatePattern(features.durations.filter((d) => d !== 'whole')));
                setTapResults([]);
                setCurrentNote(-1);
              }}
            >
              Nouvel exercice
            </button>
            <button className="btn-secondary" onClick={playPattern}>
              Réécouter
            </button>
          </div>
        </div>
      )}

      {phase === 'listen' && (
        <div className="text-center">
          <p className="text-sm text-slate-500 animate-pulse">
            🎵 Écoute attentivement…
          </p>
        </div>
      )}
    </div>
  );
}
