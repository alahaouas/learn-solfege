// ============================================================
// SolfApp — Page de connexion / inscription
// ============================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithEmail, signUpWithEmail, isSupabaseConfigured } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';

type Mode = 'connexion' | 'inscription';

export default function SignIn() {
  const navigate = useNavigate();
  const { onboardingCompleted } = useUserStore();

  const [mode, setMode] = useState<Mode>('connexion');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const redirectAfterAuth = () => {
    navigate(onboardingCompleted ? '/' : '/onboarding', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (mode === 'inscription') {
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas.');
        return;
      }
      if (password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'connexion') {
        const { error: authError } = await signInWithEmail(email, password);
        if (authError) {
          setError(translateAuthError(authError.message));
        } else {
          redirectAfterAuth();
        }
      } else {
        const { error: authError } = await signUpWithEmail(email, password);
        if (authError) {
          setError(translateAuthError(authError.message));
        } else {
          setSuccessMessage(
            'Inscription réussie ! Vérifiez votre e-mail pour confirmer votre compte.'
          );
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    navigate(onboardingCompleted ? '/' : '/onboarding', { replace: true });
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-primary-700">SolfApp</h1>
          </Link>
          <p className="text-slate-500 mt-1 text-sm">Apprendre le solfege, pas a pas</p>
        </div>

        <div className="card">
          {/* Onglets connexion / inscription */}
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            {(['connexion', 'inscription'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all capitalize ${
                  mode === m
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m === 'connexion' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          {/* Avertissement si Supabase non configuré */}
          {!isSupabaseConfigured && (
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <strong>Mode hors-ligne :</strong> Supabase n&apos;est pas configure.
              L&apos;authentification est desactivee.{' '}
              <button
                onClick={handleGuest}
                className="underline font-semibold hover:text-amber-900"
              >
                Continuer sans compte
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {successMessage ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4"
              >
                <div className="text-4xl mb-3">&#x2709;&#xfe0f;</div>
                <p className="text-slate-700 font-medium mb-1">Verifiez votre e-mail</p>
                <p className="text-slate-500 text-sm mb-6">{successMessage}</p>
                <button
                  className="btn-secondary w-full"
                  onClick={() => {
                    setSuccessMessage(null);
                    switchMode('connexion');
                  }}
                >
                  Se connecter
                </button>
              </motion.div>
            ) : (
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: mode === 'connexion' ? -12 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onSubmit={handleSubmit}
                noValidate
              >
                {/* Champ e-mail */}
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Adresse e-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    disabled={isLoading || !isSupabaseConfigured}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
                               text-slate-900 placeholder-slate-400
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>

                {/* Champ mot de passe */}
                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete={mode === 'connexion' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'inscription' ? 'Minimum 6 caracteres' : '••••••••'}
                    disabled={isLoading || !isSupabaseConfigured}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
                               text-slate-900 placeholder-slate-400
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>

                {/* Confirmation mot de passe (inscription seulement) */}
                <AnimatePresence>
                  {mode === 'inscription' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 overflow-hidden"
                    >
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Confirmer le mot de passe
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isLoading || !isSupabaseConfigured}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
                                   text-slate-900 placeholder-slate-400
                                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                   disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Message d'erreur */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700"
                      role="alert"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bouton principal */}
                <button
                  type="submit"
                  disabled={isLoading || !isSupabaseConfigured}
                  className="btn-primary w-full mb-3"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      {mode === 'connexion' ? 'Connexion...' : 'Inscription...'}
                    </span>
                  ) : mode === 'connexion' ? (
                    'Se connecter'
                  ) : (
                    "Creer un compte"
                  )}
                </button>

                {/* Separateur */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 border-t border-slate-200" />
                  <span className="text-xs text-slate-400">ou</span>
                  <div className="flex-1 border-t border-slate-200" />
                </div>

                {/* Continuer sans compte */}
                <button
                  type="button"
                  onClick={handleGuest}
                  className="btn-secondary w-full"
                >
                  Continuer sans compte
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Note de confidentialite */}
        <p className="text-center text-xs text-slate-400 mt-4">
          Votre progression est sauvegardee localement.{' '}
          {isSupabaseConfigured && (
            <>Un compte permet de la synchroniser entre appareils.</>
          )}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Traduction des erreurs Supabase en francais
// ============================================================

function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'E-mail ou mot de passe incorrect.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Veuillez confirmer votre e-mail avant de vous connecter.';
  }
  if (message.includes('User already registered')) {
    return 'Un compte existe deja avec cet e-mail. Connectez-vous.';
  }
  if (message.includes('Password should be')) {
    return 'Le mot de passe doit contenir au moins 6 caracteres.';
  }
  if (message.includes('Unable to validate email')) {
    return 'Adresse e-mail invalide.';
  }
  if (message.includes('rate limit') || message.includes('too many')) {
    return 'Trop de tentatives. Attendez quelques minutes.';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Erreur reseau. Verifiez votre connexion.';
  }
  return `Erreur : ${message}`;
}
