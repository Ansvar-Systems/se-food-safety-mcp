import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface HygieneArgs {
  activity: string;
  premises_type?: string;
  jurisdiction?: string;
}

export function handleGetHygieneRequirements(db: Database, args: HygieneArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  let sql = `SELECT * FROM hygiene_rules WHERE LOWER(activity) LIKE LOWER(?) AND jurisdiction = ?`;
  const params: unknown[] = [`%${args.activity}%`, jv.jurisdiction];

  if (args.premises_type) {
    sql += ' AND LOWER(premises_type) LIKE LOWER(?)';
    params.push(`%${args.premises_type}%`);
  }

  const rules = db.all<{
    id: number; activity: string; premises_type: string; registration_type: string;
    haccp_required: number; temperature_controls: string;
    cleaning_requirements: string; regulation_ref: string;
  }>(sql, params);

  if (rules.length === 0) {
    return {
      error: 'not_found',
      message: `No hygiene rules found for activity '${args.activity}'` +
        (args.premises_type ? ` at premises type '${args.premises_type}'` : '') +
        '. Try broader search terms.',
    };
  }

  return {
    activity: args.activity,
    premises_type: args.premises_type ?? 'all',
    jurisdiction: jv.jurisdiction,
    results_count: rules.length,
    rules: rules.map(r => ({
      activity: r.activity,
      premises_type: r.premises_type,
      registration_type: r.registration_type,
      haccp_required: Boolean(r.haccp_required),
      temperature_controls: r.temperature_controls,
      cleaning_requirements: r.cleaning_requirements,
      regulation_ref: r.regulation_ref,
    })),
    _meta: buildMeta({ source_url: 'https://www.livsmedelsverket.se/' }),
  };
}
