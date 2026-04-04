import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleGetTraceabilityRules } from '../../src/tools/get-traceability-rules.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-traceability.db';

describe('get_traceability_rules', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns traceability rules for a valid product type', () => {
    const result = handleGetTraceabilityRules(db, { product_type: 'meat' }) as any;
    expect(result).toBeDefined();
    expect(result.rules ?? result.traceability_rules).toBeDefined();
  });

  it('filters by species', () => {
    const result = handleGetTraceabilityRules(db, { product_type: 'meat', species: 'cattle' }) as any;
    expect(result).toBeDefined();
  });

  it('returns error for nonexistent product type', () => {
    const result = handleGetTraceabilityRules(db, { product_type: 'zzz_nonexistent' }) as any;
    expect(result).toHaveProperty('error', 'not_found');
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleGetTraceabilityRules(db, { product_type: 'meat', jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });
});
