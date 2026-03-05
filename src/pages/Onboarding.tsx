// ============================================================
// SolfApp — Onboarding — Première ouverture
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { useLevelStore } from '@/store/levelStore';
import type { InstrumentType } from '@/types/music';
import { NOTE_NAMES_FR, NOTE_COLORS } from '@/types/music';
import type { NoteName } from '@/types/music';

const STEPS = ['bienvenue', 'instrument', 'premiere-note', 'pret'] as const;
type Step = (typeof STEPS)[number];

const DEMO_NOTES: NoteName[] = ['C', 'D', 'E', 'F', 'G'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setOnboardingCompleted } = useUserStore();
  const { setInstrument } = useLevelStore();

  const [step, setStep] = useState<Step>('bienvenue');
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('melodic');
  const [playedNote, setPlayedNote] = useState<NoteName | null>(null);

  const nextStep = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) {
      setStep(STEPS[idx + 1]);
    }
  };

  const handleInstrumentSelect = (inst: InstrumentType) => {
    setSelectedInstrument(inst);
    setInstrument(inst);
  };

  const handleNoteClick = async (noteName: NoteName) => {
    setPlayedNote(noteName);

    // Tone.js — démarrer après geste utilisateur
    try {
      const Tone = await import('tone');
      await Tone.start();
      const synth = new Tone.Synth().toDestination();
      const noteMap: Record<NoteName, string> = {
        C: 'C4', D: 'D4', E: 'E4', F: 'F4', G: 'G4', A: 'A4', B: 'B4',
      };
      synth.triggerAttackRelease(noteMap[noteName], '4n');
    } catch {
      // Audio non disponible — continuer sans son
    }
  };

  const handleFinish = () => {
    setOnboardingCompleted(true);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-700">🎵 SolfApp</h1>
          <p className="text-slate-500 mt-1">Apprendre le solfège, pas à pas</p>
        </div>

        <AnimatePresence mode="wait">
          {/* ======================================== */}
          {step === 'bienvenue' && (
            <motion.div
              key="bienvenue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card text-center"
            >
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Bienvenue !</h2>
              <p className="text-slate-600 mb-2">
                SolfApp t'apprend le solfège à la française, progressivement.
              </p>
              <p className="text-slate-500 text-sm mb-8">
                Pas besoin de connaissances préalables. On commence depuis zéro.
              </p>
              <div className="flex flex-col gap-2 text-left bg-slate-50 rounded-xl p-4 mb-8">
                {[
                  'Les 7 notes : Do, Ré, Mi, Fa, Sol, La, Si',
                  'Lire des partitions en cliquant sur les notes',
                  'Exercices progressifs adaptés à ton niveau',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-primary-500">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <button className="btn-primary w-full" onClick={nextStep}>
                Commencer →
              </button>
            </motion.div>
          )}

          {/* ======================================== */}
          {step === 'instrument' && (
            <motion.div
              key="instrument"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-2">Quel instrument pratiques-tu ?</h2>
              <p className="text-slate-500 text-sm mb-6">
                Cela adapte l'affichage à ton instrument.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  {
                    id: 'melodic' as InstrumentType,
                    icon: '🎸',
                    label: 'Instrument mélodique',
                    desc: 'Flûte, violon, guitare, voix…',
                  },
                  {
                    id: 'keyboard' as InstrumentType,
                    icon: '🎹',
                    label: 'Clavier / Piano',
                    desc: 'Piano, orgue, synthétiseur…',
                  },
                ].map((inst) => (
                  <button
                    key={inst.id}
                    onClick={() => handleInstrumentSelect(inst.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedInstrument === inst.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{inst.icon}</div>
                    <div className="font-semibold text-slate-900 text-sm">{inst.label}</div>
                    <div className="text-slate-500 text-xs mt-1">{inst.desc}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button className="btn-secondary" onClick={() => setStep('bienvenue')}>
                  ← Retour
                </button>
                <button className="btn-primary flex-1" onClick={nextStep}>
                  Continuer →
                </button>
              </div>
            </motion.div>
          )}

          {/* ======================================== */}
          {step === 'premiere-note' && (
            <motion.div
              key="premiere-note"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card text-center"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-2">Ta première note !</h2>
              <p className="text-slate-500 text-sm mb-6">
                En solfège français, les notes ont des noms spéciaux.
                Clique sur une note pour l'entendre.
              </p>

              <div className="flex justify-center gap-3 mb-6">
                {DEMO_NOTES.map((noteName) => {
                  const solfege = NOTE_NAMES_FR[noteName];
                  const color = NOTE_COLORS[solfege];
                  return (
                    <motion.button
                      key={noteName}
                      onClick={() => handleNoteClick(noteName)}
                      whileTap={{ scale: 0.9 }}
                      className="flex flex-col items-center gap-1 w-14 py-3 rounded-xl font-bold text-white shadow-md hover:shadow-lg transition-shadow"
                      style={{ backgroundColor: color }}
                    >
                      <span className="text-lg">{solfege}</span>
                      <span className="text-xs opacity-75">{noteName}</span>
                    </motion.button>
                  );
                })}
              </div>

              {playedNote && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-primary-700 font-semibold mb-4"
                >
                  🎵 Tu as joué : {NOTE_NAMES_FR[playedNote]} ({playedNote})
                </motion.p>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-semibold text-amber-800 mb-1">Le saviez-vous ?</p>
                <p className="text-sm text-amber-700">
                  En solfège français, on utilise <strong>Do fixe</strong> : Do = C toujours,
                  quelle que soit la tonalité. La 7ème note s'appelle <strong>Si</strong> (pas Ti).
                </p>
              </div>

              <div className="flex gap-3">
                <button className="btn-secondary" onClick={() => setStep('instrument')}>
                  ← Retour
                </button>
                <button
                  className="btn-primary flex-1"
                  onClick={nextStep}
                  disabled={!playedNote}
                >
                  {playedNote ? 'Continuer →' : 'Joue une note d\'abord'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ======================================== */}
          {step === 'pret' && (
            <motion.div
              key="pret"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Tu es prêt·e !</h2>
              <p className="text-slate-600 mb-8">
                Bienvenue dans SolfApp. Commence par lire une partition,
                ou essaie un exercice. L'application s'adapte à ton rythme.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: '🎵', label: 'Lire une partition', desc: 'Survole les notes' },
                  { icon: '✏️', label: 'Écrire de la musique', desc: 'Créer une partition' },
                  { icon: '🎯', label: 'Faire un exercice', desc: 'Identifier les notes' },
                  { icon: '📚', label: 'Explorer la théorie', desc: 'Gammes et accords' },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 text-left">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="font-medium text-slate-900 text-sm">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                ))}
              </div>

              <button className="btn-primary w-full text-lg py-4" onClick={handleFinish}>
                Entrer dans SolfApp 🚀
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicateur d'étape */}
        <div className="flex justify-center gap-2 mt-6">
          {STEPS.map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-all ${
                s === step ? 'bg-primary-600 w-6' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
