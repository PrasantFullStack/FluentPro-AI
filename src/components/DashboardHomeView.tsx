import React, { useState } from 'react';
import {
  Flame,
  ArrowRight,
  CheckCircle2,
  Mic,
  BookOpen,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  ConversationScenario,
  ConversationSessionRecord,
  DailyChallenge,
  ScenarioCategory,
  UserProfile,
} from '../types/fluentpro';
import { WEEKLY_FLUENCY_TREND } from '../data/mockSeedData';
import { calculateOverallFluencyIndex } from '../utils/fluencyLogic';

interface DashboardHomeViewProps {
  user: UserProfile;
  scenarios: ConversationScenario[];
  challenges: DailyChallenge[];
  sessions: ConversationSessionRecord[];
  vocabCount: number;
  masteredVocabCount: number;
  onStartScenario: (scenarioId: string) => void;
  onCompleteChallenge: (challengeId: string, scenarioId: string) => void;
  onNavigateTab: (tab: 'dashboard' | 'tutor' | 'notebook' | 'architecture') => void;
}

export const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({
  user,
  scenarios,
  challenges,
  sessions,
  vocabCount,
  masteredVocabCount,
  onStartScenario,
  onCompleteChallenge,
  onNavigateTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | ScenarioCategory>('all');

  const fluencySummary = calculateOverallFluencyIndex(
    sessions.map((s) => ({
      grammarScore: s.grammarAccuracy,
      vocabularyScore: s.vocabularyRichness,
      fluencyScore: s.fluencyRating,
    }))
  );

  const filteredScenarios =
    selectedCategory === 'all'
      ? scenarios
      : scenarios.filter((s) => s.category === selectedCategory);

  const progressPct = Math.min(
    100,
    Math.round((user.completedMinutesToday / user.dailyTargetMinutes) * 100)
  );

  return (
    <div className="space-y-8">
      {/* Top 4-Metric KPI Strip (Single-elevation, tabular numerals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Practice Streak</span>
            <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {user.streakDays} Days
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums">
            Today: {user.completedMinutesToday}/{user.dailyTargetMinutes} min ({progressPct}%)
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Composite Fluency Index</span>
            <TrendingUp className="w-4 h-4 text-blue-700 dark:text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {fluencySummary.overall}/100
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums">
            Grammar {fluencySummary.grammarAvg}% · Vocab {fluencySummary.vocabularyAvg}%
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Vocabulary Notebook</span>
            <BookOpen className="w-4 h-4 text-blue-700 dark:text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {vocabCount} Terms
          </p>
          <div className="flex items-center justify-between mt-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {masteredVocabCount} mastered
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('notebook')}
              className="font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Review →
            </button>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Calibrated Level</span>
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            CEFR {user.proficiencyLevel.split(' ')[0]}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {user.proficiencyLevel.split(' ').slice(1).join(' ')} · {user.dailyTargetMinutes}m/day goal
          </p>
        </div>
      </div>

      {/* Two-Column Split: Daily Speaking Challenges + Weekly Progress Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Daily Challenges (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daily Targeted Drills · Updated Daily
                </p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  Today’s Speaking Challenges
                </h2>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {challenges.filter((c) => c.completed).length}/{challenges.length} Completed
              </span>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {challenges.map((chal) => (
                <div
                  key={chal.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">
                        {chal.title}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">+{chal.xpReward} XP</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{chal.durationMinutes} min</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {chal.description}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Target Phrase:{' '}
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        “{chal.targetPhrase}”
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {chal.completed ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onCompleteChallenge(chal.id, chal.targetScenarioId)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>Start Drill</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7-Day Fluency & Accuracy Analytics Chart (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="pb-4 mb-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  7-Day Linguistic Progression
                </p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  Grammar &amp; Vocabulary Trend
                </h2>
              </div>
              <span className="text-xs font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-semibold">
                +10 pts this week
              </span>
            </div>

            <div className="space-y-3">
              {WEEKLY_FLUENCY_TREND.map((item) => (
                <div key={item.day} className="grid grid-cols-12 items-center gap-3 text-xs">
                  <span className="col-span-2 font-mono font-medium text-slate-600 dark:text-slate-400">
                    {item.day}
                  </span>
                  <div className="col-span-7 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-700 dark:bg-blue-500 rounded-full"
                      style={{ width: `${item.fluency}%` }}
                    />
                  </div>
                  <span className="col-span-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {item.fluency}% ({item.minutes}m)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Weekly Speaking: 127 mins</span>
            <button
              type="button"
              onClick={() => onNavigateTab('notebook')}
              className="font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
            >
              View Session Logs →
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Catalog with Interactive Filter Controls */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Roleplay Scenario Library
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display">
              Select a Conversation Scenario to Practice
            </h2>
          </div>

          {/* Functional Segmented Filter Buttons */}
          <div
            role="group"
            aria-label="Filter scenarios by category"
            className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
          >
            {[
              { id: 'all', label: 'All Tracks' },
              { id: 'professional-communication', label: 'Professional' },
              { id: 'job-interviews', label: 'Job Interviews' },
              { id: 'storytelling', label: 'Storytelling' },
              { id: 'daily-english', label: 'Daily English' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredScenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <span>
                    {scenario.categoryLabel} · {scenario.difficulty}
                  </span>
                  <span className="font-mono tabular-nums">{scenario.durationMinutes} min</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display mb-2">
                  {scenario.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {scenario.contextBrief}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Coach: {scenario.tutorPersona} ({scenario.tutorRole})
                </span>
                <button
                  type="button"
                  onClick={() => onStartScenario(scenario.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Launch Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
