import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  BookmarkPlus,
  Check,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  ConversationMessage,
  ConversationScenario,
  ProficiencyLevel,
  TutorTurnResponse,
  VocabularySpotlightItem,
} from '../types/fluentpro';
import { fluentProApiClient } from '../services/apiClient';
import { PronunciationTrainer } from './PronunciationTrainer';

interface TutorStudioViewProps {
  scenarios: ConversationScenario[];
  activeScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  proficiencyLevel: ProficiencyLevel;
  savedVocabTerms: Set<string>;
  onSaveVocabularyItem: (item: VocabularySpotlightItem, category: ConversationScenario['category']) => void;
  onSaveCompletedSession: (
    scenario: ConversationScenario,
    messages: ConversationMessage[],
    latestAnalysis: Omit<TutorTurnResponse, 'tutorReply' | 'followUpQuestion'> | null
  ) => void;
}

export const TutorStudioView: React.FC<TutorStudioViewProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  proficiencyLevel,
  savedVocabTerms,
  onSaveVocabularyItem,
  onSaveCompletedSession,
}) => {
  const activeScenario =
    scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: `init-${activeScenario.id}`,
      sender: 'tutor',
      text: activeScenario.openingPrompt,
      timestamp: 'Now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speechStatus, setSpeechStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string>('');
  const [sessionSavedNotice, setSessionSavedNotice] = useState<string>('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const [selectedAnalysis, setSelectedAnalysis] = useState<
    Omit<TutorTurnResponse, 'tutorReply' | 'followUpQuestion'> | null
  >(null);
  const [selectedPronunciationTarget, setSelectedPronunciationTarget] = useState<string>(
    activeScenario.targetPhrases[0] || 'mitigate downstream risk'
  );

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  // Reset conversation when scenario changes
  useEffect(() => {
    setMessages([
      {
        id: `init-${activeScenario.id}`,
        sender: 'tutor',
        text: activeScenario.openingPrompt,
        timestamp: 'Just now',
      },
    ]);
    setSelectedAnalysis(null);
    setSelectedPronunciationTarget(activeScenario.targetPhrases[0] || 'mitigate downstream risk');
    setInputText('');
    setErrorBanner('');
    setSessionSavedNotice('');
  }, [activeScenario.id, activeScenario.openingPrompt, activeScenario.targetPhrases]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleToggleMicrophone = async () => {
    setErrorBanner('');
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setSpeechStatus('Microphone stopped. Review or edit your transcript below before sending.');
      return;
    }

    // Start recording via Web Speech API if supported, or fallback to simulated Gemini transcription
    setIsRecording(true);
    setRecordingSeconds(0);
    setSpeechStatus('Listening... Speak naturally into your microphone.');

    timerRef.current = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionCtor) {
      try {
        const recognition = new SpeechRecognitionCtor();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript + ' ';
          }
          setInputText(transcript.trim());
        };

        recognition.onerror = () => {
          // Fallback to sample transcription if mic permission denied in sandboxed iframe
          const sampleFallback = activeScenario.sampleUserResponses[0];
          setInputText((prev) => prev || sampleFallback);
          setSpeechStatus(
            'Browser microphone restricted in preview frame—loaded scenario speech sample for testing.'
          );
          setIsRecording(false);
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch {
        const sampleFallback = activeScenario.sampleUserResponses[0];
        setInputText((prev) => prev || sampleFallback);
        setSpeechStatus('Loaded spoken sample transcript.');
        setIsRecording(false);
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    } else {
      // Fallback: call server-side /api/v1/audio/transcribe with simulated audio payload
      const res = await fluentProApiClient.transcribeAudio(
        'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
        'audio/wav',
        activeScenario.sampleUserResponses[0]
      );
      setInputText(res.transcript);
      setSpeechStatus('Transcribed speech via server-side audio pipeline.');
      setIsRecording(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handlePlayTutorAudio = async (messageId: string, text: string) => {
    setSpeakingMessageId(messageId);
    try {
      const ttsResult = await fluentProApiClient.synthesizeTutorSpeech(text, 'Kore');
      if (ttsResult.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${ttsResult.audioBase64}`);
        audio.onended = () => setSpeakingMessageId(null);
        audio.onerror = () => setSpeakingMessageId(null);
        await audio.play();
        return;
      }

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.98;
        utterance.onend = () => setSpeakingMessageId(null);
        utterance.onerror = () => setSpeakingMessageId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        window.setTimeout(() => setSpeakingMessageId(null), 1200);
      }
    } catch {
      setSpeakingMessageId(null);
    }
  };

  const handleSendTurn = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const messageToSend = (overrideText !== undefined ? overrideText : inputText).trim();

    if (!messageToSend) {
      setErrorBanner('Please speak or type your response in English before submitting.');
      return;
    }

    setErrorBanner('');
    setSessionSavedNotice('');
    if (isRecording) {
      setIsRecording(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    const userMsgId = `usr-${Date.now()}`;
    const newUserMessage: ConversationMessage = {
      id: userMsgId,
      sender: 'user',
      text: messageToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      audioDurationSec: recordingSeconds > 0 ? recordingSeconds : Math.max(4, Math.round(messageToSend.split(/\s+/).length * 0.45)),
    };

    const updatedHistory = [...messages, newUserMessage];
    setMessages(updatedHistory);
    setInputText('');
    setRecordingSeconds(0);
    setSpeechStatus('');
    setIsSubmitting(true);

    try {
      const turnResponse = await fluentProApiClient.submitTutorTurn({
        userMessage: messageToSend,
        scenarioTitle: activeScenario.title,
        scenarioCategory: activeScenario.category,
        tutorPersona: activeScenario.tutorPersona,
        tutorRole: activeScenario.tutorRole,
        contextBrief: activeScenario.contextBrief,
        proficiencyLevel,
        conversationHistory: updatedHistory.map((m) => ({ sender: m.sender, text: m.text })),
      });

      const analysisForTurn: Omit<TutorTurnResponse, 'tutorReply' | 'followUpQuestion'> = {
        grammarCorrection: turnResponse.grammarCorrection,
        naturalSuggestions: turnResponse.naturalSuggestions,
        vocabularySpotlight: turnResponse.vocabularySpotlight,
        speakingMetrics: turnResponse.speakingMetrics,
        source: turnResponse.source,
      };

      const tutorReplyMessage: ConversationMessage = {
        id: `tut-${Date.now()}`,
        sender: 'tutor',
        text: `${turnResponse.tutorReply} ${turnResponse.followUpQuestion}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) =>
        prev
          .map((m) => (m.id === userMsgId ? { ...m, analysis: analysisForTurn } : m))
          .concat(tutorReplyMessage)
      );
      setSelectedAnalysis(analysisForTurn);
    } catch (err: any) {
      setErrorBanner(err?.message || 'Unable to reach coaching service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteSession = () => {
    onSaveCompletedSession(activeScenario, messages, selectedAnalysis);
    setSessionSavedNotice(
      'Session saved to Conversation History and daily practice progress updated.'
    );
  };

  const userTurnCount = messages.filter((m) => m.sender === 'user').length;

  return (
    <div className="space-y-6">
      {/* Scenario Selector Header Bar */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active Speaking Scenario · {activeScenario.categoryLabel} · {activeScenario.difficulty}
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display">
              {activeScenario.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="studio-scenario-select" className="sr-only">
              Switch Conversation Scenario
            </label>
            <select
              id="studio-scenario-select"
              value={activeScenario.id}
              onChange={(e) => onSelectScenario(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              {scenarios.map((scen) => (
                <option key={scen.id} value={scen.id}>
                  {scen.categoryLabel}: {scen.title}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setMessages([
                  {
                    id: `init-${Date.now()}`,
                    sender: 'tutor',
                    text: activeScenario.openingPrompt,
                    timestamp: 'Just now',
                  },
                ]);
                setSelectedAnalysis(null);
                setSessionSavedNotice('');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Turn</span>
            </button>

            {userTurnCount > 0 && (
              <button
                type="button"
                onClick={handleCompleteSession}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Log Session ({userTurnCount} {userTurnCount === 1 ? 'turn' : 'turns'})</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
          <strong className="text-slate-900 dark:text-white">Roleplay Context:</strong>{' '}
          {activeScenario.contextBrief}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Coach Persona: {activeScenario.tutorPersona} ({activeScenario.tutorRole})</span>
          <span aria-hidden="true">·</span>
          <span>Target Vocabulary: {activeScenario.targetPhrases.join(', ')}</span>
        </div>
      </div>

      {sessionSavedNotice && (
        <div
          role="status"
          className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 flex items-center justify-between"
        >
          <span>{sessionSavedNotice}</span>
          <button
            type="button"
            onClick={() => setSessionSavedNotice('')}
            className="text-xs font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Two-Column Studio Split: Conversation Stream + Linguistic Analysis Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Live Conversation & Voice Recorder */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col">
          {/* Conversation Feed */}
          <div className="p-5 sm:p-6 space-y-5 max-h-[480px] overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {msg.sender === 'tutor' ? activeScenario.tutorPersona : 'You'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{msg.timestamp}</span>
                  {msg.audioDurationSec && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{msg.audioDurationSec}s spoken</span>
                    </>
                  )}
                </div>

                <div
                  className={`max-w-xl p-4 rounded-xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-700 text-white dark:bg-blue-600'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>

                <div className="mt-1.5 flex items-center gap-3 text-xs">
                  {msg.sender === 'tutor' && (
                    <button
                      type="button"
                      onClick={() => handlePlayTutorAudio(msg.id, msg.text)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>
                        {speakingMessageId === msg.id ? 'Playing Audio...' : 'Listen to Pronunciation'}
                      </span>
                    </button>
                  )}

                  {msg.sender === 'user' && msg.analysis && (
                    <button
                      type="button"
                      onClick={() => setSelectedAnalysis(msg.analysis!)}
                      className="text-blue-700 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                    >
                      Inspect Turn Feedback ({msg.analysis.speakingMetrics.grammarScore}/100 Grammar)
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isSubmitting && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                Analyzing spoken grammar, register alternatives, and C1 vocabulary...
              </div>
            )}
          </div>

          {/* Quick-Test Spoken Sample Prompts Bar */}
          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Quick-Test Spoken Responses (Click to simulate speaking into microphone):
            </p>
            <div className="flex flex-wrap gap-2">
              {activeScenario.sampleUserResponses.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendTurn(undefined, sample)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-xs text-left text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 rounded-lg transition-colors cursor-pointer truncate max-w-xs"
                  title={sample}
                >
                  Sample {idx + 1}: “{sample.slice(0, 42)}...”
                </button>
              ))}
            </div>
          </div>

          {/* Microphone & Text Input Composer */}
          <form
            onSubmit={(e) => handleSendTurn(e)}
            className="p-5 border-t border-slate-200 dark:border-slate-800 space-y-3"
          >
            {errorBanner && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorBanner}</span>
              </div>
            )}

            {speechStatus && (
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                {speechStatus} {isRecording && `(${recordingSeconds}s)`}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleToggleMicrophone}
                aria-label={isRecording ? 'Stop microphone recording' : 'Start microphone speaking practice'}
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isRecording ? `Stop Mic (${recordingSeconds}s)` : 'Speak with Mic'}</span>
              </button>

              <label htmlFor="tutor-speech-input" className="sr-only">
                Spoken transcript or typed English response
              </label>
              <input
                id="tutor-speech-input"
                type="text"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (errorBanner) setErrorBanner('');
                }}
                placeholder="Speak with mic or type your English response here..."
                className="flex-1 px-4 py-3 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Analyze &amp; Reply</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (5 cols): Real-Time Linguistic Coaching Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6">
          <div className="pb-4 mb-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-Time Linguistic Diagnostics
              </p>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Grammar, Register &amp; Vocabulary Feedback
              </h3>
            </div>
            <Sparkles className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
          </div>

          {!selectedAnalysis ? (
            <div className="py-8 text-center space-y-4">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Submit your first spoken or typed turn to unlock live coaching.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                You will receive immediate grammar corrections, 3 native phrasing upgrades
                (Executive, Idiomatic, Concise), and C1–C2 vocabulary explanations that you can save
                to your notebook.
              </p>
              <button
                type="button"
                onClick={() => handleSendTurn(undefined, activeScenario.sampleUserResponses[0])}
                className="px-4 py-2 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
              >
                Run Diagnostics on Sample Turn 1
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Turn Scores Strip */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Grammar</p>
                  <p className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                    {selectedAnalysis.speakingMetrics.grammarScore}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Vocabulary</p>
                  <p className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                    {selectedAnalysis.speakingMetrics.vocabularyScore}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Fluency</p>
                  <p className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                    {selectedAnalysis.speakingMetrics.fluencyScore}%
                  </p>
                </div>
              </div>

              {/* Grammar Correction Block */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    1. Grammar &amp; Syntax Check
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {selectedAnalysis.grammarCorrection.ruleCategory}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs sm:text-sm">
                  {selectedAnalysis.grammarCorrection.hasIssues ? (
                    <>
                      <p className="text-slate-500 dark:text-slate-400 line-through">
                        {selectedAnalysis.grammarCorrection.original}
                      </p>
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {selectedAnalysis.grammarCorrection.corrected}
                      </p>
                    </>
                  ) : (
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                      ✓ Clean grammatical structure: “{selectedAnalysis.grammarCorrection.corrected}”
                    </p>
                  )}
                  <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-800">
                    {selectedAnalysis.grammarCorrection.explanation}
                  </p>
                </div>
              </div>

              {/* Natural Sentence Suggestions */}
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  2. Native Phrasing Upgrades
                </p>
                <div className="space-y-2.5">
                  {selectedAnalysis.naturalSuggestions.map((sug, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                          {sug.tone}
                        </span>
                        <button
                          type="button"
                          onClick={() => setInputText(sug.text)}
                          className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
                        >
                          Use Phrasing
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white mb-1">
                        “{sug.text}”
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{sug.nuanceNote}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vocabulary Spotlight */}
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  3. Vocabulary Spotlight (Save to Notebook)
                </p>
                <div className="space-y-2.5">
                  {selectedAnalysis.vocabularySpotlight.map((voc) => {
                    const isSaved = savedVocabTerms.has(voc.term.toLowerCase());
                    return (
                      <div
                        key={voc.term}
                        className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="text-xs">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {voc.term}
                            </span>{' '}
                            <span className="text-slate-500">{voc.phonetic}</span> ·{' '}
                            <span className="text-slate-500">
                              {voc.partOfSpeech} · CEFR {voc.cefrLevel}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedPronunciationTarget(voc.term)}
                              className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              Drill Phonetics
                            </button>
                            <button
                              type="button"
                              onClick={() => onSaveVocabularyItem(voc, activeScenario.category)}
                              disabled={isSaved}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                isSaved
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-blue-700 hover:bg-blue-800 text-white'
                              }`}
                            >
                              {isSaved ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Saved</span>
                                </>
                              ) : (
                                <>
                                  <BookmarkPlus className="w-3 h-3" />
                                  <span>Save Word</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mb-1">
                          {voc.definition}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                          Example: “{voc.exampleSentence}”
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery & Clarity Tip */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">Coach Delivery Tip:</strong>{' '}
                {selectedAnalysis.speakingMetrics.clarityTip}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pronunciation Trainer Component (Web Speech API Real-Time Phonetic Feedback) */}
      <PronunciationTrainer
        scenarioPhrases={activeScenario.targetPhrases}
        spotlightTerms={
          selectedAnalysis
            ? selectedAnalysis.vocabularySpotlight.map((v) => v.term)
            : ['actionable', 'mitigate', 'spearhead']
        }
        selectedTargetPhrase={selectedPronunciationTarget}
        onSelectTargetPhrase={setSelectedPronunciationTarget}
      />
    </div>
  );
};
