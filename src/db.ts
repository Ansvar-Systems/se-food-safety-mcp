import BetterSqlite3 from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export interface Database {
  get<T>(sql: string, params?: unknown[]): T | undefined;
  all<T>(sql: string, params?: unknown[]): T[];
  run(sql: string, params?: unknown[]): void;
  close(): void;
  readonly instance: BetterSqlite3.Database;
}

export function createDatabase(dbPath?: string): Database {
  const resolvedPath =
    dbPath ??
    join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'database.db');
  const db = new BetterSqlite3(resolvedPath);

  db.pragma('journal_mode = DELETE');
  db.pragma('foreign_keys = ON');

  initSchema(db);

  return {
    get<T>(sql: string, params: unknown[] = []): T | undefined {
      return db.prepare(sql).get(...params) as T | undefined;
    },
    all<T>(sql: string, params: unknown[] = []): T[] {
      return db.prepare(sql).all(...params) as T[];
    },
    run(sql: string, params: unknown[] = []): void {
      db.prepare(sql).run(...params);
    },
    close(): void {
      db.close();
    },
    get instance() {
      return db;
    },
  };
}

function initSchema(db: BetterSqlite3.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      product_type TEXT,
      species TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'SE'
    );

    CREATE TABLE IF NOT EXISTS product_requirements (
      id INTEGER PRIMARY KEY,
      product_id TEXT REFERENCES products(id),
      sales_channel TEXT,
      registration_required INTEGER,
      approval_required INTEGER,
      temperature_control TEXT,
      traceability_requirements TEXT,
      labelling_requirements TEXT,
      regulation_ref TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'SE'
    );

    CREATE TABLE IF NOT EXISTS assurance_schemes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      product_types TEXT,
      standards_summary TEXT,
      audit_frequency TEXT,
      cost_indication TEXT,
      url TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'SE'
    );

    CREATE TABLE IF NOT EXISTS hygiene_rules (
      id INTEGER PRIMARY KEY,
      activity TEXT NOT NULL,
      premises_type TEXT,
      registration_type TEXT,
      haccp_required INTEGER,
      temperature_controls TEXT,
      cleaning_requirements TEXT,
      regulation_ref TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'SE'
    );

    CREATE TABLE IF NOT EXISTS raw_milk_rules (
      id INTEGER PRIMARY KEY,
      region TEXT NOT NULL,
      permitted INTEGER NOT NULL,
      sales_methods TEXT,
      conditions TEXT,
      warning_label_required INTEGER,
      regulation_ref TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'SE'
    );

    CREATE TABLE IF NOT EXISTS labelling_rules (
      id INTEGER PRIMARY KEY,
      product_type TEXT NOT NULL,
      field TEXT NOT NULL,
      mandatory INTEGER NOT NULL,
      format TEXT,
      regulation_ref TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'SE'
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
      title, body, product_type, jurisdiction
    );

    CREATE TABLE IF NOT EXISTS db_metadata (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    INSERT OR IGNORE INTO db_metadata (key, value) VALUES ('schema_version', '1.0');
    INSERT OR IGNORE INTO db_metadata (key, value) VALUES ('mcp_name', 'Sweden Food Safety MCP');
    INSERT OR IGNORE INTO db_metadata (key, value) VALUES ('jurisdiction', 'SE');
  `);
}

const FTS_COLUMNS = ['title', 'body', 'product_type', 'jurisdiction'];

export function ftsSearch(
  db: Database,
  query: string,
  limit: number = 20
): { title: string; body: string; product_type: string; jurisdiction: string; rank: number }[] {
  const { results } = tieredFtsSearch(db, 'search_index', FTS_COLUMNS, query, limit);
  return results as { title: string; body: string; product_type: string; jurisdiction: string; rank: number }[];
}

/**
 * Tiered FTS5 search with automatic fallback.
 * Tiers: exact phrase -> AND -> prefix -> stemmed prefix -> OR -> LIKE
 */
export function tieredFtsSearch(
  db: Database,
  table: string,
  columns: string[],
  query: string,
  limit: number = 20
): { tier: string; results: Record<string, unknown>[] } {
  const sanitized = sanitizeFtsInput(query);
  if (!sanitized.trim()) return { tier: 'empty', results: [] };

  const columnList = columns.join(', ');
  const select = `SELECT ${columnList}, rank FROM ${table}`;
  const order = `ORDER BY rank LIMIT ?`;

  // Tier 1: Exact phrase
  const phrase = `"${sanitized}"`;
  let results = tryFts(db, select, table, order, phrase, limit);
  if (results.length > 0) return { tier: 'phrase', results };

  // Tier 2: AND
  const words = sanitized.split(/\s+/).filter(w => w.length > 1);
  if (words.length > 1) {
    const andQuery = words.join(' AND ');
    results = tryFts(db, select, table, order, andQuery, limit);
    if (results.length > 0) return { tier: 'and', results };
  }

  // Tier 3: Prefix
  const prefixQuery = words.map(w => `${w}*`).join(' AND ');
  results = tryFts(db, select, table, order, prefixQuery, limit);
  if (results.length > 0) return { tier: 'prefix', results };

  // Tier 4: Stemmed prefix
  const stemmed = words.map(w => stemWord(w) + '*');
  const stemmedQuery = stemmed.join(' AND ');
  if (stemmedQuery !== prefixQuery) {
    results = tryFts(db, select, table, order, stemmedQuery, limit);
    if (results.length > 0) return { tier: 'stemmed', results };
  }

  // Tier 5: OR
  if (words.length > 1) {
    const orQuery = words.join(' OR ');
    results = tryFts(db, select, table, order, orQuery, limit);
    if (results.length > 0) return { tier: 'or', results };
  }

  // Tier 6: LIKE fallback — bypasses FTS, searches products table
  const baseCols = ['name', 'product_type'];
  const likeConditions = words.map(() =>
    `(${baseCols.map(c => `${c} LIKE ?`).join(' OR ')})`
  ).join(' AND ');
  const likeParams = words.flatMap(w =>
    baseCols.map(() => `%${w}%`)
  );
  try {
    const likeResults = db.all<Record<string, unknown>>(
      `SELECT name as title, COALESCE(species, '') as body, COALESCE(product_type, '') as product_type, jurisdiction FROM products WHERE ${likeConditions} LIMIT ?`,
      [...likeParams, limit]
    );
    if (likeResults.length > 0) return { tier: 'like', results: likeResults };
  } catch {
    // LIKE fallback failed
  }

  return { tier: 'none', results: [] };
}

function tryFts(
  db: Database, select: string, table: string,
  order: string, matchExpr: string, limit: number
): Record<string, unknown>[] {
  try {
    return db.all(
      `${select} WHERE ${table} MATCH ? ${order}`,
      [matchExpr, limit]
    );
  } catch {
    return [];
  }
}

/**
 * Sanitize FTS input, preserving Swedish characters (a-o-a with diacritics).
 */
function sanitizeFtsInput(query: string): string {
  return query
    .replace(/["\u201C\u201D\u2018\u2019\u201E\u201A\u00AB\u00BB]/g, '"')
    .replace(/[^a-zA-Z0-9\s*"_\-\u00E5\u00E4\u00F6\u00C5\u00C4\u00D6\u00E9\u00E8\u00FC\u00DF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stemWord(word: string): string {
  return word
    .replace(/(arna|erna|orna|ingar|ningar)$/i, '')
    .replace(/(ade|ande|ning|are|are|else|het|isk|igt|lig|tion|ar|er|or|en|et|na|ne)$/i, '')
    .replace(/(ies)$/i, 'y')
    .replace(/(ying|tion|ment|ness|able|ible|ous|ive|ing|ers|ed|es|er|ly|s)$/i, '');
}
