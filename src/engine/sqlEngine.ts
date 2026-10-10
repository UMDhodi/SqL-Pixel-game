import alasql from 'alasql';
import { generateAllDatasets } from './datasets';
import { QueryExecutionResult, TableSchema } from '../types/game';

class SqlEngineService {
  private isInitialized = false;
  private schemas: TableSchema[] = [];

  constructor() {
    // Configure alasql settings
    alasql.options.errorlog = false;
    alasql.options.modifier = 'RECORD';
  }

  /**
   * Initializes all dungeon tables and seeds them with thousands of records
   */
  public async initDatabase(): Promise<TableSchema[]> {
    if (this.isInitialized) {
      return this.schemas;
    }

    try {
      const { tables, schemas } = generateAllDatasets();
      this.schemas = schemas;

      // Drop any previous tables
      for (const schema of schemas) {
        try {
          alasql(`DROP TABLE IF EXISTS ${schema.tableName}`);
        } catch {
          // ignore drop error
        }
      }

      // Create and populate tables
      for (const [tableName, rows] of Object.entries(tables)) {
        // Create table in alasql
        alasql(`CREATE TABLE ${tableName}`);
        // Populate records in batches
        alasql.tables[tableName].data = [...rows];
      }

      this.isInitialized = true;
      return this.schemas;
    } catch (err) {
      console.error('Failed to initialize in-browser SQL database:', err);
      throw err;
    }
  }

  /**
   * Resets database back to default pristine dungeon state
   */
  public async resetDatabase(): Promise<TableSchema[]> {
    this.isInitialized = false;
    return this.initDatabase();
  }

  /**
   * Returns current cached schemas
   */
  public getSchemas(): TableSchema[] {
    return this.schemas;
  }

  /**
   * Executes a player query with high-precision timing and friendly error diagnostics
   */
  public executeQuery(sql: string): QueryExecutionResult {
    const trimmed = sql.trim().replace(/;+$/, '');
    if (!trimmed) {
      return {
        success: false,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: 0,
        error: 'Empty incantation! Type an SQL query into the terminal to cast.',
      };
    }

    const startTime = performance.now();
    try {
      const rawResult = alasql(trimmed);
      const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

      // Result normalization
      let rows: Record<string, any>[] = [];
      if (Array.isArray(rawResult)) {
        // If query is an array of objects
        if (rawResult.length > 0 && typeof rawResult[0] === 'object' && rawResult[0] !== null) {
          rows = rawResult;
        } else if (rawResult.length > 0 && Array.isArray(rawResult[0])) {
          // If array of arrays
          rows = rawResult as any;
        } else {
          rows = rawResult.map((v, idx) => ({ result: v, row_num: idx + 1 }));
        }
      } else if (rawResult && typeof rawResult === 'object') {
        rows = [rawResult];
      } else if (rawResult !== undefined && rawResult !== null) {
        rows = [{ result: rawResult }];
      }

      // Extract unique column names
      const columnsSet = new Set<string>();
      if (rows.length > 0) {
        Object.keys(rows[0]).forEach(k => columnsSet.add(k));
        // Check first 10 rows in case of sparse objects
        for (let i = 1; i < Math.min(rows.length, 10); i++) {
          Object.keys(rows[i]).forEach(k => columnsSet.add(k));
        }
      }

      return {
        success: true,
        columns: Array.from(columnsSet),
        rows,
        rowCount: rows.length,
        executionTimeMs,
      };
    } catch (err: any) {
      const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));
      const friendlyError = this.humanizeSqlError(err?.message || String(err), trimmed);

      return {
        success: false,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs,
        error: friendlyError,
      };
    }
  }

  /**
   * Translates raw parser syntax errors into easy, gamer-friendly English explanations
   */
  private humanizeSqlError(rawMsg: string, query: string): string {
    const lower = rawMsg.toLowerCase();
    const queryLower = query.toLowerCase();

    if (lower.includes('table does not exist') || lower.includes('cannot find table')) {
      return `❌ Table Not Found: ${rawMsg}. Check your FROM clause! Available tables: customers, orders, order_items, products, user_events, boss_monsters.`;
    }

    if (lower.includes('column') && (lower.includes('does not exist') || lower.includes('unknown'))) {
      return `❌ Unknown Column: ${rawMsg}. Tip: Check the Table Schema in your Grimoire to verify the exact column spellings.`;
    }

    if (lower.includes('parse error') || lower.includes('syntax error')) {
      if (!queryLower.includes('from') && queryLower.startsWith('select')) {
        return `❌ Missing FROM Clause: Did you forget to specify which table to query from? (e.g. SELECT * FROM customers)`;
      }
      if (queryLower.includes('where') && queryLower.includes('group by')) {
        const whereIdx = queryLower.indexOf('where');
        const groupIdx = queryLower.indexOf('group by');
        if (whereIdx > groupIdx) {
          return `❌ Syntax Order Error: In SQL, WHERE must come BEFORE GROUP BY! Order: SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY`;
        }
      }
      return `❌ Syntax Spell Error: ${rawMsg}. Check for missing commas, mismatched quotes, or misspelled keywords like SELECT, FROM, or WHERE.`;
    }

    return `❌ Spell Fizzled: ${rawMsg}`;
  }
}

export const sqlEngine = new SqlEngineService();
