// ============================================================
// SolfApp — scoreStore — Partition et édition
// Source de vérité unique — VexFlow et Tone.js lisent ici
// ============================================================

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Score, Measure, Note, Duration, Accidental, TimeSignature, KeySignature } from '@/types/music';
import { DEFAULT_CLEF } from '@/types/music';
import { createNote, createRest, durationToBeats } from '@/lib/music/noteUtils';
import { fillMeasureWithRests, measureDuration } from '@/lib/music/rhythm';

const MAX_HISTORY = 50;

// ============================================================
// Helpers
// ============================================================

function createEmptyMeasure(
  index: number,
  ts: TimeSignature,
  ks: KeySignature
): Measure {
  const id = uuidv4();
  const totalBeats = measureDuration(ts);
  // Remplir avec un silence de mesure entière
  const rest = createRest(totalBeats === 4 ? 'whole' : totalBeats === 2 ? 'half' : 'quarter', {
    startBeat: 0,
  });
  return {
    id,
    index,
    notes: [],
    rests: [rest as typeof rest & { isRest: true; restName: string }],
    timeSignature: ts,
    keySignature: ks,
  };
}

function createEmptyScore(title = 'Nouvelle partition'): Score {
  const ts: TimeSignature = { numerator: 4, denominator: 4 };
  const ks: KeySignature = { key: 'C', mode: 'major', sharps: 0, flats: 0 };

  return {
    id: uuidv4(),
    title,
    clef: DEFAULT_CLEF,
    tempo: 60,
    measures: [createEmptyMeasure(0, ts, ks)],
    metadata: {},
    timeSignature: ts,
    keySignature: ks,
  };
}

// ============================================================
// Store
// ============================================================

interface ScoreState {
  currentScore: Score | null;
  selectedNoteId: string | null;
  selectedDuration: Duration;
  selectedAccidental: Accidental;
  mode: 'read' | 'write' | 'exercise';
  history: Score[];
  historyIndex: number;

  // Actions — Partition
  loadScore: (score: Score) => void;
  newScore: (title?: string) => void;
  updateScore: (updates: Partial<Score>) => void;

  // Actions — Notes (la plus critique)
  insertNote: (measureId: string, beat: number, noteData: Partial<Note>) => void;
  deleteNote: (noteId: string) => void;
  moveNote: (noteId: string, newBeat: number) => void;
  splitMeasure: (measureId: string) => void;

  // Actions — Sélection
  setSelectedNote: (noteId: string | null) => void;
  setSelectedDuration: (duration: Duration) => void;
  setSelectedAccidental: (accidental: Accidental) => void;

  // Actions — Mode
  setMode: (mode: 'read' | 'write' | 'exercise') => void;

  // Historique
  undo: () => void;
  redo: () => void;

  // Helpers
  getMeasure: (measureId: string) => Measure | undefined;
  getNoteById: (noteId: string) => Note | undefined;
}

export const useScoreStore = create<ScoreState>()((set, get) => ({
  currentScore: null,
  selectedNoteId: null,
  selectedDuration: 'quarter',
  selectedAccidental: null,
  mode: 'read',
  history: [],
  historyIndex: -1,

  // ============================================================
  // Chargement / création
  // ============================================================

  loadScore: (score) => {
    set((state) => ({
      currentScore: score,
      selectedNoteId: null,
      history: [score, ...state.history.slice(0, MAX_HISTORY - 1)],
      historyIndex: 0,
    }));
  },

  newScore: (title = 'Nouvelle partition') => {
    const score = createEmptyScore(title);
    get().loadScore(score);
  },

  updateScore: (updates) => {
    set((state) => {
      if (!state.currentScore) return state;
      const updated = { ...state.currentScore, ...updates };
      return { currentScore: updated };
    });
  },

  // ============================================================
  // insertNote — action centrale
  // Gère le beat, supprime le silence correspondant, joue le son
  // ============================================================

  insertNote: (measureId, beat, noteData) => {
    set((state) => {
      if (!state.currentScore) return state;

      const score = state.currentScore;
      const measures = score.measures.map((measure) => {
        if (measure.id !== measureId) return measure;

        const duration = noteData.duration ?? state.selectedDuration;
        const accidental = noteData.accidental ?? state.selectedAccidental;
        const name = noteData.name ?? 'C';
        const octave = noteData.octave ?? 4;

        const newNote = createNote(name, octave, duration, {
          accidental,
          dots: noteData.dots ?? 0,
          startBeat: beat,
          chord: noteData.chord ?? false,
        });

        // Supprimer les silences qui chevauchent la position
        const noteDuration = durationToBeats(duration, noteData.dots ?? 0);
        const newRests = measure.rests.filter((rest) => {
          const restEnd = rest.startBeat + durationToBeats(rest.duration, rest.dots);
          return rest.startBeat >= beat + noteDuration || restEnd <= beat;
        });

        const newNotes = [...measure.notes, newNote].sort((a, b) => a.startBeat - b.startBeat);

        // Re-remplir avec les silences nécessaires
        const filledRests = fillMeasureWithRests(newNotes, measure.timeSignature);

        return {
          ...measure,
          notes: newNotes,
          rests: [...newRests, ...filledRests].sort((a, b) => a.startBeat - b.startBeat) as typeof measure.rests,
        };
      });

      const updatedScore = { ...score, measures };

      // Historique
      const newHistory = [
        updatedScore,
        ...state.history.slice(state.historyIndex, MAX_HISTORY - 1),
      ];

      return {
        currentScore: updatedScore,
        history: newHistory,
        historyIndex: 0,
      };
    });
  },

  deleteNote: (noteId) => {
    set((state) => {
      if (!state.currentScore) return state;

      const measures = state.currentScore.measures.map((measure) => {
        const noteIdx = measure.notes.findIndex((n) => n.id === noteId);
        if (noteIdx === -1) return measure;

        const removedNote = measure.notes[noteIdx];
        const newNotes = measure.notes.filter((n) => n.id !== noteId);

        // Re-remplir avec un silence à la position libérée
        const rest = createRest(removedNote.duration, {
          dots: removedNote.dots,
          startBeat: removedNote.startBeat,
        });

        return {
          ...measure,
          notes: newNotes,
          rests: [...measure.rests, rest as typeof measure.rests[0]].sort(
            (a, b) => a.startBeat - b.startBeat
          ),
        };
      });

      return {
        currentScore: { ...state.currentScore, measures },
        selectedNoteId: state.selectedNoteId === noteId ? null : state.selectedNoteId,
      };
    });
  },

  moveNote: (noteId, newBeat) => {
    set((state) => {
      if (!state.currentScore) return state;

      const measures = state.currentScore.measures.map((measure) => {
        const noteIdx = measure.notes.findIndex((n) => n.id === noteId);
        if (noteIdx === -1) return measure;

        const updatedNotes = measure.notes.map((n) =>
          n.id === noteId ? { ...n, startBeat: newBeat } : n
        ).sort((a, b) => a.startBeat - b.startBeat);

        return { ...measure, notes: updatedNotes };
      });

      return { currentScore: { ...state.currentScore, measures } };
    });
  },

  splitMeasure: (measureId) => {
    set((state) => {
      if (!state.currentScore) return state;

      const score = state.currentScore;
      const measureIdx = score.measures.findIndex((m) => m.id === measureId);
      if (measureIdx === -1) return state;

      const measure = score.measures[measureIdx];
      const ts = measure.timeSignature;
      const totalBeats = measureDuration(ts);

      // Trouver les notes qui débordent
      const notesInMeasure: Note[] = [];
      const notesOverflow: Note[] = [];

      let accBeat = 0;
      for (const note of measure.notes) {
        accBeat += durationToBeats(note.duration, note.dots);
        if (accBeat <= totalBeats + 0.001) {
          notesInMeasure.push(note);
        } else {
          notesOverflow.push({ ...note, startBeat: note.startBeat - totalBeats });
        }
      }

      // Nouvelle mesure pour le débordement
      const newMeasure = createEmptyMeasure(measureIdx + 1, ts, measure.keySignature);
      newMeasure.notes = notesOverflow;

      // Re-indexer les mesures suivantes
      const beforeMeasures = score.measures.slice(0, measureIdx);
      const afterMeasures = score.measures.slice(measureIdx + 1).map((m, i) => ({
        ...m,
        index: measureIdx + 2 + i,
      }));

      const updatedMeasure = { ...measure, notes: notesInMeasure };
      const newMeasures = [...beforeMeasures, updatedMeasure, newMeasure, ...afterMeasures];

      return {
        currentScore: { ...score, measures: newMeasures },
      };
    });
  },

  // ============================================================
  // Sélection
  // ============================================================

  setSelectedNote: (noteId) => set({ selectedNoteId: noteId }),
  setSelectedDuration: (duration) => set({ selectedDuration: duration }),
  setSelectedAccidental: (accidental) => set({ selectedAccidental: accidental }),
  setMode: (mode) => set({ mode }),

  // ============================================================
  // Historique
  // ============================================================

  undo: () => {
    set((state) => {
      const newIdx = state.historyIndex + 1;
      if (newIdx >= state.history.length) return state;
      return {
        currentScore: state.history[newIdx],
        historyIndex: newIdx,
      };
    });
  },

  redo: () => {
    set((state) => {
      const newIdx = state.historyIndex - 1;
      if (newIdx < 0) return state;
      return {
        currentScore: state.history[newIdx],
        historyIndex: newIdx,
      };
    });
  },

  // ============================================================
  // Helpers
  // ============================================================

  getMeasure: (measureId) => {
    return get().currentScore?.measures.find((m) => m.id === measureId);
  },

  getNoteById: (noteId) => {
    const score = get().currentScore;
    if (!score) return undefined;
    for (const measure of score.measures) {
      const note = measure.notes.find((n) => n.id === noteId);
      if (note) return note;
    }
    return undefined;
  },
}));
