export type CareerRole =
  | 'Data Analyst'
  | 'Data Scientist'
  | 'Analytics Engineer'
  | 'Backend Developer'
  | 'Full Stack Developer';

export type AppView = 'auth' | 'home' | 'schema' | 'playground' | 'roadmap' | 'interview';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  pin: string;
  gamerTag: string;
  role: CareerRole;
  createdAt: string;
}

export interface PlayerProfile {
  id: string;
  userId: string;
  gamerTag: string;
  role: CareerRole;
  pin: string;
  level: number;
  xp: number;
  gems: number;
  mana: number;
  maxMana: number;
  hp: number;
  maxHp: number;
  streak: number;
  lastDailyDate: string | null;
  currentWorldId: number;
  unlockedChapters: number[]; // e.g. [1, 2]
  completedLessons: string[]; // e.g. ["ch1-ex1", "ch1-ex2"]
  completedCaseStudies: number[]; // e.g. [1]
  completedDailyTasks: string[];
  solvedQueriesCount: number;
  createdAt: string;
}

export interface HintTier {
  tier: 1 | 2 | 3;
  title: string;
  content: string;
  xpPenalty: number;
}

export interface Lesson {
  id: string;
  chapterId: number;
  exerciseNumber: number; // e.g. 1, 2, ...
  title: string;
  shortDesc: string;
  difficulty: 'NOVICE' | 'ADEPT' | 'EXPERT' | 'MASTER';
  xpReward: number;
  gemReward: number;
  loreIntro: string;
  ruleTitle: string;
  ruleNumber: string;
  syntaxMasterclass: {
    explanation: string;
    anatomyCode: string;
    bulletTips: string[];
  };
  currentObjective: {
    prompt: string;
    requirements: string[];
    focusTable: string;
    tableColumnsPreview: Array<{ name: string; type: string; isPk?: boolean; isFk?: boolean }>;
  };
  starterSql: string; // ONLY comments or empty, so user writes query using own brain!
  solutionQuery: string; // for validation reference
  hint: {
    clue: string;
    syntaxGuide: string;
    solutionSnippet: string;
  };
  validation: (rows: any[]) => { passed: boolean; message: string };
  isBossTrial?: boolean;
}

export interface BossMonster {
  id: string;
  name: string;
  title: string;
  avatarType: 'slime' | 'goblin' | 'lich' | 'dragon' | 'golem' | 'hydra';
  maxHp: number;
  attackPower: number;
  weaknessSql: string;
  defeatLore: string;
}

export interface Chapter {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  lore: string;
  requiredLevel: number;
  completionPercent?: number;
  lessons: Lesson[];
  boss: BossMonster;
}

export interface ColumnSchema {
  name: string;
  type: 'INT' | 'VARCHAR' | 'FLOAT' | 'TIMESTAMP' | 'TEXT' | 'NUMERIC' | 'DATETIME';
  description: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: string;
}

export interface TableSchema {
  tableName: string;
  category: 'Quest' | 'Dimension' | 'Fact Orders Log' | 'Logs' | 'Equipment';
  rowCount: number;
  columnsCount: number;
  description: string;
  columns: ColumnSchema[];
  sampleData: Record<string, any>[];
}

export interface QueryExecutionResult {
  success: boolean;
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
}

export interface DailyBounty {
  date: string;
  cycleId: string;
  title: string;
  objective: string;
  scenario: string;
  targetTable: string;
  starterSql: string;
  xpReward: number;
  gemReward: number;
  validate: (rows: any[]) => { passed: boolean; message: string };
}
