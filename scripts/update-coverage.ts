/**
 * Regenerate data/coverage.json from the current database.
 * Usage: npm run coverage:update
 */

import { createDatabase } from '../src/db.js';
import { writeFileSync } from 'fs';

const db = createDatabase();

const products = db.get<{ c: number }>('SELECT count(*) as c FROM products')!.c;
const requirements = db.get<{ c: number }>('SELECT count(*) as c FROM product_requirements')!.c;
const schemes = db.get<{ c: number }>('SELECT count(*) as c FROM assurance_schemes')!.c;
const hygiene = db.get<{ c: number }>('SELECT count(*) as c FROM hygiene_rules')!.c;
const rawMilk = db.get<{ c: number }>('SELECT count(*) as c FROM raw_milk_rules')!.c;
const labelling = db.get<{ c: number }>('SELECT count(*) as c FROM labelling_rules')!.c;
const fts = db.get<{ c: number }>('SELECT count(*) as c FROM search_index')!.c;
const lastIngest = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['last_ingest']);

db.close();

const coverage = {
  mcp_name: 'Sweden Food Safety MCP',
  jurisdiction: 'SE',
  build_date: lastIngest?.value ?? new Date().toISOString().split('T')[0],
  products,
  product_requirements: requirements,
  assurance_schemes: schemes,
  hygiene_rules: hygiene,
  raw_milk_rules: rawMilk,
  labelling_rules: labelling,
  fts_entries: fts,
};

writeFileSync('data/coverage.json', JSON.stringify(coverage, null, 2));
console.log('Updated data/coverage.json:', coverage);
