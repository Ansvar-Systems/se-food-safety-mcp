import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleGetHygieneRequirements } from '../../src/tools/get-hygiene-requirements.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-hygiene.db';

describe('get_hygiene_requirements', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns hygiene rules for slakt', () => {
    const result = handleGetHygieneRequirements(db, { activity: 'slakt' }) as any;
    expect(result).toBeDefined();
    expect(result.results_count).toBeGreaterThan(0);
    expect(result.rules[0].haccp_required).toBe(true);
  });

  it('filters by premises type', () => {
    const result = handleGetHygieneRequirements(db, { activity: 'slakt', premises_type: 'gard' }) as any;
    expect(result.results_count).toBeGreaterThan(0);
  });

  it('returns error for unknown activity', () => {
    const result = handleGetHygieneRequirements(db, { activity: 'zzz_nonexistent' }) as any;
    expect(result).toHaveProperty('error', 'not_found');
  });

  it('includes temperature controls', () => {
    const result = handleGetHygieneRequirements(db, { activity: 'slakt' }) as any;
    expect(result.rules[0].temperature_controls).toBeDefined();
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleGetHygieneRequirements(db, { activity: 'slakt', jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });
});
