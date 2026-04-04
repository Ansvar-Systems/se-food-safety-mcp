import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleGetProductRequirements } from '../../src/tools/get-product-requirements.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-product-req.db';

describe('get_product_requirements', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns requirements for a valid product', () => {
    const result = handleGetProductRequirements(db, { product: 'prod-001' }) as any;
    expect(result).toBeDefined();
    expect(result.requirements).toBeDefined();
    expect(result.requirements.length).toBeGreaterThan(0);
  });

  it('finds product by name', () => {
    const result = handleGetProductRequirements(db, { product: 'Notkreaturskott' }) as any;
    expect(result).toBeDefined();
    expect(result.product).toBe('Notkreaturskott');
  });

  it('filters by sales channel', () => {
    const result = handleGetProductRequirements(db, { product: 'prod-001', sales_channel: 'gardsforjsaljning' }) as any;
    expect(result).toBeDefined();
  });

  it('returns error for nonexistent product', () => {
    const result = handleGetProductRequirements(db, { product: 'nonexistent' });
    expect(result).toHaveProperty('error', 'not_found');
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleGetProductRequirements(db, { product: 'prod-001', jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });
});
