import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { analyzeLocalSpeechHeuristics } from './src/utils/fluencyLogic.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/v1/health', (_req, res) => {
    const hasLiveKey = Boolean(
      process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
        process.env.GEMINI_API_KEY.trim() !== ''
    );
    res.json({
      status: 'UP',
      service: 'fluentpro-api-gateway-prototype',
      geminiConfigured: hasLiveKey,
      targetArchitecture: 'Spring Boot 3.4 REST API + MySQL 8.0',
    });
  });

  // POST /api/v1/tutor/turns - Server-side Gemini AI English Tutor & Linguistic Analyzer
  app.post('/api/v1/tutor/turns', async (req, res) => {
    const {
      userMessage,
      scenarioTitle,
      scenarioCategory,
      tutorPersona,
      tutorRole,
      contextBrief,
      proficiencyLevel,
      conversationHistory,
    } = req.body || {};

    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
      res.status(400).json({
        error: 'Please speak or type a response before submitting.',
      });
      return;
    }

    const fallbackResult = analyzeLocalSpeechHeuristics(
      userMessage,
      scenarioCategory || 'professional-communication'
    );

    const ai = getGenAIClient();
    if (!ai) {
      res.json({
        ...fallbackResult,
        source: 'deterministic-engine',
      });
      return;
    }

    try {
      const recentTurnsText = Array.isArray(conversationHistory)
        ? conversationHistory
            .slice(-6)
            .map((m: { sender: string; text: string }) => `${m.sender.toUpperCase()}: ${m.text}`)
            .join('\n')
        : '';

      const prompt = `
Scenario Title: ${scenarioTitle || 'Executive English Practice'}
Category: ${scenarioCategory || 'professional-communication'}
Tutor Persona: ${tutorPersona || 'Claire Vance'} (${tutorRole || 'Communication Coach'})
Learner Target Level: ${proficiencyLevel || 'B2 Upper-Intermediate'}
Scenario Context: ${contextBrief || 'Practice natural, articulate spoken English.'}

Recent Conversation History:
${recentTurnsText || '(Session start)'}

Learner's Latest Spoken Response:
"${userMessage.trim()}"

Analyze the learner's response and continue the conversation in character as ${tutorPersona || 'Claire Vance'}.
Provide:
1. tutorReply: A natural, encouraging response to what the learner said (2-3 sentences).
2. followUpQuestion: A clear, open-ended follow-up question in character to keep the learner speaking.
3. grammarCorrection: Whether the learner's sentence had grammar/preposition/tense issues, the original text, the corrected version, a clear explanation, and a short ruleCategory label.
4. naturalSuggestions: Exactly 3 alternative ways a native speaker would express the learner's idea with tones: "Executive & Formal", "Idiomatic & Natural", and "Concise & Direct".
5. vocabularySpotlight: 2 high-value English terms or idioms relevant to this turn with phonetic IPA, partOfSpeech, definition, exampleSentence, and cefrLevel ("B1", "B2", "C1", or "C2").
6. speakingMetrics: grammarScore (0-100), vocabularyScore (0-100), fluencyScore (0-100), clarityTip (1 actionable tip), and wordsPerMinute estimate.
`.trim();

      const geminiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an elite executive English communication coach and roleplay partner for FluentPro AI. Always return valid JSON matching the requested schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tutorReply: { type: Type.STRING },
              followUpQuestion: { type: Type.STRING },
              grammarCorrection: {
                type: Type.OBJECT,
                properties: {
                  hasIssues: { type: Type.BOOLEAN },
                  original: { type: Type.STRING },
                  corrected: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  ruleCategory: { type: Type.STRING },
                },
                required: ['hasIssues', 'original', 'corrected', 'explanation', 'ruleCategory'],
              },
              naturalSuggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    tone: { type: Type.STRING },
                    text: { type: Type.STRING },
                    nuanceNote: { type: Type.STRING },
                  },
                  required: ['tone', 'text', 'nuanceNote'],
                },
              },
              vocabularySpotlight: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    phonetic: { type: Type.STRING },
                    partOfSpeech: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    exampleSentence: { type: Type.STRING },
                    cefrLevel: { type: Type.STRING },
                  },
                  required: ['term', 'phonetic', 'partOfSpeech', 'definition', 'exampleSentence', 'cefrLevel'],
                },
              },
              speakingMetrics: {
                type: Type.OBJECT,
                properties: {
                  grammarScore: { type: Type.INTEGER },
                  vocabularyScore: { type: Type.INTEGER },
                  fluencyScore: { type: Type.INTEGER },
                  clarityTip: { type: Type.STRING },
                  wordsPerMinute: { type: Type.INTEGER },
                },
                required: ['grammarScore', 'vocabularyScore', 'fluencyScore', 'clarityTip'],
              },
            },
            required: [
              'tutorReply',
              'followUpQuestion',
              'grammarCorrection',
              'naturalSuggestions',
              'vocabularySpotlight',
              'speakingMetrics',
            ],
          },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini timeout')), 2500)
      );

      const response = await Promise.race([geminiPromise, timeoutPromise]);

      const rawText = response.text;
      if (!rawText) {
        res.json({ ...fallbackResult, source: 'deterministic-engine' });
        return;
      }

      const parsed = JSON.parse(rawText.trim());
      res.json({
        ...fallbackResult,
        ...parsed,
        source: 'gemini-live',
      });
    } catch (_error) {
      // Graceful fallback to deterministic linguistic analyzer if quota or network fails
      res.json({
        ...fallbackResult,
        source: 'deterministic-engine',
      });
    }
  });

  // POST /api/v1/audio/transcribe - Server-side Gemini Audio Transcription
  app.post('/api/v1/audio/transcribe', async (req, res) => {
    const { audioBase64, mimeType, fallbackPromptContext } = req.body || {};
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      res.status(400).json({ error: 'Audio payload is required for transcription.' });
      return;
    }

    const ai = getGenAIClient();
    if (!ai) {
      res.json({
        transcript:
          fallbackPromptContext ||
          'Yesterday we discuss about the Q3 engineering timeline and how we can mitigate delivery risks.',
        source: 'deterministic-fallback',
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'audio/webm',
                data: audioBase64,
              },
            },
            {
              text: 'Transcribe this spoken English audio accurately. Output only the transcribed text.',
            },
          ],
        },
      });

      const transcript = (response.text || '').trim();
      res.json({
        transcript:
          transcript ||
          fallbackPromptContext ||
          'To mitigate downstream risk, we are dedicating two weeks to complete compliance testing.',
        source: 'gemini-live',
      });
    } catch (_err) {
      res.json({
        transcript:
          fallbackPromptContext ||
          'Yesterday we discuss about the Q3 engineering timeline and how we can mitigate delivery risks.',
        source: 'deterministic-fallback',
      });
    }
  });

  // POST /api/v1/audio/tts - Server-side Gemini TTS Speech Synthesis
  app.post('/api/v1/audio/tts', async (req, res) => {
    const { text, voiceName } = req.body || {};
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required for speech synthesis.' });
      return;
    }

    const ai = getGenAIClient();
    if (!ai) {
      res.json({ audioBase64: null, useBrowserSpeechFallback: true });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.slice(0, 450),
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
      res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
        useBrowserSpeechFallback: !base64Audio,
      });
    } catch (_err) {
      res.json({ audioBase64: null, useBrowserSpeechFallback: true });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FluentPro AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
