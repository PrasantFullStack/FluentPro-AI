export interface LocalAnalysisOutput {
  tutorReply: string;
  followUpQuestion: string;
  grammarCorrection: {
    hasIssues: boolean;
    original: string;
    corrected: string;
    explanation: string;
    ruleCategory: string;
  };
  naturalSuggestions: Array<{
    tone: 'Executive & Formal' | 'Idiomatic & Natural' | 'Concise & Direct';
    text: string;
    nuanceNote: string;
  }>;
  vocabularySpotlight: Array<{
    term: string;
    phonetic: string;
    partOfSpeech: string;
    definition: string;
    exampleSentence: string;
    cefrLevel: 'B1' | 'B2' | 'C1' | 'C2';
  }>;
  speakingMetrics: {
    grammarScore: number;
    vocabularyScore: number;
    fluencyScore: number;
    clarityTip: string;
    wordsPerMinute: number;
  };
}

interface GrammarPatternRule {
  pattern: RegExp;
  replaceWith: string;
  explanation: string;
  ruleCategory: string;
}

const GRAMMAR_RULES: GrammarPatternRule[] = [
  {
    pattern: /\b(yesterday|last week|last month|last year|ago)\b([^.?!]*?)\b(i|we|they|he|she)\s+(go|discuss|make|have|do|say|tell|think|buy|see|come|take)\b/i,
    replaceWith: '$1$2$3 went/completed',
    explanation: 'When referencing a completed past time marker like "yesterday" or "last week", use the Past Simple tense instead of the base present verb.',
    ruleCategory: 'Past Tense Consistency',
  },
  {
    pattern: /\b(discuss(?:ed|es|ing)?)\s+about\b/gi,
    replaceWith: '$1',
    explanation: '"Discuss" is a transitive verb in English and takes a direct object without the preposition "about" (e.g., "discussed the proposal").',
    ruleCategory: 'Past Tense & Transitive Verbs',
  },
  {
    pattern: /\bexplain\s+me\b/gi,
    replaceWith: 'explain to me',
    explanation: '"Explain" requires the preposition "to" before an indirect object pronoun ("explain to me" or "explain the issue to us").',
    ruleCategory: 'Indirect Object Preposition',
  },
  {
    pattern: /\bi\s+am\s+agree\b/gi,
    replaceWith: 'I agree',
    explanation: '"Agree" is a verb, not an adjective, so it should not be paired with the auxiliary "am". Say "I agree" or "I am in agreement."',
    ruleCategory: 'Auxiliary Verb Misuse',
  },
  {
    pattern: /\bmore\s+better\b/gi,
    replaceWith: 'much better',
    explanation: '"Better" is already the comparative form of "good". Use an intensifier like "much" or "far" instead of "more".',
    ruleCategory: 'Double Comparative',
  },
  {
    pattern: /\binformations\b/gi,
    replaceWith: 'information',
    explanation: '"Information" is an uncountable noun in English and does not take a plural "-s". Use "pieces of information" or "details".',
    ruleCategory: 'Uncountable Nouns',
  },
  {
    pattern: /\bfeedbacks\b/gi,
    replaceWith: 'feedback',
    explanation: '"Feedback" is an uncountable noun. Use "feedback" or "pieces of feedback" rather than "feedbacks".',
    ruleCategory: 'Uncountable Nouns',
  },
  {
    pattern: /\bsince\s+(\d+)\s+(years|months|weeks|days)\b/gi,
    replaceWith: 'for $1 $2',
    explanation: 'Use "for" with a duration of time ("for three years") and "since" with a specific starting point in time ("since 2022").',
    ruleCategory: 'Time Prepositions (For vs. Since)',
  },
  {
    pattern: /\bi\s+go\s+to\b/gi,
    replaceWith: 'I went to',
    explanation: 'When narrating an event that already happened, shift "go" to its past tense form "went".',
    ruleCategory: 'Verb Tense',
  },
];

export function analyzeLocalSpeechHeuristics(
  rawInput: string,
  scenarioCategory: string = 'professional-communication'
): LocalAnalysisOutput {
  const trimmed = rawInput.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let correctedText = trimmed;
  let explanation = 'Your sentence structure is grammatically sound with clear subject-verb agreement and natural clause flow.';
  let ruleCategory = 'Syntactic Precision';
  let hasIssues = false;

  for (const rule of GRAMMAR_RULES) {
    if (rule.pattern.test(correctedText)) {
      hasIssues = true;
      if (rule.ruleCategory === 'Past Tense Consistency') {
        correctedText = correctedText
          .replace(/\b(i|we|they)\s+go\b/gi, '$1 went')
          .replace(/\b(i|we|they)\s+discuss\b/gi, '$1 discussed')
          .replace(/\b(i|we|they)\s+make\b/gi, '$1 made')
          .replace(/\b(i|we|they)\s+have\b/gi, '$1 had')
          .replace(/\b(i|we|they)\s+take\b/gi, '$1 took');
      } else {
        correctedText = correctedText.replace(rule.pattern, rule.replaceWith);
      }
      explanation = rule.explanation;
      ruleCategory = rule.ruleCategory;
    }
  }

  // Capitalize first letter and ensure ending punctuation
  if (correctedText.length > 0) {
    const firstChar = correctedText[0].toUpperCase();
    const withCap = firstChar + correctedText.slice(1);
    const withPunct = /[.?!]$/.test(withCap) ? withCap : `${withCap}.`;
    if (withPunct !== trimmed && !hasIssues) {
      correctedText = withPunct;
    } else {
      correctedText = withPunct;
    }
  }

  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z]/g, '')).filter(Boolean));
  const lexicalDiversity = wordCount > 0 ? uniqueWords.size / wordCount : 0;

  const grammarScore = hasIssues ? Math.max(72, 88 - Math.max(0, 12 - wordCount)) : Math.min(98, 90 + Math.min(8, Math.floor(wordCount / 3)));
  const vocabularyScore = Math.min(97, Math.max(74, Math.round(72 + lexicalDiversity * 20 + Math.min(10, wordCount / 2))));
  const fluencyScore = Math.min(96, Math.max(75, Math.round((grammarScore + vocabularyScore) / 2)));
  const wordsPerMinute = Math.min(165, Math.max(95, 115 + wordCount * 2));

  const cleanCore = correctedText.replace(/[.?!]+$/, '');

  const scenarioReplies: Record<string, { reply: string; followUp: string; vocab: LocalAnalysisOutput['vocabularySpotlight'] }> = {
    'job-interviews': {
      reply: `That gives a clear picture of how you handled the situation. Framing your contribution around measurable impact makes your answer stand out to hiring panels.`,
      followUp: `If the interviewer followed up by asking how you aligned stakeholders who initially disagreed with that approach, how would you walk them through your process?`,
      vocab: [
        {
          term: 'spearhead',
          phonetic: '/SPEER-hed/',
          partOfSpeech: 'verb',
          definition: 'To lead an initiative, project, or strategic effort from the front.',
          exampleSentence: 'I spearheaded the cross-functional migration that reduced latency by 35%.',
          cefrLevel: 'C1',
        },
        {
          term: 'stakeholder alignment',
          phonetic: '/STAYK-hohl-der uh-LINE-munt/',
          partOfSpeech: 'noun phrase',
          definition: 'Achieving shared understanding and commitment among key decision-makers.',
          exampleSentence: 'Securing early stakeholder alignment prevented scope creep during Q3.',
          cefrLevel: 'C1',
        },
      ],
    },
    'daily-english': {
      reply: `I completely relate to that! Sharing small everyday details makes casual conversation feel warm, engaging, and effortless.`,
      followUp: `What ended up being the best part of that experience for you, or would you do anything differently next time?`,
      vocab: [
        {
          term: 'unwind',
          phonetic: '/un-WIND/',
          partOfSpeech: 'verb',
          definition: 'To relax and release tension after a busy period of work or activity.',
          exampleSentence: 'I usually unwind by taking a brisk walk through the neighborhood park.',
          cefrLevel: 'B2',
        },
        {
          term: 'spontaneous',
          phonetic: '/spon-TAY-nee-us/',
          partOfSpeech: 'adjective',
          definition: 'Happening naturally or on impulse without heavy advance planning.',
          exampleSentence: 'Our spontaneous coffee catch-up turned into a great two-hour conversation.',
          cefrLevel: 'B2',
        },
      ],
    },
    'storytelling': {
      reply: `Your pacing draws the listener in right away. Adding one sensory detail or emotional turning point will make the narrative arc even more memorable.`,
      followUp: `What was the exact moment you realized things were taking an unexpected turn, and how did you react in that split second?`,
      vocab: [
        {
          term: 'pivotal',
          phonetic: '/PIV-uh-tul/',
          partOfSpeech: 'adjective',
          definition: 'Of crucial importance in relation to the development or success of something else.',
          exampleSentence: 'That conversation proved to be a pivotal turning point in my career.',
          cefrLevel: 'C1',
        },
        {
          term: 'hindsight',
          phonetic: '/HIND-site/',
          partOfSpeech: 'noun',
          definition: 'Understanding of a situation or event only after it has happened.',
          exampleSentence: 'In hindsight, missing that train led to the best detour of the trip.',
          cefrLevel: 'B2',
        },
      ],
    },
    'professional-communication': {
      reply: `Your point comes across clearly. In executive discussions, leading with the bottom-line recommendation before unpacking the context keeps everyone focused.`,
      followUp: `How would you summarize the next concrete action item and timeline for the team in two sentences?`,
      vocab: [
        {
          term: 'actionable',
          phonetic: '/AK-shuh-nuh-bul/',
          partOfSpeech: 'adjective',
          definition: 'Giving sufficient practical detail to allow immediate implementation.',
          exampleSentence: 'Let us translate the client audit into three actionable priorities for Friday.',
          cefrLevel: 'B2',
        },
        {
          term: 'mitigate',
          phonetic: '/MIT-ih-gayt/',
          partOfSpeech: 'verb',
          definition: 'To make a risk, bottleneck, or negative impact less severe.',
          exampleSentence: 'We can mitigate delivery risk by running parallel integration checks.',
          cefrLevel: 'C1',
        },
      ],
    },
  };

  const selectedPack = scenarioReplies[scenarioCategory] || scenarioReplies['professional-communication'];

  return {
    tutorReply: selectedPack.reply,
    followUpQuestion: selectedPack.followUp,
    grammarCorrection: {
      hasIssues,
      original: trimmed,
      corrected: correctedText,
      explanation,
      ruleCategory,
    },
    naturalSuggestions: [
      {
        tone: 'Executive & Formal',
        text: `From a strategic standpoint, ${cleanCore.charAt(0).toLowerCase() + cleanCore.slice(1)}, ensuring clear alignment on our core objectives.`,
        nuanceNote: 'Elevates authority for boardrooms, client briefings, and senior leadership updates.',
      },
      {
        tone: 'Idiomatic & Natural',
        text: `What really stood out was how ${cleanCore.charAt(0).toLowerCase() + cleanCore.slice(1)}—it made a tangible difference right away.`,
        nuanceNote: 'Uses natural native-speaker rhythm and conversational framing.',
      },
      {
        tone: 'Concise & Direct',
        text: `${correctedText} Here is the key takeaway we should act on next.`,
        nuanceNote: 'Strips filler phrasing for crisp, high-impact spoken delivery.',
      },
    ],
    vocabularySpotlight: selectedPack.vocab,
    speakingMetrics: {
      grammarScore,
      vocabularyScore,
      fluencyScore,
      clarityTip:
        wordCount < 10
          ? 'Expand your answer with a concrete example or result (using the STAR method) to demonstrate deeper fluency.'
          : 'Great sentence length. Try stressing key verbs and pausing briefly before your main conclusion for executive presence.',
      wordsPerMinute,
    },
  };
}

export function calculateOverallFluencyIndex(
  metricsList: Array<{ grammarScore: number; vocabularyScore: number; fluencyScore: number }>
): {
  overall: number;
  grammarAvg: number;
  vocabularyAvg: number;
  fluencyAvg: number;
} {
  if (!metricsList || metricsList.length === 0) {
    return { overall: 0, grammarAvg: 0, vocabularyAvg: 0, fluencyAvg: 0 };
  }
  const count = metricsList.length;
  const grammarSum = metricsList.reduce((acc, m) => acc + m.grammarScore, 0);
  const vocabSum = metricsList.reduce((acc, m) => acc + m.vocabularyScore, 0);
  const fluencySum = metricsList.reduce((acc, m) => acc + m.fluencyScore, 0);

  const grammarAvg = Math.round(grammarSum / count);
  const vocabularyAvg = Math.round(vocabSum / count);
  const fluencyAvg = Math.round(fluencySum / count);
  const overall = Math.round((grammarAvg * 0.35) + (vocabularyAvg * 0.3) + (fluencyAvg * 0.35));

  return { overall, grammarAvg, vocabularyAvg, fluencyAvg };
}

export function calculateStreakUpdate(
  currentStreak: number,
  lastPracticeDateStr: string,
  currentDateStr: string
): { streak: number; incremented: boolean } {
  const lastDate = new Date(lastPracticeDateStr);
  const currDate = new Date(currentDateStr);
  if (Number.isNaN(lastDate.getTime()) || Number.isNaN(currDate.getTime())) {
    return { streak: Math.max(1, currentStreak), incremented: false };
  }

  const startOfLast = Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth(), lastDate.getUTCDate());
  const startOfCurr = Date.UTC(currDate.getUTCFullYear(), currDate.getUTCMonth(), currDate.getUTCDate());
  const diffDays = Math.round((startOfCurr - startOfLast) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { streak: currentStreak, incremented: false };
  }
  if (diffDays === 1) {
    return { streak: currentStreak + 1, incremented: true };
  }
  if (diffDays > 1) {
    return { streak: 1, incremented: true };
  }
  return { streak: currentStreak, incremented: false };
}

export interface AuthValidationResult {
  valid: boolean;
  errors: {
    name?: string;
    email?: string;
    password?: string;
  };
}

export function validateAuthForm(
  email: string,
  password: string,
  name: string = '',
  requireName: boolean = false
): AuthValidationResult {
  const errors: AuthValidationResult['errors'] = {};
  const trimmedEmail = email.trim();
  const trimmedName = name.trim();

  if (requireName && trimmedName.length < 2) {
    errors.name = 'Please enter your full name (at least 2 characters).';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(trimmedEmail)) {
    errors.email = 'Please enter a valid work or personal email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function filterVocabularyItems<
  T extends {
    term: string;
    definition: string;
    category: string;
    masteryStatus: string;
  }
>(
  items: T[],
  searchQuery: string,
  categoryFilter: string,
  masteryFilter: string
): T[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return items.filter((item) => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesMastery = masteryFilter === 'all' || item.masteryStatus === masteryFilter;
    const matchesSearch =
      !normalizedQuery ||
      item.term.toLowerCase().includes(normalizedQuery) ||
      item.definition.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesMastery && matchesSearch;
  });
}

export function formatVocabularyCsv(
  items: Array<{
    term: string;
    phonetic: string;
    partOfSpeech: string;
    cefrLevel: string;
    definition: string;
    exampleSentence: string;
    masteryStatus: string;
  }>
): string {
  const header = 'Term,Phonetic,PartOfSpeech,CEFR,Mastery,Definition,Example';
  const rows = items.map((item) => {
    const escapeCsv = (val: string) => `"${String(val).replace(/"/g, '""')}"`;
    return [
      escapeCsv(item.term),
      escapeCsv(item.phonetic),
      escapeCsv(item.partOfSpeech),
      escapeCsv(item.cefrLevel),
      escapeCsv(item.masteryStatus),
      escapeCsv(item.definition),
      escapeCsv(item.exampleSentence),
    ].join(',');
  });
  return [header, ...rows].join('\n');
}

export interface WordPhoneticDiagnostic {
  expectedWord: string;
  spokenWord: string;
  status: 'exact' | 'close' | 'missed';
  accuracyScore: number;
  phoneticGuide: string;
  articulationTip: string;
}

export interface PronunciationEvaluationResult {
  targetText: string;
  spokenTranscript: string;
  overallScore: number;
  phoneticRespelling: string;
  stressPattern: string;
  wordDiagnostics: WordPhoneticDiagnostic[];
  overallCoachSummary: string;
}

const WORD_PHONETIC_DICTIONARY: Record<
  string,
  { phonetic: string; stress: string; tip: string }
> = {
  mitigate: {
    phonetic: 'MIT-ih-gayt',
    stress: 'Primary stress on 1st syllable (MIT)',
    tip: 'Flap the "t" lightly between short "i" vowels and finish with a long "ay" diphthong.',
  },
  downstream: {
    phonetic: 'DOWN-streem',
    stress: 'Primary stress on 1st syllable (DOWN)',
    tip: 'Round lips on the "ow" diphthong and blend smoothly into the "str" cluster without inserting a vowel.',
  },
  risk: {
    phonetic: 'RISK',
    stress: 'Single stressed syllable (RISK)',
    tip: 'Keep the short "ih" crisp and release both the "s" and final "k" consonant cluster clearly.',
  },
  reallocate: {
    phonetic: 'ree-AL-uh-kayt',
    stress: 'Primary stress on 2nd syllable (AL)',
    tip: 'Open the jaw on "AL", reduce the middle "o" to a neutral schwa "uh", and end with "kayt".',
  },
  engineering: {
    phonetic: 'en-jih-NEER-ing',
    stress: 'Primary stress on 3rd syllable (NEER)',
    tip: 'Lengthen the "eer" vowel before transitioning smoothly into the nasal "-ing" ending.',
  },
  bandwidth: {
    phonetic: 'BAND-width',
    stress: 'Primary stress on 1st syllable (BAND)',
    tip: 'Place the tongue tip gently between the teeth for the final unvoiced "th" after "d".',
  },
  spearheaded: {
    phonetic: 'SPEER-hed-id',
    stress: 'Primary stress on 1st syllable (SPEER)',
    tip: 'Pronounce the "-ed" past tense ending as an extra unstressed syllable "id" after "d".',
  },
  spearhead: {
    phonetic: 'SPEER-hed',
    stress: 'Primary stress on 1st syllable (SPEER)',
    tip: 'Keep a clear tense "ee" vowel before the American "r" coloring in "speer".',
  },
  initiative: {
    phonetic: 'ih-NISH-uh-tiv',
    stress: 'Primary stress on 2nd syllable (NISH)',
    tip: 'The "-ti-" is pronounced as a soft "sh" sound ("NISH"), followed by a reduced schwa "uh".',
  },
  stakeholder: {
    phonetic: 'STAYK-hohl-der',
    stress: 'Primary stress on 1st syllable (STAYK)',
    tip: 'Maintain the long "ay" vowel in "stayk" and dark "l" in "hohl".',
  },
  alignment: {
    phonetic: 'uh-LINE-munt',
    stress: 'Primary stress on 2nd syllable (LINE)',
    tip: 'The "g" is completely silent; glide directly from the long "i" diphthong to "n".',
  },
  quantifiable: {
    phonetic: 'kwon-tih-FY-uh-bul',
    stress: 'Primary stress on 3rd syllable (FY)',
    tip: 'Emphasize the open "FY" syllable and keep the final "-able" light ("uh-bul").',
  },
  hindsight: {
    phonetic: 'HIND-site',
    stress: 'Primary stress on 1st syllable (HIND)',
    tip: 'Both syllables contain the long "eye" diphthong; silent "gh" in "sight".',
  },
  pivotal: {
    phonetic: 'PIV-uh-tul',
    stress: 'Primary stress on 1st syllable (PIV)',
    tip: 'Keep the upper teeth on the lower lip for a voiced "v", then reduce the last two syllables.',
  },
  actionable: {
    phonetic: 'AK-shuh-nuh-bul',
    stress: 'Primary stress on 1st syllable (AK)',
    tip: 'Open the front vowel on "AK" and compress "-tionable" into three quick, light syllables.',
  },
  spontaneous: {
    phonetic: 'spon-TAY-nee-us',
    stress: 'Primary stress on 2nd syllable (TAY)',
    tip: 'Elevate pitch on "TAY" and link "nee-us" with a subtle "y" glide.',
  },
  unwind: {
    phonetic: 'un-WIND',
    stress: 'Primary stress on 2nd syllable (WIND)',
    tip: 'Use the long "eye" vowel in "wind" (unlike the noun "wind" for weather).',
  },
  non: {
    phonetic: 'NON',
    stress: 'Secondary stress (NON)',
    tip: 'Clear open short "o" vowel.',
  },
  negotiable: {
    phonetic: 'nih-GOH-shuh-bul',
    stress: 'Primary stress on 2nd syllable (GOH)',
    tip: 'Round lips on "GOH" and pronounce "-ti-" as a soft "sh" ("shuh-bul").',
  },
  compliance: {
    phonetic: 'kum-PLY-uns',
    stress: 'Primary stress on 2nd syllable (PLY)',
    tip: 'Reduce the first syllable to "kum" (schwa) and open wide on "PLY".',
  },
  milestone: {
    phonetic: 'MYL-stohn',
    stress: 'Primary stress on 1st syllable (MYL)',
    tip: 'Full "eye" glide on "myl" followed by a rounded "oh" in "stohn".',
  },
};

function buildWordPhoneticInfo(rawWord: string): {
  phonetic: string;
  stress: string;
  tip: string;
} {
  const cleaned = rawWord.toLowerCase().replace(/[^a-z]/g, '');
  if (WORD_PHONETIC_DICTIONARY[cleaned]) {
    return WORD_PHONETIC_DICTIONARY[cleaned];
  }
  if (cleaned.length <= 3) {
    return {
      phonetic: cleaned.toLowerCase(),
      stress: 'Unstressed function word',
      tip: 'Link smoothly into the next content word without pausing.',
    };
  }
  const mid = Math.ceil(cleaned.length / 2);
  const firstHalf = cleaned.slice(0, mid).toUpperCase();
  const secondHalf = cleaned.slice(mid).toLowerCase();
  return {
    phonetic: `${firstHalf}-${secondHalf}`,
    stress: `Stress primary root syllable (${firstHalf})`,
    tip: 'Articulate the stressed vowel clearly and release the final consonant.',
  };
}

export function getPhoneticGuideForText(text: string): {
  phoneticRespelling: string;
  stressPattern: string;
} {
  const tokens = text
    .trim()
    .split(/[\s-]+/)
    .map((t) => t.replace(/[^a-zA-Z']/g, ''))
    .filter(Boolean);

  if (tokens.length === 0) {
    return { phoneticRespelling: '/—/', stressPattern: '—' };
  }

  const guides = tokens.map((t) => buildWordPhoneticInfo(t));
  return {
    phoneticRespelling: `/${guides.map((g) => g.phonetic).join(' ')}/`,
    stressPattern: guides[0].stress,
  };
}

function computeEditDistance(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

export function evaluatePronunciationAttempt(
  targetText: string,
  spokenTranscript: string
): PronunciationEvaluationResult {
  const targetTokens = targetText
    .trim()
    .split(/[\s-]+/)
    .map((w) => w.replace(/[^a-zA-Z']/g, ''))
    .filter(Boolean);

  const spokenTokens = spokenTranscript
    .trim()
    .split(/[\s-]+/)
    .map((w) => w.replace(/[^a-zA-Z']/g, ''))
    .filter(Boolean);

  const { phoneticRespelling, stressPattern } = getPhoneticGuideForText(targetText);

  if (targetTokens.length === 0) {
    return {
      targetText,
      spokenTranscript,
      overallScore: 0,
      phoneticRespelling,
      stressPattern,
      wordDiagnostics: [],
      overallCoachSummary: 'Select or enter a target word or phrase to practice.',
    };
  }

  const wordDiagnostics: WordPhoneticDiagnostic[] = targetTokens.map((expectedRaw, idx) => {
    const expectedNorm = expectedRaw.toLowerCase();
    const info = buildWordPhoneticInfo(expectedRaw);

    // Find best matching spoken token within a window around idx
    let bestSpoken = spokenTokens[idx] || '';
    let bestScore = 0;

    const searchStart = Math.max(0, idx - 2);
    const searchEnd = Math.min(spokenTokens.length - 1, idx + 2);
    for (let sIdx = searchStart; sIdx <= searchEnd; sIdx++) {
      const candidate = spokenTokens[sIdx];
      if (!candidate) continue;
      const candNorm = candidate.toLowerCase();
      if (candNorm === expectedNorm) {
        bestSpoken = candidate;
        bestScore = 100;
        break;
      }
      const dist = computeEditDistance(expectedNorm, candNorm);
      const maxLen = Math.max(expectedNorm.length, candNorm.length, 1);
      const similarity = Math.max(0, Math.round((1 - dist / maxLen) * 100));
      if (similarity > bestScore) {
        bestScore = similarity;
        bestSpoken = candidate;
      }
    }

    let status: 'exact' | 'close' | 'missed' = 'missed';
    let tip = info.tip;

    if (bestScore >= 92) {
      status = 'exact';
      tip = `Crisp articulation of /${info.phonetic}/ (${info.stress}).`;
    } else if (bestScore >= 55) {
      status = 'close';
      tip = `Heard "${bestSpoken || 'partial'}". Focus on /${info.phonetic}/ — ${info.tip}`;
    } else {
      status = 'missed';
      tip = `Word missed or unclear. Break it into syllables: /${info.phonetic}/ — ${info.tip}`;
    }

    return {
      expectedWord: expectedRaw,
      spokenWord: bestSpoken || '—',
      status,
      accuracyScore: bestScore,
      phoneticGuide: `/${info.phonetic}/`,
      articulationTip: tip,
    };
  });

  const totalScore = wordDiagnostics.reduce((sum, d) => sum + d.accuracyScore, 0);
  const overallScore = Math.round(totalScore / wordDiagnostics.length);

  const exactCount = wordDiagnostics.filter((d) => d.status === 'exact').length;
  const closeOrMissed = wordDiagnostics.filter((d) => d.status !== 'exact');

  let overallCoachSummary = '';
  if (overallScore >= 92) {
    overallCoachSummary = `Excellent phonetic precision (${exactCount}/${wordDiagnostics.length} words exact). Your syllable stress and consonant linking on ${phoneticRespelling} sound natural and confident.`;
  } else if (overallScore >= 70) {
    const focusTerms = closeOrMissed.map((d) => `"${d.expectedWord}" (${d.phoneticGuide})`).join(', ');
    overallCoachSummary = `Good rhythm overall (${overallScore}% match). Slow down slightly to sharpen vowel length and ending consonants on ${focusTerms}.`;
  } else {
    const firstFocus = closeOrMissed[0];
    overallCoachSummary = `Let us isolate the syllables first. Listen to the 0.7x Slow Articulation model and emphasize the capital syllables in ${phoneticRespelling}${
      firstFocus ? `, especially "${firstFocus.expectedWord}"` : ''
    }.`;
  }

  return {
    targetText: targetText.trim(),
    spokenTranscript: spokenTranscript.trim(),
    overallScore,
    phoneticRespelling,
    stressPattern,
    wordDiagnostics,
    overallCoachSummary,
  };
}

