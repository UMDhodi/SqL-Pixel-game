import { Chapter } from '../types/game';

export const CHAPTERS_DATA: Chapter[] = [
  {
    id: 1,
    code: 'CH. 01',
    title: 'Foundations of Guild Data',
    subtitle: 'SELECT Projections, Column Aliases & Table Scans',
    lore: 'Master the ancient art of data illumination. Retrieve adventurer rosters and examine armor armories with foundational SQL syntax.',
    requiredLevel: 1,
    completionPercent: 100,
    boss: {
      id: 'boss-slime',
      name: 'The Slime Hoard',
      title: 'LV. 04 BOSS // GUARDIAN OF THE UNFILTERED ABYSS',
      avatarType: 'slime',
      maxHp: 200,
      attackPower: 25,
      weaknessSql: 'SELECT hero_name, level FROM heroes WHERE level >= 10',
      defeatLore: 'The Slime Hoard dissolves into iridescent mana crystals! The pathway to Chapter 2 opens.',
    },
    lessons: [
      {
        id: 'ch1-ex1',
        chapterId: 1,
        exerciseNumber: 1,
        title: 'The Tavern Ledger (SELECT Intro)',
        shortDesc: 'Summon rows from tavern orders using SELECT and FROM.',
        difficulty: 'NOVICE',
        xpReward: 90,
        gemReward: 25,
        loreIntro: 'The barkeep needs to inspect the current transaction log. Cast your first illumination spell to view orders.',
        ruleTitle: 'THE SELECT RITE',
        ruleNumber: 'RULE 01',
        syntaxMasterclass: {
          explanation: 'The SELECT statement specifies which attributes to retrieve from the archive cabinet designated by FROM.',
          anatomyCode: `// Anatomy of a base query:\nSELECT column1, column2\nFROM table_name\nLIMIT 5;`,
          bulletTips: [
            'Use * to retrieve all columns at once.',
            'Always verify table spelling from the Database Schema Codex.',
            'Terminate SQL statements with a semicolon (;).',
          ],
        },
        currentObjective: {
          prompt: 'Retrieve the id, hero_name, and gold_spent columns from the tavern_orders table, limited to 5 records.',
          requirements: [
            'Display columns: id, hero_name, gold_spent',
            'Source table: tavern_orders',
            'Limit output to 5 rows',
          ],
          focusTable: 'tavern_orders',
          tableColumnsPreview: [
            { name: 'id', type: 'INT', isPk: true },
            { name: 'hero_name', type: 'VARCHAR' },
            { name: 'gold_spent', type: 'NUMERIC' },
            { name: 'quest_class', type: 'TEXT' },
          ],
        },
        starterSql: `-- 🧙‍♂️ Exercise 01: Inspect the Tavern Ledger\n-- Write your query below:\n\n`,
        solutionQuery: `SELECT id, hero_name, gold_spent FROM tavern_orders LIMIT 5;`,
        hint: {
          clue: 'List the 3 requested columns separated by commas right after SELECT, then FROM tavern_orders LIMIT 5;',
          syntaxGuide: 'SELECT id, hero_name, gold_spent FROM tavern_orders LIMIT 5;',
          solutionSnippet: 'SELECT id, hero_name, gold_spent FROM tavern_orders LIMIT 5;',
        },
        validation: (rows) => {
          if (!rows || rows.length === 0) return { passed: false, message: 'No rows returned! Check your FROM table name.' };
          if (rows.length !== 5) return { passed: false, message: `Expected 5 rows, but got ${rows.length}. Make sure to include LIMIT 5.` };
          if (!rows[0].id || !rows[0].hero_name || rows[0].gold_spent === undefined) {
            return { passed: false, message: 'Result must contain id, hero_name, and gold_spent columns.' };
          }
          return { passed: true, message: 'QUEST OBJECTIVE COMPLETE! 5 orders summoned from tavern records!' };
        },
      },
      {
        id: 'ch1-ex2',
        chapterId: 1,
        exerciseNumber: 2,
        title: 'Master Roster Projection',
        shortDesc: 'Inspect heroes and filter by guild rank.',
        difficulty: 'NOVICE',
        xpReward: 100,
        gemReward: 30,
        loreIntro: 'The Guildmaster seeks a directory of all registered heroes.',
        ruleTitle: 'PROJECTION & ALIASING',
        ruleNumber: 'RULE 02',
        syntaxMasterclass: {
          explanation: 'Columns can be retrieved in any order and renamed using AS for clearer report headers.',
          anatomyCode: `SELECT hero_name AS adventurer, level\nFROM heroes\nLIMIT 10;`,
          bulletTips: [
            'Aliases rename result columns without altering the physical schema.',
            'Keep column names lowercase and snake_case for readability.',
          ],
        },
        currentObjective: {
          prompt: 'Retrieve hero_name, class_archetype, and level from the heroes table for 6 adventurers.',
          requirements: [
            'Columns: hero_name, class_archetype, level',
            'Source table: heroes',
            'Limit: 6 rows',
          ],
          focusTable: 'heroes',
          tableColumnsPreview: [
            { name: 'id', type: 'INT', isPk: true },
            { name: 'hero_name', type: 'VARCHAR' },
            { name: 'class_archetype', type: 'TEXT' },
            { name: 'level', type: 'INT' },
          ],
        },
        starterSql: `-- 🧙‍♂️ Exercise 02: Retrieve Hero Roster\n-- Write your query below:\n\n`,
        solutionQuery: `SELECT hero_name, class_archetype, level FROM heroes LIMIT 6;`,
        hint: {
          clue: 'Specify the 3 columns from heroes with LIMIT 6.',
          syntaxGuide: 'SELECT hero_name, class_archetype, level FROM heroes LIMIT 6;',
          solutionSnippet: 'SELECT hero_name, class_archetype, level FROM heroes LIMIT 6;',
        },
        validation: (rows) => {
          if (!rows || rows.length !== 6) return { passed: false, message: 'Expected exactly 6 hero rows.' };
          if (!rows[0].hero_name || !rows[0].class_archetype || rows[0].level === undefined) {
            return { passed: false, message: 'Ensure columns hero_name, class_archetype, and level are selected.' };
          }
          return { passed: true, message: 'QUEST OBJECTIVE COMPLETE! Roster catalogued successfully!' };
        },
      },
      {
        id: 'ch1-boss',
        chapterId: 1,
        exerciseNumber: 3,
        title: 'Case Study: The Slime Hoard Audit (Boss Trial)',
        shortDesc: 'Final Gatekeeper: Filter high-level heroes to slay the Slime Hoard.',
        difficulty: 'ADEPT',
        xpReward: 250,
        gemReward: 60,
        isBossTrial: true,
        loreIntro: 'The Slime Hoard is consuming lower-level recruits! Locate seasoned veterans of level >= 10 to assemble a vanguard strike force.',
        ruleTitle: 'CHAPTER 1 BOSS TRIAL',
        ruleNumber: 'GATEKEEPER',
        syntaxMasterclass: {
          explanation: 'Combine projection, WHERE condition filtering, and ORDER BY to target high-level champions.',
          anatomyCode: `SELECT hero_name, level\nFROM heroes\nWHERE level >= 10\nORDER BY level DESC;`,
          bulletTips: [
            'Only rows satisfying the WHERE condition will pass into the result.',
            'Clearing this case study unlocks Chapter 2: Whispering Catacombs.',
          ],
        },
        currentObjective: {
          prompt: 'Find all heroes with level >= 10. Display hero_name, class_archetype, and level, sorted by level descending.',
          requirements: [
            'Display columns: hero_name, class_archetype, level',
            'Filter condition: level >= 10',
            'Sort: ORDER BY level DESC',
          ],
          focusTable: 'heroes',
          tableColumnsPreview: [
            { name: 'id', type: 'INT', isPk: true },
            { name: 'hero_name', type: 'VARCHAR' },
            { name: 'level', type: 'INT' },
          ],
        },
        starterSql: `-- ⚔️ CHAPTER 01 BOSS TRIAL: Assembly of the Vanguard\n-- Write your query below:\n\n`,
        solutionQuery: `SELECT hero_name, class_archetype, level FROM heroes WHERE level >= 10 ORDER BY level DESC;`,
        hint: {
          clue: 'Use WHERE level >= 10 and ORDER BY level DESC.',
          syntaxGuide: 'SELECT hero_name, class_archetype, level FROM heroes WHERE level >= 10 ORDER BY level DESC;',
          solutionSnippet: 'SELECT hero_name, class_archetype, level FROM heroes WHERE level >= 10 ORDER BY level DESC;',
        },
        validation: (rows) => {
          if (!rows || rows.length === 0) return { passed: false, message: 'No veteran heroes found!' };
          const allAbove10 = rows.every(r => Number(r.level) >= 10);
          if (!allAbove10) return { passed: false, message: 'Heroes with level < 10 were included. Check your WHERE level >= 10 condition.' };
          const isSorted = rows.every((r, i) => i === 0 || Number(rows[i - 1].level) >= Number(r.level));
          if (!isSorted) return { passed: false, message: 'Sort by level in descending order (DESC).' };
          return { passed: true, message: 'BOSS SLAIN! The Slime Hoard dissolves! Chapter 2 is officially unlocked!' };
        },
      },
    ],
  },
  {
    id: 2,
    code: 'CH. 02',
    title: 'Aggregates & Advanced Filtering',
    subtitle: 'Whispering Catacombs: WHERE Predicates, Aggregates & Groupings',
    lore: 'Master aggregate spells (COUNT, SUM, AVG) and conditional WHERE criteria across the realm’s tavern & dungeon financial ledgers.',
    requiredLevel: 4,
    completionPercent: 72,
    boss: {
      id: 'boss-dragon',
      name: 'DRACO_JOINUS.DB',
      title: 'LV. 08 BOSS // RAID TARGET ENCOUNTER',
      avatarType: 'dragon',
      maxHp: 420,
      attackPower: 45,
      weaknessSql: 'SELECT hero_name, SUM(gold_spent) FROM tavern_orders GROUP BY hero_name HAVING SUM(gold_spent) > 150',
      defeatLore: 'DRACO_JOINUS.DB shatters into legendary runic shards! Chapter 3: The Labyrinth of Joins is unsealed.',
    },
    lessons: [
      {
        id: 'ch2-ex1',
        chapterId: 2,
        exerciseNumber: 1,
        title: 'The Tavern Ledger Inspection',
        shortDesc: 'Survey basic orders in the Whispering Catacombs.',
        difficulty: 'NOVICE',
        xpReward: 90,
        gemReward: 20,
        loreIntro: 'The barkeep notices discrepancies in ledger receipts. Re-scan recent orders to verify timestamps and amounts.',
        ruleTitle: 'THE WHERE PREDICATE',
        ruleNumber: 'RULE 100',
        syntaxMasterclass: {
          explanation: 'The WHERE clause evaluates a boolean expression for each row, keeping only those where the condition is TRUE.',
          anatomyCode: `SELECT id, gold_spent\nFROM tavern_orders\nWHERE gold_spent > 50;`,
          bulletTips: [
            'Use standard comparison operators: >, <, >=, <=, =, and !=.',
            'Text values require single quotes: WHERE quest_class = \'Arcane Hunt\'.',
          ],
        },
        currentObjective: {
          prompt: 'Retrieve id, hero_name, and gold_spent from tavern_orders where quest_class = \'Arcane Hunt\'.',
          requirements: [
            'Columns: id, hero_name, gold_spent',
            'Filter: quest_class = \'Arcane Hunt\'',
            'Limit: 5 rows',
          ],
          focusTable: 'tavern_orders',
          tableColumnsPreview: [
            { name: 'id', type: 'INT', isPk: true },
            { name: 'hero_name', type: 'VARCHAR' },
            { name: 'gold_spent', type: 'NUMERIC' },
            { name: 'quest_class', type: 'TEXT' },
          ],
        },
        starterSql: `-- 🧙‍♂️ Exercise 01: The Tavern Ledger Inspection\n-- Write your query below:\n\n`,
        solutionQuery: `SELECT id, hero_name, gold_spent FROM tavern_orders WHERE quest_class = 'Arcane Hunt' LIMIT 5;`,
        hint: {
          clue: 'Filter with WHERE quest_class = \'Arcane Hunt\' and append LIMIT 5.',
          syntaxGuide: 'SELECT id, hero_name, gold_spent FROM tavern_orders WHERE quest_class = \'Arcane Hunt\' LIMIT 5;',
          solutionSnippet: 'SELECT id, hero_name, gold_spent FROM tavern_orders WHERE quest_class = \'Arcane Hunt\' LIMIT 5;',
        },
        validation: (rows) => {
          if (!rows || rows.length === 0) return { passed: false, message: 'No rows returned.' };
          return { passed: true, message: 'QUEST OBJECTIVE COMPLETE! Arcane Hunt logs isolated.' };
        },
      },
      {
        id: 'ch2-ex2',
        chapterId: 2,
        exerciseNumber: 2,
        title: 'SELECT & WHERE Filtering', // EXACT MATCH TO IMAGE 3!
        shortDesc: 'Filter dragon slayer orders where gold_spent > 75 sorted descending.',
        difficulty: 'NOVICE',
        xpReward: 120,
        gemReward: 35,
        loreIntro: 'The kingdom tavern keeper lost their ledger book! Use SQL filtering to find high-spending dragon slayers who visited this week.',
        ruleTitle: 'SYNTAX MASTERCLASS: THE WHERE CLAUSE',
        ruleNumber: 'RULE 101',
        syntaxMasterclass: {
          explanation: 'In SQL, the SELECT statement pulls columns, and WHERE sets conditional criteria to filter specific rows:',
          anatomyCode: `// Anatomy of a filtered query:\nSELECT hero_name, gold_spent\nFROM tavern_logs\nWHERE gold_spent > 100\nORDER BY gold_spent DESC;`,
          bulletTips: [
            'SELECT * retrieves all available columns from the database.',
            'Comparison operators: >, <, =, and != or <>.\nEvery SQL query must end with a semicolon (;).',
          ],
        },
        currentObjective: {
          prompt: 'Write a query to locate all heroes in the tavern_orders table who spent more than 75 gold coins.',
          requirements: [
            'Display columns: id, hero_name, gold_spent',
            'Filter condition: gold_spent > 75',
            'Sort by gold_spent in descending order (DESC)',
          ],
          focusTable: 'tavern_orders',
          tableColumnsPreview: [
            { name: 'id', type: 'INT', isPk: true },
            { name: 'hero_name', type: 'VARCHAR' },
            { name: 'gold_spent', type: 'NUMERIC' },
            { name: 'quest_class', type: 'TEXT' },
          ],
        },
        starterSql: `-- 🧙‍♂️ Quest 02: Retrieve elite spending adventurers\n-- Write your query below:\n\n`,
        solutionQuery: `SELECT id, hero_name, gold_spent FROM tavern_orders WHERE gold_spent > 75 ORDER BY gold_spent DESC;`,
        hint: {
          clue: 'Select id, hero_name, gold_spent FROM tavern_orders WHERE gold_spent > 75 ORDER BY gold_spent DESC;',
          syntaxGuide: 'SELECT id, hero_name, gold_spent FROM tavern_orders WHERE gold_spent > 75 ORDER BY gold_spent DESC;',
          solutionSnippet: 'SELECT id, hero_name, gold_spent FROM tavern_orders WHERE gold_spent > 75 ORDER BY gold_spent DESC;',
        },
        validation: (rows) => {
          if (!rows || rows.length === 0) return { passed: false, message: 'No rows returned! Check your WHERE condition.' };
          const allAbove75 = rows.every(r => Number(r.gold_spent) > 75);
          if (!allAbove75) return { passed: false, message: 'Found orders with gold_spent <= 75. Ensure gold_spent > 75.' };
          const isSorted = rows.every((r, i) => i === 0 || Number(rows[i - 1].gold_spent) >= Number(r.gold_spent));
          if (!isSorted) return { passed: false, message: 'Sort by gold_spent in descending order (DESC).' };
          return { passed: true, message: 'QUEST OBJECTIVE COMPLETE! All 4 high-spending adventurers correctly identified!' };
        },
      },
      {
        id: 'ch2-ex3',
        chapterId: 2,
        exerciseNumber: 3,
        title: 'Counting the Horde (COUNT Function)',
        shortDesc: 'Count total orders per quest class using COUNT and GROUP BY.',
        difficulty: 'NOVICE',
        xpReward: 80,
        gemReward: 25,
        loreIntro: 'How many times did heroes feast or embark on bounties? Count occurrences by category.',
        ruleTitle: 'COUNTING RUNES',
        ruleNumber: 'RULE 102',
        syntaxMasterclass: {
          explanation: 'COUNT(*) calculates the total number of rows matching the query or within each group.',
          anatomyCode: `SELECT quest_class, COUNT(*) AS total_runs\nFROM tavern_orders\nGROUP BY quest_class;`,
          bulletTips: [
            'GROUP BY gathers rows with equal values in the specified column.',
            'Give aggregate calculations aliases like AS total_orders.',
          ],
        },
        currentObjective: {
          prompt: 'Count the total number of orders per quest_class in tavern_orders.',
          requirements: [
            'Columns: quest_class, COUNT(*) AS total_orders',
            'Group by: quest_class',
            'Sort by: total_orders DESC',
          ],
          focusTable: 'tavern_orders',
          tableColumnsPreview: [
            { name: 'quest_class', type: 'TEXT' },
            { name: 'id', type: 'INT', isPk: true },
          ],
        },
        starterSql: `-- 🧙‍♂️ Exercise 03: Count Orders by Quest Class\n-- Write your query below:\n\n`,
        solutionQuery: `SELECT quest_class, COUNT(*) AS total_orders FROM tavern_orders GROUP BY quest_class ORDER BY total_orders DESC;`,
        hint: {
          clue: 'SELECT quest_class, COUNT(*) AS total_orders FROM tavern_orders GROUP BY quest_class ORDER BY total_orders DESC;',
          syntaxGuide: 'GROUP BY quest_class ORDER BY total_orders DESC',
          solutionSnippet: 'SELECT quest_class, COUNT(*) AS total_orders FROM tavern_orders GROUP BY quest_class ORDER BY total_orders DESC;',
        },
        validation: (rows) => {
          if (!rows || rows.length < 2) return { passed: false, message: 'Expected multiple grouped rows.' };
          if (!rows[0].quest_class || rows[0].total_orders === undefined) {
            return { passed: false, message: 'Include quest_class and COUNT(*) AS total_orders.' };
          }
          return { passed: true, message: 'QUEST OBJECTIVE COMPLETE! Horde counted with precision!' };
        },
      },
      {
        id: 'ch2-boss',
        chapterId: 2,
        exerciseNumber: 4,
        title: 'The Dragon\'s Audit (Boss Trial)',
        shortDesc: 'Final Gatekeeper: Group by hero_name and find top spenders with HAVING to slay DRACO_JOINUS.DB.',
        difficulty: 'ADEPT',
        xpReward: 350,
        gemReward: 80,
        isBossTrial: true,
        loreIntro: 'DRACO_JOINUS.DB demands proof of royal gold concentration! Calculate total gold spent per hero and filter those who spent over 150 gold total.',
        ruleTitle: 'CHAPTER 2 BOSS TRIAL',
        ruleNumber: 'GATEKEEPER',
        syntaxMasterclass: {
          explanation: 'HAVING filters aggregated groups (SUM, COUNT) after GROUP BY has collapsed rows.',
          anatomyCode: `SELECT hero_name, SUM(gold_spent) AS total_gold\nFROM tavern_orders\nGROUP BY hero_name\nHAVING SUM(gold_spent) > 150\nORDER BY total_gold DESC;`,
          bulletTips: [
            'WHERE filters rows BEFORE grouping; HAVING filters AFTER grouping.',
            'Slaying DRACO_JOINUS.DB unlocks Chapter 3: The Labyrinth of Joins!',
          ],
        },
        currentObjective: {
          prompt: 'Find all heroes whose total gold spent (SUM(gold_spent)) exceeds 150 gold coins.',
          requirements: [
            'Display: hero_name, SUM(gold_spent) AS total_gold',
            'Group by: hero_name',
            'Filter condition: HAVING SUM(gold_spent) > 150',
            'Sort: ORDER BY total_gold DESC',
          ],
          focusTable: 'tavern_orders',
          tableColumnsPreview: [
            { name: 'hero_name', type: 'VARCHAR' },
            { name: 'gold_spent', type: 'NUMERIC' },
          ],
        },
        starterSql: `-- ⚔️ CHAPTER 02 BOSS TRIAL: Slay DRACO_JOINUS.DB!\n-- Write your query below:\n\n`,
        solutionQuery: `SELECT hero_name, SUM(gold_spent) AS total_gold FROM tavern_orders GROUP BY hero_name HAVING SUM(gold_spent) > 150 ORDER BY total_gold DESC;`,
        hint: {
          clue: 'SELECT hero_name, SUM(gold_spent) AS total_gold FROM tavern_orders GROUP BY hero_name HAVING SUM(gold_spent) > 150 ORDER BY total_gold DESC;',
          syntaxGuide: 'GROUP BY hero_name HAVING SUM(gold_spent) > 150 ORDER BY total_gold DESC',
          solutionSnippet: 'SELECT hero_name, SUM(gold_spent) AS total_gold FROM tavern_orders GROUP BY hero_name HAVING SUM(gold_spent) > 150 ORDER BY total_gold DESC;',
        },
        validation: (rows) => {
          if (!rows || rows.length === 0) return { passed: false, message: 'No heroes found matching criteria.' };
          const allOver150 = rows.every(r => Number(r.total_gold) > 150);
          if (!allOver150) return { passed: false, message: 'Found heroes with total_gold <= 150. Check your HAVING clause.' };
          return { passed: true, message: 'DRACO_JOINUS.DB DEFEATED! The Catacombs illuminate in gold! Chapter 3 is unlocked!' };
        },
      },
    ],
  },
  {
    id: 3,
    code: 'CH. 03',
    title: 'The Labyrinth of Joins',
    subtitle: 'Relational Bridges: INNER JOIN, LEFT JOIN & Cross-Table Keys',
    lore: 'Traverse bridge tables using INNER, LEFT, and Cartesian relational spells to stitch disparate dungeon scrolls together.',
    requiredLevel: 6,
    completionPercent: 0,
    boss: {
      id: 'boss-golem',
      name: 'The Relational Golem',
      title: 'LV. 12 BOSS // GUARDIAN OF FOREIGN BRIDGES',
      avatarType: 'golem',
      maxHp: 650,
      attackPower: 60,
      weaknessSql: 'heroes INNER JOIN dungeon_raids ON heroes.id = dungeon_raids.hero_id',
      defeatLore: 'The Relational Golem shatters into foreign key glyphs! Chapter 4 unlocks.',
    },
    lessons: [
      {
        id: 'ch3-ex1',
        chapterId: 3,
        exerciseNumber: 1,
        title: 'Binding Adventurers to Raids (INNER JOIN)',
        shortDesc: 'Connect heroes with their raid records.',
        difficulty: 'ADEPT',
        xpReward: 140,
        gemReward: 35,
        loreIntro: 'Cross-reference heroes with raid history to see which boss each adventurer slayed.',
        ruleTitle: 'RELATIONAL BINDINGS',
        ruleNumber: 'RULE 201',
        syntaxMasterclass: {
          explanation: 'INNER JOIN combines rows from two tables whenever the ON predicate matches.',
          anatomyCode: `SELECT h.hero_name, r.boss_defeated, r.gold_bounty\nFROM heroes AS h\nINNER JOIN dungeon_raids AS r ON h.id = r.hero_id\nLIMIT 5;`,
          bulletTips: [
            'Table aliases (h, r) prevent ambiguous column errors.',
            'Keys must match in datatype.',
          ],
        },
        currentObjective: {
          prompt: 'Join heroes with dungeon_raids on hero_id to show hero_name, boss_defeated, and gold_bounty for 5 records.',
          requirements: [
            'Columns: h.hero_name, r.boss_defeated, r.gold_bounty',
            'Join: heroes h INNER JOIN dungeon_raids r ON h.id = r.hero_id',
            'Limit: 5 rows',
          ],
          focusTable: 'dungeon_raids',
          tableColumnsPreview: [
            { name: 'raid_id', type: 'INT', isPk: true },
            { name: 'hero_id', type: 'INT', isFk: true },
            { name: 'boss_defeated', type: 'VARCHAR' },
          ],
        },
        starterSql: `-- 🧙‍♂️ Exercise 01: Relational Raid Binding\n-- Write your query below:\n\n`,
        solutionQuery: `SELECT h.hero_name, r.boss_defeated, r.gold_bounty FROM heroes AS h INNER JOIN dungeon_raids AS r ON h.id = r.hero_id LIMIT 5;`,
        hint: {
          clue: 'SELECT h.hero_name, r.boss_defeated, r.gold_bounty FROM heroes AS h INNER JOIN dungeon_raids AS r ON h.id = r.hero_id LIMIT 5;',
          syntaxGuide: 'INNER JOIN dungeon_raids AS r ON h.id = r.hero_id LIMIT 5',
          solutionSnippet: 'SELECT h.hero_name, r.boss_defeated, r.gold_bounty FROM heroes AS h INNER JOIN dungeon_raids AS r ON h.id = r.hero_id LIMIT 5;',
        },
        validation: (rows) => {
          if (!rows || rows.length !== 5) return { passed: false, message: 'Expected 5 joined rows.' };
          if (!rows[0].hero_name || !rows[0].boss_defeated) return { passed: false, message: 'Missing joined columns.' };
          return { passed: true, message: 'QUEST OBJECTIVE COMPLETE! Raids linked to heroes!' };
        },
      },
      {
        id: 'ch3-boss',
        chapterId: 3,
        exerciseNumber: 2,
        title: 'Case Study: Relational Golem Trial (Boss Trial)',
        shortDesc: 'Final Gatekeeper: Multi-table join to defeat the Relational Golem.',
        difficulty: 'EXPERT',
        xpReward: 400,
        gemReward: 90,
        isBossTrial: true,
        loreIntro: 'Calculate total raid gold bounty accumulated per hero archetype! Uncover the richest combat class.',
        ruleTitle: 'CHAPTER 3 BOSS TRIAL',
        ruleNumber: 'GATEKEEPER',
        syntaxMasterclass: {
          explanation: 'Combine INNER JOIN with GROUP BY to aggregate values from related tables.',
          anatomyCode: `SELECT h.class_archetype, SUM(r.gold_bounty) AS total_bounty\nFROM heroes AS h\nINNER JOIN dungeon_raids AS r ON h.id = r.hero_id\nGROUP BY h.class_archetype\nORDER BY total_bounty DESC;`,
          bulletTips: [
            'Aggregation occurs after rows are joined.',
            'Clearing this boss completes the Labyrinth of Joins!',
          ],
        },
        currentObjective: {
          prompt: 'Join heroes and dungeon_raids to compute total gold_bounty per class_archetype, ordered descending.',
          requirements: [
            'Display: h.class_archetype, SUM(r.gold_bounty) AS total_bounty',
            'Group by: h.class_archetype',
            'Sort: ORDER BY total_bounty DESC',
          ],
          focusTable: 'heroes',
          tableColumnsPreview: [
            { name: 'class_archetype', type: 'TEXT' },
            { name: 'gold_bounty', type: 'NUMERIC' },
          ],
        },
        starterSql: `-- ⚔️ CHAPTER 03 BOSS TRIAL: Slay the Relational Golem!\n-- Write your query below:\n\n`,
        solutionQuery: `SELECT h.class_archetype, SUM(r.gold_bounty) AS total_bounty FROM heroes AS h INNER JOIN dungeon_raids AS r ON h.id = r.hero_id GROUP BY h.class_archetype ORDER BY total_bounty DESC;`,
        hint: {
          clue: 'SELECT h.class_archetype, SUM(r.gold_bounty) AS total_bounty FROM heroes AS h INNER JOIN dungeon_raids AS r ON h.id = r.hero_id GROUP BY h.class_archetype ORDER BY total_bounty DESC;',
          syntaxGuide: 'GROUP BY h.class_archetype ORDER BY total_bounty DESC',
          solutionSnippet: 'SELECT h.class_archetype, SUM(r.gold_bounty) AS total_bounty FROM heroes AS h INNER JOIN dungeon_raids AS r ON h.id = r.hero_id GROUP BY h.class_archetype ORDER BY total_bounty DESC;',
        },
        validation: (rows) => {
          if (!rows || rows.length < 3) return { passed: false, message: 'Expected grouped archetypes.' };
          if (!rows[0].class_archetype || rows[0].total_bounty === undefined) return { passed: false, message: 'Missing class_archetype or total_bounty.' };
          return { passed: true, message: 'GOLEM CRUMBLED! Relational mastery certified! Chapter 4 unlocked!' };
        },
      },
    ],
  },
];
