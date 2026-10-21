/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Mic,
  BookOpen,
  Server,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import {
  ConversationMessage,
  ConversationScenario,
  ConversationSessionRecord,
  DailyChallenge,
  TutorTurnResponse,
  UserProfile,
  VocabularyNotebookEntry,
  VocabularySpotlightItem,
} from './types/fluentpro';
import {
  DEMO_USER_PROFILE,
  INITIAL_DAILY_CHALLENGES,
  INITIAL_SCENARIOS,
  INITIAL_SESSION_HISTORY,
  INITIAL_VOCABULARY_NOTEBOOK,
} from './data/mockSeedData';
import { LandingView } from './components/LandingView';
import { AuthOnboardingModal } from './components/AuthOnboardingModal';
import { DashboardHomeView } from './components/DashboardHomeView';
import { TutorStudioView } from './components/TutorStudioView';
import { VocabularyNotebookView } from './components/VocabularyNotebookView';
import { SpringBootGuideView } from './components/SpringBootGuideView';

type WorkspaceTab = 'dashboard' | 'tutor' | 'notebook' | 'architecture';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Support ?autostart=1 query param to skip straight to main workspace for automated verification
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return DEMO_USER_PROFILE;
      }
    }
    return null;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'onboarding'>('onboarding');

  const [activeTab, setActiveTab] = useState<WorkspaceTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (
        tabParam === 'dashboard' ||
        tabParam === 'tutor' ||
        tabParam === 'notebook' ||
        tabParam === 'architecture'
      ) {
        return tabParam;
      }
    }
    return 'dashboard';
  });
  const [notebookSubTab, setNotebookSubTab] = useState<'vocabulary' | 'history'>('vocabulary');

  const [scenarios] = useState<ConversationScenario[]>(INITIAL_SCENARIOS);
  const [activeScenarioId, setActiveScenarioId] = useState<string>(INITIAL_SCENARIOS[0].id);
  const [challenges, setChallenges] = useState<DailyChallenge[]>(INITIAL_DAILY_CHALLENGES);
  const [vocabulary, setVocabulary] = useState<VocabularyNotebookEntry[]>(INITIAL_VOCABULARY_NOTEBOOK);
  const [sessions, setSessions] = useState<ConversationSessionRecord[]>(INITIAL_SESSION_HISTORY);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const savedVocabTerms = new Set(vocabulary.map((v) => v.term.toLowerCase()));

  const handleInstantDemoLogin = (selectedScenarioId?: string) => {
    setUser(DEMO_USER_PROFILE);
    setAuthModalOpen(false);
    if (selectedScenarioId) {
      setActiveScenarioId(selectedScenarioId);
      setActiveTab('tutor');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleOpenAuth = (mode: 'login' | 'onboarding') => {
    setAuthModalInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleCompleteAuth = (profile: UserProfile) => {
    setUser(profile);
    setAuthModalOpen(false);
    setActiveTab('dashboard');
  };

  const handleStartScenario = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    setActiveTab('tutor');
  };

  const handleCompleteChallenge = (challengeId: string, scenarioId: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, completed: true } : c))
    );
    if (user) {
      setUser({
        ...user,
        completedMinutesToday: user.completedMinutesToday + 5,
      });
    }
    setActiveScenarioId(scenarioId);
    setActiveTab('tutor');
  };

  const handleSaveVocabularyItem = (
    item: VocabularySpotlightItem,
    category: ConversationScenario['category']
  ) => {
    if (savedVocabTerms.has(item.term.toLowerCase())) return;
    const newEntry: VocabularyNotebookEntry = {
      id: `voc-${Date.now()}`,
      term: item.term,
      phonetic: item.phonetic,
      partOfSpeech: item.partOfSpeech,
      definition: item.definition,
      exampleSentence: item.exampleSentence,
      cefrLevel: item.cefrLevel,
      category,
      masteryStatus: 'learning',
      addedAt: new Date().toISOString().slice(0, 10),
      reviewCount: 1,
    };
    setVocabulary((prev) => [newEntry, ...prev]);
  };

  const handleCycleVocabularyMastery = (id: string) => {
    const order: Array<VocabularyNotebookEntry['masteryStatus']> = [
      'learning',
      'reviewing',
      'mastered',
    ];
    setVocabulary((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextStatus = order[(order.indexOf(item.masteryStatus) + 1) % order.length];
        return {
          ...item,
          masteryStatus: nextStatus,
          reviewCount: item.reviewCount + 1,
        };
      })
    );
  };

  const handleAddCustomVocabulary = (
    entry: Omit<VocabularyNotebookEntry, 'id' | 'addedAt' | 'reviewCount'>
  ) => {
    const created: VocabularyNotebookEntry = {
      ...entry,
      id: `voc-${Date.now()}`,
      addedAt: new Date().toISOString().slice(0, 10),
      reviewCount: 1,
    };
    setVocabulary((prev) => [created, ...prev]);
  };

  const handleSaveCompletedSession = (
    scenario: ConversationScenario,
    messages: ConversationMessage[],
    latestAnalysis: Omit<TutorTurnResponse, 'tutorReply' | 'followUpQuestion'> | null
  ) => {
    const userTurns = messages.filter((m) => m.sender === 'user');
    const grammarScore = latestAnalysis?.speakingMetrics.grammarScore || 90;
    const vocabScore = latestAnalysis?.speakingMetrics.vocabularyScore || 91;
    const fluencyScore = latestAnalysis?.speakingMetrics.fluencyScore || 90;
    const overallScore = Math.round((grammarScore + vocabScore + fluencyScore) / 3);

    const newSession: ConversationSessionRecord = {
      id: `sess-${Date.now()}`,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      category: scenario.category,
      dateIso: new Date().toISOString(),
      durationMinutes: Math.max(4, userTurns.length * 3),
      turnCount: messages.length,
      overallScore,
      grammarAccuracy: grammarScore,
      vocabularyRichness: vocabScore,
      fluencyRating: fluencyScore,
      keyTakeaway:
        latestAnalysis?.grammarCorrection.explanation ||
        'Completed live speaking session with strong conversational flow.',
      messages,
    };

    setSessions((prev) => [newSession, ...prev]);
    if (user) {
      setUser({
        ...user,
        completedMinutesToday: user.completedMinutesToday + newSession.durationMinutes,
      });
    }
  };

  // Render Public Landing Page when unauthenticated
  if (!user) {
    return (
      <>
        <LandingView
          scenarios={scenarios}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((d) => !d)}
          onOpenAuth={handleOpenAuth}
          onInstantDemoLogin={handleInstantDemoLogin}
        />
        <AuthOnboardingModal
          isOpen={authModalOpen}
          initialMode={authModalInitialMode}
          onClose={() => setAuthModalOpen(false)}
          onCompleteAuth={handleCompleteAuth}
        />
      </>
    );
  }

  // Authenticated SaaS Workspace Layout (Sidebar + Top Header with Breadcrumbs + Main Viewport)
  const navItems: Array<{ id: WorkspaceTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'tutor', label: 'AI Speaking Tutor', icon: <Mic className="w-4 h-4" /> },
    {
      id: 'notebook',
      label: 'Vocabulary & History',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'architecture',
      label: 'Spring Boot API Guide',
      icon: <Server className="w-4 h-4" />,
    },
  ];

  const tabTitles: Record<WorkspaceTab, string> = {
    dashboard: 'Overview & Daily Speaking Challenges',
    tutor: 'Interactive AI Speaking Studio',
    notebook: 'Vocabulary Notebook & Session History',
    architecture: 'Spring Boot & React Native Export Architecture',
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Desktop Sidebar Navigation (260px width) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-display cursor-pointer"
          >
            FluentPro AI
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Executive Speaking Coach
          </p>
        </div>

        <nav aria-label="Workspace Sidebar" className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-700 text-white dark:bg-blue-600'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Learner Profile Summary Card in Sidebar Footer */}
        <div className="p-4 m-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="text-xs">
            <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
            <p className="text-slate-500 dark:text-slate-400 truncate">{user.role}</p>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            <span>{user.proficiencyLevel.split(' ')[0]}</span>
            <span>{user.streakDays}d streak</span>
          </div>
          <button
            type="button"
            onClick={() => setUser(null)}
            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit to Landing Page</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Workspace Top Bar Contract: Breadcrumb on Left, 1-2 Actions on Right */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-5 sm:px-8 py-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
            <span className="font-semibold text-slate-900 dark:text-white">Workspace</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-700 dark:text-slate-200 truncate">
              {tabTitles[activeTab]}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{darkMode ? 'Light' : 'Dark'}</span>
            </button>

            {activeTab !== 'tutor' && (
              <button
                type="button"
                onClick={() => setActiveTab('tutor')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Start Speaking</span>
              </button>
            )}
          </div>
        </header>

        {/* Mobile Horizontal Navigation Bar (<= 15% mobile sticky height) */}
        <nav
          aria-label="Mobile Workspace Navigation"
          className="lg:hidden flex items-center gap-1 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === item.id
                  ? 'bg-blue-700 text-white'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setUser(null)}
            className="ml-auto px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            Exit
          </button>
        </nav>

        {/* Main Viewport Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-5 sm:px-8 py-6 sm:py-8">
          {activeTab === 'dashboard' && (
            <DashboardHomeView
              user={user}
              scenarios={scenarios}
              challenges={challenges}
              sessions={sessions}
              vocabCount={vocabulary.length}
              masteredVocabCount={
                vocabulary.filter((v) => v.masteryStatus === 'mastered').length
              }
              onStartScenario={handleStartScenario}
              onCompleteChallenge={handleCompleteChallenge}
              onNavigateTab={(tab) => {
                if (tab === 'notebook') setNotebookSubTab('vocabulary');
                setActiveTab(tab);
              }}
            />
          )}

          {activeTab === 'tutor' && (
            <TutorStudioView
              scenarios={scenarios}
              activeScenarioId={activeScenarioId}
              onSelectScenario={setActiveScenarioId}
              proficiencyLevel={user.proficiencyLevel}
              savedVocabTerms={savedVocabTerms}
              onSaveVocabularyItem={handleSaveVocabularyItem}
              onSaveCompletedSession={handleSaveCompletedSession}
            />
          )}

          {activeTab === 'notebook' && (
            <VocabularyNotebookView
              vocabulary={vocabulary}
              sessions={sessions}
              activeSubTab={notebookSubTab}
              onChangeSubTab={setNotebookSubTab}
              onCycleMastery={handleCycleVocabularyMastery}
              onAddCustomVocabulary={handleAddCustomVocabulary}
              onLaunchScenario={handleStartScenario}
            />
          )}

          {activeTab === 'architecture' && <SpringBootGuideView />}
        </main>
      </div>
    </div>
  );
}
