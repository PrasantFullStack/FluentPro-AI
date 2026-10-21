export type ScenarioCategory =
  | 'daily-english'
  | 'job-interviews'
  | 'storytelling'
  | 'professional-communication';

export type ProficiencyLevel = 'B1 Intermediate' | 'B2 Upper-Intermediate' | 'C1 Advanced' | 'C2 Executive';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  proficiencyLevel: ProficiencyLevel;
  primaryGoal: string;
  dailyTargetMinutes: number;
  streakDays: number;
  completedMinutesToday: number;
  isDemoAccount: boolean;
}

export interface GrammarCorrection {
  hasIssues: boolean;
  original: string;
  corrected: string;
  explanation: string;
  ruleCategory: string;
}

export interface NaturalSuggestion {
  tone: 'Executive & Formal' | 'Idiomatic & Natural' | 'Concise & Direct';
  text: string;
  nuanceNote: string;
}

export interface VocabularySpotlightItem {
  term: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  exampleSentence: string;
  cefrLevel: 'B1' | 'B2' | 'C1' | 'C2';
}

export interface SpeakingMetrics {
  grammarScore: number;
  vocabularyScore: number;
  fluencyScore: number;
  clarityTip: string;
  wordsPerMinute?: number;
}

export interface TutorTurnResponse {
  tutorReply: string;
  followUpQuestion: string;
  grammarCorrection: GrammarCorrection;
  naturalSuggestions: NaturalSuggestion[];
  vocabularySpotlight: VocabularySpotlightItem[];
  speakingMetrics: SpeakingMetrics;
  source: 'gemini-live' | 'deterministic-engine';
}

export interface ConversationMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  audioDurationSec?: number;
  analysis?: Omit<TutorTurnResponse, 'tutorReply' | 'followUpQuestion'>;
}

export interface ConversationScenario {
  id: string;
  title: string;
  category: ScenarioCategory;
  categoryLabel: string;
  difficulty: ProficiencyLevel;
  durationMinutes: number;
  tutorPersona: string;
  tutorRole: string;
  contextBrief: string;
  openingPrompt: string;
  targetPhrases: string[];
  sampleUserResponses: string[];
}

export interface VocabularyNotebookEntry {
  id: string;
  term: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  exampleSentence: string;
  cefrLevel: 'B1' | 'B2' | 'C1' | 'C2';
  category: ScenarioCategory;
  masteryStatus: 'learning' | 'reviewing' | 'mastered';
  addedAt: string;
  reviewCount: number;
}

export interface ConversationSessionRecord {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  category: ScenarioCategory;
  dateIso: string;
  durationMinutes: number;
  turnCount: number;
  overallScore: number;
  grammarAccuracy: number;
  vocabularyRichness: number;
  fluencyRating: number;
  keyTakeaway: string;
  messages: ConversationMessage[];
}

export interface DailyChallenge {
  id: string;
  title: string;
  category: ScenarioCategory;
  description: string;
  targetPhrase: string;
  targetScenarioId: string;
  xpReward: number;
  durationMinutes: number;
  completed: boolean;
}

export interface SpringBootEndpointSpec {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  controllerClass: string;
  requestDto: string;
  responseDto: string;
  mysqlTable: string;
  description: string;
}
