import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface AssuranceArgs {
  scheme?: string;
  product_type?: string;
  jurisdiction?: string;
}

export function handleGetAssuranceSchemeRequirements(db: Database, args: AssuranceArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  if (args.scheme) {
    const scheme = db.get<{
      id: string; name: string; product_types: string; standards_summary: string;
      audit_frequency: string; cost_indication: string; url: string;
    }>(
      'SELECT * FROM assurance_schemes WHERE (id = ? OR LOWER(name) LIKE LOWER(?)) AND jurisdiction = ?',
      [args.scheme, `%${args.scheme}%`, jv.jurisdiction]
    );

    if (!scheme) {
      return {
        error: 'not_found',
        message: `Assurance scheme '${args.scheme}' not found. Omit the scheme parameter to list all schemes.`,
      };
    }

    return {
      scheme: scheme.name,
      scheme_id: scheme.id,
      product_types: scheme.product_types,
      standards_summary: scheme.standards_summary,
      audit_frequency: scheme.audit_frequency,
      cost_indication: scheme.cost_indication,
      url: scheme.url,
      jurisdiction: jv.jurisdiction,
      _meta: buildMeta({ source_url: scheme.url ?? 'https://www.livsmedelsverket.se/' }),
    };
  }

  // List all schemes, optionally filtered by product type
  let sql = 'SELECT * FROM assurance_schemes WHERE jurisdiction = ?';
  const params: unknown[] = [jv.jurisdiction];

  if (args.product_type) {
    sql += ' AND LOWER(product_types) LIKE LOWER(?)';
    params.push(`%${args.product_type}%`);
  }

  sql += ' ORDER BY name';

  const schemes = db.all<{
    id: string; name: string; product_types: string; standards_summary: string;
    audit_frequency: string; cost_indication: string; url: string;
  }>(sql, params);

  return {
    jurisdiction: jv.jurisdiction,
    filter_product_type: args.product_type ?? 'all',
    results_count: schemes.length,
    schemes: schemes.map(s => ({
      scheme_id: s.id,
      name: s.name,
      product_types: s.product_types,
      standards_summary: s.standards_summary,
      audit_frequency: s.audit_frequency,
      cost_indication: s.cost_indication,
      url: s.url,
    })),
    _meta: buildMeta(),
  };
}
