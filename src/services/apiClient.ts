import {
  ConversationMessage,
  ProficiencyLevel,
  ScenarioCategory,
  TutorTurnResponse,
} from '../types/fluentpro';
import { analyzeLocalSpeechHeuristics } from '../utils/fluencyLogic';

/**
 * Separated Frontend API Layer for FluentPro AI.
 *
 * Architectural Note:
 * In this web prototype, API calls route to the local Node/Express server (`/api/v1/*`)
 * which securely invokes `@google/genai` on the server side.
 *
 * When migrating to the production Java Spring Boot + MySQL backend (or sharing this
 * service module with the React Native mobile client), set `VITE_SPRING_BOOT_API_URL`
 * to point to your Spring Boot gateway (e.g., `https://api.fluentpro.io/api/v1`).
 */
const API_BASE_URL = import.meta.env.VITE_SPRING_BOOT_API_URL || '/api/v1';

export interface SubmitTutorTurnPayload {
  userMessage: string;
  scenarioTitle: string;
  scenarioCategory: ScenarioCategory;
  tutorPersona: string;
  tutorRole: string;
  contextBrief: string;
  proficiencyLevel: ProficiencyLevel;
  conversationHistory: Array<Pick<ConversationMessage, 'sender' | 'text'>>;
}

export const fluentProApiClient = {
  getBaseUrl(): string {
    return API_BASE_URL;
  },

  async checkGatewayHealth(): Promise<{
    status: string;
    service: string;
    geminiConfigured: boolean;
    targetArchitecture: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed with status ${response.status}`);
      }
      return await response.json();
    } catch {
      return {
        status: 'LOCAL_FALLBACK',
        service: 'fluentpro-client-adapter',
        geminiConfigured: false,
        targetArchitecture: 'Spring Boot 3.4 REST API + MySQL 8.0',
      };
    }
  },

  async submitTutorTurn(payload: SubmitTutorTurnPayload): Promise<TutorTurnResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor/turns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch {
      const localResult = analyzeLocalSpeechHeuristics(
        payload.userMessage,
        payload.scenarioCategory
      );
      return {
        ...localResult,
        source: 'deterministic-engine',
      };
    }
  },

  async transcribeAudio(
    audioBase64: string,
    mimeType: string = 'audio/webm',
    fallbackPromptContext?: string
  ): Promise<{ transcript: string; source: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/audio/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioBase64, mimeType, fallbackPromptContext }),
      });

      if (!response.ok) {
        throw new Error(`Transcription failed with status ${response.status}`);
      }
      return await response.json();
    } catch {
      return {
        transcript:
          fallbackPromptContext ||
          'Yesterday we discuss about the Q3 engineering timeline and how we can mitigate delivery risks.',
        source: 'deterministic-fallback',
      };
    }
  },

  async synthesizeTutorSpeech(
    text: string,
    voiceName: string = 'Kore'
  ): Promise<{ audioBase64: string | null; useBrowserSpeechFallback: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/audio/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voiceName }),
      });

      if (!response.ok) {
        return { audioBase64: null, useBrowserSpeechFallback: true };
      }
      return await response.json();
    } catch {
      return { audioBase64: null, useBrowserSpeechFallback: true };
    }
  },
};
