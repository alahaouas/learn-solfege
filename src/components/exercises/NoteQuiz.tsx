// ============================================================
// SolfApp — NoteQuiz — Exercice d'identification des notes
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { NoteName } from '@/types/music';
import { NOTE_NAMES_FR, NOTE_COLORS } from '@/types/music';
import { createNote } from '@/lib/music/noteUtils';
import { useLevelStore } from '@/store/levelStore';
import { useAudioEngine } from '@/components/audio/AudioEngine';

const OCTAVES = [4, 5];

interface QuizQuestion {
  note: ReturnType<typeof createNote>;
  options: Array<{ name: NoteName; solfege: string }>;
  correctIndex: number;
}

interface QuizResult {
  correct: number;
  total: number;
  timeMs: number;
}

function generateQuestion(availableNotes: NoteName[]): QuizQuestion {
  const noteName = availableNotes[Math.floor(Math.random() * availableNotes.length)];
  const octave = OCTAVES[Math.floor(Math.random() * OCTAVES.length)];
  const note = createNote(noteName, octave, 'quarter');

  // Générer 4 options dont la bonne
  const shuffled = [...availableNotes].sort(() => Math.random() - 0.5).slice(0, 3);
  if (!shuffled.includes(noteName)) {
    shuffled[Math.floor(Math.random() * 3)] = noteName;
  }
  const options = shuffled.map((n) => ({ name: n, solfege: NOTE_NAMES_FR[n] }));

  return {
    note,
    options,
    correctIndex: options.findIndex((o) => o.name === noteName),
  };
}

interface NoteQuizProps {
  onComplete?: (result: QuizResult) => void;
  questionCount?: number;
}

export default function NoteQuiz({ onComplete, questionCount = 10 }: NoteQuizProps) {
  const { features } = useLevelStore();
  const { playNote } = useAudioEngine();

  const [question, setQuestion] = useState<QuizQuestion>(() =>
    generateQuestion(features.notes)
  );
  const [answered, setAnswered] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [questionNum, setQuestionNum] = useState(1);
  const [startTime, setStartTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);

  // Jouer la note automatiquement
  useEffect(() => {
    const timer = setTimeout(() => {
      playNote(question.note);
    }, 500);
    return () => clearTimeout(timer);
  }, [question, playNote]);

  const handleAnswer = useCallback(
    (idx: number) => {
      if (answered !== null) return;
      setAnswered(idx);
      if (idx === question.correctIndex) {
        setScore((s) => s + 1);
      }

      setTimeout(() => {
        if (questionNum >= questionCount) {
          setCompleted(true);
          onComplete?.({
            correct: score + (idx === question.correctIndex ? 1 : 0),
            total: questionCount,
            timeMs: Date.now() - startTime,
          });
        } else {
          setQuestion(generateQuestion(features.notes));
          setAnswered(null);
          setQuestionNum((n) => n + 1);
        }
      }, 1200);
    },
    [answered, question, questionNum, questionCount, score, startTime, features.notes, onComplete]
  );

  if (completed) {
    const pct = Math.round((score / questionCount) * 100);
    return (
      <div className="card text-center">
        <div className="text-5xl mb-4">{pct >= 80 ? '🌟' : pct >= 60 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {score} / {questionCount}
        </h2>
        <p className="text-slate-600 mb-6">
          {pct >= 80 ? 'Excellent travail !' : pct >= 60 ? 'Bien joué !' : 'Continue à t\'entraîner !'}
        </p>
        <button
          className="btn-primary"
          onClick={() => {
            setScore(0);
            setQuestionNum(1);
            setAnswered(null);
            setCompleted(false);
            setStartTime(Date.now());
            setQuestion(generateQuestion(features.notes));
          }}
        >
          Recommencer
        </button>
      </div>
    );
  }

  return (
    <div className="card max-w-md mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4 text-sm text-slate-500">
        <span>Question {questionNum} / {questionCount}</span>
        <span>Score : {score}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full mb-6">
        <div
          className="h-full bg-primary-500 rounded-full transition-all"
          style={{ width: `${((questionNum - 1) / questionCount) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="text-center mb-8">
        <p className="text-sm font-medium text-slate-500 mb-2">Quelle est cette note ?</p>
        <button
          onClick={() => playNote(question.note)}
          className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-primary-50 text-primary-700 font-bold text-xl hover:bg-primary-100 transition-colors"
        >
          <span className="text-2xl">🔊</span>
          <span>Écouter</span>
        </button>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((option, idx) => {
          const isCorrect = idx === question.correctIndex;
          const isSelected = answered === idx;
          const showResult = answered !== null;

          let buttonClass =
            'w-full py-4 rounded-xl text-lg font-bold border-2 transition-all duration-300 ';

          if (!showResult) {
            buttonClass += 'border-slate-200 bg-white hover:border-primary-400 hover:bg-primary-50 text-slate-900';
          } else if (isCorrect) {
            buttonClass += 'border-emerald-500 bg-emerald-50 text-emerald-700 scale-105';
          } else if (isSelected && !isCorrect) {
            buttonClass += 'border-red-400 bg-red-50 text-red-600';
          } else {
            buttonClass += 'border-slate-200 bg-white text-slate-400 opacity-60';
          }

          const color = features.colorCoding ? NOTE_COLORS[option.solfege as keyof typeof NOTE_COLORS] : undefined;

          return (
            <motion.button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={buttonClass}
              style={!showResult && color ? { borderColor: `${color}60`, color } : undefined}
              whileTap={{ scale: showResult ? 1 : 0.97 }}
            >
              {option.solfege}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
