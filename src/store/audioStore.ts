// ============================================================
// SolfApp — audioStore — Lecture audio et métronome
// Utilise Tone.Transport — JAMAIS setTimeout
// ============================================================

import { create } from 'zustand';

interface AudioState {
  isPlaying: boolean;
  playbackPosition: number;  // temps en temps (noires)
  tempo: number;             // BPM
  metronomeEnabled: boolean;
  metronomeVolume: number;   // 0–1
  masterVolume: number;      // 0–1
  toneStarted: boolean;      // Tone.js nécessite un geste utilisateur

  // Actions
  setTempo: (bpm: number) => void;
  setPlaying: (playing: boolean) => void;
  setPlaybackPosition: (position: number) => void;
  toggleMetronome: () => void;
  setMetronomeVolume: (vol: number) => void;
  setMasterVolume: (vol: number) => void;
  setToneStarted: (started: boolean) => void;
  stopPlayback: () => void;
}

export const useAudioStore = create<AudioState>()((set) => ({
  isPlaying: false,
  playbackPosition: 0,
  tempo: 60,
  metronomeEnabled: false,
  metronomeVolume: 0.7,
  masterVolume: 0.8,
  toneStarted: false,

  setTempo: (bpm) => set({ tempo: bpm }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackPosition: (position) => set({ playbackPosition: position }),

  toggleMetronome: () => set((state) => ({ metronomeEnabled: !state.metronomeEnabled })),
  setMetronomeVolume: (vol) => set({ metronomeVolume: vol }),
  setMasterVolume: (vol) => set({ masterVolume: vol }),
  setToneStarted: (started) => set({ toneStarted: started }),

  stopPlayback: () => set({ isPlaying: false, playbackPosition: 0 }),
}));
