import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface RawMilkArgs {
  region?: string;
  sales_method?: string;
  jurisdiction?: string;
}

export function handleCheckRawMilkRules(db: Database, args: RawMilkArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  let sql = 'SELECT * FROM raw_milk_rules WHERE jurisdiction = ?';
  const params: unknown[] = [jv.jurisdiction];

  if (args.region) {
    sql += ' AND LOWER(region) LIKE LOWER(?)';
    params.push(`%${args.region}%`);
  }

  const rules = db.all<{
    id: number; region: string; permitted: number; sales_methods: string;
    conditions: string; warning_label_required: number; regulation_ref: string;
  }>(sql, params);

  if (rules.length === 0) {
    return {
      error: 'not_found',
      message: `No raw milk rules found` + (args.region ? ` for region '${args.region}'` : '') + '.',
    };
  }

  let filteredRules = rules;
  if (args.sales_method) {
    filteredRules = rules.filter(r =>
      r.sales_methods?.toLowerCase().includes(args.sales_method!.toLowerCase())
    );
    if (filteredRules.length === 0) {
      // Return all rules with a note about the filter
      return {
        jurisdiction: jv.jurisdiction,
        sales_method_filter: args.sales_method,
        note: `No rules specifically matching sales method '${args.sales_method}'. Showing all raw milk rules.`,
        results_count: rules.length,
        rules: rules.map(formatRule),
        _meta: buildMeta({ source_url: 'https://www.jordbruksverket.se/' }),
      };
    }
  }

  return {
    jurisdiction: jv.jurisdiction,
    region: args.region ?? 'all',
    sales_method: args.sales_method ?? 'all',
    results_count: filteredRules.length,
    rules: filteredRules.map(formatRule),
    _meta: buildMeta({ source_url: 'https://www.jordbruksverket.se/' }),
  };
}

function formatRule(r: {
  region: string; permitted: number; sales_methods: string;
  conditions: string; warning_label_required: number; regulation_ref: string;
}) {
  return {
    region: r.region,
    permitted: Boolean(r.permitted),
    sales_methods: r.sales_methods,
    conditions: r.conditions,
    warning_label_required: Boolean(r.warning_label_required),
    regulation_ref: r.regulation_ref,
  };
}
