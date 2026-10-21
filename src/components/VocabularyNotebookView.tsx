import React, { useState } from 'react';
import {
  Search,
  Plus,
  Download,
  Volume2,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ConversationSessionRecord,
  ScenarioCategory,
  VocabularyNotebookEntry,
} from '../types/fluentpro';
import { filterVocabularyItems, formatVocabularyCsv } from '../utils/fluencyLogic';

interface VocabularyNotebookViewProps {
  vocabulary: VocabularyNotebookEntry[];
  sessions: ConversationSessionRecord[];
  activeSubTab: 'vocabulary' | 'history';
  onChangeSubTab: (tab: 'vocabulary' | 'history') => void;
  onCycleMastery: (id: string) => void;
  onAddCustomVocabulary: (entry: Omit<VocabularyNotebookEntry, 'id' | 'addedAt' | 'reviewCount'>) => void;
  onLaunchScenario: (scenarioId: string) => void;
}

export const VocabularyNotebookView: React.FC<VocabularyNotebookViewProps> = ({
  vocabulary,
  sessions,
  activeSubTab,
  onChangeSubTab,
  onCycleMastery,
  onAddCustomVocabulary,
  onLaunchScenario,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [masteryFilter, setMasteryFilter] = useState<string>('all');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('/ˈfluː.ənt/');
  const [newPos, setNewPos] = useState('verb');
  const [newCefr, setNewCefr] = useState<'B1' | 'B2' | 'C1' | 'C2'>('C1');
  const [newCategory, setNewCategory] = useState<ScenarioCategory>('professional-communication');
  const [newDefinition, setNewDefinition] = useState('');
  const [newExample, setNewExample] = useState('');
  const [formError, setFormError] = useState('');

  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    sessions[0]?.id || null
  );

  const filteredVocab = filterVocabularyItems(
    vocabulary,
    searchQuery,
    categoryFilter,
    masteryFilter
  );

  const handleExportCsv = () => {
    const csvContent = formatVocabularyCsv(filteredVocab);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'fluentpro-vocabulary-notebook.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSpeakTerm = (term: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(term);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCreateVocab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newDefinition.trim()) {
      setFormError('Please provide both the vocabulary term and its definition.');
      return;
    }
    setFormError('');
    onAddCustomVocabulary({
      term: newTerm.trim(),
      phonetic: newPhonetic.trim() || '/—/',
      partOfSpeech: newPos,
      cefrLevel: newCefr,
      category: newCategory,
      definition: newDefinition.trim(),
      exampleSentence:
        newExample.trim() || `We used "${newTerm.trim()}" during our executive review.`,
      masteryStatus: 'learning',
    });
    setNewTerm('');
    setNewDefinition('');
    setNewExample('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation bar between Vocabulary Notebook and Conversation History */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Personal Linguistic Repository
          </p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
            {activeSubTab === 'vocabulary'
              ? `Vocabulary Notebook (${vocabulary.length} terms)`
              : `Conversation History (${sessions.length} sessions)`}
          </h2>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => onChangeSubTab('vocabulary')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'vocabulary'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Vocabulary Notebook
          </button>
          <button
            type="button"
            onClick={() => onChangeSubTab('history')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Conversation History
          </button>
        </div>
      </div>

      {activeSubTab === 'vocabulary' ? (
        <div className="space-y-6">
          {/* Search, Filter & Actions Bar */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <label htmlFor="vocab-search-input" className="sr-only">
                  Search vocabulary terms or definitions
                </label>
                <input
                  id="vocab-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search saved words, idioms, or definitions..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <label htmlFor="vocab-category-filter" className="sr-only">
                  Filter by Category
                </label>
                <select
                  id="vocab-category-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2.5 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="professional-communication">Professional Communication</option>
                  <option value="job-interviews">Job Interviews</option>
                  <option value="storytelling">Storytelling</option>
                  <option value="daily-english">Daily English</option>
                </select>

                <div
                  role="group"
                  aria-label="Filter by mastery status"
                  className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  {(['all', 'learning', 'reviewing', 'mastered'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setMasteryFilter(status)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        masteryFilter === status
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddForm((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Term</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {/* Add Custom Vocabulary Collapsible Form */}
            {showAddForm && (
              <form
                onSubmit={handleCreateVocab}
                noValidate
                className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 space-y-4"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                  Add Custom Vocabulary Term or Idiom
                </h3>
                {formError && (
                  <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                    {formError}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="new-vocab-term"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Word or Phrase
                    </label>
                    <input
                      id="new-vocab-term"
                      type="text"
                      value={newTerm}
                      onChange={(e) => setNewTerm(e.target.value)}
                      placeholder="e.g., cross-functional alignment"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="new-vocab-pos"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Part of Speech
                    </label>
                    <select
                      id="new-vocab-pos"
                      value={newPos}
                      onChange={(e) => setNewPos(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                    >
                      <option value="verb">verb</option>
                      <option value="noun">noun</option>
                      <option value="adjective">adjective</option>
                      <option value="idiom">idiom</option>
                      <option value="noun phrase">noun phrase</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="new-vocab-cefr"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      CEFR Level
                    </label>
                    <select
                      id="new-vocab-cefr"
                      value={newCefr}
                      onChange={(e) => setNewCefr(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                    >
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                      <option value="C1">C1</option>
                      <option value="C2">C2</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="new-vocab-def"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Clear Definition
                    </label>
                    <input
                      id="new-vocab-def"
                      type="text"
                      value={newDefinition}
                      onChange={(e) => setNewDefinition(e.target.value)}
                      placeholder="What does this term mean in context?"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="new-vocab-example"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Spoken Example Sentence
                    </label>
                    <input
                      id="new-vocab-example"
                      type="text"
                      value={newExample}
                      onChange={(e) => setNewExample(e.target.value)}
                      placeholder="How you would use it in a conversation..."
                      className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
                  >
                    Save to Notebook
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Vocabulary List */}
          {filteredVocab.length === 0 ? (
            <div className="p-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                No vocabulary items match your current filter.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Try clearing your search query or add a new term directly above.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setMasteryFilter('all');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-blue-700 dark:text-blue-400 underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVocab.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                            {item.term}
                          </h3>
                          <button
                            type="button"
                            onClick={() => handleSpeakTerm(item.term)}
                            aria-label={`Pronounce ${item.term}`}
                            className="p-1 text-slate-500 hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {item.phonetic} · {item.partOfSpeech} · CEFR {item.cefrLevel}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onCycleMastery(item.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 hover:border-blue-500 capitalize cursor-pointer whitespace-nowrap shrink-0"
                        title="Click to advance mastery status"
                      >
                        Status: {item.masteryStatus}
                      </button>
                    </div>

                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                      {item.definition}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-4">
                      “{item.exampleSentence}”
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    <span>Added {item.addedAt}</span>
                    <span>Reviewed {item.reviewCount}x</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Conversation History Sub-Tab */
        <div className="space-y-4">
          {sessions.map((sess) => {
            const isExpanded = expandedSessionId === sess.id;
            return (
              <div
                key={sess.id}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      <span>{new Date(sess.dateIso).toLocaleDateString()}</span>
                      <span aria-hidden="true">·</span>
                      <span>{sess.durationMinutes} min</span>
                      <span aria-hidden="true">·</span>
                      <span>{sess.turnCount} turns</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
                      {sess.scenarioTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      {sess.keyTakeaway}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 shrink-0">
                    <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      <span>Overall: {sess.overallScore}%</span>
                      <span aria-hidden="true">·</span>
                      <span>Grammar: {sess.grammarAccuracy}%</span>
                      <span aria-hidden="true">·</span>
                      <span>Vocab: {sess.vocabularyRichness}%</span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSessionId(isExpanded ? null : sess.id)
                      }
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>{isExpanded ? 'Hide Transcript' : 'View Transcript'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onLaunchScenario(sess.scenarioId)}
                      className="px-3 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Practice Again
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-3">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Session Transcript &amp; Coaching Notes
                    </p>
                    {sess.messages.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
                            {m.sender}
                          </span>
                          <span className="font-mono tabular-nums">{m.timestamp}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{m.text}</p>
                        {m.analysis?.grammarCorrection?.hasIssues && (
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 pt-1">
                            ✓ Corrected: “{m.analysis.grammarCorrection.corrected}” (
                            {m.analysis.grammarCorrection.explanation})
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
