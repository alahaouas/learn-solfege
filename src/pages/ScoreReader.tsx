// ============================================================
// SolfApp — ScoreReader — Lecture de partitions
// Survol = tooltip FR, clic = son joué
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import ScoreRenderer from '@/components/score/ScoreRenderer';
import AudioEngine, { useAudioEngine } from '@/components/audio/AudioEngine';
import Metronome from '@/components/audio/Metronome';
import { useScoreStore } from '@/store/scoreStore';
import { useAudioStore } from '@/store/audioStore';
import { useLevelStore } from '@/store/levelStore';
import { getNoteTooltip } from '@/lib/music/noteUtils';
import type { Note, Score } from '@/types/music';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_CLEF } from '@/types/music';

// Partition d'exemple pour la démo
function createDemoScore(): Score {
  const ts = { numerator: 4, denominator: 4 };
  const ks = { key: 'C', mode: 'major' as const, sharps: 0, flats: 0 };

  const makeNote = (name: Note['name'], octave: number, dur: Note['duration'], beat: number): Note => ({
    id: uuidv4(),
    name,
    solfege: { C: 'Do', D: 'Ré', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' }[name] as Note['solfege'],
    solfegeLabel: { C: 'Do', D: 'Ré', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' }[name] as string,
    octave,
    duration: dur,
    accidental: null,
    dots: 0,
    midiPitch: { C: 60, D: 62, E: 64, F: 65, G: 67, A: 69, B: 71 }[name] + (octave - 4) * 12,
    frequency: 440 * Math.pow(2, ({ C: 60, D: 62, E: 64, F: 65, G: 67, A: 69, B: 71 }[name] + (octave - 4) * 12 - 69) / 12),
    startBeat: beat,
    tie: null,
    chord: false,
    isRest: false,
  });

  return {
    id: uuidv4(),
    title: 'Gamme de Do majeur',
    composer: 'Exemple SolfApp',
    clef: DEFAULT_CLEF,
    tempo: 80,
    measures: [
      {
        id: uuidv4(), index: 0, notes: [
          makeNote('C', 4, 'quarter', 0),
          makeNote('D', 4, 'quarter', 1),
          makeNote('E', 4, 'quarter', 2),
          makeNote('F', 4, 'quarter', 3),
        ], rests: [], timeSignature: ts, keySignature: ks,
      },
      {
        id: uuidv4(), index: 1, notes: [
          makeNote('G', 4, 'quarter', 0),
          makeNote('A', 4, 'quarter', 1),
          makeNote('B', 4, 'quarter', 2),
          makeNote('C', 5, 'quarter', 3),
        ], rests: [], timeSignature: ts, keySignature: ks,
      },
    ],
    metadata: {},
    timeSignature: ts,
    keySignature: ks,
  };
}

export default function ScoreReader() {
  const { currentScore, loadScore } = useScoreStore();
  const { isPlaying, playbackPosition } = useAudioStore();
  const { features } = useLevelStore();
  const { playNote, playScore, stop } = useAudioEngine();

  const [hoveredNote, setHoveredNote] = useState<Note | null>(null);

  // Charger la partition d'exemple si aucune n'est chargée
  useEffect(() => {
    if (!currentScore) {
      loadScore(createDemoScore());
    }
  }, [currentScore, loadScore]);

  const handleNoteClick = useCallback(
    async (note: Note) => {
      await playNote(note);
    },
    [playNote]
  );

  if (!currentScore) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Chargement…</div>
      </div>
    );
  }

  return (
    <>
      <AudioEngine />

      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{currentScore.title}</h1>
            {currentScore.composer && (
              <p className="text-slate-500 text-sm mt-0.5">{currentScore.composer}</p>
            )}
          </div>

          {/* Contrôles de lecture */}
          <div className="flex items-center gap-2">
            <button
              onClick={isPlaying ? stop : playScore}
              className="btn-primary flex items-center gap-2"
            >
              <span>{isPlaying ? '⏹' : '▶'}</span>
              <span>{isPlaying ? 'Stop' : 'Lire'}</span>
            </button>
          </div>
        </div>

        {/* Métronome */}
        <Metronome />

        {/* Tooltip de la note survolée */}
        {hoveredNote && (
          <div className="bg-slate-900 text-white text-sm rounded-lg px-3 py-2 inline-flex items-center gap-2">
            <span className="text-lg">🎵</span>
            <span>{getNoteTooltip(hoveredNote)}</span>
          </div>
        )}

        {/* Partition */}
        <ScoreRenderer
          score={currentScore}
          onNoteClick={handleNoteClick}
          onNoteHover={setHoveredNote}
          showPlaybackCursor={isPlaying}
          playbackPosition={playbackPosition}
          className="min-h-[200px]"
        />

        {/* Info mode Découverte */}
        {features.noteLabels && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-semibold mb-1">💡 Comment lire cette partition</p>
            <p>
              Passe la souris sur une note pour voir son nom. Clique dessus pour l'entendre.
              Les couleurs correspondent aux notes : Rouge = Do, Orange = Ré, Jaune = Mi…
            </p>
          </div>
        )}
      </div>
    </>
  );
}
