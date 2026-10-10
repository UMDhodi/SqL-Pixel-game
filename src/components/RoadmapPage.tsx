import React, { useState } from 'react';
import { PlayerProfile, AppView, CareerRole } from '../types/game';
import {
  Compass, ArrowLeft, CheckCircle2, Lock, Sparkles, Terminal,
  BookOpen, Shield, Flame, Play, ChevronRight, BarChart3,
  Database, Cpu, Globe, Layers, ArrowUpRight, Award, Zap
} from 'lucide-react';
import { Toast } from './Toast';

export interface RoadmapTopic {
  id: string;
  stepNumber: string;
  chapterId: number;
  lessonId: string;
  title: string;
  sqlFocus: string[];
  description: string;
  careerRelevance: string;
  interviewTip: string;
  interviewTrap?: string;
  estimatedTime: string;
  xpReward: number;
  skills: string[];
}

interface RoleCurriculum {
  role: CareerRole;
  title: string;
  tagline: string;
  icon: React.ReactNode;
  summary: string;
  topics: RoadmapTopic[];
}

const ROADMAP_DATA: Record<CareerRole, RoleCurriculum> = {
  'Data Analyst': {
    role: 'Data Analyst',
    title: 'Data Analyst SQL Journey',
    tagline: 'Transform raw database tables into executive metrics, cohort analytics, and ace technical screening rounds',
    icon: <BarChart3 className="w-5 h-5 text-mana-core" />,
    summary: 'A complete end-to-end curriculum designed for aspiring & practicing Data Analysts. Covers high-efficiency filtering, business group rollups, multi-table joins, conditional logic, window functions, deduplication, and query optimization.',
    topics: [
      {
        id: 'da-01',
        stepNumber: '01',
        chapterId: 1,
        lessonId: 'ch1-ex1',
        title: 'Core Projection, SARGable Filtering & Slicing',
        sqlFocus: ['SELECT', 'FROM', 'WHERE', 'AND / OR', 'IN / NOT IN', 'BETWEEN', 'ORDER BY', 'LIMIT'],
        description: 'Master fast row retrieval, compound boolean predicates, column aliasing, and sorting without causing sequential table scans.',
        careerRelevance: 'Extracting clean sliced subsets from transaction databases for daily stakeholder ad-hoc monitoring.',
        interviewTip: 'Interviewers frequently test boolean precedence (AND takes priority over OR) and SARGability (never wrap indexed columns in functions like WHERE YEAR(order_date) = 2024).',
        interviewTrap: 'Using "WHERE status != \'active\'" will silently drop NULL rows! Always include "OR status IS NULL" if missing records matter.',
        estimatedTime: '20 Mins',
        xpReward: 250,
        skills: ['Column Slicing', 'SARGable Filtering', 'Boolean Precedence', 'NULL Comparisons']
      },
      {
        id: 'da-02',
        stepNumber: '02',
        chapterId: 2,
        lessonId: 'ch2-ex1',
        title: 'Business Aggregations & Metric Rollups',
        sqlFocus: ['GROUP BY', 'HAVING', 'COUNT(*)', 'COUNT(col)', 'SUM()', 'AVG()', 'ROUND()'],
        description: 'Aggregate millions of records into business summary metrics across product lines, customer tiers, and time periods.',
        careerRelevance: 'Computing Gross Merchandise Value (GMV), Average Order Value (AOV), and daily active user tallies for BI reports.',
        interviewTip: 'Classic screening question: What is the exact difference between COUNT(*), COUNT(1), and COUNT(column_name)? (COUNT(col) ignores NULL values).',
        interviewTrap: 'Putting filter conditions in HAVING instead of WHERE. WHERE filters rows before grouping; HAVING filters aggregated groups.',
        estimatedTime: '30 Mins',
        xpReward: 350,
        skills: ['Aggregate Functions', 'Dimension Grouping', 'HAVING vs WHERE', 'Cardinality Management']
      },
      {
        id: 'da-03',
        stepNumber: '03',
        chapterId: 3,
        lessonId: 'ch3-ex1',
        title: 'Multi-Table Joins & Anti-Join Patterns',
        sqlFocus: ['INNER JOIN', 'LEFT JOIN', 'FULL OUTER JOIN', 'CROSS JOIN', 'Self-Joins'],
        description: 'Connect disparate relational models (users, transactions, campaigns) and identify churned/unmatched cohorts using anti-joins.',
        careerRelevance: 'Joining customer profile attributes with transactional ledgers to measure customer lifetime value (LTV).',
        interviewTip: 'How to find customers who signed up but NEVER placed an order? Use "LEFT JOIN orders ON ... WHERE orders.id IS NULL" or "NOT EXISTS".',
        interviewTrap: 'Cartesian product duplication: Joining tables with duplicate foreign keys multiplies rows and inflates SUM() revenue totals!',
        estimatedTime: '45 Mins',
        xpReward: 450,
        skills: ['Relational Joins', 'Anti-Join Strategy', 'Cartesian Defense', 'Entity Resolution']
      },
      {
        id: 'da-04',
        stepNumber: '04',
        chapterId: 3,
        lessonId: 'ch3-ex2',
        title: 'Conditional Logic, Type Casting & Data Cleansing',
        sqlFocus: ['CASE WHEN', 'COALESCE', 'NULLIF', 'CAST', 'DATE_TRUNC', 'EXTRACT'],
        description: 'Transform messy operational data into clean categorical buckets, pivot metrics without PIVOT clauses, and handle edge cases.',
        careerRelevance: 'Cleansing raw production inputs and categorizing users into High/Medium/Low spenders before BI export.',
        interviewTip: 'Use NULLIF(denominator, 0) to prevent devastating "division by zero" errors when computing conversion percentages and growth ratios.',
        interviewTrap: 'Writing overlapping WHEN conditions in CASE statements. SQL evaluates sequentially and exits on the first true match.',
        estimatedTime: '40 Mins',
        xpReward: 500,
        skills: ['Conditional Binning', 'Zero-Division Defense', 'Temporal Truncation', 'Pivoting via CASE']
      },
      {
        id: 'da-05',
        stepNumber: '05',
        chapterId: 4,
        lessonId: 'ch4-ex1',
        title: 'Interview-Critical Window Functions & Trend Analytics',
        sqlFocus: ['ROW_NUMBER()', 'RANK()', 'DENSE_RANK()', 'LEAD()', 'LAG()', 'OVER (PARTITION BY)'],
        description: 'Compute partitioned rankings, moving averages, and period-over-period momentum without collapsing individual rows.',
        careerRelevance: 'Calculating top 3 products per region and computing 7-day rolling revenue averages.',
        interviewTip: 'Must-know interview question: "Find the 2nd highest salary / purchase". Difference between RANK (leaves rank gaps like 1, 2, 2, 4) vs DENSE_RANK (1, 2, 2, 3).',
        interviewTrap: 'Using LEAD/LAG without an explicit ORDER BY clause inside the OVER() clause results in undefined row order.',
        estimatedTime: '55 Mins',
        xpReward: 650,
        skills: ['Partitioned Windows', 'Period-over-Period Deltas', 'Rolling Moving Averages', 'Ranking Functions']
      },
      {
        id: 'da-06',
        stepNumber: '06',
        chapterId: 4,
        lessonId: 'ch4-boss',
        title: 'Deduplication & Common Table Expressions (CTEs)',
        sqlFocus: ['WITH (CTEs)', 'Deduplication via ROW_NUMBER() = 1', 'Subqueries', 'Recursive CTEs'],
        description: 'Structure multi-stage analytical queries into readable, modular CTE pipelines and eliminate duplicate webhook logs.',
        careerRelevance: 'Authoring clean, maintainable SQL pipelines for monthly executive presentations and retention analysis.',
        interviewTip: 'Deduplication pattern: Wrap with CTE, compute "ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) AS rn", then filter "WHERE rn = 1".',
        interviewTrap: 'Correlated subqueries in the SELECT clause execute once per row (O(N^2)). Refactor into CTEs or LEFT JOINs for speed.',
        estimatedTime: '50 Mins',
        xpReward: 750,
        skills: ['Deduplication', 'Modular CTEs', 'Subquery Refactoring', 'Data Staging']
      },
      {
        id: 'da-07',
        stepNumber: '07',
        chapterId: 4,
        lessonId: 'ch4-boss',
        title: 'Retention Cohorts, Funnel Drop-off & LTV Metrics',
        sqlFocus: ['Cohort Retention', 'Funnel Step Drop-off', 'Self-Join Time Lags', 'Dynamic Aggregation'],
        description: 'Analyze user retention cohorts across weekly/monthly buckets and track step-by-step conversion funnels.',
        careerRelevance: 'Building executive KPI decks answering: "What % of users acquired in January return to purchase in March?"',
        interviewTip: 'FAANG favorite: Calculate Day 1, Day 7, Day 30 user retention by joining user first login date with subsequent activity timestamps.',
        interviewTrap: 'Counting absolute users instead of percentage of the original cohort size, misrepresenting retention drop-offs.',
        estimatedTime: '60 Mins',
        xpReward: 900,
        skills: ['Cohort Retention Matrix', 'Conversion Funnels', 'Customer LTV', 'Temporal Analysis']
      },
      {
        id: 'da-08',
        stepNumber: '08',
        chapterId: 4,
        lessonId: 'ch4-boss',
        title: 'Query Optimization, Indexing & Execution Plans',
        sqlFocus: ['EXPLAIN ANALYZE', 'B-Tree vs Hash Index', 'Covering Indexes', 'Cartesian Check'],
        description: 'Diagnose slow database queries, inspect query execution plans, and write high-speed SQL that scales to 50M+ rows.',
        careerRelevance: 'Ensuring Tableau and Looker dashboards load under 2 seconds rather than timing out on heavy cloud warehouses.',
        interviewTip: 'Interview question: "A query on a 50M row table takes 45 seconds. How do you troubleshoot and fix it?" (Run EXPLAIN ANALYZE, check for sequential scans, add composite index matching WHERE + ORDER BY).',
        interviewTrap: 'Using "NOT IN" on a column that contains NULLs causes the entire query to evaluate to UNKNOWN and return zero rows! Use "NOT EXISTS" instead.',
        estimatedTime: '45 Mins',
        xpReward: 1000,
        skills: ['Execution Plans', 'Index Optimization', 'SARGable Patterns', 'Bottleneck Remediation']
      }
    ]
  },
  'Data Scientist': {
    role: 'Data Scientist',
    title: 'Data Scientist SQL Journey',
    tagline: 'Extract high-dimensional datasets, engineer predictive features in-engine, and pass ML technical screenings',
    icon: <Cpu className="w-5 h-5 text-glyph-emerald" />,
    summary: 'Master statistical sampling, feature engineering with CASE/COALESCE, time-series lags, stratified train-test splits, and feature store assembly.',
    topics: [
      {
        id: 'ds-01',
        stepNumber: '01',
        chapterId: 1,
        lessonId: 'ch1-ex1',
        title: 'Exploratory Data Slicing & Stratified Sampling',
        sqlFocus: ['SELECT', 'WHERE', 'LIMIT', 'TABLESAMPLE', 'RANDOM()'],
        description: 'Extract representative candidate datasets from high-volume transaction databases without skewing distributions.',
        careerRelevance: 'Pulling balanced sample distributions for offline training in Jupyter/Python.',
        interviewTip: 'Using ORDER BY RANDOM() LIMIT N forces a full table scan and sort on millions of rows. Use TABLESAMPLE or hash-based modulo sampling for big data.',
        estimatedTime: '20 Mins',
        xpReward: 250,
        skills: ['Stratified Slicing', 'Sampling Efficiency', 'Attribute Filtering', 'Distribution Inspection']
      },
      {
        id: 'ds-02',
        stepNumber: '02',
        chapterId: 2,
        lessonId: 'ch2-ex1',
        title: 'Descriptive Statistics & Outlier Detection in SQL',
        sqlFocus: ['AVG()', 'VARIANCE()', 'STDDEV()', 'PERCENTILE_CONT()', 'NTILE()'],
        description: 'Compute statistical distribution metrics directly in SQL to identify feature skewness and extreme outliers.',
        careerRelevance: 'Verifying training set quality and data stability without waiting for Python pandas processing.',
        interviewTip: 'Know how to calculate the Interquartile Range (IQR) and identify rows falling beyond Q1 - 1.5*IQR or Q3 + 1.5*IQR using SQL window percentiles.',
        estimatedTime: '30 Mins',
        xpReward: 350,
        skills: ['Variance & StdDev', 'Percentiles & Quartiles', 'Outlier Detection', 'NTILE Distribution']
      },
      {
        id: 'ds-03',
        stepNumber: '03',
        chapterId: 3,
        lessonId: 'ch3-ex1',
        title: 'In-Database Feature Engineering & Transformation',
        sqlFocus: ['CASE WHEN (One-Hot)', 'COALESCE (Imputation)', 'LOG()', 'Mathematical Scaling'],
        description: 'Construct binary one-hot encoded flags and impute missing values with cluster medians directly in SQL.',
        careerRelevance: 'Preparing production feature stores directly in Snowflake/BigQuery before model inference.',
        interviewTip: 'Handle missing values deliberately: Explain to the interviewer whether COALESCE should fill 0, the group median, or a distinct flag value.',
        estimatedTime: '40 Mins',
        xpReward: 450,
        skills: ['One-Hot Encoding', 'Missing Data Imputation', 'Numerical Transformations', 'Categorical Binning']
      },
      {
        id: 'ds-04',
        stepNumber: '04',
        chapterId: 4,
        lessonId: 'ch4-ex1',
        title: 'Time-Series Lags & Rolling Window Features',
        sqlFocus: ['LAG()', 'LEAD()', 'AVG() OVER (ORDER BY ROWS BETWEEN)', 'Temporal Partitions'],
        description: 'Compute past 7-day rolling averages, delta momentum, and sequence lags for predictive forecasting.',
        careerRelevance: 'Generating time-series features for customer churn and demand forecasting models.',
        interviewTip: 'Careful with data leakage: A rolling window for feature training must only include rows strictly prior to the prediction timestamp (ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING).',
        estimatedTime: '50 Mins',
        xpReward: 650,
        skills: ['Rolling Time Windows', 'Lag/Lead Differences', 'Leakage Prevention', 'Temporal Features']
      },
      {
        id: 'ds-05',
        stepNumber: '05',
        chapterId: 4,
        lessonId: 'ch4-boss',
        title: 'Deterministic Model Train/Validation/Test Splits',
        sqlFocus: ['MD5() / HASH()', 'MOD()', 'Deterministic Bucketing', 'WITH (CTEs)'],
        description: 'Partition datasets into 80/10/10 train/validation/test splits using deterministic hashing to avoid data leakage.',
        careerRelevance: 'Ensuring repeatable experiment benchmarking across teams and automated ML pipelines.',
        interviewTip: 'Never split time-series models randomly: Explain why temporal cutoff splits are mandatory for forecasting vs hash splits for independent entity models.',
        estimatedTime: '55 Mins',
        xpReward: 800,
        skills: ['Deterministic Splitting', 'Data Leakage Defense', 'Stratified Partitions', 'Modular Pipelines']
      }
    ]
  },
  'Analytics Engineer': {
    role: 'Analytics Engineer',
    title: 'Analytics Engineer SQL Journey',
    tagline: 'Design resilient dimensional models, modular dbt transformations, and data contracts',
    icon: <Layers className="w-5 h-5 text-quest-gold" />,
    summary: 'Bridging data engineering and business analytics: master Kimball dimensional star schemas, idempotent dbt-style CTE staging, incremental CDC models, and automated data quality audits.',
    topics: [
      {
        id: 'ae-01',
        stepNumber: '01',
        chapterId: 1,
        lessonId: 'ch1-ex1',
        title: 'Staging Models & Source Standardization',
        sqlFocus: ['SELECT', 'CAST / TRY_CAST', 'Column Renaming', 'Source Contracts'],
        description: 'Build foundational staging views that enforce type casting, snake_case standards, and remove source discrepancies.',
        careerRelevance: 'Developing the raw-to-staging transformation layer of modern cloud data warehouses.',
        interviewTip: 'Explain why SELECT * is prohibited in production dbt staging models (explicit column definitions protect downstream models from silent schema changes).',
        estimatedTime: '25 Mins',
        xpReward: 250,
        skills: ['Staging Architecture', 'Type Casting', 'Source Protection', 'Schema Standards']
      },
      {
        id: 'ae-02',
        stepNumber: '02',
        chapterId: 2,
        lessonId: 'ch2-ex1',
        title: 'Grain Definition & Granularity Integrity',
        sqlFocus: ['Grain Testing', 'GROUP BY', 'Surrogate Keys', 'Primary Key Uniqueness'],
        description: 'Establish the exact grain of every transformed model and ensure aggregate logic prevents fan-out duplication.',
        careerRelevance: 'Ensuring financial ledger models never double-count revenue across nested order items.',
        interviewTip: 'Define the grain in the PR description: e.g. "One row per user per subscription renewal date".',
        estimatedTime: '35 Mins',
        xpReward: 350,
        skills: ['Grain Management', 'Fan-out Prevention', 'Surrogate Keys', 'Aggregation Boundaries']
      },
      {
        id: 'ae-03',
        stepNumber: '03',
        chapterId: 3,
        lessonId: 'ch3-ex1',
        title: 'Kimball Star Schema & Dimension Joins',
        sqlFocus: ['Fact Tables', 'Dimension Tables', 'Surrogate Keys', 'Slowly Changing Dimensions (SCD)'],
        description: 'Model relational datasets into Kimball star schemas with central numeric facts and shared dimensions.',
        careerRelevance: 'Enabling business teams to build self-service reports in BI tools without writing complex joins.',
        interviewTip: 'Difference between Fact table (additive numerical measurements like order revenue) vs Dimension table (contextual attributes like user city).',
        estimatedTime: '45 Mins',
        xpReward: 500,
        skills: ['Star Schema', 'Fact vs Dim', 'Surrogate Keys', 'SCD Type 2 Modeling']
      },
      {
        id: 'ae-04',
        stepNumber: '04',
        chapterId: 4,
        lessonId: 'ch4-ex1',
        title: 'Incremental Models & Change Data Capture (CDC)',
        sqlFocus: ['MERGE', 'MAX(updated_at)', 'Idempotent Logic', 'Watermarking'],
        description: 'Author incremental SQL models that process only new or modified records, cutting cloud warehouse costs by 80%.',
        careerRelevance: 'Optimizing warehouse queries handling tens of millions of daily streaming events.',
        interviewTip: 'Idempotency: An incremental model must produce the exact same outcome whether run once or executed five times consecutively.',
        estimatedTime: '50 Mins',
        xpReward: 700,
        skills: ['Incremental Loads', 'Idempotence', 'Watermarking', 'Warehouse Efficiency']
      }
    ]
  },
  'Backend Developer': {
    role: 'Backend Developer',
    title: 'Backend Developer SQL Journey',
    tagline: 'Engineer high-throughput transactional databases with bulletproof ACID guarantees and sub-10ms APIs',
    icon: <Database className="w-5 h-5 text-glyph-crimson" />,
    summary: 'Master relational constraints, transaction isolation levels, row-level locking, index design, query optimization, and latency reduction.',
    topics: [
      {
        id: 'be-01',
        stepNumber: '01',
        chapterId: 1,
        lessonId: 'ch1-ex1',
        title: 'High-Efficiency Index Seeks & Keyset Pagination',
        sqlFocus: ['SELECT', 'WHERE Index Seeks', 'Keyset Pagination', 'LIMIT / OFFSET Drawbacks'],
        description: 'Design database queries for low-latency API endpoints and avoid performance degradation from high-offset pagination.',
        careerRelevance: 'Powering API endpoints responding in under 10ms under heavy concurrent microservice traffic.',
        interviewTip: 'Why is "LIMIT 20 OFFSET 100000" slow? (The engine must read and discard 100,000 rows). Explain how keyset pagination (WHERE id > last_seen_id LIMIT 20) fixes it.',
        estimatedTime: '20 Mins',
        xpReward: 250,
        skills: ['Index Seeking', 'Keyset Pagination', 'Low-Latency Retrieval', 'Offset Mitigation']
      },
      {
        id: 'be-02',
        stepNumber: '02',
        chapterId: 2,
        lessonId: 'ch2-ex1',
        title: 'Relational Integrity, Foreign Keys & Cascades',
        sqlFocus: ['FOREIGN KEY', 'ON DELETE CASCADE', 'UNIQUE Constraints', 'CHECK Constraints'],
        description: 'Enforce relational constraints at the database engine level to prevent corrupted state and orphan data.',
        careerRelevance: 'Protecting critical system state against application bugs and network failures.',
        interviewTip: 'Explain why ON DELETE CASCADE on heavy parent tables can cause lock contention and spike CPU during deletion spikes.',
        estimatedTime: '30 Mins',
        xpReward: 350,
        skills: ['Database Constraints', 'Cascading Actions', 'Data Integrity', 'Lock Prevention']
      },
      {
        id: 'be-03',
        stepNumber: '03',
        chapterId: 3,
        lessonId: 'ch3-ex1',
        title: 'ORM Query Optimization & N+1 Prevention',
        sqlFocus: ['INNER JOIN', 'LEFT JOIN', 'LATERAL Joins', 'Consolidated Queries'],
        description: 'Identify and eliminate dangerous N+1 queries generated by ORMs like Prisma, Hibernate, or Entity Framework.',
        careerRelevance: 'Preventing database connection pool exhaustion when traffic surges.',
        interviewTip: 'Demonstrate how to turn 1 parent query + 100 child queries into a single efficient JOIN or grouped JSON aggregation.',
        estimatedTime: '45 Mins',
        xpReward: 450,
        skills: ['N+1 Elimination', 'ORM Performance', 'Eager Loading', 'Join Optimization']
      },
      {
        id: 'be-04',
        stepNumber: '04',
        chapterId: 4,
        lessonId: 'ch4-ex1',
        title: 'ACID Transactions, Row Locks & Concurrency',
        sqlFocus: ['BEGIN / COMMIT', 'ROLLBACK', 'SELECT ... FOR UPDATE', 'Isolation Levels'],
        description: 'Prevent race conditions, phantom reads, and double-spend exploits during concurrent transactions.',
        careerRelevance: 'Securing fintech checkout, hotel booking, and inventory management endpoints.',
        interviewTip: 'Contrast Optimistic Locking (version column check) vs Pessimistic Locking (SELECT ... FOR UPDATE) and their respective trade-offs.',
        estimatedTime: '55 Mins',
        xpReward: 700,
        skills: ['ACID Guarantees', 'Row-Level Locking', 'Race Condition Defense', 'Isolation Levels']
      }
    ]
  },
  'Full Stack Developer': {
    role: 'Full Stack Developer',
    title: 'Full Stack Developer SQL Journey',
    tagline: 'Bridge frontend user interfaces with robust, secure relational databases and APIs',
    icon: <Globe className="w-5 h-5 text-mana-glow" />,
    summary: 'Master database querying for web applications: efficient API endpoints, cursor pagination, user authentication models, and data security.',
    topics: [
      {
        id: 'fs-01',
        stepNumber: '01',
        chapterId: 1,
        lessonId: 'ch1-ex1',
        title: 'REST / GraphQL API Querying & Keyset Pagination',
        sqlFocus: ['SELECT', 'WHERE', 'LIMIT', 'Keyset Pagination', 'Aliases'],
        description: 'Build fast data endpoints with smooth cursor pagination for infinite-scroll frontend user interfaces.',
        careerRelevance: 'Powering web and mobile app feeds with instant response times and low memory footprints.',
        interviewTip: 'Explain why cursor-based pagination is preferred over page-number pagination for real-time social feeds with frequent new items.',
        estimatedTime: '20 Mins',
        xpReward: 250,
        skills: ['API Endpoints', 'Keyset Pagination', 'Infinite Feeds', 'Filtering']
      },
      {
        id: 'fs-02',
        stepNumber: '02',
        chapterId: 2,
        lessonId: 'ch2-ex1',
        title: 'Dashboard Metrics & Summary Endpoints',
        sqlFocus: ['GROUP BY', 'COUNT(*)', 'SUM()', 'Category Cards'],
        description: 'Aggregate user stats and status badges to supply dynamic frontend analytics charts.',
        careerRelevance: 'Serving summary cards, notification counters, and activity metrics in SaaS applications.',
        interviewTip: 'Combine multiple metric counts into a single query using COUNT(CASE WHEN ...) to avoid firing 5 separate queries from your frontend.',
        estimatedTime: '30 Mins',
        xpReward: 350,
        skills: ['Dashboard APIs', 'Metric Aggregation', 'Single-Query Rollups', 'Chart Feeds']
      },
      {
        id: 'fs-03',
        stepNumber: '03',
        chapterId: 3,
        lessonId: 'ch3-ex1',
        title: 'SQL Injection Security & Parameterization',
        sqlFocus: ['Prepared Statements', 'Parameterized Queries', 'Least Privilege'],
        description: 'Protect application databases from malicious user input and devastating SQL injection attacks.',
        careerRelevance: 'Passing security audits and keeping user data safe from breaches and malicious actors.',
        interviewTip: 'Classic interview security question: Show how string concatenation in SQL creates vulnerabilities and explain how parameterized query planning neutralizes it.',
        estimatedTime: '35 Mins',
        xpReward: 450,
        skills: ['OWASP Top 10', 'Parameterized Queries', 'Security Hardening', 'Sanitization']
      },
      {
        id: 'fs-04',
        stepNumber: '04',
        chapterId: 4,
        lessonId: 'ch4-ex1',
        title: 'Atomic Multi-Step Form Submissions & Rollbacks',
        sqlFocus: ['BEGIN / COMMIT', 'ROLLBACK', 'Form Data Integrity'],
        description: 'Wrap multi-step checkout processes and user onboarding into safe atomic transactions.',
        careerRelevance: 'Preventing half-completed orders and broken database rows when network errors occur.',
        interviewTip: 'Always structure transactions with proper try-catch-finally blocks that guarantee ROLLBACK execution on unhandled exceptions.',
        estimatedTime: '45 Mins',
        xpReward: 650,
        skills: ['Atomic Transactions', 'Form Integrity', 'Error Rollback', 'Checkout Safety']
      }
    ]
  }
};

interface RoadmapPageProps {
  profile: PlayerProfile;
  onChangeView: (view: AppView) => void;
  onStartQuest: (chapterId: number, exerciseId?: string) => void;
  onOpenProfile: () => void;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({
  profile,
  onChangeView,
  onStartQuest,
  onOpenProfile,
}) => {
  // User's selected profession locked strictly to profile
  const userRole: CareerRole = profile.role || 'Data Analyst';
  const curriculum = ROADMAP_DATA[userRole] || ROADMAP_DATA['Data Analyst'];

  // Determine user progression level
  const hasFinishedCh1 = profile.completedCaseStudies.includes(1);
  const hasFinishedCh2 = profile.completedCaseStudies.includes(2);
  const hasFinishedCh3 = profile.completedCaseStudies.includes(3);
  const completedPhasesCount = (profile.completedCaseStudies || []).length;
  const isInterviewUnlocked = completedPhasesCount >= 4;

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isToastOpen, setIsToastOpen] = useState<boolean>(false);

  // Calculate active topic index (0-indexed)
  let activeIndex = 0;
  if (hasFinishedCh3) {
    activeIndex = Math.min(3, curriculum.topics.length - 1);
  } else if (hasFinishedCh2) {
    activeIndex = 2;
  } else if (hasFinishedCh1) {
    activeIndex = 1;
  } else {
    activeIndex = 0;
  }

  // Count milestones completed
  const completedCount = activeIndex;
  const progressPercent = Math.round((completedCount / curriculum.topics.length) * 100);

  return (
    <div className="min-h-screen bg-dungeon-abyss text-parchment-white flex flex-col font-code">
      {/* 1. TOP HEADER NAVIGATION */}
      <header className="border-b-2 border-dungeon-border bg-dungeon-chamber px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-pixel sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onChangeView('home')}
            className="bg-dungeon-crypt hover:bg-dungeon-highlight border border-dungeon-highlight hover:border-mana-core px-3 py-1.5 pixel-btn text-xs font-display flex items-center gap-1.5 text-parchment-rune hover:text-parchment-white"
          >
            <ArrowLeft className="w-4 h-4 text-mana-core" />
            <span>BACK TO HOME</span>
          </button>
          
          <div className="h-5 w-[1px] bg-dungeon-highlight hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-dungeon-abyss border border-quest-gold flex items-center justify-center text-quest-gold">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm tracking-wider text-parchment-white uppercase">
                  CAREER SQL ROADMAP
                </span>
                <span className="bg-mana-core text-dungeon-abyss text-[9px] font-display font-bold px-1.5 py-0.5 shadow-pixel-sm uppercase">
                  LEARNING PATH
                </span>
              </div>
              <p className="text-[10px] text-parchment-rune hidden md:block">
                Curated Syllabus for <span className="text-quest-gold font-bold">{profile.gamerTag}</span> // Assigned Track: <span className="text-mana-glow font-bold">{userRole}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Quick Controls */}
        <div className="flex items-center gap-3">
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

      {/* 2. CAREER TRACK HERO BANNER */}
      <section className="bg-dungeon-chamber/80 border-b-2 border-dungeon-border p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Locked In User Track Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-display text-parchment-rune uppercase tracking-wider">
                ACTIVE CAREER TRACK:
              </span>
              <div className="bg-mana-core text-dungeon-abyss font-display font-bold text-xs px-3 py-1 pixel-btn shadow-pixel-sm flex items-center gap-2">
                <span>{userRole}</span>
                <span className="bg-dungeon-abyss text-quest-gold text-[9px] px-1.5 py-0.2 uppercase font-bold">
                  ASSIGNED SPECIALIZATION
                </span>
              </div>
            </div>
            <div className="text-[11px] text-parchment-rune flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-quest-gold" />
              <span>Tailored to <span className="text-quest-gold font-bold">{profile.gamerTag}</span>'s active interview preparation path</span>
            </div>
          </div>

          {/* Curriculum Overview Card */}
          <div className="bg-dungeon-abyss border-2 border-dungeon-highlight p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-pixel">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-dungeon-chamber border border-mana-core flex items-center justify-center">
                  {curriculum.icon}
                </div>
                <div>
                  <h1 className="font-display font-bold text-base md:text-lg text-mana-core tracking-wide">
                    {curriculum.title}
                  </h1>
                  <p className="text-xs text-parchment-rune font-display">
                    {curriculum.tagline}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-parchment-rune/90 leading-relaxed pt-1">
                {curriculum.summary}
              </p>
            </div>

            {/* Progression Progress Stats */}
            <div className="bg-dungeon-chamber border border-dungeon-border p-3 min-w-[240px] space-y-2 shrink-0">
              <div className="flex justify-between items-center text-xs font-display">
                <span className="text-quest-gold font-bold">CURRICULUM PROGRESS</span>
                <span className="text-mana-core font-bold">{progressPercent}%</span>
              </div>
              <div className="h-3 bg-dungeon-abyss border border-dungeon-highlight relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-quest-amber via-mana-core to-glyph-emerald transition-all duration-500"
                  style={{ width: `${Math.max(8, progressPercent)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-parchment-rune font-display">
                <span>{completedCount} / {curriculum.topics.length} PHASES DONE</span>
                <span className="text-glyph-emerald font-bold">
                  {completedCount >= curriculum.topics.length ? 'ALL COMPLETE' : 'IN PROGRESS'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TIMELINE GRAPHIC & MILESTONES (INTERVIEW REMOVED - PURE LEARNING PHASES) */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-display">
            <span className="text-quest-gold font-bold">◆ LEARNING TIMELINE</span>
            <span className="text-parchment-rune">//</span>
            <span className="text-parchment-white">{curriculum.topics.length} CORE PHASES</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-display">
            <span className="flex items-center gap-1.5 text-glyph-emerald">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
            <span className="flex items-center gap-1.5 text-mana-core">
              <span className="w-2 h-2 rounded-full bg-mana-core animate-ping inline-block" /> Active Phase
            </span>
            <span className="flex items-center gap-1.5 text-neutral-500">
              <Lock className="w-3.5 h-3.5" /> Locked
            </span>
          </div>
        </div>

        {/* Timeline Graphic Container */}
        <div className="relative pl-6 md:pl-10 space-y-8 md:space-y-10">
          {/* Vertical Connecting Runic Conduit Spine */}
          <div className="absolute left-[18px] md:left-[30px] top-6 bottom-6 w-1 bg-gradient-to-b from-glyph-emerald via-mana-core to-neutral-800 -translate-x-1/2 z-0" />

          {curriculum.topics.map((topic, index) => {
            const isCompleted = index < activeIndex;
            const isActive = index === activeIndex;
            const isLocked = index > activeIndex;

            return (
              <div key={topic.id} className="relative z-10 flex items-start gap-4 md:gap-6 group">
                {/* 1. TIMELINE NODE GRAPHIC */}
                <div className="relative -ml-6 md:-ml-10 shrink-0 mt-2">
                  {isCompleted && (
                    <div className="w-9 h-9 md:w-11 md:h-11 rounded-none bg-glyph-emerald border-2 border-glyph-emerald text-dungeon-abyss flex items-center justify-center font-display font-bold shadow-pixel shadow-glyph-emerald/40 transition-transform group-hover:scale-105">
                      <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-dungeon-abyss" />
                    </div>
                  )}

                  {isActive && (
                    <div className="relative">
                      {/* Animated Radar Pulse Rings */}
                      <div className="absolute -inset-1.5 bg-mana-core/30 rounded-none animate-ping" />
                      <div className="absolute -inset-1 bg-mana-glow/40 rounded-none animate-pulse" />
                      
                      {/* Active Node Center */}
                      <div className="relative w-9 h-9 md:w-11 md:h-11 bg-dungeon-abyss border-2 border-mana-core text-mana-core flex items-center justify-center font-display font-bold shadow-[0_0_15px_#00d2ff] animate-pulse">
                        <Zap className="w-5 h-5 text-mana-glow fill-mana-core" />
                      </div>
                    </div>
                  )}

                  {isLocked && (
                    <div className="w-9 h-9 md:w-11 md:h-11 bg-dungeon-crypt border-2 border-neutral-700 text-neutral-500 flex items-center justify-center font-display font-bold">
                      <Lock className="w-4 h-4 md:w-5 md:h-5 text-neutral-500" />
                    </div>
                  )}
                </div>

                {/* 2. TOPIC CONTENT CARD */}
                <div
                  className={`flex-1 border-2 p-4 md:p-5 transition-all shadow-pixel ${
                    isActive
                      ? 'bg-dungeon-abyss border-mana-core shadow-[0_0_20px_rgba(0,210,255,0.2)] ring-1 ring-mana-glow/40 animate-fadeIn'
                      : isCompleted
                      ? 'bg-dungeon-abyss/90 border-glyph-emerald/70 hover:border-glyph-emerald'
                      : 'bg-dungeon-abyss/40 border-neutral-800 text-neutral-500'
                  }`}
                >
                  {/* Card Header Status & Title */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 mb-3 border-inherit">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-display font-bold ${
                        isActive ? 'text-mana-core' : isCompleted ? 'text-glyph-emerald' : 'text-neutral-500'
                      }`}>
                        PHASE {topic.stepNumber}
                      </span>
                      <span className={`text-xs ${isLocked ? 'text-neutral-600' : 'text-parchment-rune'}`}>•</span>
                      <span className={`text-xs font-display ${isLocked ? 'text-neutral-500' : 'text-parchment-rune'}`}>
                        {topic.estimatedTime}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isActive && (
                        <span className="bg-mana-core text-dungeon-abyss text-[10px] font-display font-bold px-2 py-0.5 flex items-center gap-1.5 shadow-pixel-sm animate-pulse">
                          <span className="w-1.5 h-1.5 bg-dungeon-abyss rounded-full inline-block animate-ping" />
                          ⚡ ACTIVE OBJECTIVE // IN PROGRESS
                        </span>
                      )}
                      {isCompleted && (
                        <span className="bg-glyph-emerald/20 border border-glyph-emerald text-glyph-emerald text-[10px] font-display font-bold px-2 py-0.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          MASTERY ACHIEVED (+{topic.xpReward} XP)
                        </span>
                      )}
                      {isLocked && (
                        <span className="bg-neutral-800/80 border border-neutral-700 text-neutral-500 text-[10px] font-display font-bold px-2 py-0.5 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-neutral-500" />
                          LOCKED (COMPLETE PREVIOUS PHASES)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Topic Title */}
                  <div className="space-y-1.5 mb-3">
                    <h2 className={`font-display font-bold text-sm md:text-base tracking-wide ${
                      isActive ? 'text-parchment-white' : isCompleted ? 'text-parchment-white' : 'text-neutral-500'
                    }`}>
                      {topic.title}
                    </h2>
                    <p className={`text-xs leading-relaxed ${
                      isLocked ? 'text-neutral-500' : 'text-parchment-rune'
                    }`}>
                      {topic.description}
                    </p>
                  </div>

                  {/* Career & Role Context Box */}
                  <div className={`p-2.5 border mb-3 text-xs ${
                    isActive
                      ? 'bg-dungeon-chamber border-mana-core/40 text-parchment-white'
                      : isCompleted
                      ? 'bg-dungeon-chamber/60 border-dungeon-border text-parchment-rune'
                      : 'bg-neutral-900/40 border-neutral-800 text-neutral-500'
                  }`}>
                    <span className={`text-[10px] font-display block uppercase mb-0.5 font-bold ${
                      isActive ? 'text-quest-gold' : isCompleted ? 'text-glyph-emerald' : 'text-neutral-600'
                    }`}>
                      💼 Role Context ({curriculum.role}):
                    </span>
                    <p className={isLocked ? 'text-neutral-500' : 'text-parchment-rune'}>
                      {topic.careerRelevance}
                    </p>
                  </div>

                  {/* SQL Syntax & Skills Badges */}
                  <div className="space-y-2 mb-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[10px] font-display mr-1 ${
                        isLocked ? 'text-neutral-600' : 'text-parchment-rune'
                      }`}>
                        SQL CLAUSES & OPERATORS:
                      </span>
                      {topic.sqlFocus.map((sql, i) => (
                        <code
                          key={i}
                          className={`text-[11px] px-1.5 py-0.5 font-bold ${
                            isActive
                              ? 'bg-mana-core/20 border border-mana-core/60 text-mana-core'
                              : isCompleted
                              ? 'bg-glyph-emerald/10 border border-glyph-emerald/40 text-glyph-emerald'
                              : 'bg-neutral-900 border border-neutral-800 text-neutral-500'
                          }`}
                        >
                          {sql}
                        </code>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[10px] font-display mr-1 ${
                        isLocked ? 'text-neutral-600' : 'text-parchment-rune'
                      }`}>
                        JOB SKILLS:
                      </span>
                      {topic.skills.map((skill, i) => (
                        <span
                          key={i}
                          className={`text-[10px] px-1.5 py-0.2 ${
                            isLocked
                              ? 'bg-neutral-900 text-neutral-600 border border-neutral-800'
                              : 'bg-dungeon-chamber text-parchment-rune border border-dungeon-highlight'
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button Bar */}
                  <div className="pt-2 border-t border-inherit flex items-center justify-between">
                    <div className={`text-[11px] font-display ${
                      isLocked ? 'text-neutral-600' : 'text-quest-gold font-bold'
                    }`}>
                      REWARD: +{topic.xpReward} XP
                    </div>

                    {isActive && (
                      <button
                        onClick={() => onStartQuest(topic.chapterId, topic.lessonId)}
                        className="bg-mana-core hover:bg-mana-glow text-dungeon-abyss font-display font-bold text-xs uppercase px-4 py-2 pixel-btn flex items-center gap-2 shadow-pixel transition-transform hover:scale-[1.02]"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>ENTER DUNGEON // PRACTICE TOPIC</span>
                      </button>
                    )}

                    {isCompleted && (
                      <button
                        onClick={() => onStartQuest(topic.chapterId, topic.lessonId)}
                        className="bg-dungeon-crypt hover:bg-dungeon-highlight border border-glyph-emerald text-glyph-emerald font-display text-xs px-3.5 py-1.5 pixel-btn flex items-center gap-1.5 hover:text-parchment-white"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>REVIEW DRILL</span>
                      </button>
                    )}

                    {isLocked && (
                      <div className="flex items-center gap-1.5 text-xs font-display text-neutral-500 py-1.5 px-3 bg-neutral-900/60 border border-neutral-800">
                        <Lock className="w-3.5 h-3.5 text-neutral-500" />
                        <span>LOCKED PHASE</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. SEPARATE STAGE TEASER: TECHNICAL INTERVIEW ARENA (LOCKED UNTIL ALL PHASES COMPLETE) */}
        <div className="mt-10 p-5 bg-dungeon-chamber border-2 border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-pixel">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 bg-dungeon-abyss border-2 border-neutral-700 text-neutral-500 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-neutral-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-bold text-xs sm:text-sm text-parchment-white uppercase">
                  SEPARATE CAPSTONE: TECHNICAL INTERVIEW & REAL-LIFE CASE STUDIES
                </span>
                <span className={`text-[9px] font-display font-bold px-1.5 py-0.2 ${
                  isInterviewUnlocked
                    ? 'bg-quest-gold text-dungeon-abyss'
                    : 'bg-neutral-800 border border-neutral-700 text-neutral-400'
                }`}>
                  {isInterviewUnlocked ? 'UNLOCKED' : 'LOCKED'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-code pt-0.5">
                The Interview Arena is hosted as a separate arena on the Homestead. It remains locked until all learning phases are mastered.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!isInterviewUnlocked) {
                setToastMessage("Please complete your course first");
                setIsToastOpen(true);
                return;
              }
              onChangeView('interview');
            }}
            className={`text-xs font-display px-4 py-2 pixel-btn uppercase transition-all shrink-0 flex items-center gap-2 ${
              isInterviewUnlocked
                ? 'text-quest-gold hover:text-dungeon-abyss bg-quest-gold/20 hover:bg-quest-gold border-2 border-quest-gold cursor-pointer font-bold shadow-[0_0_12px_rgba(255,184,0,0.3)]'
                : 'text-neutral-500 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 cursor-not-allowed opacity-75 active:scale-[0.98]'
            }`}
            title={!isInterviewUnlocked ? "Please complete your course first" : "Open Interview Page"}
          >
            {isInterviewUnlocked ? (
              <>
                <Zap className="w-3.5 h-3.5 text-quest-gold fill-quest-gold" />
                <span className="text-quest-gold font-bold">OPEN INTERVIEW PAGE (UNLOCKED)</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-neutral-500 font-bold">LOCKED (COMPLETE ALL PHASES)</span>
              </>
            )}
          </button>
        </div>
      </main>

      {/* Retro Pixel RPG Toast Notification */}
      <Toast
        message={toastMessage}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
      />
    </div>
  );
};
