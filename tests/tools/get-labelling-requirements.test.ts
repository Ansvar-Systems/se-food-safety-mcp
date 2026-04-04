import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleGetLabellingRequirements } from '../../src/tools/get-labelling-requirements.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-labelling.db';

describe('get_labelling_requirements', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns labelling rules for meat', () => {
    const result = handleGetLabellingRequirements(db, { product: 'meat' }) as any;
    expect(result).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('returns labelling rules for honey', () => {
    const result = handleGetLabellingRequirements(db, { product: 'honey' }) as any;
    expect(result).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('finds product by ID and uses product_type', () => {
    const result = handleGetLabellingRequirements(db, { product: 'prod-001' }) as any;
    expect(result).toBeDefined();
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleGetLabellingRequirements(db, { product: 'meat', jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });
});
