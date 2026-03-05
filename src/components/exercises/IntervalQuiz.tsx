// ============================================================
// SolfApp — IntervalQuiz — Exercice d'identification des intervalles
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { createNote } from '@/lib/music/noteUtils';
import { useAudioEngine } from '@/components/audio/AudioEngine';
import type { NoteName } from '@/types/music';

const NOTES: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const INTERVAL_OPTIONS = [
  { semitones: 1, label: 'Seconde mineure' },
  { semitones: 2, label: 'Seconde majeure' },
  { semitones: 3, label: 'Tierce mineure' },
  { semitones: 4, label: 'Tierce majeure' },
  { semitones: 5, label: 'Quarte juste' },
  { semitones: 7, label: 'Quinte juste' },
  { semitones: 8, label: 'Sixte mineure' },
  { semitones: 9, label: 'Sixte majeure' },
  { semitones: 12, label: 'Octave' },
];

interface IntervalQuestion {
  noteA: ReturnType<typeof createNote>;
  noteB: ReturnType<typeof createNote>;
  semitones: number;
  correctLabel: string;
  options: string[];
}

function generateQuestion(): IntervalQuestion {
  const opt = INTERVAL_OPTIONS[Math.floor(Math.random() * INTERVAL_OPTIONS.length)];
  const noteAName = NOTES[Math.floor(Math.random() * NOTES.length)];
  const noteA = createNote(noteAName, 4, 'quarter');

  // Calculer la note B en ajoutant les demi-tons
  const noteBMidi = noteA.midiPitch + opt.semitones;
  const noteB = { ...noteA, midiPitch: noteBMidi, frequency: 440 * Math.pow(2, (noteBMidi - 69) / 12) };

  // 4 options de réponse
  const allLabels = INTERVAL_OPTIONS.map((o) => o.label);
  const shuffled = allLabels
    .filter((l) => l !== opt.label)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  shuffled.push(opt.label);
  const options = shuffled.sort(() => Math.random() - 0.5);

  return { noteA, noteB, semitones: opt.semitones, correctLabel: opt.label, options };
}

interface IntervalQuizProps {
  onComplete?: (result: { correct: number; total: number }) => void;
  questionCount?: number;
}

export default function IntervalQuiz({ onComplete, questionCount = 10 }: IntervalQuizProps) {
  const { playNote } = useAudioEngine();
  const [question, setQuestion] = useState<IntervalQuestion>(generateQuestion);
  const [answered, setAnswered] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [questionNum, setQuestionNum] = useState(1);
  const [completed, setCompleted] = useState(false);

  const playInterval = useCallback(async () => {
    await playNote(question.noteA);
    setTimeout(() => playNote(question.noteB), 800);
  }, [question, playNote]);

  useEffect(() => {
    const timer = setTimeout(playInterval, 600);
    return () => clearTimeout(timer);
  }, [question, playInterval]);

  const handleAnswer = useCallback(
    (label: string) => {
      if (answered !== null) return;
      setAnswered(label);
      const isCorrect = label === question.correctLabel;
      if (isCorrect) setScore((s) => s + 1);

      setTimeout(() => {
        if (questionNum >= questionCount) {
          setCompleted(true);
          onComplete?.({ correct: score + (isCorrect ? 1 : 0), total: questionCount });
        } else {
          setQuestion(generateQuestion());
          setAnswered(null);
          setQuestionNum((n) => n + 1);
        }
      }, 1200);
    },
    [answered, question, questionNum, questionCount, score, onComplete]
  );

  if (completed) {
    return (
      <div className="card text-center">
        <div className="text-5xl mb-4">🎵</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{score} / {questionCount}</h2>
        <p className="text-slate-600 mb-6">Exercice terminé !</p>
        <button className="btn-primary" onClick={() => {
          setScore(0); setQuestionNum(1); setAnswered(null);
          setCompleted(false); setQuestion(generateQuestion());
        }}>
          Recommencer
        </button>
      </div>
    );
  }

  return (
    <div className="card max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4 text-sm text-slate-500">
        <span>Question {questionNum} / {questionCount}</span>
        <span>Score : {score}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full mb-6">
        <div className="h-full bg-primary-500 rounded-full transition-all"
          style={{ width: `${((questionNum - 1) / questionCount) * 100}%` }} />
      </div>

      <div className="text-center mb-8">
        <p className="text-sm font-medium text-slate-500 mb-4">Quel est cet intervalle ?</p>
        <button onClick={playInterval}
          className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-primary-50 text-primary-700 font-bold text-xl hover:bg-primary-100">
          <span className="text-2xl">🔊</span>
          <span>Écouter l'intervalle</span>
        </button>
        <p className="text-xs text-slate-400 mt-2">
          {question.semitones} demi-ton{question.semitones > 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt) => {
          const isCorrect = opt === question.correctLabel;
          const isSelected = answered === opt;
          const showResult = answered !== null;
          let cls = 'w-full py-3 px-4 rounded-xl text-sm font-medium border-2 transition-all ';
          if (!showResult) cls += 'border-slate-200 bg-white hover:border-primary-400 text-slate-900';
          else if (isCorrect) cls += 'border-emerald-500 bg-emerald-50 text-emerald-700';
          else if (isSelected && !isCorrect) cls += 'border-red-400 bg-red-50 text-red-600';
          else cls += 'border-slate-200 bg-white text-slate-400 opacity-60';

          return (
            <button key={opt} onClick={() => handleAnswer(opt)} className={cls}>{opt}</button>
          );
        })}
      </div>
    </div>
  );
}
