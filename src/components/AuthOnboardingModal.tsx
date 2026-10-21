import React, { useState } from 'react';
import { X, ArrowRight, Check, UserCheck } from 'lucide-react';
import { ProficiencyLevel, UserProfile } from '../types/fluentpro';
import { validateAuthForm } from '../utils/fluencyLogic';
import { DEMO_USER_PROFILE } from '../data/mockSeedData';

interface AuthOnboardingModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'onboarding';
  onClose: () => void;
  onCompleteAuth: (profile: UserProfile) => void;
}

export const AuthOnboardingModal: React.FC<AuthOnboardingModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onCompleteAuth,
}) => {
  const [mode, setMode] = useState<'login' | 'onboarding'>(initialMode);
  const [step, setStep] = useState<1 | 2>(1);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState<ProficiencyLevel>('B2 Upper-Intermediate');
  const [primaryGoal, setPrimaryGoal] = useState('Executive Leadership & Client Meetings');
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState<number>(20);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  if (!isOpen) return null;

  const levels: ProficiencyLevel[] = [
    'B1 Intermediate',
    'B2 Upper-Intermediate',
    'C1 Advanced',
    'C2 Executive',
  ];

  const goals = [
    'Executive Leadership & Client Meetings',
    'Technical & Behavioral Job Interviews',
    'Engaging Storytelling & Keynote Presence',
    'Effortless Daily Conversation & Small Talk',
  ];

  const handleContinueOrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      const validation = validateAuthForm(email, password, '', false);
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }
      setErrors({});
      onCompleteAuth({
        ...DEMO_USER_PROFILE,
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: email.trim(),
        role: 'Authenticated Learner (Mock Session)',
        isDemoAccount: false,
      });
      return;
    }

    // Onboarding flow
    if (step === 1) {
      setStep(2);
      return;
    }

    const validation = validateAuthForm(email, password, name, true);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    onCompleteAuth({
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: 'Custom Learner Profile (Mock Auth)',
      proficiencyLevel,
      primaryGoal,
      dailyTargetMinutes,
      streakDays: 1,
      completedMinutesToday: 0,
      isDemoAccount: false,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              FluentPro AI · Prototype Authentication &amp; Onboarding
            </p>
            <h2
              id="auth-modal-title"
              className="text-xl font-bold text-slate-900 dark:text-white font-display"
            >
              {mode === 'login'
                ? 'Sign In to Your Workspace'
                : step === 1
                ? 'Step 1 of 2: Customize Your Speaking Track'
                : 'Step 2 of 2: Create Your Learner Profile'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication dialog"
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('onboarding');
              setStep(1);
              setErrors({});
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              mode === 'onboarding'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            New Learner Onboarding
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrors({});
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Existing Account Sign In
          </button>
        </div>

        {/* 1-Click Demo Account Bypass (Clearly labeled mock auth) */}
        <div className="mb-6 p-3.5 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white block">
              Instant Demo Workspace (Mock Auth)
            </span>
            Explore with Elena Rostova’s pre-populated B2/C1 profile &amp; history.
          </div>
          <button
            type="button"
            onClick={() => onCompleteAuth(DEMO_USER_PROFILE)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Use Demo Profile</span>
          </button>
        </div>

        <form onSubmit={handleContinueOrSubmit} noValidate className="space-y-4">
          {mode === 'onboarding' && step === 1 ? (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Current Spoken English Level (CEFR)
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {levels.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setProficiencyLevel(lvl)}
                      className={`px-3 py-2.5 text-left text-xs font-medium rounded-lg border transition-colors cursor-pointer flex items-center justify-between ${
                        proficiencyLevel === lvl
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span>{lvl}</span>
                      {proficiencyLevel === lvl && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="onboarding-goal-select"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Primary Speaking Goal
                </label>
                <select
                  id="onboarding-goal-select"
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {goals.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Daily Speaking Practice Target
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[10, 20, 30].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDailyTargetMinutes(mins)}
                      className={`py-2 text-xs font-mono tabular-nums font-medium rounded-lg border transition-colors cursor-pointer ${
                        dailyTargetMinutes === mins
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {mins} min / day
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
              >
                <span>Continue to Account Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {mode === 'onboarding' && (
                <div>
                  <label
                    htmlFor="auth-name-input"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="auth-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  {errors.name && (
                    <p role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email-input"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="auth-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.rivera@enterprise.io"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                {errors.email && (
                  <p role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="auth-password-input"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Password
                </label>
                <input
                  id="auth-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                {errors.password && (
                  <p role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                {mode === 'onboarding' && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
                >
                  {mode === 'login' ? 'Sign In to Workspace' : 'Complete Onboarding & Start'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
