// ============================================================
// SolfApp — AudioEngine — Lecture via Tone.Transport
// Tone.start() UNIQUEMENT dans un onClick — jamais au montage
// ============================================================

import { useCallback, useEffect, useRef } from 'react';
import { useAudioStore } from '@/store/audioStore';
import { useScoreStore } from '@/store/scoreStore';
import type { Note } from '@/types/music';

interface AudioEngineProps {
  onBeat?: (beat: number) => void;
}

export default function AudioEngine({ onBeat }: AudioEngineProps) {
  const { tempo, isPlaying, toneStarted, setToneStarted, setPlaying, setPlaybackPosition, stopPlayback } =
    useAudioStore();
  const { currentScore } = useScoreStore();
  const synthRef = useRef<unknown>(null);

  // Initialiser Tone.js (après geste utilisateur)
  const initTone = useCallback(async () => {
    if (toneStarted) return;
    const Tone = await import('tone');
    await Tone.start();
    setToneStarted(true);
  }, [toneStarted, setToneStarted]);

  // Jouer une note isolée (clic sur partition)
  const playNote = useCallback(
    async (note: Note) => {
      if (!note || note.isRest) return;
      await initTone();

      const Tone = await import('tone');
      if (!synthRef.current) {
        synthRef.current = new Tone.Synth({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.5 },
        }).toDestination();
      }

      const synth = synthRef.current as { triggerAttackRelease: (freq: number, dur: string) => void };

      const durationMap: Record<string, string> = {
        whole: '1n', half: '2n', quarter: '4n', eighth: '8n',
        '16th': '16n', '32nd': '32n', '64th': '64n',
      };

      const toneDur = durationMap[note.duration] || '4n';
      synth.triggerAttackRelease(note.frequency, toneDur);
    },
    [initTone]
  );

  // Lecture de la partition complète
  const playScore = useCallback(async () => {
    if (!currentScore) return;
    await initTone();

    const Tone = await import('tone');
    Tone.getTransport().bpm.value = tempo;
    Tone.getTransport().stop();
    Tone.getTransport().cancel();

    if (!synthRef.current) {
      synthRef.current = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.8 },
      }).toDestination();
    }

    let currentTime = 0;

    for (const measure of currentScore.measures) {
      for (const note of measure.notes) {
        if (note.isRest) continue;

        const durationMap: Record<string, string> = {
          whole: '1n', half: '2n', quarter: '4n', eighth: '8n',
          '16th': '16n', '32nd': '32n', '64th': '64n',
        };
        const toneDur = durationMap[note.duration] || '4n';

        const beatTime = `+${currentTime}`;
        Tone.getTransport().schedule((time: number) => {
          const synth = synthRef.current as { triggerAttackRelease: (freq: number, dur: string, time: number) => void };
          synth?.triggerAttackRelease(note.frequency, toneDur, time);
          setPlaybackPosition(currentTime);
          onBeat?.(currentTime);
        }, beatTime);

        // Durée en secondes (tempo en BPM)
        const beatsPerSecond = tempo / 60;
        const durationBeats: Record<string, number> = {
          '1n': 4, '2n': 2, '4n': 1, '8n': 0.5,
          '16n': 0.25, '32n': 0.125, '64n': 0.0625,
        };
        currentTime += (durationBeats[toneDur] || 1) / beatsPerSecond;
      }
    }

    // Arrêt automatique
    Tone.getTransport().schedule(() => {
      stopPlayback();
    }, `+${currentTime}`);

    Tone.getTransport().start();
    setPlaying(true);
  }, [currentScore, tempo, initTone, setPlaying, setPlaybackPosition, stopPlayback, onBeat]);

  const stop = useCallback(async () => {
    const Tone = await import('tone');
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    stopPlayback();
  }, [stopPlayback]);

  // Synchronisation isPlaying → Tone.Transport
  useEffect(() => {
    if (!isPlaying) {
      import('tone').then((Tone) => {
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
      });
    }
  }, [isPlaying]);

  // Nettoyage
  useEffect(() => {
    return () => {
      import('tone').then((Tone) => {
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
      });
    };
  }, []);

  // Exposer les méthodes via window pour les pages (solution simple)
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__audioEngine = { playNote, playScore, stop };
  }, [playNote, playScore, stop]);

  return null; // Pas de rendu — moteur audio invisible
}

// Hook pour accéder à l'AudioEngine depuis n'importe quel composant
export function useAudioEngine() {
  const playNote = useCallback(async (note: Note) => {
    const engine = (window as unknown as Record<string, { playNote?: (n: Note) => Promise<void> }>).__audioEngine;
    await engine?.playNote?.(note);
  }, []);

  const playScore = useCallback(async () => {
    const engine = (window as unknown as Record<string, { playScore?: () => Promise<void> }>).__audioEngine;
    await engine?.playScore?.();
  }, []);

  const stop = useCallback(async () => {
    const engine = (window as unknown as Record<string, { stop?: () => Promise<void> }>).__audioEngine;
    await engine?.stop?.();
  }, []);

  return { playNote, playScore, stop };
}
