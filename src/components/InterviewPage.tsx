import React, { useState } from 'react';
import { PlayerProfile, AppView, CareerRole } from '../types/game';
import {
  Briefcase, ArrowLeft, Lock, CheckCircle2, AlertTriangle, BookOpen,
  Terminal, Play, Shield, Target, FileText, HelpCircle, Code2, Sparkles,
  ChevronRight, Award, Zap, Compass, Check
} from 'lucide-react';

interface CaseStudy {
  id: string;
  level: 'Beginner' | 'Intermediate' | 'Hard';
  company: string;
  title: string;
  scenario: string;
  requirements: string[];
  tablesUsed: string[];
  interviewGotcha: string;
  expectedOutputColumns: string[];
  chapterId: number;
  lessonId: string;
}

interface PreparationTopic {
  title: string;
  concept: string;
  sqlSnippet: string;
  trap: string;
  interviewTip: string;
}

interface InterviewQa {
  question: string;
  answer: string;
  code?: string;
  tag: string;
}

interface InterviewPageProps {
  profile: PlayerProfile;
  onChangeView: (view: AppView) => void;
  onStartQuest: (chapterId: number, exerciseId?: string) => void;
  onOpenProfile: () => void;
}

export const InterviewPage: React.FC<InterviewPageProps> = ({
  profile,
  onChangeView,
  onStartQuest,
  onOpenProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'case-studies' | 'prep-materials' | 'whiteboard-qa'>('case-studies');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<string>('cs-1');

  const userRole: CareerRole = profile.role || 'Data Analyst';

  // Check if all phases / bosses are completed to unlock the live exam
  const completedPhasesCount = (profile.completedCaseStudies || []).length;
  const totalRequiredPhases = 4;
  const isGauntletUnlocked = completedPhasesCount >= totalRequiredPhases;

  // Real-life practical case studies
  const caseStudies: CaseStudy[] = [
    {
      id: 'cs-1',
      level: 'Beginner',
      company: 'Amazon / Uber Screening Round',
      title: 'Customer Churn & Inactivity Slicing',
      scenario: 'The growth marketing team is preparing a high-priority win-back campaign. They need a verified list of customers who have historically spent more than $100 across all their orders, but have placed ZERO orders in the last 45 days.',
      requirements: [
        'Calculate total lifetime spend per customer',
        'Identify each customer\'s most recent order timestamp',
        'Filter for customers with spend > $100 whose last order was > 45 days ago',
        'Order results by total historical spend descending'
      ],
      tablesUsed: ['tavern_orders', 'heroes'],
      interviewGotcha: 'Do not filter individual orders where gold_spent > 100! You must calculate SUM(gold_spent) per user in HAVING, and use MAX(order_date) for the dormancy check.',
      expectedOutputColumns: ['hero_name', 'total_gold_spent', 'last_order_date'],
      chapterId: 2,
      lessonId: 'ch2-ex2'
    },
    {
      id: 'cs-2',
      level: 'Intermediate',
      company: 'Stripe / Shopify Product Analytics Round',
      title: 'Month-over-Month Revenue Growth & Moving Averages',
      scenario: 'Finance needs an automated monthly revenue ledger for executive review: Output calendar month (YYYY-MM), total monthly gross volume, previous month gross volume, MoM percentage revenue growth (handle zero-division safely), and the trailing 3-month moving average revenue.',
      requirements: [
        'Aggregate orders into calendar months using DATE_TRUNC',
        'Calculate previous month revenue using LAG() OVER ()',
        'Calculate MoM percentage growth using NULLIF(prev_revenue, 0) to avoid division by zero crashes',
        'Compute 3-month trailing moving average using ROWS BETWEEN 2 PRECEDING AND CURRENT ROW'
      ],
      tablesUsed: ['tavern_orders'],
      interviewGotcha: 'Do not attempt to compute LAG() directly on raw unaggregated transactional rows. You must structure a CTE that groups by month first, then apply window functions on the grouped monthly records.',
      expectedOutputColumns: ['order_month', 'monthly_revenue', 'prev_month_revenue', 'mom_growth_pct', 'trailing_3mo_avg'],
      chapterId: 4,
      lessonId: 'ch4-ex1'
    },
    {
      id: 'cs-3',
      level: 'Hard',
      company: 'Meta / Netflix Senior Product Analyst Round',
      title: 'Multi-Month User Retention Cohort Matrix',
      scenario: 'Product leadership requires a full cohort retention matrix to measure long-term user stickiness. Group users into cohorts based on their initial signup/first order month. Then calculate the retention rate (percentage of the original cohort active) for Month 0 (100%), Month 1, Month 2, and Month 3.',
      requirements: [
        'Determine each user\'s cohort inception month (MIN order timestamp)',
        'Join subsequent user orders to compute month offset differences',
        'Count distinct active users in each subsequent month offset',
        'Pivot month retention percentages using conditional aggregation (CASE WHEN) divided by the initial cohort size'
      ],
      tablesUsed: ['heroes', 'tavern_orders', 'dungeon_raids'],
      interviewGotcha: 'Remember that retention must be computed as a percentage of that specific cohort\'s initial Month 0 user count, not the total overall user base.',
      expectedOutputColumns: ['cohort_month', 'cohort_users', 'm0_pct', 'm1_pct', 'm2_pct', 'm3_pct'],
      chapterId: 4,
      lessonId: 'ch4-boss'
    }
  ];

  // Role-specific Interview Preparation Materials
  const prepMaterials: PreparationTopic[] = [
    {
      title: '1. SARGable Queries & Boolean Precedence',
      concept: 'SARGable (Search Argument Able) queries allow the database engine to use index seeks instead of scanning millions of rows. Wrapping columns in functions (e.g. WHERE YEAR(created_at) = 2024) destroys index seekability. Also, SQL evaluates AND before OR.',
      sqlSnippet: `-- BAD (Non-SARGable full table scan):\nWHERE EXTRACT(YEAR FROM order_date) = 2024;\n\n-- GOOD (SARGable range seek):\nWHERE order_date >= '2024-01-01' AND order_date < '2025-01-01';`,
      trap: 'WHERE status != \'active\' silently drops rows where status IS NULL! Always write "WHERE status != \'active\' OR status IS NULL" if missing records must be preserved.',
      interviewTip: 'When asked how to optimize a slow WHERE clause, immediately explain index seekability and range-based date boundaries.'
    },
    {
      title: '2. Aggregation Gotchas: COUNT(*) vs COUNT(column)',
      concept: 'COUNT(*) counts every row returned, including rows containing NULLs. COUNT(column_name) counts only rows where that specific column is NOT NULL. COUNT(DISTINCT col) counts unique non-null values.',
      sqlSnippet: `SELECT \n  COUNT(*) AS total_rows,\n  COUNT(referral_code) AS rows_with_referral,\n  COUNT(DISTINCT hero_id) AS unique_heroes\nFROM tavern_orders;`,
      trap: 'Forgetting that AVG(score) ignores NULLs in the denominator! If NULL should count as 0, you must write AVG(COALESCE(score, 0)).',
      interviewTip: 'Interviewers love asking this as an opening warm-up question. Clearly state that COUNT(*) reads the table metadata/index while COUNT(col) evaluates nullability.'
    },
    {
      title: '3. Anti-Joins: Finding Missing / Churned Entities',
      concept: 'To find records in Table A that have no matching records in Table B (e.g., users who never ordered, or products never purchased), use an Anti-Join pattern with LEFT JOIN ... WHERE right.id IS NULL or NOT EXISTS.',
      sqlSnippet: `-- High-Performance Anti-Join:\nSELECT h.id, h.hero_name\nFROM heroes AS h\nLEFT JOIN tavern_orders AS o ON h.id = o.hero_id\nWHERE o.id IS NULL;`,
      trap: 'Using "WHERE id NOT IN (SELECT hero_id FROM tavern_orders)" will return ZERO rows if tavern_orders contains even a single NULL hero_id! Use NOT EXISTS or LEFT JOIN ... IS NULL instead.',
      interviewTip: 'Highlight why "LEFT JOIN ... WHERE right.id IS NULL" is immune to the notorious NULL trap that breaks NOT IN.'
    },
    {
      title: '4. Zero-Division Defense with NULLIF',
      concept: 'When computing growth rates, conversion percentages, or averages, division by zero will immediately crash the entire query with a fatal error. Wrapping the denominator with NULLIF(val, 0) converts 0 into NULL, which cleanly yields NULL instead of crashing.',
      sqlSnippet: `SELECT \n  month,\n  revenue,\n  prev_revenue,\n  -- Safe percentage growth:\n  ROUND(((revenue - prev_revenue) / NULLIF(prev_revenue, 0)) * 100, 2) AS mom_growth_pct\nFROM monthly_metrics;`,
      trap: 'Assuming an IF or CASE statement is needed: NULLIF(denominator, 0) is the industry standard idiom.',
      interviewTip: 'Demonstrates defensive production-grade SQL writing during coding screens.'
    },
    {
      title: '5. Ranking Functions: ROW_NUMBER vs RANK vs DENSE_RANK',
      concept: 'All three rank ordered rows over an optional partition, but handle ties differently. Given scores 100, 90, 90, 80: ROW_NUMBER yields 1, 2, 3, 4; RANK yields 1, 2, 2, 4 (leaves gaps); DENSE_RANK yields 1, 2, 2, 3 (no gaps).',
      sqlSnippet: `SELECT \n  hero_name,\n  gold_spent,\n  ROW_NUMBER() OVER (ORDER BY gold_spent DESC) AS row_num,\n  RANK() OVER (ORDER BY gold_spent DESC) AS rnk,\n  DENSE_RANK() OVER (ORDER BY gold_spent DESC) AS dense_rnk\nFROM tavern_orders;`,
      trap: 'To find the "2nd highest salary", always use DENSE_RANK = 2 so ties at rank 1 do not push the second highest value into rank 3 or 4.',
      interviewTip: 'Recruiters ask this in over 60% of SQL technical screens. Be ready to explain the tie behavior.'
    },
    {
      title: '6. Production Deduplication via Window Partitioning',
      concept: 'Real-world data lakes and webhooks frequently generate duplicate event logs. The gold standard deduplication pattern partitions by unique entity ID, orders by timestamp descending, and extracts row_number = 1 inside a CTE.',
      sqlSnippet: `WITH ranked_events AS (\n  SELECT *,\n    ROW_NUMBER() OVER (\n      PARTITION BY user_id, event_type \n      ORDER BY event_timestamp DESC\n    ) AS rn\n  FROM raw_telemetry_events\n)\nSELECT * \nFROM ranked_events \nWHERE rn = 1;`,
      trap: 'Using SELECT DISTINCT on the whole row fails if timestamps differ by milliseconds. Window deduplication provides precise control over which duplicate record to preserve.',
      interviewTip: 'Standard design pattern in both data pipelines and technical whiteboard rounds.'
    }
  ];

  // Frequently Asked Interview Q&A
  const whiteboardQas: InterviewQa[] = [
    {
      question: 'What happens when you use NOT IN with a subquery containing NULL values?',
      answer: 'If the subquery returns even a single NULL, the entire NOT IN condition evaluates to UNKNOWN for every single row. Because SQL requires a boolean TRUE to include rows, the query will return 0 rows. Always use NOT EXISTS or a LEFT JOIN with IS NULL instead.',
      tag: 'SQL Pitfalls'
    },
    {
      question: 'How does GROUP BY handle NULL values?',
      answer: 'GROUP BY treats all NULL values as equal and collapses them into a single grouping row. Unlike equality comparisons (NULL = NULL evaluates to UNKNOWN), GROUP BY treats them as the same grouping bucket.',
      tag: 'Aggregations'
    },
    {
      question: 'What is the performance difference between UNION and UNION ALL?',
      answer: 'UNION performs a distinct sorting and deduplication step across both datasets to eliminate duplicates, which is computationally expensive on large tables. UNION ALL simply concatenates the record sets without deduplication and is significantly faster. Use UNION ALL unless distinct records are strictly required.',
      tag: 'Performance'
    },
    {
      question: 'How do you find the 2nd highest salary without using LIMIT and OFFSET?',
      answer: 'Use DENSE_RANK() inside a CTE or subquery: "WITH ranked AS (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk FROM employees) SELECT MAX(salary) FROM ranked WHERE rnk = 2;". Alternatively, use "SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);".',
      code: `WITH ranked AS (\n  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk \n  FROM employees\n)\nSELECT salary FROM ranked WHERE rnk = 2;`,
      tag: 'Classic FAANG'
    },
    {
      question: 'What is a Cartesian Product (Cross Join) and how can it cause silent bugs?',
      answer: 'A Cartesian Product occurs when two tables are joined without an ON condition (or on non-unique keys), pairing every row in Table A with every row in Table B. If Table A has 1,000 rows and Table B has 1,000 rows, it generates 1,000,000 rows. In aggregate queries, this silently duplicates rows and artificially inflates SUM() and COUNT() numbers without throwing an error.',
      tag: 'Joins'
    },
    {
      question: 'Explain the difference between WHERE and HAVING.',
      answer: 'WHERE filters rows before any grouping or aggregation takes place. HAVING filters aggregated group metrics after the GROUP BY clause has executed. You cannot use aggregate functions like SUM() in a WHERE clause.',
      tag: 'Fundamentals'
    }
  ];

  const currentCaseStudy = caseStudies.find(cs => cs.id === selectedCaseStudy) || caseStudies[0];

  return (
    <div className="min-h-screen bg-dungeon-abyss text-parchment-white flex flex-col font-code">
      {/* 1. TOP HEADER NAVIGATION */}
      <header className="border-b-2 border-dungeon-border bg-dungeon-chamber px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-pixel sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onChangeView('home')}
            className="bg-dungeon-crypt hover:bg-dungeon-highlight border border-dungeon-highlight hover:border-mana-core px-3 py-1.5 pixel-btn text-xs font-display flex items-center gap-1.5 text-parchment-rune hover:text-parchment-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-mana-core" />
            <span>BACK TO HOME</span>
          </button>
          
          <div className="h-5 w-[1px] bg-dungeon-highlight hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-dungeon-abyss border border-glyph-crimson flex items-center justify-center text-glyph-crimson">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm tracking-wider text-parchment-white uppercase">
                  TECHNICAL INTERVIEW & CASE STUDIES
                </span>
                <span className="bg-glyph-crimson text-parchment-white text-[9px] font-display font-bold px-1.5 py-0.5 shadow-pixel-sm uppercase">
                  CAREER PREP
                </span>
              </div>
              <p className="text-[10px] text-parchment-rune hidden md:block">
                Interview Screening Questions & Case Study Preparation for <span className="text-quest-gold font-bold">{profile.gamerTag}</span> // Role: <span className="text-mana-glow font-bold">{userRole}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onChangeView('roadmap')}
            className="bg-dungeon-crypt hover:bg-dungeon-highlight border border-dungeon-highlight px-3 py-1.5 pixel-btn text-xs font-display flex items-center gap-1.5 text-parchment-rune hover:text-parchment-white"
          >
            <Compass className="w-3.5 h-3.5 text-quest-gold" />
            <span>ROADMAP</span>
          </button>

          <button
            onClick={() => onChangeView('schema')}
            className="bg-dungeon-crypt hover:bg-dungeon-highlight border border-dungeon-highlight px-3 py-1.5 pixel-btn text-xs font-display flex items-center gap-1.5 text-parchment-rune hover:text-parchment-white"
          >
            <BookOpen className="w-3.5 h-3.5 text-mana-core" />
            <span>DB SCHEMA</span>
          </button>

          <button
            onClick={onOpenProfile}
            className="bg-dungeon-crypt border border-quest-gold px-2.5 py-1 pixel-btn flex items-center gap-2 cursor-pointer hover:bg-dungeon-highlight"
          >
            <div className="w-5 h-5 bg-dungeon-abyss border border-quest-gold text-quest-gold flex items-center justify-center text-[10px] font-bold">
              {profile.gamerTag.charAt(0).toUpperCase()}
            </div>
            <div className="text-left text-[11px] font-display">
              <span className="text-quest-gold font-bold">{profile.gamerTag}</span>
              <span className="text-[9px] text-parchment-rune ml-1.5">LVL {profile.level}</span>
            </div>
          </button>
        </div>
      </header>

      {/* 2. GATING / STATUS BANNER */}
      <section className="bg-dungeon-chamber/90 border-b-2 border-dungeon-border p-4 md:p-5">
        <div className="max-w-6xl mx-auto">
          {!isGauntletUnlocked ? (
            <div className="bg-dungeon-abyss border-2 border-neutral-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-pixel">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-neutral-900 border border-neutral-700 text-neutral-500 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-neutral-500" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xs sm:text-sm text-parchment-white uppercase">
                      LIVE INTERVIEW EXAM GAUNTLET: LOCKED
                    </span>
                    <span className="bg-neutral-800 border border-neutral-700 text-neutral-400 text-[9px] font-display font-bold px-1.5 py-0.2">
                      PREREQUISITE REQUIRED
                    </span>
                  </div>
                  <p className="text-xs text-parchment-rune leading-relaxed">
                    Complete all 4 Dungeon Boss Chapters in the Codex to unlock the live timed examination. In the meantime, you have full access to study the <span className="text-quest-gold font-bold">Preparation Materials</span>, <span className="text-mana-core font-bold">Whiteboard Q&A</span>, and <span className="text-glyph-emerald font-bold">Practice Case Studies</span> below!
                  </p>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="bg-dungeon-chamber border border-neutral-800 p-3 min-w-[220px] space-y-1.5 shrink-0">
                <div className="flex justify-between items-center text-xs font-display">
                  <span className="text-neutral-400">BOSS TRIALS CLEARED</span>
                  <span className="text-quest-gold font-bold">{completedPhasesCount} / {totalRequiredPhases}</span>
                </div>
                <div className="h-2 bg-neutral-900 border border-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-quest-gold transition-all duration-500"
                    style={{ width: `${Math.max(5, (completedPhasesCount / totalRequiredPhases) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-500 block text-right font-display">
                  {completedPhasesCount >= totalRequiredPhases ? 'UNLOCKED' : `${totalRequiredPhases - completedPhasesCount} MORE BOSSES NEEDED`}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-dungeon-abyss border-2 border-glyph-crimson p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-pixel shadow-glyph-crimson/20">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-glyph-crimson/20 border border-glyph-crimson text-glyph-crimson flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5 text-glyph-crimson" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xs sm:text-sm text-parchment-white uppercase">
                      ⚔️ LIVE INTERVIEW GAUNTLET: UNLOCKED & READY
                    </span>
                    <span className="bg-glyph-crimson text-parchment-white text-[9px] font-display font-bold px-1.5 py-0.2 animate-pulse">
                      READY TO TEST
                    </span>
                  </div>
                  <p className="text-xs text-parchment-rune">
                    All prerequisite dungeon bosses cleared! You have proved your foundational SQL mastery. Launch into live whiteboard case studies with zero hints below.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onStartQuest(4, 'ch4-boss')}
                className="bg-glyph-crimson hover:bg-red-500 text-parchment-white font-display font-bold text-xs uppercase px-5 py-2.5 pixel-btn flex items-center gap-2 shadow-pixel shrink-0 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>START LIVE EXAM NOW</span>
              </button>
            </div>
          )}

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 pt-4 border-t border-dungeon-border mt-4 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('case-studies')}
              className={`px-4 py-2 text-xs font-display pixel-btn border flex items-center gap-2 cursor-pointer transition-all ${
                activeTab === 'case-studies'
                  ? 'bg-mana-core text-dungeon-abyss border-mana-glow font-bold shadow-pixel-sm'
                  : 'bg-dungeon-crypt text-parchment-rune border-dungeon-highlight hover:text-parchment-white hover:border-mana-core/60'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>PRACTICAL CASE STUDIES (3 TIERS)</span>
            </button>

            <button
              onClick={() => setActiveTab('prep-materials')}
              className={`px-4 py-2 text-xs font-display pixel-btn border flex items-center gap-2 cursor-pointer transition-all ${
                activeTab === 'prep-materials'
                  ? 'bg-mana-core text-dungeon-abyss border-mana-glow font-bold shadow-pixel-sm'
                  : 'bg-dungeon-crypt text-parchment-rune border-dungeon-highlight hover:text-parchment-white hover:border-mana-core/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>PREPARATION MATERIALS & CHEAT SHEETS</span>
            </button>

            <button
              onClick={() => setActiveTab('whiteboard-qa')}
              className={`px-4 py-2 text-xs font-display pixel-btn border flex items-center gap-2 cursor-pointer transition-all ${
                activeTab === 'whiteboard-qa'
                  ? 'bg-mana-core text-dungeon-abyss border-mana-glow font-bold shadow-pixel-sm'
                  : 'bg-dungeon-crypt text-parchment-rune border-dungeon-highlight hover:text-parchment-white hover:border-mana-core/60'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>WHITEBOARD QUESTIONS & ANSWERS</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. MAIN TAB CONTENT */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6 space-y-6">
        {/* TAB 1: REAL-LIFE CASE STUDIES */}
        {activeTab === 'case-studies' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 4 Cols: Case Study Selectors */}
            <div className="lg:col-span-4 space-y-3">
              <span className="text-xs font-display text-quest-gold uppercase block">
                SELECT INTERVIEW CASE STUDY:
              </span>
              {caseStudies.map((cs) => {
                const isSelected = selectedCaseStudy === cs.id;

                return (
                  <button
                    key={cs.id}
                    onClick={() => setSelectedCaseStudy(cs.id)}
                    className={`w-full text-left p-3.5 border-2 transition-all pixel-btn cursor-pointer ${
                      isSelected
                        ? 'bg-dungeon-abyss border-mana-core shadow-pixel ring-1 ring-mana-core'
                        : 'bg-dungeon-chamber border-dungeon-border hover:border-dungeon-highlight'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-display font-bold px-1.5 py-0.2 uppercase ${
                        cs.level === 'Beginner'
                          ? 'bg-glyph-emerald/20 text-glyph-emerald border border-glyph-emerald/40'
                          : cs.level === 'Intermediate'
                          ? 'bg-quest-gold/20 text-quest-gold border border-quest-gold/40'
                          : 'bg-glyph-crimson/20 text-glyph-crimson border border-glyph-crimson/40'
                      }`}>
                        {cs.level}
                      </span>
                      <span className="text-[10px] text-parchment-rune font-code">
                        {cs.company.split('/')[0]}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-xs text-parchment-white mb-1">
                      {cs.title}
                    </h3>
                    <p className="text-[11px] text-parchment-rune line-clamp-2">
                      {cs.scenario}
                    </p>
                  </button>
                );
              })}

              <div className="bg-dungeon-chamber p-3 border border-dungeon-border text-[11px] text-parchment-rune space-y-1">
                <span className="text-quest-gold font-bold block uppercase text-[10px]">
                  💡 INTERVIEW PROTOCOL:
                </span>
                <p>
                  In live technical interviews, communicate your approach before typing: declare your grain, explain CTE staging, and verify edge cases. Zero hints are permitted in real screenings.
                </p>
              </div>
            </div>

            {/* Right 8 Cols: Case Study Detail Dossier */}
            <div className="lg:col-span-8 bg-dungeon-abyss border-2 border-dungeon-highlight p-5 space-y-4 shadow-pixel">
              {/* Header */}
              <div className="border-b border-dungeon-border pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-display font-bold px-2 py-0.5 uppercase ${
                      currentCaseStudy.level === 'Beginner'
                        ? 'bg-glyph-emerald/20 text-glyph-emerald border border-glyph-emerald/40'
                        : currentCaseStudy.level === 'Intermediate'
                        ? 'bg-quest-gold/20 text-quest-gold border border-quest-gold/40'
                        : 'bg-glyph-crimson/20 text-glyph-crimson border border-glyph-crimson/40'
                    }`}>
                      {currentCaseStudy.level} CASE STUDY
                    </span>
                    <span className="text-xs text-parchment-rune font-code">
                      • {currentCaseStudy.company}
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-base md:text-lg text-mana-core">
                    {currentCaseStudy.title}
                  </h2>
                </div>

                <div className="bg-glyph-crimson/20 border border-glyph-crimson text-glyph-crimson text-[10px] font-display font-bold px-2 py-1">
                  NO HINT RUNE PERMITTED
                </div>
              </div>

              {/* Business Scenario */}
              <div className="space-y-1.5">
                <span className="text-xs font-display text-quest-gold uppercase font-bold block">
                  BUSINESS SCENARIO:
                </span>
                <p className="text-xs text-parchment-white leading-relaxed bg-dungeon-chamber p-3 border border-dungeon-border">
                  {currentCaseStudy.scenario}
                </p>
              </div>

              {/* Requirements Checklist */}
              <div className="space-y-1.5">
                <span className="text-xs font-display text-parchment-white uppercase font-bold block">
                  TECHNICAL DELIVERABLES:
                </span>
                <div className="space-y-1">
                  {currentCaseStudy.requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-parchment-rune">
                      <span className="text-mana-core font-bold font-display">■</span>
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tables & Schema Context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-dungeon-chamber p-2.5 border border-dungeon-border space-y-1">
                  <span className="text-[10px] font-display text-parchment-rune block uppercase font-bold">
                    PRIMARY DATABASE TABLES:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCaseStudy.tablesUsed.map((tbl, i) => (
                      <code key={i} className="bg-dungeon-abyss text-mana-core border border-mana-core/40 px-2 py-0.5 text-xs font-bold">
                        {tbl}
                      </code>
                    ))}
                  </div>
                </div>

                <div className="bg-dungeon-chamber p-2.5 border border-dungeon-border space-y-1">
                  <span className="text-[10px] font-display text-parchment-rune block uppercase font-bold">
                    EXPECTED OUTPUT SCHEMA:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {currentCaseStudy.expectedOutputColumns.map((col, i) => (
                      <span key={i} className="bg-dungeon-abyss text-parchment-white border border-dungeon-highlight px-1.5 py-0.2 text-[10px]">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interview Gotcha / Critical Warning */}
              <div className="bg-dungeon-crypt border border-glyph-crimson/50 p-3 flex items-start gap-2.5 text-xs">
                <AlertTriangle className="w-4 h-4 text-glyph-crimson shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-glyph-crimson font-bold uppercase text-[10px] block">
                    INTERVIEW GOTCHA & CRITICAL TRAP:
                  </span>
                  <p className="text-parchment-rune text-[11px] leading-relaxed">
                    {currentCaseStudy.interviewGotcha}
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-dungeon-border flex items-center justify-between flex-wrap gap-3">
                <div className="text-xs text-parchment-rune">
                  Ready to test your query against real PostgreSQL tables?
                </div>

                <button
                  onClick={() => onStartQuest(currentCaseStudy.chapterId, currentCaseStudy.lessonId)}
                  className="bg-mana-core hover:bg-mana-glow text-dungeon-abyss font-display font-bold text-xs uppercase px-5 py-2.5 pixel-btn flex items-center gap-2 shadow-pixel cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>PRACTICE IN SQL PLAYGROUND</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PREPARATION MATERIALS & CHEAT SHEETS */}
        {activeTab === 'prep-materials' && (
          <div className="space-y-4">
            <div className="bg-dungeon-chamber p-4 border border-dungeon-highlight flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="font-display font-bold text-sm text-mana-core uppercase">
                  CAREER TECHNICAL SCREENING CHEAT SHEET ({userRole.toUpperCase()})
                </h2>
                <p className="text-xs text-parchment-rune">
                  Core patterns, index seek optimizations, and defensive SQL idioms tested by technical hiring managers.
                </p>
              </div>
              <span className="bg-quest-gold text-dungeon-abyss text-[10px] font-display font-bold px-2 py-0.5 uppercase">
                {prepMaterials.length} HIGH-IMPACT PATTERNS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prepMaterials.map((topic, i) => (
                <div key={i} className="bg-dungeon-abyss border-2 border-dungeon-border p-4 space-y-3 shadow-pixel">
                  <div className="flex items-center justify-between border-b border-dungeon-border pb-2">
                    <h3 className="font-display font-bold text-xs text-parchment-white">
                      {topic.title}
                    </h3>
                    <span className="text-[10px] font-display text-quest-gold">MUST KNOW</span>
                  </div>

                  <p className="text-xs text-parchment-rune leading-relaxed">
                    {topic.concept}
                  </p>

                  {/* Code Snippet */}
                  <div className="bg-dungeon-chamber p-2.5 border border-dungeon-border text-[11px] font-code text-mana-core">
                    <pre className="whitespace-pre-wrap font-code">{topic.sqlSnippet}</pre>
                  </div>

                  {/* Trap Warning */}
                  <div className="p-2 bg-neutral-900/60 border border-neutral-800 text-[10px] flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-glyph-crimson shrink-0 mt-0.5" />
                    <span className="text-neutral-400">
                      <strong className="text-glyph-crimson">Trap:</strong> {topic.trap}
                    </span>
                  </div>

                  {/* Interview Pro Tip */}
                  <div className="p-2 bg-dungeon-crypt border border-dungeon-highlight text-[10px] flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-quest-gold shrink-0 mt-0.5" />
                    <span className="text-parchment-rune">
                      <strong className="text-quest-gold">Interviewer Look-For:</strong> {topic.interviewTip}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: WHITEBOARD QUESTIONS & ANSWERS */}
        {activeTab === 'whiteboard-qa' && (
          <div className="space-y-4">
            <div className="bg-dungeon-chamber p-4 border border-dungeon-highlight flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="font-display font-bold text-sm text-quest-gold uppercase">
                  FREQUENTLY ASKED WHITEBOARD SCREENING QUESTIONS
                </h2>
                <p className="text-xs text-parchment-rune">
                  Standard conceptual SQL questions asked during phone screens and onsite technical interviews.
                </p>
              </div>
              <span className="bg-mana-core text-dungeon-abyss text-[10px] font-display font-bold px-2 py-0.5 uppercase">
                {whiteboardQas.length} QUESTIONS
              </span>
            </div>

            <div className="space-y-3">
              {whiteboardQas.map((qa, i) => (
                <div key={i} className="bg-dungeon-abyss border-2 border-dungeon-border p-4 space-y-2 shadow-pixel">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-display font-bold text-mana-core flex items-center gap-1.5">
                      <span>Q{i + 1}:</span>
                      <span>{qa.question}</span>
                    </span>
                    <span className="bg-dungeon-chamber text-parchment-rune text-[9px] font-display px-2 py-0.5 border border-dungeon-highlight shrink-0">
                      {qa.tag}
                    </span>
                  </div>

                  <p className="text-xs text-parchment-rune leading-relaxed bg-dungeon-chamber/60 p-3 border border-dungeon-border">
                    {qa.answer}
                  </p>

                  {qa.code && (
                    <div className="bg-dungeon-chamber p-2 border border-dungeon-border text-[11px] font-code text-mana-glow">
                      <pre className="whitespace-pre-wrap">{qa.code}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
