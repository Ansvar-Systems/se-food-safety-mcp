import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface LabellingArgs {
  product: string;
  jurisdiction?: string;
}

export function handleGetLabellingRequirements(db: Database, args: LabellingArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  // Try exact product match first
  const product = db.get<{ id: string; name: string; product_type: string }>(
    'SELECT id, name, product_type FROM products WHERE (id = ? OR LOWER(name) = LOWER(?)) AND jurisdiction = ?',
    [args.product, args.product, jv.jurisdiction]
  );

  const productType = product?.product_type ?? args.product;

  // Get labelling rules for the product type
  const rules = db.all<{
    product_type: string; field: string; mandatory: number;
    format: string; regulation_ref: string;
  }>(
    `SELECT * FROM labelling_rules
     WHERE (LOWER(product_type) = LOWER(?) OR product_type = 'all')
     AND jurisdiction = ?
     ORDER BY mandatory DESC, field`,
    [productType, jv.jurisdiction]
  );

  if (rules.length === 0) {
    // Try broader match
    const broader = db.all<{
      product_type: string; field: string; mandatory: number;
      format: string; regulation_ref: string;
    }>(
      `SELECT * FROM labelling_rules
       WHERE jurisdiction = ?
       ORDER BY mandatory DESC, field`,
      [jv.jurisdiction]
    );

    if (broader.length === 0) {
      return {
        error: 'not_found',
        message: `No labelling rules found for '${args.product}'.`,
      };
    }

    return formatResult(broader, args.product, product?.name, jv.jurisdiction);
  }

  return formatResult(rules, productType, product?.name, jv.jurisdiction);
}

function formatResult(
  rules: { product_type: string; field: string; mandatory: number; format: string; regulation_ref: string }[],
  productType: string,
  productName: string | undefined,
  jurisdiction: string
) {
  const mandatory = rules.filter(r => r.mandatory);
  const optional = rules.filter(r => !r.mandatory);

  return {
    product: productName ?? productType,
    product_type: productType,
    jurisdiction,
    mandatory_fields: mandatory.map(r => ({
      field: r.field,
      format: r.format,
      regulation_ref: r.regulation_ref,
    })),
    optional_fields: optional.map(r => ({
      field: r.field,
      format: r.format,
      regulation_ref: r.regulation_ref,
    })),
    total_rules: rules.length,
    _meta: buildMeta({ source_url: 'https://www.livsmedelsverket.se/' }),
  };
}
