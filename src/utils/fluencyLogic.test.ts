import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeLocalSpeechHeuristics,
  calculateOverallFluencyIndex,
  calculateStreakUpdate,
  validateAuthForm,
  filterVocabularyItems,
  formatVocabularyCsv,
  evaluatePronunciationAttempt,
  getPhoneticGuideForText,
} from './fluencyLogic.ts';

test('analyzeLocalSpeechHeuristics detects common grammar errors like "discuss about" and past tense mismatches', () => {
  const sample = 'Yesterday I go to the client office and we discuss about the contract feedbacks.';
  const result = analyzeLocalSpeechHeuristics(sample, 'professional-communication');

  assert.equal(result.grammarCorrection.hasIssues, true);
  assert.equal(result.grammarCorrection.corrected.includes('discuss about'), false);
  assert.equal(result.grammarCorrection.corrected.includes('discussed about'), false);
  assert.equal(result.grammarCorrection.corrected.includes('feedbacks'), false);
  assert.equal(result.naturalSuggestions.length, 3);
  assert.ok(result.vocabularySpotlight.length >= 2);
  assert.ok(result.speakingMetrics.grammarScore >= 70 && result.speakingMetrics.grammarScore <= 100);
});

test('analyzeLocalSpeechHeuristics handles clean grammatical input accurately', () => {
  const cleanSample = 'We aligned our engineering roadmap with the third-quarter product launch milestones.';
  const result = analyzeLocalSpeechHeuristics(cleanSample, 'job-interviews');

  assert.equal(result.grammarCorrection.hasIssues, false);
  assert.ok(result.speakingMetrics.grammarScore >= 90);
  assert.ok(result.tutorReply.length > 15);
  assert.ok(result.followUpQuestion.endsWith('?'));
});

test('calculateOverallFluencyIndex computes weighted average and component means', () => {
  const metrics = [
    { grammarScore: 80, vocabularyScore: 85, fluencyScore: 90 },
    { grammarScore: 90, vocabularyScore: 95, fluencyScore: 90 },
  ];
  const summary = calculateOverallFluencyIndex(metrics);

  assert.equal(summary.grammarAvg, 85);
  assert.equal(summary.vocabularyAvg, 90);
  assert.equal(summary.fluencyAvg, 90);
  assert.equal(summary.overall, 88);
});

test('calculateStreakUpdate handles same day, consecutive day, and broken streak', () => {
  const sameDay = calculateStreakUpdate(12, '2026-10-20T08:00:00Z', '2026-10-20T19:30:00Z');
  assert.equal(sameDay.streak, 12);
  assert.equal(sameDay.incremented, false);

  const nextDay = calculateStreakUpdate(12, '2026-10-19T10:00:00Z', '2026-10-20T09:00:00Z');
  assert.equal(nextDay.streak, 13);
  assert.equal(nextDay.incremented, true);

  const gapDays = calculateStreakUpdate(12, '2026-10-15T10:00:00Z', '2026-10-20T09:00:00Z');
  assert.equal(gapDays.streak, 1);
  assert.equal(gapDays.incremented, true);
});

test('validateAuthForm rejects invalid emails and short passwords', () => {
  const invalid = validateAuthForm('invalid-email', '123', 'A', true);
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.password);
  assert.ok(invalid.errors.name);

  const valid = validateAuthForm('alex.chen@enterprise.io', 'securePass2026', 'Alex Chen', true);
  assert.equal(valid.valid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('filterVocabularyItems filters by query, category, and mastery status', () => {
  const items = [
    { term: 'spearhead', definition: 'lead an initiative', category: 'job-interviews', masteryStatus: 'learning' },
    { term: 'mitigate', definition: 'reduce risk severity', category: 'professional-communication', masteryStatus: 'mastered' },
    { term: 'unwind', definition: 'relax after work', category: 'daily-english', masteryStatus: 'learning' },
  ];

  const filteredByCat = filterVocabularyItems(items, '', 'job-interviews', 'all');
  assert.equal(filteredByCat.length, 1);
  assert.equal(filteredByCat[0].term, 'spearhead');

  const filteredBySearch = filterVocabularyItems(items, 'risk', 'all', 'mastered');
  assert.equal(filteredBySearch.length, 1);
  assert.equal(filteredBySearch[0].term, 'mitigate');
});

test('formatVocabularyCsv escapes quotes and outputs valid CSV lines', () => {
  const csv = formatVocabularyCsv([
    {
      term: 'spearhead',
      phonetic: '/ˈspɪr.hed/',
      partOfSpeech: 'verb',
      cefrLevel: 'C1',
      definition: 'To "lead" an effort',
      exampleSentence: 'She spearheaded the launch.',
      masteryStatus: 'learning',
    },
  ]);
  const lines = csv.split('\n');
  assert.equal(lines.length, 2);
  assert.ok(lines[0].startsWith('Term,Phonetic'));
  assert.ok(lines[1].includes('"To ""lead"" an effort"'));
});

test('getPhoneticGuideForText produces syllable respelling and stress guidance', () => {
  const guide = getPhoneticGuideForText('mitigate downstream risk');
  assert.equal(guide.phoneticRespelling, '/MIT-ih-gayt DOWN-streem RISK/');
  assert.ok(guide.stressPattern.includes('MIT'));
});

test('evaluatePronunciationAttempt scores exact, close, and missed words with phonetic tips', () => {
  const exactRes = evaluatePronunciationAttempt(
    'mitigate downstream risk',
    'mitigate downstream risk'
  );
  assert.equal(exactRes.overallScore, 100);
  assert.equal(exactRes.wordDiagnostics.length, 3);
  assert.equal(exactRes.wordDiagnostics.every((d) => d.status === 'exact'), true);

  const partialRes = evaluatePronunciationAttempt(
    'mitigate downstream risk',
    'mitigat downstrem'
  );
  assert.ok(partialRes.overallScore >= 50 && partialRes.overallScore < 100);
  assert.equal(partialRes.wordDiagnostics[0].status, 'close');
  assert.equal(partialRes.wordDiagnostics[2].status, 'missed');
  assert.ok(partialRes.wordDiagnostics[0].articulationTip.includes('/MIT-ih-gayt/'));
});

