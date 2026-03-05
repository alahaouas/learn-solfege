// ============================================================
// SolfApp — Theory — Page théorie musicale
// ============================================================

import { useState } from 'react';
import { useLevelStore } from '@/store/levelStore';
import FeatureGate from '@/components/progression/FeatureGate';
import { buildScale, SCALE_NAMES_FR, KEY_SIGNATURES } from '@/lib/music/scales';
import { buildChord, CHORD_NAMES_FR } from '@/lib/music/chords';
import { NOTE_NAMES_FR, NOTE_COLORS } from '@/types/music';
import type { NoteName, SolfegeName } from '@/types/music';
import type { ScaleType } from '@/lib/music/scales';
import type { ChordQuality } from '@/lib/music/chords';

const NOTES: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

type TheoryTab = 'gammes' | 'accords' | 'armures' | 'quintes';

export default function Theory() {
  const { features } = useLevelStore();
  const [tab, setTab] = useState<TheoryTab>('gammes');
  const [selectedRoot, setSelectedRoot] = useState<NoteName>('C');
  const [selectedScale, setSelectedScale] = useState<ScaleType>('major');
  const [selectedChordQuality, setSelectedChordQuality] = useState<ChordQuality>('major');

  const scale = buildScale(selectedRoot, null, selectedScale);
  const chord = buildChord(selectedRoot, null, selectedChordQuality);

  const tabs: Array<{ id: TheoryTab; label: string; icon: string }> = [
    { id: 'gammes', label: 'Gammes', icon: '🎵' },
    { id: 'accords', label: 'Accords', icon: '🎼' },
    { id: 'armures', label: 'Armures', icon: '🔑' },
    { id: 'quintes', label: 'Cercle des quintes', icon: '⭕' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Théorie musicale</h1>
        <p className="text-slate-500 mt-1">
          Gammes, accords et armures en solfège français
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ================================ */}
      {tab === 'gammes' && (
        <div className="space-y-4">
          {/* Sélecteur tonique */}
          <div className="flex flex-wrap gap-2">
            {NOTES.map((n) => (
              <button
                key={n}
                onClick={() => setSelectedRoot(n)}
                className={`px-4 py-2 rounded-lg font-bold border-2 transition-all ${
                  selectedRoot === n
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
                style={
                  features.colorCoding
                    ? { borderColor: selectedRoot === n ? undefined : `${NOTE_COLORS[NOTE_NAMES_FR[n] as SolfegeName]}60` }
                    : undefined
                }
              >
                {NOTE_NAMES_FR[n]}
              </button>
            ))}
          </div>

          {/* Type de gamme */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SCALE_NAMES_FR) as ScaleType[])
              .filter((t) => features.showChords || ['major', 'minor_natural', 'minor_harmonic'].includes(t))
              .map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedScale(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    selectedScale === type
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-slate-200 text-slate-600 hover:border-primary-300'
                  }`}
                >
                  {SCALE_NAMES_FR[type]}
                </button>
              ))}
          </div>

          {/* Affichage de la gamme */}
          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-4">{scale.nameFR}</h3>
            <div className="flex flex-wrap gap-3">
              {scale.notes.map((note, i) => {
                const color = features.colorCoding
                  ? NOTE_COLORS[note.solfege as SolfegeName]
                  : undefined;
                const isFirst = i === 0;
                const isLast = i === scale.notes.length - 1;
                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 ${
                      isFirst || isLast ? 'border-primary-400 bg-primary-50' : 'border-slate-200'
                    }`}
                    style={color ? { borderColor: `${color}80`, backgroundColor: `${color}15` } : undefined}
                  >
                    <span className="font-bold text-lg" style={color ? { color } : undefined}>
                      {note.solfege}
                    </span>
                    <span className="text-xs text-slate-500">{note.name}{note.accidental === '#' ? '♯' : note.accidental === 'b' ? '♭' : ''}</span>
                    <span className="text-xs text-slate-400">Degré {note.degree}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================================ */}
      {tab === 'accords' && (
        <FeatureGate requiredLevel="pratique">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {NOTES.map((n) => (
                <button
                  key={n}
                  onClick={() => setSelectedRoot(n)}
                  className={`px-4 py-2 rounded-lg font-bold border-2 transition-all ${
                    selectedRoot === n
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {NOTE_NAMES_FR[n]}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {(Object.keys(CHORD_NAMES_FR) as ChordQuality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => setSelectedChordQuality(q)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    selectedChordQuality === q
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {CHORD_NAMES_FR[q]}
                </button>
              ))}
            </div>

            <div className="card">
              <h3 className="font-semibold text-slate-900 mb-2">{chord.nameFR}</h3>
              <p className="text-sm text-slate-500 mb-4">Symbole : {chord.nameSymbol}</p>
              <div className="flex gap-3">
                {chord.notes.map((note, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 border-slate-200"
                  >
                    <span className="font-bold text-lg">{note.name}{note.accidental === '#' ? '♯' : note.accidental === 'b' ? '♭' : ''}</span>
                    <span className="text-xs text-slate-500">{note.interval}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FeatureGate>
      )}

      {/* ================================ */}
      {tab === 'armures' && (
        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-4">Table des armures</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 pr-4 text-slate-500 font-medium">Tonalité</th>
                  <th className="text-left py-2 pr-4 text-slate-500 font-medium">Dièses ♯</th>
                  <th className="text-left py-2 pr-4 text-slate-500 font-medium">Bémols ♭</th>
                  <th className="text-left py-2 text-slate-500 font-medium">Relative mineure</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(KEY_SIGNATURES)
                  .filter(([, sig]) => features.maxSharpsFlats >= Math.max(sig.sharps, sig.flats))
                  .map(([key, sig]) => (
                    <tr key={key} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 pr-4 font-semibold">{key} majeur</td>
                      <td className="py-2 pr-4">{sig.sharps > 0 ? `${sig.sharps} ♯` : '—'}</td>
                      <td className="py-2 pr-4">{sig.flats > 0 ? `${sig.flats} ♭` : '—'}</td>
                      <td className="py-2 text-slate-500">{sig.relative}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================ */}
      {tab === 'quintes' && (
        <FeatureGate requiredLevel="apprentissage">
          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-2">Cercle des quintes</h3>
            <p className="text-sm text-slate-500 mb-6">
              Le cercle des quintes montre les relations entre les 12 tonalités.
              Chaque pas vers la droite ajoute un dièse ; vers la gauche, un bémol.
            </p>

            {/* Représentation simplifiée */}
            <div className="relative w-64 h-64 mx-auto">
              {Object.entries(KEY_SIGNATURES).slice(0, 12).map(([key], i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180);
                const r = 110;
                const x = 128 + r * Math.cos(angle);
                const y = 128 + r * Math.sin(angle);
                return (
                  <button
                    key={key}
                    style={{
                      position: 'absolute',
                      left: x - 20,
                      top: y - 20,
                      width: 40,
                      height: 40,
                    }}
                    className="flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-sm hover:bg-primary-200 transition-colors"
                    title={`${key} majeur`}
                  >
                    {key}
                  </button>
                );
              })}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">🎵</span>
              </div>
            </div>
          </div>
        </FeatureGate>
      )}
    </div>
  );
}
