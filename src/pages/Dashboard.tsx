// ============================================================
// SolfApp — Dashboard — Page d'accueil
// ============================================================

import { Link } from 'react-router-dom';
import { useLevelStore } from '@/store/levelStore';
import { useScoreStore } from '@/store/scoreStore';
import LevelIndicator from '@/components/progression/LevelIndicator';
import ProgressionPrompt from '@/components/progression/ProgressionPrompt';
import { LEVEL_DESCRIPTIONS } from '@/types/levels';
import AudioEngine from '@/components/audio/AudioEngine';

const QUICK_ACTIONS = [
  {
    to: '/lire',
    icon: '🎵',
    label: 'Lire une partition',
    desc: 'Survole les notes pour voir leur nom, clique pour les entendre',
    color: 'from-blue-500 to-blue-600',
  },
  {
    to: '/editer',
    icon: '✏️',
    label: 'Écrire de la musique',
    desc: 'Créer une partition vierge note par note',
    color: 'from-violet-500 to-violet-600',
  },
  {
    to: '/exercices',
    icon: '🎯',
    label: 'Exercices',
    desc: 'Entraîne-toi à identifier les notes et les intervalles',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    to: '/theorie',
    icon: '📚',
    label: 'Théorie',
    desc: 'Gammes, accords et cercle des quintes',
    color: 'from-amber-500 to-amber-600',
  },
];

const TIPS = [
  'Survole une note sur la partition pour voir son nom en français.',
  'Clique sur une note pour l\'entendre instantanément.',
  'Le code couleur des notes suit la méthode internationale Boomwhackers.',
  'Do fixe : en solfège français, Do = C toujours, peu importe la tonalité.',
  'La 7ème note s\'appelle Si en français (et non Ti comme en anglais).',
];

export default function Dashboard() {
  const { level, xp } = useLevelStore();
  const { newScore } = useScoreStore();
  const tip = TIPS[Math.floor(Date.now() / 86400000) % TIPS.length];

  return (
    <>
      <AudioEngine />

      <div className="space-y-8">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bonjour 👋</h1>
            <p className="text-slate-500 mt-1">{LEVEL_DESCRIPTIONS[level]}</p>
          </div>
          <LevelIndicator showXp />
        </div>

        {/* Conseil du jour */}
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-sm font-semibold text-primary-800 mb-0.5">Conseil du jour</p>
            <p className="text-sm text-primary-700">{tip}</p>
          </div>
        </div>

        {/* Actions rapides */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Que veux-tu faire ?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                onClick={() => {
                  if (action.to === '/editer') {
                    newScore();
                  }
                }}
                className="group relative overflow-hidden rounded-2xl p-6 text-white shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className="text-4xl mb-3">{action.icon}</div>
                  <h3 className="text-lg font-bold mb-1">{action.label}</h3>
                  <p className="text-sm opacity-80">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'XP total', value: xp, icon: '⭐' },
            { label: 'Niveau', value: level === 'decouverte' ? 1 : level === 'apprentissage' ? 2 : level === 'pratique' ? 3 : 4, icon: '📈' },
            { label: 'Exercices', value: 0, icon: '🎯' },
          ].map((stat) => (
            <div key={stat.label} className="card text-center py-4">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <ProgressionPrompt />
    </>
  );
}
