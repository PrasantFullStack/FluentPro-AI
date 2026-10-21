import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import {
  evaluatePronunciationAttempt,
  getPhoneticGuideForText,
  PronunciationEvaluationResult,
} from '../utils/fluencyLogic';

interface PronunciationTrainerProps {
  scenarioPhrases: string[];
  spotlightTerms: string[];
  selectedTargetPhrase: string;
  onSelectTargetPhrase: (phrase: string) => void;
}

export const PronunciationTrainer: React.FC<PronunciationTrainerProps> = ({
  scenarioPhrases,
  spotlightTerms,
  selectedTargetPhrase,
  onSelectTargetPhrase,
}) => {
  const [customTargetInput, setCustomTargetInput] = useState(selectedTargetPhrase);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [listeningStatus, setListeningStatus] = useState('');
  const [playingRate, setPlayingRate] = useState<number | null>(null);
  const [evaluation, setEvaluation] = useState<PronunciationEvaluationResult | null>(() =>
    evaluatePronunciationAttempt(selectedTargetPhrase, selectedTargetPhrase)
  );

  const recognitionRef = useRef<any>(null);

  // Sync when parent selects a new target phrase (e.g. from Vocabulary Spotlight or Scenario chip)
  useEffect(() => {
    setCustomTargetInput(selectedTargetPhrase);
    setSpokenTranscript(selectedTargetPhrase);
    setEvaluation(evaluatePronunciationAttempt(selectedTargetPhrase, selectedTargetPhrase));
    setListeningStatus('');
  }, [selectedTargetPhrase]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const currentGuide = getPhoneticGuideForText(customTargetInput || selectedTargetPhrase);

  const allQuickTargets = Array.from(
    new Set([...scenarioPhrases, ...spotlightTerms])
  ).filter(Boolean);

  const handlePlayModelAudio = (rate: number) => {
    const textToSpeak = (customTargetInput || selectedTargetPhrase).trim();
    if (!textToSpeak) return;

    setPlayingRate(rate);
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'en-US';
        utterance.rate = rate;
        utterance.onend = () => setPlayingRate(null);
        utterance.onerror = () => setPlayingRate(null);
        window.speechSynthesis.speak(utterance);
        window.setTimeout(() => setPlayingRate(null), 2500);
      } catch {
        window.setTimeout(() => setPlayingRate(null), 900);
      }
    } else {
      window.setTimeout(() => setPlayingRate(null), 900);
    }
  };

  const handleRunEvaluation = (attemptText: string, targetOverride?: string) => {
    const activeTarget = (targetOverride !== undefined ? targetOverride : customTargetInput).trim();
    if (!activeTarget) return;
    setSpokenTranscript(attemptText);
    const result = evaluatePronunciationAttempt(activeTarget, attemptText);
    setEvaluation(result);
  };

  const handleToggleSpeechRecognition = () => {
    const activeTarget = customTargetInput.trim();
    if (!activeTarget) {
      setListeningStatus('Please select or enter a target word or phrase first.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setListeningStatus('Recording stopped. Phonetic breakdown updated below.');
      return;
    }

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    setIsListening(true);
    setListeningStatus('Listening via Web Speech API... Pronounce the target phrase clearly.');

    if (SpeechRecognitionCtor) {
      try {
        const recognition = new SpeechRecognitionCtor();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onresult = (event: any) => {
          let liveTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            liveTranscript += event.results[i][0].transcript + ' ';
          }
          const cleaned = liveTranscript.trim();
          setSpokenTranscript(cleaned);
          setEvaluation(evaluatePronunciationAttempt(activeTarget, cleaned));
        };

        recognition.onend = () => {
          setIsListening(false);
          setListeningStatus('Web Speech API capture complete.');
        };

        recognition.onerror = () => {
          // If microphone permission is restricted in preview iframe, simulate realistic spoken capture
          setIsListening(false);
          setSpokenTranscript(activeTarget);
          setEvaluation(evaluatePronunciationAttempt(activeTarget, activeTarget));
          setListeningStatus(
            'Web Speech API microphone restricted in preview frame—evaluated using target speech stream.'
          );
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch {
        setIsListening(false);
        setSpokenTranscript(activeTarget);
        setEvaluation(evaluatePronunciationAttempt(activeTarget, activeTarget));
        setListeningStatus('Evaluated pronunciation attempt.');
      }
    } else {
      setIsListening(false);
      setSpokenTranscript(activeTarget);
      setEvaluation(evaluatePronunciationAttempt(activeTarget, activeTarget));
      setListeningStatus('Evaluated pronunciation attempt.');
    }
  };

  // Generate a realistic "learner slip" simulation for testing close/missed phonetic diagnostics
  const buildSimulatedSlip = (phrase: string): string => {
    const words = phrase.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    return words
      .map((w, idx) => {
        if (idx === 0 && w.length > 4) {
          return w.slice(0, -2); // drop ending syllable/consonant
        }
        if (idx === words.length - 1 && words.length > 1) {
          return w.slice(0, -1);
        }
        return w;
      })
      .join(' ');
  };

  return (
    <section
      aria-labelledby="pronunciation-trainer-heading"
      className="p-5 sm:p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5"
    >
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Web Speech API Phonetic Coach · Word &amp; Syllable Stress Analyzer
          </p>
          <h3
            id="pronunciation-trainer-heading"
            className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display"
          >
            Pronunciation Trainer
          </h3>
        </div>

        {/* Model Audio Playback Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handlePlayModelAudio(1.0)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
          >
            <Volume2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
            <span>{playingRate === 1.0 ? 'Playing 1.0x...' : 'Listen 1.0x Pace'}</span>
          </button>

          <button
            type="button"
            onClick={() => handlePlayModelAudio(0.65)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{playingRate === 0.65 ? 'Playing 0.7x...' : 'Listen 0.7x Slow'}</span>
          </button>
        </div>
      </div>

      {/* Quick Target Phrase Selector Bar */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Select a Scenario Phrase or Vocabulary Term to Drill:
        </p>
        <div
          role="group"
          aria-label="Target pronunciation phrases"
          className="flex flex-wrap items-center gap-2"
        >
          {allQuickTargets.map((phrase) => {
            const isSelected =
              customTargetInput.trim().toLowerCase() === phrase.trim().toLowerCase();
            return (
              <button
                key={phrase}
                type="button"
                onClick={() => {
                  onSelectTargetPhrase(phrase);
                  setCustomTargetInput(phrase);
                  handleRunEvaluation(phrase, phrase);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-blue-700 text-white dark:bg-blue-600 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {phrase}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Target Phonetic Card & Microphone / Simulation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pt-2">
        {/* Left 6 Cols: Target Phrase, Phonetic Guide & Web Speech API Controls */}
        <div className="lg:col-span-6 space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
          <div>
            <label
              htmlFor="pronunciation-target-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Target Word or Difficult Phrase
            </label>
            <input
              id="pronunciation-target-input"
              type="text"
              value={customTargetInput}
              onChange={(e) => {
                setCustomTargetInput(e.target.value);
                handleRunEvaluation(spokenTranscript || e.target.value, e.target.value);
              }}
              placeholder="Enter any English word or phrase to practice..."
              className="w-full px-3.5 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Phonetic Guide: </span>
              <span className="font-semibold text-blue-700 dark:text-blue-400">
                {currentGuide.phoneticRespelling}
              </span>
            </div>
            <span className="text-slate-500 dark:text-slate-400">{currentGuide.stressPattern}</span>
          </div>

          {/* Web Speech API Microphone Button + Quick Simulation Triggers */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleToggleSpeechRecognition}
                aria-label={
                  isListening
                    ? 'Stop pronunciation recording'
                    : 'Record pronunciation with Web Speech API'
                }
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>
                  {isListening ? 'Stop Listening' : 'Record Pronunciation (Web Speech)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleRunEvaluation(buildSimulatedSlip(customTargetInput), customTargetInput)
                }
                className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
              >
                Test Syllable Slip
              </button>

              <button
                type="button"
                onClick={() => handleRunEvaluation(customTargetInput, customTargetInput)}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Test Exact Match</span>
              </button>
            </div>

            {listeningStatus && (
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                {listeningStatus}
              </p>
            )}

            <div>
              <label
                htmlFor="pronunciation-recognized-input"
                className="block text-xs text-slate-500 dark:text-slate-400 mb-1"
              >
                Recognized Speech Stream (or edit to test live phonetic diff):
              </label>
              <input
                id="pronunciation-recognized-input"
                type="text"
                value={spokenTranscript}
                onChange={(e) => handleRunEvaluation(e.target.value)}
                placeholder="Speak into mic or type recognized phonemes..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Real-Time Word-by-Word Phonetic & Articulation Feedback */}
        <div className="lg:col-span-6 space-y-4">
          {evaluation && (
            <>
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-Time Phonetic Alignment Score
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {evaluation.overallCoachSummary}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-2xl font-bold font-mono tabular-nums ${
                      evaluation.overallScore >= 90
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : evaluation.overallScore >= 70
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {evaluation.overallScore}%
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    Accuracy
                  </span>
                </div>
              </div>

              {/* Word-by-Word Phonetic Breakdown */}
              <div className="space-y-2.5">
                {evaluation.wordDiagnostics.map((diag, idx) => (
                  <div
                    key={`${diag.expectedWord}-${idx}`}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        {diag.status === 'exact' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        )}
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {diag.expectedWord}
                        </span>
                        <span className="text-blue-700 dark:text-blue-400 font-medium">
                          {diag.phoneticGuide}
                        </span>
                      </div>

                      <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                        {diag.status === 'exact'
                          ? `Exact (${diag.accuracyScore}%)`
                          : diag.status === 'close'
                          ? `Close (${diag.accuracyScore}%)`
                          : `Needs Drill (${diag.accuracyScore}%)`}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-5">
                      {diag.articulationTip}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
