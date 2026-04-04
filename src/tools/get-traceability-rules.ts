import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface TraceabilityArgs {
  product_type: string;
  species?: string;
  jurisdiction?: string;
}

export function handleGetTraceabilityRules(db: Database, args: TraceabilityArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  let sql = `SELECT p.name, p.product_type, p.species, pr.traceability_requirements, pr.regulation_ref, pr.sales_channel
    FROM products p
    JOIN product_requirements pr ON p.id = pr.product_id
    WHERE LOWER(p.product_type) = LOWER(?) AND p.jurisdiction = ?`;
  const params: unknown[] = [args.product_type, jv.jurisdiction];

  if (args.species) {
    sql += ' AND LOWER(p.species) = LOWER(?)';
    params.push(args.species);
  }

  const rows = db.all<{
    name: string; product_type: string; species: string;
    traceability_requirements: string; regulation_ref: string; sales_channel: string;
  }>(sql, params);

  if (rows.length === 0) {
    // Broader search: try partial match on product_type
    const broader = db.all<{
      name: string; product_type: string; species: string;
      traceability_requirements: string; regulation_ref: string; sales_channel: string;
    }>(
      `SELECT p.name, p.product_type, p.species, pr.traceability_requirements, pr.regulation_ref, pr.sales_channel
       FROM products p
       JOIN product_requirements pr ON p.id = pr.product_id
       WHERE p.product_type LIKE ? AND p.jurisdiction = ?`,
      [`%${args.product_type}%`, jv.jurisdiction]
    );

    if (broader.length === 0) {
      return {
        error: 'not_found',
        message: `No traceability rules found for product type '${args.product_type}'.`,
      };
    }

    return formatResult(broader, args.product_type, jv.jurisdiction);
  }

  return formatResult(rows, args.product_type, jv.jurisdiction);
}

function formatResult(
  rows: { name: string; product_type: string; species: string; traceability_requirements: string; regulation_ref: string; sales_channel: string }[],
  productType: string,
  jurisdiction: string
) {
  return {
    product_type: productType,
    jurisdiction,
    results_count: rows.length,
    rules: rows.map(r => ({
      product: r.name,
      product_type: r.product_type,
      species: r.species,
      sales_channel: r.sales_channel,
      traceability_requirements: r.traceability_requirements,
      regulation_ref: r.regulation_ref,
    })),
    _meta: buildMeta({ source_url: 'https://www.livsmedelsverket.se/' }),
  };
}
