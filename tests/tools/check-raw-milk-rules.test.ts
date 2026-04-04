import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleCheckRawMilkRules } from '../../src/tools/check-raw-milk-rules.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-raw-milk.db';

describe('check_raw_milk_rules', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns raw milk rules for Sweden', () => {
    const result = handleCheckRawMilkRules(db, {}) as any;
    expect(result).toBeDefined();
    expect(result.results_count).toBeGreaterThan(0);
  });

  it('includes permitted status and warning label requirement', () => {
    const result = handleCheckRawMilkRules(db, {}) as any;
    const rules = result.rules;
    expect(rules[0]).toHaveProperty('permitted');
    expect(rules[0]).toHaveProperty('warning_label_required');
  });

  it('filters by region', () => {
    const result = handleCheckRawMilkRules(db, { region: 'hela Sverige' }) as any;
    expect(result.results_count).toBeGreaterThan(0);
  });

  it('returns error for nonexistent region', () => {
    const result = handleCheckRawMilkRules(db, { region: 'zzz_nonexistent' }) as any;
    expect(result).toHaveProperty('error', 'not_found');
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleCheckRawMilkRules(db, { jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });
});
