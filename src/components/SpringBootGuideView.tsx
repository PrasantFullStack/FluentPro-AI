import React, { useState } from 'react';
import { Copy, Check, Server, Database, Smartphone, Code2 } from 'lucide-react';
import { SPRING_BOOT_API_SPECIFICATIONS } from '../data/mockSeedData';
import { fluentProApiClient } from '../services/apiClient';

export const SpringBootGuideView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 2000);
  };

  const springControllerSnippet = `@RestController
@RequestMapping("/api/v1/tutor")
@RequiredArgsConstructor
public class TutorConversationController {

    private final GeminiCoachingService geminiCoachingService;
    private final ConversationTurnRepository turnRepository;

    @PostMapping("/turns")
    public ResponseEntity<TutorTurnResponseDto> processSpeakingTurn(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody TutorTurnRequestDto request) {

        TutorTurnResponseDto response = geminiCoachingService.analyzeAndReply(request);
        turnRepository.save(ConversationTurnEntity.from(currentUser.getId(), request, response));
        return ResponseEntity.ok(response);
    }
}`;

  const mysqlSchemaSnippet = `CREATE TABLE speaking_scenarios (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    difficulty VARCHAR(64) NOT NULL,
    tutor_persona VARCHAR(120) NOT NULL,
    opening_prompt TEXT NOT NULL
);

CREATE TABLE user_vocabulary_notebook (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    term VARCHAR(180) NOT NULL,
    phonetic VARCHAR(120),
    part_of_speech VARCHAR(64),
    cefr_level CHAR(2) NOT NULL,
    definition TEXT NOT NULL,
    example_sentence TEXT,
    mastery_status ENUM('learning', 'reviewing', 'mastered') DEFAULT 'learning',
    review_count INT DEFAULT 1,
    added_at DATE NOT NULL,
    INDEX idx_user_mastery (user_id, mastery_status)
);`;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
          Full-Stack Architecture &amp; Source Export Guide
        </p>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display mb-3">
          Exporting &amp; Connecting FluentPro AI to Java Spring Boot + MySQL &amp; React Native
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
          This web application is built with a cleanly separated API service layer (
          <code className="font-mono text-xs">src/services/apiClient.ts</code>) and shared TypeScript
          DTO models (<code className="font-mono text-xs">src/types/fluentpro.ts</code>). Please note:
          the Java Spring Boot backend and React Native mobile app are <strong>not</strong> bundled
          inside this web prototype container; follow the steps below to export this frontend and
          connect it to your Spring Boot + MySQL cluster.
        </p>

        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
              <Code2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>1. Export Web Source Code</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Download or clone the project repository. All UI components live in{' '}
              <code className="font-mono">src/components/</code> and pure business logic + unit tests
              live in <code className="font-mono">src/utils/fluencyLogic.ts</code>.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
              <Server className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>2. Point to Spring Boot Gateway</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Set <code className="font-mono">VITE_SPRING_BOOT_API_URL=https://your-spring-api/api/v1</code>.
              Currently active base URL:{' '}
              <code className="font-mono font-semibold">{fluentProApiClient.getBaseUrl()}</code>.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
              <Smartphone className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>3. Share with React Native</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Copy <code className="font-mono">src/types/fluentpro.ts</code>,{' '}
              <code className="font-mono">src/utils/fluencyLogic.ts</code>, and{' '}
              <code className="font-mono">src/services/apiClient.ts</code> directly into your React
              Native monorepo package.
            </p>
          </div>
        </div>
      </div>

      {/* REST API Endpoint Mapping Table */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Spring Boot 3.4 REST Controller &amp; MySQL 8.0 Table Mapping
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Every method in <code className="font-mono">fluentProApiClient</code> maps 1:1 to these
              Spring Boot endpoints.
            </p>
          </div>
          <Database className="w-5 h-5 text-blue-700 dark:text-blue-400 shrink-0" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 pr-4 font-semibold">Method &amp; Path</th>
                <th className="py-2.5 px-4 font-semibold">Spring Controller</th>
                <th className="py-2.5 px-4 font-semibold">Request / Response DTO</th>
                <th className="py-2.5 px-4 font-semibold">MySQL Table</th>
                <th className="py-2.5 pl-4 font-semibold">Responsibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {SPRING_BOOT_API_SPECIFICATIONS.map((spec) => (
                <tr key={`${spec.method}-${spec.path}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 pr-4 font-mono whitespace-nowrap">
                    <span className="font-bold text-blue-700 dark:text-blue-400">{spec.method}</span>{' '}
                    <span className="text-slate-900 dark:text-white">{spec.path}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                    {spec.controllerClass}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {spec.requestDto} → {spec.responseDto}
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-700 dark:text-emerald-400">
                    {spec.mysqlTable}
                  </td>
                  <td className="py-3 pl-4 text-slate-600 dark:text-slate-300">
                    {spec.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reference Code Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white font-display">
              Reference Spring Boot Controller (Java 21)
            </span>
            <button
              type="button"
              onClick={() => handleCopy('spring', springControllerSnippet)}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-400 cursor-pointer"
            >
              {copiedId === 'spring' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'spring' ? 'Copied' : 'Copy Java'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-lg bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
            <code>{springControllerSnippet}</code>
          </pre>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white font-display">
              Reference MySQL 8.0 Schema DDL
            </span>
            <button
              type="button"
              onClick={() => handleCopy('mysql', mysqlSchemaSnippet)}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-400 cursor-pointer"
            >
              {copiedId === 'mysql' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'mysql' ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-lg bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
            <code>{mysqlSchemaSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
