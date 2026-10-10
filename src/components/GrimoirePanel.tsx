import React, { useState } from 'react';
import { Chapter, Lesson, CaseStudy, TableSchema } from '../types/game';
import {
  BookOpen,
  Lock,
  CheckCircle2,
  HelpCircle,
  Database,
  Swords,
  ChevronRight,
  Flame,
  AlertTriangle,
  Lightbulb,
  FileCode2,
  Sparkles,
} from 'lucide-react';

interface GrimoirePanelProps {
  chapters: Chapter[];
  currentChapterId: number;
  unlockedChapters: number[];
  completedLessons: string[];
  completedCaseStudies: number[];
  selectedLessonId: string | null;
  onSelectChapter: (chapterId: number) => void;
  onSelectLesson: (lessonId: string) => void;
  onSelectCaseStudy: () => void;
  isViewingCaseStudy: boolean;
  schemas: TableSchema[];
  onInsertCode: (sql: string) => void;
  onOpenHintModal: (hints: any[]) => void;
}

export const GrimoirePanel: React.FC<GrimoirePanelProps> = ({
  chapters,
  currentChapterId,
  unlockedChapters,
  completedLessons,
  completedCaseStudies,
  selectedLessonId,
  onSelectChapter,
  onSelectLesson,
  onSelectCaseStudy,
  isViewingCaseStudy,
  schemas,
  onInsertCode,
  onOpenHintModal,
}) => {
  const [activeTab, setActiveTab] = useState<'quest' | 'boss' | 'schema'>('quest');
  const currentChapter = chapters.find(c => c.id === currentChapterId) || chapters[0];
  const activeLesson = currentChapter.lessons.find(l => l.id === selectedLessonId) || currentChapter.lessons[0];
  const isCaseStudyCleared = completedCaseStudies.includes(currentChapter.id);

  return (
    <div className="bg-dungeon-chamber border-2 border-dungeon-border flex flex-col h-full shadow-pixel">
      {/* Grimoire Title Header */}
      <div className="bg-dungeon-crypt border-b-2 border-dungeon-border p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-mana-core" />
          <span className="font-display font-bold text-xs uppercase tracking-wider text-parchment-white">
            THE GRIMOIRE CODEX
          </span>
        </div>
        <div className="flex gap-1">
          {chapters.map(ch => {
            const isUnlocked = unlockedChapters.includes(ch.id);
            const isSelected = ch.id === currentChapterId;
            const isCleared = completedCaseStudies.includes(ch.id);

            return (
              <button
                key={ch.id}
                onClick={() => {
                  if (isUnlocked) onSelectChapter(ch.id);
                }}
                className={`w-7 h-7 flex items-center justify-center font-display text-xs font-bold pixel-btn transition-colors ${
                  isSelected
                    ? 'bg-mana-core text-dungeon-abyss border-2 border-parchment-white'
                    : isUnlocked
                    ? isCleared
                      ? 'bg-dungeon-chamber text-glyph-emerald border border-glyph-emerald hover:border-mana-core'
                      : 'bg-dungeon-chamber text-parchment-white border border-dungeon-highlight hover:border-mana-core'
                    : 'bg-dungeon-abyss text-slate-600 border border-dungeon-border cursor-not-allowed opacity-50'
                }`}
                title={
                  isUnlocked
                    ? `${ch.code}: ${ch.title} ${isCleared ? '(CLEARED)' : ''}`
                    : `🔒 Sealed! Defeat Boss in Chamber ${ch.id - 1} to unlock.`
                }
              >
                {isUnlocked ? ch.id : <Lock className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapter Overview Banner */}
      <div className="bg-dungeon-abyss/80 border-b border-dungeon-border px-3 py-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-display text-quest-gold uppercase font-bold tracking-wider">
            {currentChapter.code} • {currentChapter.subtitle}
          </span>
          {isCaseStudyCleared && (
            <span className="text-[10px] bg-glyph-emerald/20 text-glyph-emerald border border-glyph-emerald px-1.5 py-0.2 font-display uppercase font-bold">
              CHAMBER CLEARED
            </span>
          )}
        </div>
        <h2 className="font-display font-bold text-sm text-parchment-white mt-0.5">
          {currentChapter.title}
        </h2>
        <p className="text-[11px] text-parchment-rune line-clamp-2 mt-1">
          {currentChapter.lore}
        </p>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="grid grid-cols-3 border-b-2 border-dungeon-border text-xs font-display">
        <button
          onClick={() => {
            setActiveTab('quest');
            if (isViewingCaseStudy) onSelectLesson(currentChapter.lessons[0].id);
          }}
          className={`py-2 text-center border-r border-dungeon-border font-bold uppercase transition-colors ${
            activeTab === 'quest' && !isViewingCaseStudy
              ? 'bg-dungeon-crypt text-mana-core border-b-2 border-b-mana-core'
              : 'text-parchment-rune hover:text-parchment-white bg-dungeon-chamber'
          }`}
        >
          📖 Lessons
        </button>
        <button
          onClick={() => {
            setActiveTab('boss');
            onSelectCaseStudy();
          }}
          className={`py-2 text-center border-r border-dungeon-border font-bold uppercase transition-colors flex items-center justify-center gap-1 ${
            isViewingCaseStudy
              ? 'bg-dungeon-crypt text-glyph-crimson border-b-2 border-b-glyph-crimson'
              : 'text-parchment-rune hover:text-glyph-crimson bg-dungeon-chamber'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Boss Gate</span>
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`py-2 text-center font-bold uppercase transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'schema'
              ? 'bg-dungeon-crypt text-quest-gold border-b-2 border-b-quest-gold'
              : 'text-parchment-rune hover:text-quest-gold bg-dungeon-chamber'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Armory (Schema)</span>
        </button>
      </div>

      {/* Main Tab Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* TAB 1: LESSONS & CONCEPT EXPLAINER */}
        {activeTab === 'quest' && !isViewingCaseStudy && (
          <div className="space-y-4">
            {/* Lesson Selector Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-display text-parchment-rune uppercase">
                Chamber Lessons
              </span>
              <div className="grid grid-cols-1 gap-1">
                {currentChapter.lessons.map((lesson, idx) => {
                  const isDone = completedLessons.includes(lesson.id);
                  const isCur = lesson.id === activeLesson.id;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson.id)}
                      className={`w-full text-left p-2 border flex items-center justify-between text-xs transition-colors ${
                        isCur
                          ? 'bg-dungeon-crypt border-mana-core text-mana-core font-bold'
                          : isDone
                          ? 'bg-dungeon-abyss/60 border-glyph-emerald/40 text-parchment-white hover:border-glyph-emerald'
                          : 'bg-dungeon-abyss border-dungeon-border text-parchment-rune hover:border-dungeon-highlight'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[10px] font-display">{idx + 1}.</span>
                        <span className="truncate">{lesson.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-quest-gold font-display">+{lesson.xpReward} XP</span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-glyph-emerald" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-parchment-rune" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Lesson Deep Dive */}
            <div className="bg-dungeon-abyss border-2 border-dungeon-highlight p-3 space-y-3">
              <div className="flex items-center justify-between border-b border-dungeon-border pb-1.5">
                <h3 className="font-display font-bold text-xs text-mana-core uppercase">
                  {activeLesson.title}
                </h3>
                <span className="text-[10px] text-quest-gold font-display font-bold">
                  +{activeLesson.xpReward} XP
                </span>
              </div>

              {/* Plain English Concept Explainer */}
              <div>
                <span className="text-[10px] font-display uppercase text-parchment-rune block mb-1">
                  💡 Plain-English Concept
                </span>
                <p className="text-xs text-parchment-white leading-relaxed">
                  {activeLesson.conceptExplainer}
                </p>
              </div>

              {/* Real World Analogy */}
              <div className="bg-dungeon-crypt/60 border border-dungeon-border p-2">
                <span className="text-[10px] font-display uppercase text-quest-gold block mb-1">
                  🏰 Real-World Dungeon Analogy
                </span>
                <p className="text-xs text-parchment-rune italic">
                  "{activeLesson.realWorldAnalogy}"
                </p>
              </div>

              {/* Syntax Rune Box */}
              <div>
                <span className="text-[10px] font-display uppercase text-parchment-rune block mb-1">
                  ⚡ Syntax Inscription
                </span>
                <div className="bg-dungeon-chamber border border-dungeon-border p-2 text-xs font-code text-mana-glow">
                  {activeLesson.syntaxTemplate}
                </div>
              </div>

              {/* Target Objective */}
              <div className="border-t border-dungeon-border pt-2">
                <span className="text-[10px] font-display uppercase text-glyph-emerald font-bold block mb-1">
                  🎯 Objective Task
                </span>
                <p className="text-xs text-parchment-white mb-2">
                  {activeLesson.targetObjective}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onInsertCode(activeLesson.starterSql)}
                    className="flex-1 bg-dungeon-crypt border border-mana-core text-mana-core hover:bg-mana-core hover:text-dungeon-abyss py-1 px-2 text-xs font-display font-bold pixel-btn transition-colors"
                  >
                    Insert Starter Scroll
                  </button>
                  <button
                    onClick={() => onOpenHintModal(activeLesson.hints)}
                    className="bg-dungeon-crypt border border-quest-gold text-quest-gold hover:bg-quest-gold hover:text-dungeon-abyss py-1 px-2.5 text-xs font-display font-bold pixel-btn transition-colors"
                    title="View 3-Tier Grimoire Hints"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CASE STUDY / BOSS BATTLE (GATEKEEPER) */}
        {(activeTab === 'boss' || isViewingCaseStudy) && (
          <div className="space-y-4">
            <div className="bg-dungeon-abyss border-2 border-glyph-crimson p-3 space-y-3 shadow-pixel">
              <div className="flex items-center justify-between border-b border-glyph-crimson/50 pb-2">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-glyph-crimson animate-pulse" />
                  <span className="font-display font-bold text-xs text-glyph-crimson uppercase">
                    GATEKEEPER CASE STUDY
                  </span>
                </div>
                <span className="text-[10px] text-quest-gold font-display font-bold">
                  +{currentChapter.caseStudy.xpReward} XP
                </span>
              </div>

              <div>
                <span className="text-[10px] font-display text-quest-amber uppercase block">
                  Role Mission: {currentChapter.caseStudy.roleContext}
                </span>
                <h3 className="font-display font-bold text-sm text-parchment-white mt-0.5">
                  {currentChapter.caseStudy.title}
                </h3>
              </div>

              <div className="bg-dungeon-chamber border border-dungeon-border p-2.5 text-xs text-parchment-white leading-relaxed">
                {currentChapter.caseStudy.scenario}
              </div>

              {/* Requirements Checklist */}
              <div>
                <span className="text-[10px] font-display uppercase text-parchment-rune block mb-1.5">
                  📜 Mandatory Chamber Objectives (Next chapter closed until cleared):
                </span>
                <ul className="space-y-1">
                  {currentChapter.caseStudy.requirements.map((req, i) => (
                    <li key={i} className="text-xs text-parchment-white flex items-start gap-1.5">
                      <span className="text-glyph-crimson font-bold font-display">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1 border-t border-dungeon-border">
                <button
                  onClick={() => onInsertCode(currentChapter.caseStudy.starterSql)}
                  className="flex-1 bg-dungeon-chamber border border-glyph-crimson text-glyph-crimson hover:bg-glyph-crimson hover:text-parchment-white py-1.5 px-2 text-xs font-display font-bold pixel-btn transition-colors"
                >
                  Load Case Study Prompt
                </button>
                <button
                  onClick={() => onOpenHintModal(currentChapter.caseStudy.hints)}
                  className="bg-dungeon-chamber border border-quest-gold text-quest-gold hover:bg-quest-gold hover:text-dungeon-abyss py-1.5 px-3 text-xs font-display font-bold pixel-btn transition-colors flex items-center gap-1"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Hints</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TABLE SCHEMAS / INVENTORY */}
        {activeTab === 'schema' && (
          <div className="space-y-4">
            <span className="text-[10px] font-display text-parchment-rune uppercase">
              Chamber Armory (Database Tables & Columns)
            </span>

            {/* Inventory Slots for Tables */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {schemas.map(schema => (
                <div
                  key={schema.tableName}
                  className="bg-dungeon-abyss border-2 border-dungeon-highlight hover:border-mana-core p-2 text-left group cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-display font-bold text-mana-core">
                    <span className="truncate">{schema.tableName}</span>
                  </div>
                  <div className="text-[10px] text-parchment-rune mt-0.5">
                    {schema.rowCount.toLocaleString()} rows
                  </div>
                  <div className="text-[9px] text-quest-gold mt-1 font-display">
                    {schema.columns.length} columns
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Table Inspection */}
            <div className="space-y-3">
              {schemas.map(schema => (
                <div key={schema.tableName} className="bg-dungeon-abyss border border-dungeon-border p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-bold text-xs text-parchment-white">
                      {schema.tableName}
                    </span>
                    <button
                      onClick={() => onInsertCode(`SELECT * FROM ${schema.tableName} LIMIT 10;`)}
                      className="text-[10px] text-mana-core hover:underline font-display"
                    >
                      SELECT *
                    </button>
                  </div>
                  <p className="text-[11px] text-parchment-rune mb-2">
                    {schema.description}
                  </p>

                  <div className="space-y-1">
                    {schema.columns.map(col => (
                      <div
                        key={col.name}
                        className="flex items-center justify-between text-[11px] bg-dungeon-chamber px-2 py-0.5 border border-dungeon-border"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-code text-parchment-white">{col.name}</span>
                          {col.isPrimaryKey && (
                            <span className="text-[9px] bg-quest-gold/20 text-quest-gold px-1 font-display">PK</span>
                          )}
                          {col.isForeignKey && (
                            <span className="text-[9px] bg-glyph-violet/20 text-glyph-violet px-1 font-display">FK</span>
                          )}
                        </div>
                        <span className="text-[10px] text-parchment-rune font-display">{col.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
