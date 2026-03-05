// ============================================================
// SolfApp — NoteInput — Palette de saisie de notes
// ============================================================

import { useLevelStore } from '@/store/levelStore';
import { useScoreStore } from '@/store/scoreStore';
import type { Duration, NoteName, Accidental } from '@/types/music';
import { NOTE_NAMES_FR, NOTE_COLORS, DURATION_LABELS_FR } from '@/types/music';
import { ACCIDENTAL_SYMBOLS } from '@/lib/music/noteUtils';

const NOTE_KEYBOARD_SHORTCUTS: Record<NoteName, string> = {
  C: 'A', D: 'Z', E: 'E', F: 'R', G: 'T', A: 'Y', B: 'U',
};

const DURATION_SHORTCUTS: Record<Duration, string> = {
  whole: '1', half: '2', quarter: '3', eighth: '4', '16th': '5', '32nd': '6', '64th': '7',
};

export default function NoteInput() {
  const { features } = useLevelStore();
  const {
    selectedDuration,
    selectedAccidental,
    setSelectedDuration,
    setSelectedAccidental,
  } = useScoreStore();

  const availableNotes = features.notes;
  const availableDurations = features.durations;
  const availableAccidentals = features.accidentals;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      {/* Durées */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Durée
        </p>
        <div className="flex flex-wrap gap-2">
          {availableDurations.map((duration) => (
            <button
              key={duration}
              onClick={() => setSelectedDuration(duration)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                selectedDuration === duration
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
              }`}
              title={`${DURATION_LABELS_FR[duration]} (${DURATION_SHORTCUTS[duration]})`}
            >
              <span className="text-base">{getDurationSymbol(duration)}</span>
              <span>{DURATION_LABELS_FR[duration]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Altérations */}
      {availableAccidentals.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Altération
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedAccidental(null)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                selectedAccidental === null
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
              }`}
            >
              ♮ Naturel
            </button>
            {availableAccidentals.map((acc) => {
              if (!acc) return null;
              return (
                <button
                  key={acc}
                  onClick={() => setSelectedAccidental(acc as Accidental)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    selectedAccidental === acc
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                  }`}
                >
                  {ACCIDENTAL_SYMBOLS[acc as NonNullable<Accidental>]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes (affichées en mode Découverte avec couleurs) */}
      {features.noteLabels && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Notes
          </p>
          <div className="flex gap-2">
            {availableNotes.map((noteName) => {
              const solfege = NOTE_NAMES_FR[noteName];
              const color = features.colorCoding ? NOTE_COLORS[solfege] : undefined;
              return (
                <button
                  key={noteName}
                  className="flex flex-col items-center gap-0.5 w-10 py-2 rounded-lg text-xs font-bold border border-slate-200 hover:border-slate-400 transition-colors"
                  style={
                    color
                      ? { backgroundColor: `${color}20`, borderColor: color, color }
                      : undefined
                  }
                  title={`${solfege} (${NOTE_KEYBOARD_SHORTCUTS[noteName]})`}
                >
                  <span className="text-base">{solfege}</span>
                  <span className="text-slate-400 font-normal">{noteName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Légende raccourcis clavier */}
      <p className="text-xs text-slate-400">
        Raccourcis: durées 1–7 · notes A/Z/E/R/T/Y/U · point . · accord +
      </p>
    </div>
  );
}

function getDurationSymbol(duration: Duration): string {
  const symbols: Record<Duration, string> = {
    whole: '𝅝',
    half: '𝅗𝅥',
    quarter: '♩',
    eighth: '♪',
    '16th': '♬',
    '32nd': '𝅘𝅥𝅯',
    '64th': '𝅘𝅥𝅰',
  };
  return symbols[duration] ?? '♩';
}
