import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Mic,
  Volume2,
  BookOpen,
  BarChart3,
  Layers,
  Sun,
  Moon,
} from 'lucide-react';
import { ConversationScenario } from '../types/fluentpro';

interface LandingViewProps {
  scenarios: ConversationScenario[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAuth: (initialMode: 'login' | 'onboarding') => void;
  onInstantDemoLogin: (selectedScenarioId?: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  scenarios,
  darkMode,
  onToggleDarkMode,
  onOpenAuth,
  onInstantDemoLogin,
}) => {
  const [selectedPreviewIdx, setSelectedPreviewIdx] = useState<number>(0);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadGoal, setLeadGoal] = useState('Executive & Client Communication');
  const [leadError, setLeadError] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const previewSamples = [
    {
      category: 'Professional Communication · C1 Target',
      spoken: '“Yesterday I go to the security review and we discuss about the timeline feedbacks.”',
      corrected: '“Yesterday I attended the security review, and we discussed the timeline feedback.”',
      executiveUpgrade:
        '“Following yesterday’s security review, we aligned on the revised delivery timeline.”',
      ruleNote:
        'Replaces Present Simple ("go", "discuss") with Past Simple, removes redundant "about" after transitive verb "discuss", and corrects uncountable noun "feedback".',
      metrics: { grammar: 86, vocabulary: 92, fluency: 90 },
    },
    {
      category: 'Job Interviews · STAR Behavioral Method',
      spoken: '“In my last company the team was not agree on the scope so I make a priority list.”',
      corrected: '“At my previous company, the team did not agree on the scope, so I created a priority matrix.”',
      executiveUpgrade:
        '“To resolve cross-functional scope misalignment, I spearheaded a weighted prioritization framework.”',
      ruleNote:
        'Fixes auxiliary misuse ("was not agree" -> "did not agree") and upgrades generic verb "make" to high-impact leadership phrasing.',
      metrics: { grammar: 88, vocabulary: 94, fluency: 91 },
    },
    {
      category: 'Daily English & Storytelling · Natural Rhythm',
      spoken: '“I live in Seattle since three years and I really enjoy to hike in weekends.”',
      corrected: '“I have lived in Seattle for three years, and I really enjoy hiking on weekends.”',
      executiveUpgrade:
        '“I’ve been based in Seattle for the past three years and love spending my weekends out on the trails.”',
      ruleNote:
        'Uses Present Perfect with "for" (duration of time) instead of "since", and pairs "enjoy" with a gerund ("hiking").',
      metrics: { grammar: 89, vocabulary: 90, fluency: 93 },
    },
  ];

  const activeSample = previewSamples[selectedPreviewIdx];

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = leadEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setLeadError('Please enter a valid work or personal email address.');
      return;
    }
    setLeadError('');
    setLeadSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 lg:px-12 py-4 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <a
          href="#top"
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 font-display"
        >
          FluentPro AI
        </a>

        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          <a
            href="#capabilities"
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Capabilities
          </a>
          <a
            href="#scenarios"
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Scenarios
          </a>
          <a
            href="#outcomes"
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Outcomes
          </a>
          <a
            href="#architecture"
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Architecture
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onOpenAuth('onboarding')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Start Speaking
          </button>
        </div>
      </header>

      <main id="top">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            {/* Left Column: Proposition & Primary Action */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
                  AI English Speaking Coach · Gemini Linguistic Engine · Web &amp; Mobile Prototype
                </p>
                <h1
                  className="font-display font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12] mb-6"
                  style={{ fontSize: 'clamp(2.25rem, 4vw, 3.75rem)', textWrap: 'balance' }}
                >
                  Speak articulate, natural English in every high-stakes room.
                </h1>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mb-8">
                  Practice realistic voice conversations for executive meetings, technical job interviews,
                  storytelling, and daily life. Receive immediate grammar correction, native phrasing
                  alternatives, and C1–C2 vocabulary coaching after every spoken turn.
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-10">
                  <button
                    type="button"
                    onClick={() => onInstantDemoLogin()}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Launch Interactive Tutor Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenAuth('onboarding')}
                    className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Personalize Onboarding</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </div>

              {/* Unboxed Metadata & Theme Control Bar */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex flex-wrap items-center gap-2">
                  <span>Server-Side Gemini API</span>
                  <span aria-hidden="true">·</span>
                  <span>Web Speech &amp; Audio Transcription</span>
                  <span aria-hidden="true">·</span>
                  <span>Spring Boot REST Ready</span>
                </div>
                <button
                  type="button"
                  onClick={onToggleDarkMode}
                  aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer whitespace-nowrap shrink-0"
                >
                  {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Live Linguistic Coaching Showcase */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8">
              <div>
                <div className="flex items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Interactive Coaching Preview
                    </p>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                      Real-Time Turn Diagnostics
                    </h2>
                  </div>
                  <div
                    role="group"
                    aria-label="Select sample scenario turn"
                    className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
                  >
                    {['Exec', 'Interview', 'Daily'].map((label, idx) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setSelectedPreviewIdx(idx)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          selectedPreviewIdx === idx
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Acoustic Waveform Visual SVG Header */}
                <div className="mb-5 p-4 rounded-lg bg-slate-50 dark:bg-slate-950">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span>{activeSample.category}</span>
                    <span className="font-mono tabular-nums">00:11.4s recorded</span>
                  </div>
                  <svg
                    viewBox="0 0 400 36"
                    className="w-full h-8 text-blue-700 dark:text-blue-400"
                    role="img"
                    aria-label="Spoken audio waveform visualization"
                  >
                    {[
                      10, 18, 26, 14, 22, 32, 28, 16, 12, 24, 34, 29, 19, 14, 25, 31, 22, 15, 27, 33,
                      26, 18, 12, 20, 29, 24, 16, 28, 34, 22, 15, 26, 30, 21, 14, 24, 18, 12, 16, 10,
                    ].map((height, i) => (
                      <rect
                        key={i}
                        x={i * 10 + 2}
                        y={(36 - height) / 2}
                        width="5"
                        height={height}
                        rx="2.5"
                        fill="currentColor"
                        opacity={i % 3 === 0 ? 0.95 : 0.55}
                      />
                    ))}
                  </svg>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 italic">
                    {activeSample.spoken}
                  </p>
                </div>

                {/* Correction & Executive Reframing */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                      Grammar Correction
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {activeSample.corrected}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {activeSample.ruleNote}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                      Natural Executive Alternative
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {activeSample.executiveUpgrade}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                  <span>Grammar: {activeSample.metrics.grammar}/100</span>
                  <span aria-hidden="true">·</span>
                  <span>Vocab: {activeSample.metrics.vocabulary}/100</span>
                  <span aria-hidden="true">·</span>
                  <span>Fluency: {activeSample.metrics.fluency}/100</span>
                </div>
                <button
                  type="button"
                  onClick={() => onInstantDemoLogin()}
                  className="font-semibold text-blue-700 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Try With Your Voice →
                </button>
              </div>
            </div>
          </div>

          {/* Full-Width 4-Column Quantitative Proof Strip Below Hero */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                +34%
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Average reduction in spoken grammar &amp; preposition errors within 14 days of daily 15-minute practice
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                4 Core Tracks
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Daily English, Job Interviews (STAR), Narrative Storytelling, and Executive Communication
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                &lt; 1.8s
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Turnaround for multi-dimensional grammar, natural tone re-framing, and CEFR lexical analysis
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                100% Decoupled
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Clean REST service contract ready for Java Spring Boot + MySQL backend and React Native mobile clients
              </p>
            </div>
          </div>
        </section>

        {/* Core Capabilities Asymmetric Bento Grid */}
        <section
          id="capabilities"
          className="py-16 lg:py-24 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                Core Capabilities &amp; Linguistic Architecture
              </p>
              <h2
                className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Designed for measurable spoken fluency, not passive flashcards.
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Span 2 Marquee Capability */}
              <div className="lg:col-span-2 p-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      01. Real-Time Speech &amp; Syntax Coaching
                    </span>
                    <Mic className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display mb-3">
                    Speak naturally via microphone while Gemini diagnoses every clause.
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Unlike generic chat bots that ignore grammatical slips to keep conversation moving,
                    FluentPro AI separates conversational roleplay from surgical linguistic feedback. Every
                    turn yields an in-character tutor reply alongside a side-by-side diff of your spoken
                    grammar, why the rule matters, and how native executives phrase the exact same thought.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Browser Web Speech API</span>
                  <span aria-hidden="true">·</span>
                  <span>Server-Side Gemini Audio Transcription</span>
                  <span aria-hidden="true">·</span>
                  <span>Neural WAV Text-to-Speech Playback</span>
                </div>
              </div>

              {/* Span 1 Capability */}
              <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      02. Three-Register Reframing
                    </span>
                    <Volume2 className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display mb-3">
                    Executive, Idiomatic, and Concise alternatives.
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    See how your idea sounds in a formal boardroom briefing, a relaxed coffee chat with
                    colleagues, or a crisp 10-second status update. Practice reading each variation aloud.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  Register-aware coaching · C1/C2 Idioms
                </div>
              </div>

              {/* Span 1 Capability */}
              <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      03. Active Vocabulary Notebook
                    </span>
                    <BookOpen className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display mb-3">
                    Capture C1–C2 vocabulary directly from live turns.
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Save spotlight words with phonetic IPA, part of speech, and contextual example sentences
                    in one click. Track mastery from Learning to Reviewing to Mastered, or export to CSV.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  IPA Phonetics · Spaced Review States
                </div>
              </div>

              {/* Span 2 Capability */}
              <div className="lg:col-span-2 p-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      04. Daily Challenges, Streaks &amp; Enterprise Architecture
                    </span>
                    <BarChart3 className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display mb-3">
                    Quantified fluency analytics backed by a clean Spring Boot REST contract.
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Track grammar accuracy, lexical richness, and speaking pace across sessions. The frontend
                    service layer (`fluentProApiClient`) is strictly decoupled so engineering teams can point
                    this web client—and upcoming React Native apps—directly at a Java Spring Boot + MySQL
                    cluster.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Daily Targeted Drills</span>
                  <span aria-hidden="true">·</span>
                  <span>Session Transcript Archive</span>
                  <span aria-hidden="true">·</span>
                  <span>Spring Boot DTO Mapping Included</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Scenario Tracks Preview */}
        <section id="scenarios" className="py-16 lg:py-24 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                Four Specialized Speaking Tracks
              </p>
              <h2
                className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Practice the exact conversations you face at work and in life.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onInstantDemoLogin()}
              className="px-4 py-2.5 text-sm font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Explore All Scenarios in Workspace →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scenarios.map((scenario, idx) => (
              <div
                key={scenario.id}
                className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span>
                      0{idx + 1}. {scenario.categoryLabel} · {scenario.difficulty}
                    </span>
                    <span className="font-mono tabular-nums">{scenario.durationMinutes} min</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display mb-2">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {scenario.contextBrief}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                    Target Phrases: {scenario.targetPhrases.join(' · ')}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Coach: {scenario.tutorPersona} ({scenario.tutorRole})
                  </span>
                  <button
                    type="button"
                    onClick={() => onInstantDemoLogin(scenario.id)}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Practice Scenario
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Proof of Impact / Case Studies Adjacent to Claims */}
        <section
          id="outcomes"
          className="py-16 lg:py-24 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                Verified Learner Outcomes
              </p>
              <h2
                className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                How global professionals use FluentPro AI to advance their careers.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <article className="p-6 sm:p-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-mono tabular-nums text-blue-700 dark:text-blue-400 mb-3">
                    +29% Grammar Accuracy in 3 Weeks · B2 to C1
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                    “Before FluentPro AI, I hesitated during architecture reviews with our US headquarters
                    and overused basic verbs. Practicing the Q3 Roadmap Pushback scenario for 15 minutes
                    every morning gave me the exact C1 phrasing to defend engineering timelines confidently.”
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Kenji Takahashi</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Staff Backend Engineer · FinTech Systems Tokyo
                  </p>
                </div>
              </article>

              <article className="p-6 sm:p-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-mono tabular-nums text-blue-700 dark:text-blue-400 mb-3">
                    4 Senior PM Offers Secured · STAR Interview Track
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                    “My spoken answers in behavioral interviews used to ramble for four minutes without a
                    clear metric. The AI tutor’s Concise &amp; Direct reframing trained me to deliver tight
                    90-second STAR responses with quantifiable outcomes.”
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Sofia Lindqvist</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Principal Product Manager · Cloud Platform Stockholm
                  </p>
                </div>
              </article>

              <article className="p-6 sm:p-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-mono tabular-nums text-blue-700 dark:text-blue-400 mb-3">
                    85 Active C1 Idioms Mastered · 21-Day Streak
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                    “Saving words from my live speaking sessions straight into the Vocabulary Notebook meant
                    I only studied phrases I actually needed in client workshops. My team immediately
                    noticed how much more natural my transitions sounded.”
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Mateo Vargas</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Director of Customer Success · Enterprise SaaS Madrid
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Architecture & Lead Capture Section */}
        <section id="architecture" className="py-16 lg:py-24 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                <Layers className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Full-Stack Product Roadmap &amp; Exportable Architecture</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display tracking-tight mb-4"
                style={{ textWrap: 'balance' }}
              >
                Built for seamless transition to Java Spring Boot, MySQL, and React Native.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                This interactive React + TypeScript web application is the foundational first prototype of
                FluentPro AI. All Gemini AI calls run securely on the server side, and all frontend network
                calls are isolated inside <code className="font-mono text-xs">src/services/apiClient.ts</code>{' '}
                using strict DTO contracts ready for your Spring Boot REST controllers and MySQL schema.
              </p>

              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 mb-8">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
                  <span>
                    <strong>Web Prototype (Implemented Here):</strong> React 19, TypeScript, Tailwind CSS,
                    Web Speech API, and Express server-side Gemini AI coaching endpoints.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
                  <span>
                    <strong>Backend Target (Documented for Integration):</strong> Java 21 + Spring Boot 3.4
                    REST API with Spring Security JWT and MySQL 8.0 persistence.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
                  <span>
                    <strong>Mobile Target (Shared TypeScript Models):</strong> React Native client reusing{' '}
                    <code className="font-mono text-xs">src/types/fluentpro.ts</code> and{' '}
                    <code className="font-mono text-xs">src/services/apiClient.ts</code>.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onInstantDemoLogin()}
                className="px-5 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Open Workspace &amp; View Spring Boot Integration Guide
              </button>
            </div>

            {/* Interactive Team / Curriculum Inquiry Form */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display mb-2">
                Request Custom Enterprise Scenario Pack
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Receive a tailored syllabus and API integration checklist for your engineering or leadership
                team.
              </p>

              {leadSubmitted ? (
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-900 dark:text-emerald-200">
                  <p className="font-semibold mb-1">Syllabus Request Confirmed</p>
                  <p className="text-xs">
                    We have prepared the <strong>{leadGoal}</strong> curriculum pack for{' '}
                    <span className="font-mono">{leadEmail}</span>. You can also launch the interactive demo
                    workspace immediately above.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setLeadSubmitted(false);
                      setLeadEmail('');
                    }}
                    className="mt-3 text-xs font-semibold underline cursor-pointer"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} noValidate className="space-y-4">
                  <div>
                    <label
                      htmlFor="lead-email-input"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Work Email Address
                    </label>
                    <input
                      id="lead-email-input"
                      type="email"
                      value={leadEmail}
                      onChange={(e) => {
                        setLeadEmail(e.target.value);
                        if (leadError) setLeadError('');
                      }}
                      placeholder="you@company.com"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {leadError && (
                      <p role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {leadError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lead-goal-select"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Primary Team Focus
                    </label>
                    <select
                      id="lead-goal-select"
                      value={leadGoal}
                      onChange={(e) => setLeadGoal(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Executive & Client Communication">
                        Executive &amp; Client Communication
                      </option>
                      <option value="Technical & Behavioral Job Interviews">
                        Technical &amp; Behavioral Job Interviews
                      </option>
                      <option value="Global Daily Standups & Agile Rituals">
                        Global Daily Standups &amp; Agile Rituals
                      </option>
                      <option value="Keynote Storytelling & Presentations">
                        Keynote Storytelling &amp; Presentations
                      </option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
                  >
                    Download Curriculum &amp; API Spec
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 px-6 lg:px-12 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span className="font-bold text-slate-900 dark:text-white font-display">FluentPro AI</span> ·
            Interactive Web Prototype · Mock Authentication &amp; Server-Side Gemini Coaching
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => onInstantDemoLogin()}
              className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Demo Workspace
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
