import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PlayerProfile, Chapter, Lesson, QueryExecutionResult, AppView, TableSchema } from '../types/game';
import { CHAPTERS_DATA } from '../data/chapters';
import { ApiService } from '../services/apiService';
import { sqlEngine } from '../engine/sqlEngine';
import confetti from 'canvas-confetti';
import {
  Swords, Flame, Gem, Shield, Database, Play, Check, ChevronDown, ChevronUp,
  RotateCcw, Sparkles, Terminal, CheckCircle2, ChevronRight, ChevronLeft,
  Settings, Award, Lock, ArrowRight, ArrowLeft, BookOpen, AlertOctagon, HelpCircle,
  Key, ExternalLink, FileCode, Copy
} from 'lucide-react';

interface QuerySuggestion {
  label: string;
  type: 'keyword' | 'table' | 'column' | 'func';
  detail: string;
}

const BASE_SQL_KEYWORDS: QuerySuggestion[] = [
  { label: 'SELECT', type: 'keyword', detail: 'Retrieve rows from table' },
  { label: 'SELECT * FROM', type: 'keyword', detail: 'Select all columns' },
  { label: 'FROM', type: 'keyword', detail: 'Specify source table' },
  { label: 'WHERE', type: 'keyword', detail: 'Filter records by condition' },
  { label: 'ORDER BY', type: 'keyword', detail: 'Sort output columns' },
  { label: 'GROUP BY', type: 'keyword', detail: 'Group rows by values' },
  { label: 'HAVING', type: 'keyword', detail: 'Filter aggregated groups' },
  { label: 'LIMIT', type: 'keyword', detail: 'Restrict maximum rows' },
  { label: 'JOIN', type: 'keyword', detail: 'Join related tables' },
  { label: 'LEFT JOIN', type: 'keyword', detail: 'Left outer join' },
  { label: 'INNER JOIN', type: 'keyword', detail: 'Inner join matched rows' },
  { label: 'ON', type: 'keyword', detail: 'Join condition' },
  { label: 'AND', type: 'keyword', detail: 'Logical AND' },
  { label: 'OR', type: 'keyword', detail: 'Logical OR' },
  { label: 'NOT', type: 'keyword', detail: 'Logical NOT' },
  { label: 'IN', type: 'keyword', detail: 'Match any in list' },
  { label: 'LIKE', type: 'keyword', detail: 'Pattern match (%)' },
  { label: 'DISTINCT', type: 'keyword', detail: 'Return unique values' },
  { label: 'AS', type: 'keyword', detail: 'Alias column or table' },
  { label: 'BETWEEN', type: 'keyword', detail: 'Range comparison' },
  { label: 'IS NULL', type: 'keyword', detail: 'Test for null values' },
  { label: 'IS NOT NULL', type: 'keyword', detail: 'Test for non-null' },
  { label: 'DESC', type: 'keyword', detail: 'Descending sort' },
  { label: 'ASC', type: 'keyword', detail: 'Ascending sort' },
  { label: 'COUNT(*)', type: 'func', detail: 'Count total returned rows' },
  { label: 'SUM()', type: 'func', detail: 'Sum numeric column' },
  { label: 'AVG()', type: 'func', detail: 'Calculate average value' },
  { label: 'MIN()', type: 'func', detail: 'Minimum value' },
  { label: 'MAX()', type: 'func', detail: 'Maximum value' },
  { label: 'ROUND()', type: 'func', detail: 'Round numeric value' },
];

// Helper function to calculate caret pixel coordinates inside a textarea
const getCaretCoordinates = (element: HTMLTextAreaElement, position: number) => {
  const properties = [
    'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
    'fontSizeAdjust', 'lineHeight', 'fontFamily', 'textAlign', 'textTransform',
    'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing', 'tabSize'
  ];

  const div = document.createElement('div');
  div.id = 'input-textarea-caret-position-mirror-div';
  document.body.appendChild(div);

  const style = div.style;
  const computed = window.getComputedStyle(element);

  style.whiteSpace = 'pre-wrap';
  style.wordWrap = 'break-word';
  style.position = 'absolute';
  style.visibility = 'hidden';
  style.top = '0';
  style.left = '-9999px';

  properties.forEach(prop => {
    // @ts-ignore
    style[prop] = computed[prop];
  });

  div.textContent = element.value.substring(0, position);

  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);

  const coordinates = {
    top: span.offsetTop + parseInt(computed.borderTopWidth || '0', 10),
    left: span.offsetLeft + parseInt(computed.borderLeftWidth || '0', 10),
    height: parseInt(computed.lineHeight || '20', 10) || 20
  };

  document.body.removeChild(div);
  return coordinates;
};

// Formats single-line SQL query into standard multi-line clauses like Image_4
const formatSqlHint = (sql: string): string => {
  if (!sql) return '';
  if (sql.includes('\n')) return sql.trim();
  return sql
    .replace(/\s+/g, ' ')
    .replace(/\s+(FROM)\s+/gi, '\nFROM ')
    .replace(/\s+(WHERE)\s+/gi, '\nWHERE ')
    .replace(/\s+(GROUP BY)\s+/gi, '\nGROUP BY ')
    .replace(/\s+(HAVING)\s+/gi, '\nHAVING ')
    .replace(/\s+(ORDER BY)\s+/gi, '\nORDER BY ')
    .replace(/\s+(LIMIT)\s+/gi, '\nLIMIT ')
    .replace(/\s+(INNER JOIN)\s+/gi, '\nINNER JOIN ')
    .replace(/\s+(LEFT JOIN)\s+/gi, '\nLEFT JOIN ')
    .replace(/\s+(JOIN)\s+/gi, '\nJOIN ')
    .trim();
};

interface PlaygroundPageProps {
  profile: PlayerProfile;
  schemas?: TableSchema[];
  initialChapterId?: number;
  initialLessonId?: string;
  onChangeView: (view: AppView) => void;
  onOpenProfile: () => void;
  onProfileUpdated: (updated: PlayerProfile) => void;
}

export const PlaygroundPage: React.FC<PlaygroundPageProps> = ({
  profile,
  schemas,
  initialChapterId = 1,
  initialLessonId,
  onChangeView,
  onOpenProfile,
  onProfileUpdated,
}) => {
  // Current active chapter
  const [chapterId, setChapterId] = useState<number>(initialChapterId);
  const chapter = CHAPTERS_DATA.find(c => c.id === chapterId) || CHAPTERS_DATA[0];

  // Determine current lesson
  const [lessonId, setLessonId] = useState<string>(
    initialLessonId || chapter.lessons[0].id
  );
  const currentLesson = chapter.lessons.find(l => l.id === lessonId) || chapter.lessons[0];

  // Code editor state
  const [editorQuery, setEditorQuery] = useState<string>(currentLesson.starterSql);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<QueryExecutionResult | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<'none' | 'passed' | 'failed'>('none');
  const [passMessage, setPassMessage] = useState<string>('');

  // Right panel view tab: 'output' | 'battle' | 'schema'
  const [rightTab, setRightTab] = useState<'output' | 'battle' | 'schema'>('output');

  // DB Schemas for interactive schema tab
  const availableSchemas = (schemas && schemas.length > 0) ? schemas : sqlEngine.getSchemas();
  const [selectedSchemaTable, setSelectedSchemaTable] = useState<string>('tavern_orders');
  const activeSchema = availableSchemas.find(s => s.tableName === selectedSchemaTable) || availableSchemas[0];
  const [copiedSchemaTable, setCopiedSchemaTable] = useState(false);

  // Editor ref & Query Supporter Autocomplete State
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [suggestions, setSuggestions] = useState<QuerySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [activeWordRange, setActiveWordRange] = useState<{ start: number; end: number; word: string } | null>(null);
  const [suggestionCoords, setSuggestionCoords] = useState<{ top: number; left: number }>({ top: 40, left: 20 });

  // Dynamic suggestions combining SQL keywords, DB tables, and DB columns
  const allSuggestions = useMemo(() => {
    const tableSuggestions: QuerySuggestion[] = availableSchemas.map(s => ({
      label: s.tableName,
      type: 'table',
      detail: `${s.rowCount} rows • ${s.category}`
    }));

    const colMap = new Map<string, string>();
    availableSchemas.forEach(s => {
      s.columns.forEach(c => {
        if (!colMap.has(c.name)) {
          colMap.set(c.name, `${c.type} (${s.tableName})`);
        }
      });
    });

    const colSuggestions: QuerySuggestion[] = Array.from(colMap.entries()).map(([name, detail]) => ({
      label: name,
      type: 'column',
      detail,
    }));

    return [...BASE_SQL_KEYWORDS, ...tableSuggestions, ...colSuggestions];
  }, [availableSchemas]);

  // Hint collapsible toggle (HIDDEN by default until clicked!)
  const [hintExpanded, setHintExpanded] = useState<boolean>(false);

  // Lesson index & Sequential Unlock Checking
  const currentLessonIndex = chapter.lessons.findIndex(l => l.id === currentLesson.id);
  const isFirstLesson = currentLessonIndex === 0;
  const isLastLesson = currentLessonIndex === chapter.lessons.length - 1;

  // An exercise is unlocked if it's the first exercise of an unlocked chapter, OR if the previous exercise has been completed!
  const isPreviousLessonCompleted = isFirstLesson
    ? true
    : (profile.completedLessons || []).includes(chapter.lessons[currentLessonIndex - 1].id);

  const isCurrentLessonUnlocked = (profile.unlockedChapters || [1]).includes(chapter.id) && isPreviousLessonCompleted;

  // Sync editor starter query when lesson changes
  useEffect(() => {
    setEditorQuery(currentLesson.starterSql);
    setLastResult(null);
    setSubmissionStatus('none');
    setPassMessage('');
    setHintExpanded(false);
  }, [lessonId, chapterId]);

  // 1. RUN QUERY ONLY: Executes SQL and shows output result, does NOT submit or evaluate quest criteria
  const handleRunQuery = async () => {
    if (!isCurrentLessonUnlocked) {
      alert('🔒 This trial is locked! Complete the preceding exercises first.');
      return;
    }

    setIsExecuting(true);
    setSubmissionStatus('none');
    setRightTab('output');

    try {
      // Execute query against PostgreSQL backend or local engine
      const res = await ApiService.executeQuery(editorQuery, profile.id, currentLesson.id, chapter.id);

      let finalResult = res;
      if (!res.success && res.error && res.error.includes('Network Connection Error')) {
        const localRes = sqlEngine.executeQuery(editorQuery);
        finalResult = {
          success: localRes.success,
          columns: localRes.columns,
          rows: localRes.rows,
          rowCount: localRes.rowCount,
          executionTimeMs: localRes.executionTimeMs,
          error: localRes.error,
        };
      }

      setLastResult(finalResult);
    } catch (e: any) {
      setLastResult({
        success: false,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: 0,
        error: e.message || 'Execution error',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // 2. SUBMIT ANSWER: Validates query against quest objective, displays completion banner & awards XP/Gold
  const handleSubmitAnswer = async () => {
    if (!isCurrentLessonUnlocked) {
      alert('🔒 This trial is locked! Complete the preceding exercises first.');
      return;
    }

    setIsSubmitting(true);
    setRightTab('output');

    try {
      // 1. Call real backend API running against PostgreSQL Prisma (or in-browser fallback)
      const res = await ApiService.executeQuery(editorQuery, profile.id, currentLesson.id, chapter.id);

      // Fallback or evaluate lesson validation on in-browser engine
      let finalResult = res;
      if (finalResult.lessonPassed === undefined && finalResult.rows) {
        const check = currentLesson.validation(finalResult.rows);
        finalResult = {
          ...finalResult,
          lessonPassed: check.passed,
          feedbackMessage: check.message,
        };
      }

      setLastResult(finalResult);

      if (finalResult.success) {
        if (finalResult.lessonPassed) {
          setSubmissionStatus('passed');
          setPassMessage(finalResult.feedbackMessage || 'Quest trial cleared with 100% accuracy!');

          // Update local profile with backend response or calculation
          if (finalResult.updatedProgress) {
            const updated: PlayerProfile = {
              ...profile,
              level: finalResult.updatedProgress.level,
              xp: finalResult.updatedProgress.xp,
              gems: finalResult.updatedProgress.gems,
              completedLessons: finalResult.updatedProgress.completedLessons,
              completedCaseStudies: finalResult.updatedProgress.completedCaseStudies,
              unlockedChapters: finalResult.updatedProgress.unlockedChapters,
              solvedQueriesCount: profile.solvedQueriesCount + 1,
            };
            onProfileUpdated(updated);
          } else {
            const completed = [...(profile.completedLessons || [])];
            if (!completed.includes(currentLesson.id)) {
              completed.push(currentLesson.id);
            }
            const updated: PlayerProfile = {
              ...profile,
              xp: profile.xp + currentLesson.xpReward,
              gems: (profile.gems ?? 0) + currentLesson.gemReward,
              completedLessons: completed,
              solvedQueriesCount: profile.solvedQueriesCount + 1,
            };
            onProfileUpdated(updated);
          }

          // Confetti celebration
          try {
            confetti({
              particleCount: 80,
              spread: 65,
              origin: { y: 0.7 },
              colors: ['#00f2fe', '#fbbf24', '#10b981'],
            });
          } catch {
            // ignore
          }
        } else {
          setSubmissionStatus('failed');
          setPassMessage(finalResult.feedbackMessage || 'Results did not match the expected objective requirements.');
        }
      } else {
        setSubmissionStatus('failed');
        setPassMessage(finalResult.error || 'Syntax spell fizzled!');
      }
    } catch (e: any) {
      setSubmissionStatus('failed');
      setPassMessage(e.message || 'Execution error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle typing in editor and triggering Query Supporter hints
  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setEditorQuery(text);

    const cursorPos = e.target.selectionStart || 0;
    let start = cursorPos - 1;
    while (start >= 0 && /[a-zA-Z0-9_*]/.test(text[start])) {
      start--;
    }
    start++;
    const currentWord = text.slice(start, cursorPos).trim();

    if (currentWord.length >= 1) {
      const filtered = allSuggestions.filter(s =>
        s.label.toLowerCase().startsWith(currentWord.toLowerCase()) ||
        (currentWord.length >= 2 && s.label.toLowerCase().includes(currentWord.toLowerCase()))
      ).slice(0, 6);

      if (filtered.length > 0) {
        setSuggestions(filtered);
        setSelectedSuggestionIndex(0);
        setShowSuggestions(true);
        setActiveWordRange({ start, end: cursorPos, word: currentWord });

        // Calculate cursor coordinates for popup placement next to cursor
        if (textareaRef.current) {
          try {
            const coords = getCaretCoordinates(textareaRef.current, cursorPos);
            const top = coords.top - textareaRef.current.scrollTop + coords.height + 4;
            const left = coords.left - textareaRef.current.scrollLeft;

            const textareaWidth = textareaRef.current.clientWidth || 360;
            const textareaHeight = textareaRef.current.clientHeight || 300;

            // Clamp so popup fits inside editor bounds
            const clampedLeft = Math.max(8, Math.min(left, textareaWidth - 270));
            const clampedTop = top + 180 > textareaHeight ? Math.max(8, top - 180 - coords.height) : Math.max(8, top);

            setSuggestionCoords({ top: clampedTop, left: clampedLeft });
          } catch {
            setSuggestionCoords({ top: 60, left: 20 });
          }
        }
        return;
      }
    }
    setShowSuggestions(false);
  };

  // Apply selected autocomplete suggestion
  const applySuggestion = (suggestion: QuerySuggestion) => {
    if (!activeWordRange || !textareaRef.current) return;
    const before = editorQuery.slice(0, activeWordRange.start);
    const after = editorQuery.slice(activeWordRange.end);
    const insertText = suggestion.label;
    const updated = before + insertText + after;
    setEditorQuery(updated);
    setShowSuggestions(false);

    const newCursor = activeWordRange.start + insertText.length;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursor, newCursor);
      }
    }, 10);
  };

  // Keyboard navigation & Shortcuts (Ctrl+Enter to Run Query)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 4. Shortcut for run query (Ctrl+Enter or Cmd+Enter)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunQuery();
      return;
    }

    // Autocomplete navigation
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
        return;
      }
    }
  };

  // Global window listener for Ctrl+Enter shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunQuery();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [editorQuery, isCurrentLessonUnlocked, isExecuting]);

  // Sequential Navigation: Next quest unlocks ONLY if current quest is completed!
  const isCurrentLessonDone = (profile.completedLessons || []).includes(currentLesson.id) || submissionStatus === 'passed';

  const handleNextQuest = () => {
    if (!isCurrentLessonDone) {
      alert('🔒 Complete the current exercise and submit a passing query to unlock the next quest!');
      return;
    }

    if (!isLastLesson) {
      const nextL = chapter.lessons[currentLessonIndex + 1];
      setLessonId(nextL.id);
    } else {
      // If boss trial cleared, check if next chapter is available
      const nextChap = CHAPTERS_DATA.find(c => c.id === chapter.id + 1);
      if (nextChap && (profile.unlockedChapters || [1]).includes(nextChap.id)) {
        setChapterId(nextChap.id);
        setLessonId(nextChap.lessons[0].id);
      } else {
        alert('⚔️ Slay the Chapter Boss Trial first to unseal the next chapter!');
      }
    }
  };

  const handlePrevQuest = () => {
    if (!isFirstLesson) {
      const prevL = chapter.lessons[currentLessonIndex - 1];
      setLessonId(prevL.id);
    }
  };

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-dungeon-abyss text-parchment-white flex flex-col font-code">
      {/* 1. TOP HEADER - EXACT MATCH TO IMAGE 3 */}
      <header className="border-b-2 border-dungeon-border bg-dungeon-chamber px-4 py-2 flex items-center justify-between gap-3 shadow-pixel shrink-0 z-40">
        {/* Left: Brand & Chapter Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onChangeView('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Return to Academy Hub"
          >
            <div className="w-8 h-8 bg-dungeon-abyss border-2 border-mana-core flex items-center justify-center text-mana-core">
              <Swords className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-sm text-parchment-white">
                  SQL QUEST
                </span>
                <span className="bg-quest-gold text-dungeon-abyss text-[9px] font-display font-bold px-1">
                  RPG
                </span>
              </div>
              <span className="text-[10px] text-parchment-rune">RPG DATA ACADEMY</span>
            </div>
          </button>

          <div className="hidden md:block h-6 w-px bg-dungeon-highlight mx-1" />

          {/* Chapter Selector Pill */}
          <div className="hidden md:flex items-center gap-2 text-xs font-display">
            <span className="text-parchment-white font-bold">{chapter.code} :</span>
            <span className="text-parchment-rune">{chapter.title}</span>
          </div>
        </div>

        {/* Center: XP Bar */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-display w-64">
          <span className="text-quest-gold font-bold">XP</span>
          <div className="flex-1 h-2 bg-dungeon-abyss border border-dungeon-highlight overflow-hidden">
            <div
              className="h-full bg-mana-core transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.round((profile.xp / (profile.level * 350)) * 100))}%`,
              }}
            />
          </div>
          <span className="text-parchment-rune text-[10px]">
            {profile.xp} / {profile.level * 350}
          </span>
        </div>

        {/* Right Stats & Navigation */}
        <div className="flex items-center gap-3 text-xs font-display">
          <div className="flex items-center gap-1 bg-dungeon-crypt border border-dungeon-highlight px-2 py-1 text-quest-gold">
            <Flame className="w-3.5 h-3.5 fill-quest-gold text-quest-gold" />
            <span>{profile.streak} DAYS</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-dungeon-crypt border border-dungeon-highlight px-2 py-1 text-mana-core">
            <Gem className="w-3.5 h-3.5 fill-mana-core text-mana-core" />
            <span>{profile.gems ?? 0} GEMS</span>
          </div>

          {/* Player Pill */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 bg-dungeon-crypt border-2 border-mana-core px-2.5 py-1 pixel-btn hover:bg-dungeon-highlight"
          >
            <div className="w-5 h-5 bg-dungeon-abyss text-mana-core border border-mana-core flex items-center justify-center text-[10px] font-bold">
              {profile.gamerTag.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-parchment-white block leading-none">
                {profile.gamerTag}
              </span>
              <span className="text-[9px] text-quest-gold leading-none">
                LV{profile.level} {profile.role}
              </span>
            </div>
          </button>

          <button
            onClick={() => onChangeView('schema')}
            className="bg-quest-gold hover:bg-quest-amber text-dungeon-abyss font-display font-bold text-xs px-2.5 py-1.5 pixel-btn hidden sm:block uppercase"
          >
            JOIN GUILD
          </button>
        </div>
      </header>

      {/* 2. SUB-HEADER: BACK TO HOME & QUEST INFO */}
      <div className="bg-dungeon-chamber border-b border-dungeon-border px-4 py-1.5 flex items-center justify-between text-xs font-display flex-wrap gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onChangeView('home')}
            className="flex items-center gap-1.5 bg-dungeon-crypt hover:bg-mana-core hover:text-dungeon-abyss text-mana-core border border-mana-core px-2.5 py-1 text-xs font-display font-bold pixel-btn transition-colors"
            title="Return to Campaign Home"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO HOME</span>
          </button>
          <div className="h-4 w-px bg-dungeon-highlight" />
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full inline-block ${isCurrentLessonUnlocked ? 'bg-mana-core' : 'bg-glyph-crimson'}`} />
            <span className="text-mana-core font-bold tracking-wider uppercase">
              QUEST 0{currentLesson.exerciseNumber}: {currentLesson.title.toUpperCase()}
            </span>
            {!isCurrentLessonUnlocked && (
              <span className="bg-glyph-crimson/20 border border-glyph-crimson text-glyph-crimson text-[9px] px-1 font-bold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> LOCKED
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-parchment-rune">
          <span className="text-glyph-emerald flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 bg-glyph-emerald rounded-full animate-pulse" />
            <span>DB CONNECTED</span>
          </span>
          <button
            onClick={() => setRightTab('schema')}
            className="text-quest-gold hover:underline flex items-center gap-1 font-bold"
          >
            <Database className="w-3.5 h-3.5" />
            <span>DB SCHEMA</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKBENCH: EXACT 3-COLUMN LAYOUT (FITS EXACT SCREEN) */}
      <main className="flex-1 min-h-0 max-w-[1850px] w-full mx-auto p-2 sm:p-2.5 grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-hidden">
        {/* ============================================================== */}
        {/* COLUMN 1 (4 cols): QUEST BRIEF, SYNTAX MASTERCLASS & OBJECTIVE */}
        {/* ============================================================== */}
        <section className="lg:col-span-4 h-full min-h-0 bg-dungeon-chamber border-2 border-dungeon-border flex flex-col shadow-pixel overflow-hidden">
          <div className="p-3 sm:p-4 space-y-4 overflow-y-auto flex-1 min-h-0 text-xs font-code scrollbar-thin">
            {/* Locked Warning Banner if not unlocked */}
            {!isCurrentLessonUnlocked && (
              <div className="p-3 bg-glyph-crimson/15 border-2 border-glyph-crimson text-parchment-white space-y-1">
                <div className="flex items-center gap-2 text-glyph-crimson font-display font-bold">
                  <Lock className="w-4 h-4" />
                  <span>CHAMBER TRIAL SEALED</span>
                </div>
                <p className="text-[11px] text-parchment-rune">
                  You must complete Exercise {currentLessonIndex}:{' '}
                  <span className="text-parchment-white font-bold">{chapter.lessons[currentLessonIndex - 1]?.title}</span>{' '}
                  before this trial can be attempted!
                </p>
              </div>
            )}

            {/* Level Badge & XP Rewards */}
            <div className="flex items-center justify-between">
              <span className="bg-dungeon-crypt border border-quest-gold text-quest-gold px-2 py-0.5 font-display font-bold text-[10px] tracking-wider">
                LEVEL: {currentLesson.difficulty}
              </span>
              <span className="text-quest-gold font-display font-bold text-xs">
                +{currentLesson.xpReward} XP • {currentLesson.gemReward} GEMS
              </span>
            </div>

            {/* Quest Title & Lore Intro */}
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-parchment-white">
                #{String(currentLesson.exerciseNumber).padStart(2, '0')}. {currentLesson.title}
              </h2>
              <p className="text-xs text-parchment-rune mt-1 leading-relaxed">
                {currentLesson.loreIntro}
              </p>
            </div>

            {/* SYNTAX MASTERCLASS CARD */}
            <div className="bg-dungeon-abyss border border-dungeon-highlight p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-display">
                <span className="text-parchment-white font-bold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-mana-core" />
                  <span>{currentLesson.ruleTitle}</span>
                </span>
                <span className="text-quest-gold font-bold">{currentLesson.ruleNumber}</span>
              </div>

              <p className="text-parchment-rune text-[11px] leading-relaxed">
                {currentLesson.syntaxMasterclass.explanation}
              </p>

              {/* Bullet Tips */}
              <ul className="space-y-1 text-[11px] text-parchment-rune pt-1">
                {currentLesson.syntaxMasterclass.bulletTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-mana-core font-bold font-display">✦</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CURRENT OBJECTIVE (QUEST TRIAL) */}
            <div className="bg-dungeon-abyss border-2 border-mana-core/60 p-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-display">
                <span className="text-mana-core font-bold uppercase tracking-wider">
                  CURRENT OBJECTIVE
                </span>
                <span className="text-quest-gold text-[10px]">⚔️ Quest Trial</span>
              </div>

              <p className="text-parchment-white text-xs font-bold leading-relaxed">
                {currentLesson.currentObjective.prompt}
              </p>

              {/* Table Schema Preview Chip */}
              <div className="pt-2 border-t border-dungeon-border">
                <div className="flex items-center justify-between text-[10px] font-display text-parchment-rune mb-1">
                  <span>TABLE: <span className="text-parchment-white font-bold">{currentLesson.currentObjective.focusTable}</span></span>
                  <span className="text-quest-gold">{currentLesson.currentObjective.tableColumnsPreview.length} COLUMNS</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] font-code bg-dungeon-chamber p-1.5 border border-dungeon-border">
                  {currentLesson.currentObjective.tableColumnsPreview.map(c => (
                    <div key={c.name} className="flex justify-between text-parchment-rune">
                      <span className="text-parchment-white font-bold">{c.name}</span>
                      <span className="text-mana-core">{c.type} {c.isPk ? '(PK)' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* COLLAPSIBLE HINT CARD (HIDDEN BY DEFAULT UNTIL CLICKED!) */}
            <div className="border-2 border-quest-gold bg-dungeon-abyss overflow-hidden">
              <button
                onClick={() => setHintExpanded(!hintExpanded)}
                className="w-full bg-dungeon-chamber hover:bg-dungeon-crypt p-2.5 flex items-center justify-between text-xs font-display font-bold text-quest-gold cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>💡</span>
                  <span>NEED A HINT? (CLICK TO UNLOCK)</span>
                </div>
                {hintExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {hintExpanded && (
                <div className="p-3 space-y-2 border-t border-quest-gold/40 text-xs font-code bg-dungeon-abyss animate-fadeIn">
                  <div className="text-parchment-rune leading-relaxed">
                    <span className="text-quest-gold font-bold font-display block mb-1">🔍 STRATEGIC CLUE:</span>
                    {currentLesson.hint.clue}
                  </div>
                  <div className="bg-dungeon-chamber p-2.5 border border-dungeon-border text-[11px] text-mana-core font-code leading-relaxed">
                    <pre className="whitespace-pre-wrap font-code">{formatSqlHint(currentLesson.hint.syntaxGuide)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* COLUMN 2 (4 cols): SQL EDITOR & INTERACTIVE QUERY SUPPORTER   */}
        {/* ============================================================== */}
        <section className="lg:col-span-4 h-full min-h-0 bg-dungeon-abyss border-2 border-dungeon-border flex flex-col shadow-pixel overflow-hidden">
          {/* File Tab Header */}
          <div className="bg-dungeon-chamber border-b border-dungeon-border px-3 py-1.5 flex items-center justify-between text-xs font-display shrink-0">
            <div className="flex items-center gap-2 bg-dungeon-abyss px-2.5 py-0.5 border-t-2 border-mana-core text-mana-core font-bold">
              <Terminal className="w-3.5 h-3.5" />
              <span>quest_solution.sql</span>
              <span className="w-1.5 h-1.5 bg-quest-gold rounded-full inline-block" />
            </div>
            <div className="flex items-center gap-3 text-parchment-rune text-[11px]">
              <button
                onClick={() => {
                  setEditorQuery(prev => prev.trim());
                }}
                className="hover:text-parchment-white flex items-center gap-1"
                title="Format SQL Query"
              >
                <span>Format ⚡</span>
              </button>
              <button
                onClick={() => setEditorQuery(currentLesson.starterSql)}
                className="hover:text-glyph-crimson flex items-center gap-1"
                title="Reset editor"
              >
                <span>Reset ↺</span>
              </button>
            </div>
          </div>

          {/* Line-Numbered SQL Editor with Query Supporter popup */}
          <div className="flex-1 min-h-0 flex flex-col bg-dungeon-abyss p-2 relative">
            <textarea
              ref={textareaRef}
              value={editorQuery}
              onChange={handleEditorChange}
              onKeyDown={handleKeyDown}
              disabled={!isCurrentLessonUnlocked}
              placeholder="-- Write your SQL query here using your own brain!&#10;SELECT * FROM tavern_orders;"
              className="w-full flex-1 min-h-0 bg-transparent text-parchment-white font-code text-xs sm:text-sm p-2 focus:outline-none resize-none leading-relaxed selection:bg-mana-core selection:text-dungeon-abyss disabled:opacity-40"
              spellCheck={false}
            />

            {/* 5. QUERY SUPPORTER: Auto-Complete Hints next to cursor */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                style={{ top: `${suggestionCoords.top}px`, left: `${suggestionCoords.left}px` }}
                className="absolute z-30 w-64 max-h-48 bg-dungeon-chamber border-2 border-mana-core shadow-2xl flex flex-col overflow-hidden text-xs font-code animate-fadeIn pointer-events-auto"
              >
                <div className="bg-dungeon-crypt px-2 py-0.5 border-b border-dungeon-border flex items-center justify-between text-[10px] font-display text-parchment-rune shrink-0">
                  <span className="text-mana-core font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-quest-gold" />
                    <span>HINT</span>
                  </span>
                  <span className="text-[9px]">Tab / ↵</span>
                </div>
                <div className="overflow-y-auto divide-y divide-dungeon-border/40 scrollbar-thin flex-1 min-h-0">
                  {suggestions.map((item, idx) => {
                    const isSel = idx === selectedSuggestionIndex;
                    return (
                      <div
                        key={`${item.label}-${idx}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applySuggestion(item);
                        }}
                        className={`px-2 py-1 flex items-center justify-between cursor-pointer transition-colors ${
                          isSel
                            ? 'bg-mana-core/25 text-parchment-white border-l-2 border-mana-core'
                            : 'text-parchment-white/80 hover:bg-dungeon-crypt/60'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className={`text-[8px] font-display font-bold px-1 py-0.2 uppercase ${
                            item.type === 'keyword' ? 'bg-mana-core/20 text-mana-core' :
                            item.type === 'table' ? 'bg-quest-gold/20 text-quest-gold' :
                            item.type === 'column' ? 'bg-glyph-emerald/20 text-glyph-emerald' :
                            'bg-glyph-crimson/20 text-glyph-crimson'
                          }`}>
                            {item.type}
                          </span>
                          <span className="font-bold text-parchment-white text-xs truncate">{item.label}</span>
                        </div>
                        <span className="text-[9px] text-parchment-rune truncate ml-2 max-w-[80px]">{item.detail}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="bg-dungeon-chamber border-t border-dungeon-border p-2 flex items-center justify-between gap-2 flex-wrap text-xs font-display shrink-0">
            {/* Shortcut Indicator */}
            <div className="flex items-center gap-2 text-parchment-rune text-[11px]">
              <span className="flex items-center gap-1.5 text-parchment-rune">
                <kbd className="bg-dungeon-abyss border border-dungeon-highlight px-1.5 py-0.5 text-mana-core font-code text-[10px]">Ctrl + Enter</kbd>
                <span>to run query</span>
              </span>
            </div>

            {/* Action buttons: RUN QUERY (output only) vs SUBMIT (objective validation) */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunQuery}
                disabled={isExecuting || isSubmitting || !isCurrentLessonUnlocked}
                className="bg-dungeon-crypt hover:bg-dungeon-highlight disabled:opacity-40 text-parchment-white border border-dungeon-highlight px-3 py-1.5 pixel-btn font-bold flex items-center gap-1.5"
                title="Run SQL Query to inspect output (Ctrl + Enter)"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isExecuting ? 'RUNNING...' : 'RUN QUERY'}</span>
              </button>

              <button
                onClick={handleSubmitAnswer}
                disabled={isExecuting || isSubmitting || !isCurrentLessonUnlocked}
                className="bg-mana-core hover:bg-mana-glow disabled:opacity-40 text-dungeon-abyss border-2 border-parchment-white px-3.5 py-1.5 pixel-btn font-bold uppercase flex items-center gap-1.5 tracking-wider"
                title="Submit Answer for Quest Evaluation"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'VALIDATING...' : 'SUBMIT'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* COLUMN 3 (3.5 cols): RESULTS, BADGES & MINI DUNGEON VISUALIZER */}
        {/* ============================================================== */}
        <section className="lg:col-span-4 bg-dungeon-chamber border-2 border-dungeon-border flex flex-col shadow-pixel overflow-hidden">
          {/* Sub Header Tabs */}
          <div className="bg-dungeon-crypt border-b border-dungeon-border px-3 py-1.5 flex items-center justify-between text-xs font-display shrink-0">
            <div className="flex gap-2">
              <button
                onClick={() => setRightTab('output')}
                className={`py-1 px-2.5 border-b-2 font-bold uppercase transition-colors ${
                  rightTab === 'output'
                    ? 'border-mana-core text-mana-core bg-dungeon-chamber'
                    : 'border-transparent text-parchment-rune hover:text-parchment-white'
                }`}
              >
                Query Output
              </button>
              <button
                onClick={() => setRightTab('battle')}
                className={`py-1 px-2.5 border-b-2 font-bold uppercase transition-colors flex items-center gap-1 ${
                  rightTab === 'battle'
                    ? 'border-glyph-crimson text-glyph-crimson bg-dungeon-chamber'
                    : 'border-transparent text-parchment-rune hover:text-glyph-crimson'
                }`}
              >
                <span>Stage Battle</span>
              </button>
              <button
                onClick={() => setRightTab('schema')}
                className={`py-1 px-2.5 border-b-2 font-bold uppercase transition-colors flex items-center gap-1.5 ${
                  rightTab === 'schema'
                    ? 'border-quest-gold text-quest-gold bg-dungeon-chamber'
                    : 'border-transparent text-parchment-rune hover:text-quest-gold'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>DB Schema</span>
              </button>
            </div>

            <div className="text-[10px] text-glyph-emerald font-display flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 bg-glyph-emerald rounded-full" />
              <span>{lastResult ? `200 OK (${lastResult.executionTimeMs}ms)` : 'IDLE'}</span>
            </div>
          </div>

          <div className="p-2.5 flex-1 min-h-0 flex flex-col space-y-2 overflow-hidden">
            {/* VIEW 1: QUERY OUTPUT */}
            {rightTab === 'output' && (
              <>
                {/* 1. Success Card ONLY when user clicked SUBMIT and passed (Matches Image 2) */}
                {submissionStatus === 'passed' && (
                  <div className="bg-dungeon-abyss border-2 border-glyph-emerald p-2.5 shadow-pixel space-y-1.5 animate-fadeIn shrink-0">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-glyph-emerald animate-bounce" />
                      <span className="font-display font-bold text-xs text-glyph-emerald uppercase tracking-wider">
                        QUEST OBJECTIVE COMPLETE!
                      </span>
                    </div>

                    <p className="text-xs text-parchment-white font-code">
                      {passMessage || 'All objective criteria successfully validated!'}
                    </p>

                    <div className="flex justify-between items-center text-[10px] font-display pt-1.5 border-t border-dungeon-border">
                      <span className="text-quest-gold font-bold">+{currentLesson.xpReward} XP</span>
                      <span className="text-quest-gold font-bold">+{currentLesson.gemReward} GOLD</span>
                      <span className="text-mana-core font-bold">BADGE: 'QUERY ROOKIE'</span>
                    </div>
                  </div>
                )}

                {/* 2. Validation Failed Banner ONLY when user clicked SUBMIT and failed objective */}
                {submissionStatus === 'failed' && (
                  <div className="bg-glyph-crimson/10 border-l-4 border-glyph-crimson p-2 text-xs text-parchment-white font-code shrink-0 animate-fadeIn">
                    <div className="font-display font-bold text-glyph-crimson mb-0.5 flex items-center gap-1">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>VALIDATION CHECK FAILED</span>
                    </div>
                    <p>{passMessage || lastResult?.error}</p>
                  </div>
                )}

                {/* 3. SQL Syntax Error Banner when query had a syntax error during RUN QUERY (without submitting) */}
                {submissionStatus === 'none' && lastResult && !lastResult.success && lastResult.error && (
                  <div className="bg-glyph-crimson/10 border-l-4 border-glyph-crimson p-2 text-xs text-parchment-white font-code shrink-0 animate-fadeIn">
                    <div className="font-display font-bold text-glyph-crimson mb-0.5 flex items-center gap-1">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>SQL SYNTAX ERROR</span>
                    </div>
                    <p>{lastResult.error}</p>
                  </div>
                )}

                {/* 2 & 6. Result Set Table with constrained height and horizontal/vertical scrollbars */}
                <div className="bg-dungeon-abyss border border-dungeon-highlight flex-1 min-h-0 flex flex-col overflow-hidden">
                  <div className="bg-dungeon-crypt px-2 py-1 border-b border-dungeon-border flex items-center justify-between text-[10px] font-display text-parchment-rune shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-parchment-white">ResultSet:</span>
                      <span className="text-quest-gold font-bold">{lastResult ? lastResult.rowCount : 0} rows</span>
                      {lastResult && lastResult.rowCount > 100 && (
                        <span className="text-mana-core text-[9px] bg-dungeon-abyss px-1 border border-mana-core/40">
                          Scrollable (showing 100 of {lastResult.rowCount})
                        </span>
                      )}
                    </div>
                    <span className="text-mana-core text-[9px]">↔ Scrollable</span>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto scrollbar-thin">
                    {lastResult && lastResult.rowCount > 0 ? (
                      <table className="min-w-full text-left text-xs border-collapse font-code">
                        <thead className="sticky top-0 z-10 bg-dungeon-chamber shadow-sm">
                          <tr className="border-b border-dungeon-border text-[10px] font-display text-quest-gold uppercase">
                            {lastResult.columns.map(col => (
                              <th key={col} className="p-2 whitespace-nowrap bg-dungeon-chamber border-r border-dungeon-border/60 last:border-r-0">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-dungeon-border/40">
                          {lastResult.rows.slice(0, 100).map((row, idx) => (
                            <tr key={idx} className="hover:bg-dungeon-crypt/60 transition-colors">
                              {lastResult.columns.map(col => (
                                <td key={col} className="p-2 text-parchment-white whitespace-nowrap text-[11px] border-r border-dungeon-border/30 last:border-r-0">
                                  {col.toLowerCase().includes('name') ? (
                                    <span className="flex items-center gap-1.5">
                                      <span>{idx % 4 === 0 ? '👑' : idx % 4 === 1 ? '🛡️' : idx % 4 === 2 ? '🗡️' : '🏹'}</span>
                                      <span>{String(row[col])}</span>
                                    </span>
                                  ) : (
                                    String(row[col])
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-6 text-center text-xs text-parchment-rune">
                        <Terminal className="w-6 h-6 mx-auto mb-1 text-dungeon-highlight" />
                        <span>Run query to inspect returned PostgreSQL data table.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* MINI DUNGEON VISUALIZER (EXACT MATCH TO IMAGE 3!) */}
                <div className="bg-dungeon-abyss border-2 border-dungeon-highlight p-2 space-y-1.5 shrink-0">
                  <div className="flex items-center justify-between text-[10px] font-display text-parchment-rune">
                    <span className="text-parchment-white font-bold uppercase">MINI DUNGEON VISUALIZER</span>
                    <span className="text-quest-gold">Tavern Map #1</span>
                  </div>

                  {/* Pixel Arena Sprites Box */}
                  <div className="bg-dungeon-chamber/80 border border-dungeon-border p-2 grid grid-cols-4 gap-2 text-center items-end min-h-[75px]">
                    <div className="space-y-1">
                      <div className="text-xl animate-bob">🧙‍♂️</div>
                      <span className="bg-dungeon-abyss px-1 py-0.5 border border-quest-gold text-quest-gold font-display font-bold text-[9px] block">
                        240g
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xl animate-bob" style={{ animationDelay: '0.2s' }}>🛡️</div>
                      <span className="bg-dungeon-abyss px-1 py-0.5 border border-mana-core text-mana-core font-display font-bold text-[9px] block">
                        185g
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xl animate-bob" style={{ animationDelay: '0.4s' }}>🗡️</div>
                      <span className="bg-dungeon-abyss px-1 py-0.5 border border-dungeon-highlight text-parchment-white font-display font-bold text-[9px] block">
                        120g
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xl animate-bob" style={{ animationDelay: '0.6s' }}>🏹</div>
                      <span className="bg-dungeon-abyss px-1 py-0.5 border border-dungeon-highlight text-parchment-white font-display font-bold text-[9px] block">
                        90g
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-[9px] text-parchment-rune font-display">
                    4 entities filtered
                  </div>
                </div>
              </>
            )}

            {/* VIEW 2: STAGE BATTLE */}
            {rightTab === 'battle' && (
              <div className="bg-dungeon-abyss border border-dungeon-border p-3 space-y-3 flex-1 min-h-0 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex justify-between items-center text-xs font-display text-glyph-crimson font-bold">
                    <span>{chapter.boss.name}</span>
                    <span>LV. 04 BOSS</span>
                  </div>
                  <div className="h-32 bg-dungeon-crypt flex flex-col items-center justify-center my-3 border border-dungeon-border">
                    <div className="text-5xl animate-bob mb-1">
                      {chapter.boss.avatarType === 'slime' ? '🟢' : chapter.boss.avatarType === 'dragon' ? '🐲' : '🗿'}
                    </div>
                    <span className="text-[11px] font-display text-quest-gold">{chapter.boss.title}</span>
                  </div>
                  <div className="text-xs text-parchment-rune leading-relaxed">
                    Cast correct SQL to defeat the boss integrity and claim victory!
                  </div>
                </div>

                <div className="p-2 bg-dungeon-chamber border border-dungeon-border text-xs font-code text-mana-core">
                  Weakness: {chapter.boss.weaknessSql}
                </div>
              </div>
            )}

            {/* VIEW 3: DB SCHEMA EXPLORER (Sample Data Preview removed as requested) */}
            {rightTab === 'schema' && (
              <div className="flex-1 min-h-0 flex flex-col space-y-2 overflow-hidden font-code">
                {/* Table Selector Pills */}
                <div className="flex flex-wrap gap-1.5 pb-1 border-b border-dungeon-border/60 shrink-0">
                  {availableSchemas.map((sch) => {
                    const isSelected = sch.tableName === (activeSchema?.tableName || selectedSchemaTable);
                    return (
                      <button
                        key={sch.tableName}
                        onClick={() => setSelectedSchemaTable(sch.tableName)}
                        className={`px-2 py-1 text-[11px] font-display font-bold border transition-colors flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-quest-gold text-dungeon-abyss border-quest-gold shadow-pixel'
                            : 'bg-dungeon-abyss text-parchment-rune border-dungeon-highlight hover:text-quest-gold hover:border-quest-gold/60'
                        }`}
                      >
                        <span>{sch.tableName}</span>
                        <span className={`text-[9px] px-1 py-0.2 ${isSelected ? 'bg-dungeon-abyss/20 text-dungeon-abyss' : 'bg-dungeon-chamber text-parchment-rune'}`}>
                          {sch.rowCount}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {activeSchema && (
                  <div className="flex-1 min-h-0 flex flex-col space-y-2 overflow-hidden">
                    {/* Table Header & Quick Action Buttons */}
                    <div className="bg-dungeon-abyss border border-dungeon-highlight p-2 space-y-1.5 shrink-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5 text-quest-gold" />
                            <span className="font-display font-bold text-xs text-parchment-white uppercase">
                              {activeSchema.tableName}
                            </span>
                            <span className="text-[9px] font-display font-bold bg-dungeon-crypt border border-mana-core/40 text-mana-core px-1 py-0.2">
                              {activeSchema.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-parchment-rune mt-0.5 leading-snug">
                            {activeSchema.description}
                          </p>
                        </div>

                        <button
                          onClick={() => onChangeView('schema')}
                          className="text-[10px] font-display font-bold text-mana-core hover:text-mana-glow flex items-center gap-1 whitespace-nowrap bg-dungeon-crypt border border-dungeon-border px-2 py-1 hover:border-mana-core transition-colors"
                          title="Open Full Schema & ER Canvas"
                        >
                          <span>Full Codex</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Quick Insert SQL into Editor */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-dungeon-border/60">
                        <button
                          onClick={() => {
                            setEditorQuery(`SELECT * FROM ${activeSchema.tableName};`);
                          }}
                          className="text-[10px] font-display font-bold bg-dungeon-crypt hover:bg-mana-core hover:text-dungeon-abyss border border-mana-core text-mana-core px-2 py-0.5 transition-colors flex items-center gap-1"
                          title="Paste SELECT statement into editor"
                        >
                          <FileCode className="w-3 h-3" />
                          <span>SELECT * FROM {activeSchema.tableName}</span>
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(activeSchema.tableName);
                            setCopiedSchemaTable(true);
                            setTimeout(() => setCopiedSchemaTable(false), 2000);
                          }}
                          className="text-[10px] font-display text-parchment-rune hover:text-parchment-white border border-dungeon-highlight px-2 py-0.5 flex items-center gap-1"
                          title="Copy table name"
                        >
                          {copiedSchemaTable ? <Check className="w-3 h-3 text-glyph-emerald" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedSchemaTable ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* 1 & 7: Column Specifications (Sample Data Preview removed!) */}
                    <div className="bg-dungeon-abyss border border-dungeon-highlight flex-1 min-h-0 flex flex-col overflow-hidden">
                      <div className="bg-dungeon-crypt px-2.5 py-1.5 border-b border-dungeon-border flex items-center justify-between text-[10px] font-display shrink-0">
                        <span className="text-parchment-white font-bold uppercase">Columns & Types ({activeSchema.columns.length})</span>
                        <span className="text-quest-gold">PostgreSQL / SQLite</span>
                      </div>

                      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto scrollbar-thin">
                        <table className="min-w-full text-left text-[11px] border-collapse font-code">
                          <thead className="sticky top-0 z-10 bg-dungeon-chamber shadow-sm">
                            <tr className="border-b border-dungeon-border text-[9px] font-display text-quest-gold uppercase">
                              <th className="p-1.5 whitespace-nowrap bg-dungeon-chamber">Column</th>
                              <th className="p-1.5 whitespace-nowrap bg-dungeon-chamber">Type</th>
                              <th className="p-1.5 whitespace-nowrap bg-dungeon-chamber">Key</th>
                              <th className="p-1.5 whitespace-nowrap bg-dungeon-chamber">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-dungeon-border/40">
                            {activeSchema.columns.map((col) => (
                              <tr key={col.name} className="hover:bg-dungeon-crypt/40 transition-colors">
                                <td className="p-1.5 font-bold text-mana-core whitespace-nowrap">
                                  {col.name}
                                </td>
                                <td className="p-1.5 text-glyph-emerald whitespace-nowrap font-bold text-[10px]">
                                  {col.type}
                                </td>
                                <td className="p-1.5 whitespace-nowrap">
                                  {col.isPrimaryKey ? (
                                    <span className="bg-quest-gold text-dungeon-abyss text-[9px] font-display font-bold px-1 py-0.2 flex items-center gap-0.5 w-fit">
                                      <Key className="w-2.5 h-2.5" />
                                      <span>PK</span>
                                    </span>
                                  ) : col.isForeignKey ? (
                                    <span className="bg-mana-core/20 border border-mana-core text-mana-core text-[9px] font-display font-bold px-1 py-0.2">
                                      FK
                                    </span>
                                  ) : (
                                    <span className="text-parchment-rune text-[10px]">-</span>
                                  )}
                                </td>
                                <td className="p-1.5 text-parchment-rune text-[10px] leading-tight whitespace-nowrap">
                                  {col.description}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 4. BOTTOM FOOTER NAVIGATION BAR - EXACT MATCH TO IMAGE 3 */}
      <footer className="border-t-2 border-dungeon-border bg-dungeon-chamber px-4 py-2 flex items-center justify-between gap-3 text-xs font-display shadow-pixel shrink-0">
        {/* Left: Chapter Curriculum status */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-mana-core" />
          <span className="text-parchment-white font-bold">Chapter Curriculum</span>
          <span className="text-parchment-rune">
            Exercise {currentLesson.exerciseNumber} / {chapter.lessons.length}
          </span>
          {isCurrentLessonDone ? (
            <span className="bg-glyph-emerald/20 text-glyph-emerald border border-glyph-emerald px-1.5 py-0.2 text-[10px] font-bold">
              COMPLETED!
            </span>
          ) : (
            <span className="bg-dungeon-crypt text-quest-gold border border-quest-gold px-1.5 py-0.2 text-[10px] font-bold">
              IN PROGRESS
            </span>
          )}
        </div>

        {/* Right: Prev & Next Quest Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevQuest}
            disabled={isFirstLesson}
            className="bg-dungeon-crypt hover:bg-dungeon-highlight disabled:opacity-40 text-parchment-white px-3 py-1.5 border border-dungeon-highlight pixel-btn font-bold flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>PREV</span>
          </button>

          <button
            onClick={handleNextQuest}
            disabled={!isCurrentLessonDone}
            className={`px-4 py-1.5 pixel-btn font-bold flex items-center gap-1 tracking-wider uppercase ${
              isCurrentLessonDone
                ? 'bg-quest-gold hover:bg-quest-amber text-dungeon-abyss'
                : 'bg-dungeon-abyss text-slate-500 border border-dungeon-border cursor-not-allowed opacity-50'
            }`}
          >
            <span>NEXT QUEST</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
