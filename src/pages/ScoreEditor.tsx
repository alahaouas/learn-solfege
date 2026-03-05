// ============================================================
// SolfApp — ScoreEditor — Éditeur de partition
// ============================================================

import { useState, useCallback } from 'react';
import ScoreRenderer from '@/components/score/ScoreRenderer';
import NoteInput from '@/components/score/NoteInput';
import AudioEngine, { useAudioEngine } from '@/components/audio/AudioEngine';
import Metronome from '@/components/audio/Metronome';
import FeatureGate from '@/components/progression/FeatureGate';
import { useScoreStore } from '@/store/scoreStore';
import { useAudioStore } from '@/store/audioStore';
import { useLevelStore } from '@/store/levelStore';
import { getNoteTooltip } from '@/lib/music/noteUtils';
import type { Note } from '@/types/music';

export default function ScoreEditor() {
  const { currentScore, newScore, undo, redo, deleteNote, historyIndex, history } =
    useScoreStore();
  const { isPlaying } = useAudioStore();
  const { features } = useLevelStore();
  const { playNote, playScore, stop } = useAudioEngine();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const handleNoteClick = useCallback(
    async (note: Note) => {
      setSelectedNote(note);
      await playNote(note);
    },
    [playNote]
  );

  const canUndo = historyIndex < history.length - 1;
  const canRedo = historyIndex > 0;

  return (
    <>
      <AudioEngine />

      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button className="btn-secondary" onClick={() => newScore()}>
              + Nouvelle partition
            </button>
            <button className="btn-ghost" onClick={undo} disabled={!canUndo} title="Annuler (Ctrl+Z)">
              ↩
            </button>
            <button className="btn-ghost" onClick={redo} disabled={!canRedo} title="Rétablir (Ctrl+Y)">
              ↪
            </button>
          </div>

          <div className="flex items-center gap-2">
            {selectedNote && (
              <button
                className="btn-ghost text-red-500 hover:text-red-700"
                onClick={() => {
                  deleteNote(selectedNote.id);
                  setSelectedNote(null);
                }}
              >
                🗑 Supprimer
              </button>
            )}
            <button
              onClick={isPlaying ? stop : playScore}
              className="btn-primary flex items-center gap-2"
            >
              <span>{isPlaying ? '⏹' : '▶'}</span>
              <span>{isPlaying ? 'Stop' : 'Lire'}</span>
            </button>
          </div>
        </div>

        {/* Note sélectionnée */}
        {selectedNote && !selectedNote.isRest && (
          <div className="bg-slate-900 text-white text-sm rounded-lg px-3 py-2 inline-flex items-center gap-2">
            <span className="text-lg">🎵</span>
            <span>{getNoteTooltip(selectedNote)}</span>
          </div>
        )}

        {/* Métronome */}
        <Metronome />

        {/* Partition */}
        {currentScore ? (
          <ScoreRenderer
            score={currentScore}
            onNoteClick={handleNoteClick}
            className="min-h-[200px]"
          />
        ) : (
          <div className="card flex flex-col items-center justify-center min-h-[200px] text-center">
            <div className="text-4xl mb-4">🎼</div>
            <p className="text-slate-500 mb-4">Crée une nouvelle partition pour commencer</p>
            <button className="btn-primary" onClick={() => newScore()}>
              + Nouvelle partition
            </button>
          </div>
        )}

        {/* Palette de saisie */}
        {currentScore && <NoteInput />}

        {/* Import — niveau Pratique uniquement */}
        <FeatureGate requiredLevel="pratique">
          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-2">📂 Importer une partition</h3>
            <p className="text-sm text-slate-500 mb-4">
              Formats supportés : MusicXML (.xml, .mxl), ABC, MIDI
            </p>
            <input
              type="file"
              accept=".xml,.mxl,.abc,.mid,.midi"
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
        </FeatureGate>

        {/* Guide mode Découverte */}
        {features.noteLabels && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-semibold mb-1">✏️ Comment écrire des notes</p>
            <p>
              Sélectionne une durée, puis clique sur la portée pour placer une note.
              Appuie sur les touches 1–7 pour choisir la durée rapidement.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
