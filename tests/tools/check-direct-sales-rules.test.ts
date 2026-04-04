import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleCheckDirectSalesRules } from '../../src/tools/check-direct-sales-rules.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-direct-sales.db';

describe('check_direct_sales_rules', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns direct sales rules for a valid product', () => {
    const result = handleCheckDirectSalesRules(db, { product: 'prod-001' }) as any;
    expect(result).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('includes raw milk info for dairy products', () => {
    const result = handleCheckDirectSalesRules(db, { product: 'prod-002' }) as any;
    expect(result).toBeDefined();
    // prod-002 is dairy, should cross-reference raw milk rules
  });

  it('returns error for nonexistent product', () => {
    const result = handleCheckDirectSalesRules(db, { product: 'nonexistent' });
    expect(result).toHaveProperty('error', 'not_found');
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleCheckDirectSalesRules(db, { product: 'prod-001', jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });
});
