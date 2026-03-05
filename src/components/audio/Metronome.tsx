// ============================================================
// SolfApp — Metronome — Métronome visuel et audio
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { useAudioStore } from '@/store/audioStore';
import Slider from '@/components/ui/Slider';

interface MetronomeProps {
  onTick?: (beat: number) => void;
}

export default function Metronome({ onTick }: MetronomeProps) {
  const {
    tempo,
    metronomeEnabled,
    metronomeVolume,
    toneStarted,
    setTempo,
    toggleMetronome,
    setMetronomeVolume,
  } = useAudioStore();

  const clickerRef = useRef<unknown>(null);
  const loopRef = useRef<unknown>(null);
  const beatRef = useRef(0);

  const startMetronome = useCallback(async () => {
    if (!toneStarted || !metronomeEnabled) return;

    const Tone = await import('tone');

    if (!clickerRef.current) {
      clickerRef.current = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 4,
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
      }).toDestination();
    }

    const clicker = clickerRef.current as { volume: { value: number }; triggerAttackRelease: (note: string, dur: string) => void };
    clicker.volume.value = Tone.gainToDb(metronomeVolume);

    loopRef.current = new Tone.Sequence(
      (_time: number) => {
        const isDownbeat = beatRef.current === 0;
        clicker.triggerAttackRelease(isDownbeat ? 'C2' : 'G2', '32n');
        onTick?.(beatRef.current);
        beatRef.current = (beatRef.current + 1) % 4;
      },
      [0, 1, 2, 3],
      '4n'
    );

    (loopRef.current as { start: () => void }).start();
    Tone.getTransport().start();
  }, [toneStarted, metronomeEnabled, metronomeVolume, onTick]);

  const stopMetronome = useCallback(async () => {
    if (loopRef.current) {
      (loopRef.current as { stop: () => void; dispose: () => void }).stop();
      (loopRef.current as { stop: () => void; dispose: () => void }).dispose();
      loopRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (metronomeEnabled) {
      startMetronome();
    } else {
      stopMetronome();
    }
    return () => { stopMetronome(); };
  }, [metronomeEnabled, startMetronome, stopMetronome]);

  useEffect(() => {
    import('tone').then((Tone) => {
      Tone.getTransport().bpm.value = tempo;
    });
  }, [tempo]);

  return (
    <div className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-xl">
      {/* Bouton métronome */}
      <button
        onClick={toggleMetronome}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
          metronomeEnabled
            ? 'bg-primary-600 text-white border-primary-600'
            : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
        }`}
      >
        <span>🎵</span>
        <span>Métronome</span>
      </button>

      {/* Tempo */}
      <div className="flex items-center gap-2 flex-1">
        <button
          onClick={() => setTempo(Math.max(40, tempo - 5))}
          className="btn-ghost w-8 h-8 flex items-center justify-center"
        >
          −
        </button>
        <Slider
          min={40}
          max={240}
          value={tempo}
          onChange={setTempo}
          className="flex-1"
        />
        <button
          onClick={() => setTempo(Math.min(240, tempo + 5))}
          className="btn-ghost w-8 h-8 flex items-center justify-center"
        >
          +
        </button>
        <span className="text-sm font-medium text-slate-700 w-16 text-right">
          {tempo} BPM
        </span>
      </div>

      {/* Volume métronome */}
      {metronomeEnabled && (
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">🔊</span>
          <Slider
            min={0}
            max={1}
            step={0.05}
            value={metronomeVolume}
            onChange={setMetronomeVolume}
            className="w-20"
          />
        </div>
      )}
    </div>
  );
}
