import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleSearchFoodSafety } from '../../src/tools/search-food-safety.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-search-food.db';

describe('search_food_safety', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns results for a valid query', () => {
    const result = handleSearchFoodSafety(db, { query: 'mjolk' }) as any;
    expect(result).toBeDefined();
    expect(result.results_count).toBeGreaterThan(0);
  });

  it('filters by product type', () => {
    const result = handleSearchFoodSafety(db, { query: 'forsaljning', product_type: 'meat' }) as any;
    expect(result).toBeDefined();
  });

  it('returns empty for nonexistent query', () => {
    const result = handleSearchFoodSafety(db, { query: 'zzz_nonexistent_zzz' }) as any;
    expect(result.results_count).toBe(0);
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleSearchFoodSafety(db, { query: 'test', jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });

  it('respects limit parameter', () => {
    const result = handleSearchFoodSafety(db, { query: 'markning', limit: 1 }) as any;
    expect(result.results.length).toBeLessThanOrEqual(1);
  });
});
