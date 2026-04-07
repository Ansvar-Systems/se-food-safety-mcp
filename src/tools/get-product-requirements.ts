import { buildCitation } from '../citation.js';
import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface ProductRequirementsArgs {
  product: string;
  sales_channel?: string;
  jurisdiction?: string;
}

export function handleGetProductRequirements(db: Database, args: ProductRequirementsArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  // Look up the product
  const product = db.get<{ id: string; name: string; product_type: string; species: string }>(
    'SELECT * FROM products WHERE (id = ? OR LOWER(name) = LOWER(?)) AND jurisdiction = ?',
    [args.product, args.product, jv.jurisdiction]
  );

  if (!product) {
    return {
      error: 'not_found',
      message: `Product '${args.product}' not found. Use search_food_safety to find available products.`,
    };
  }

  let sql = `SELECT * FROM product_requirements WHERE product_id = ? AND jurisdiction = ?`;
  const params: unknown[] = [product.id, jv.jurisdiction];

  if (args.sales_channel) {
    sql += ' AND (LOWER(sales_channel) = LOWER(?) OR sales_channel IS NULL)';
    params.push(args.sales_channel);
  }

  const requirements = db.all<{
    id: number; sales_channel: string; registration_required: number;
    approval_required: number; temperature_control: string;
    traceability_requirements: string; labelling_requirements: string;
    regulation_ref: string;
  }>(sql, params);

  if (requirements.length === 0) {
    return {
      error: 'not_found',
      message: `No requirements found for '${product.name}'` +
        (args.sales_channel ? ` in sales channel '${args.sales_channel}'` : '') + '.',
    };
  }

  return {
    product: product.name,
    product_id: product.id,
    product_type: product.product_type,
    jurisdiction: jv.jurisdiction,
    requirements: requirements.map(r => ({
      sales_channel: r.sales_channel,
      registration_required: Boolean(r.registration_required),
      approval_required: Boolean(r.approval_required),
      temperature_control: r.temperature_control,
      traceability_requirements: r.traceability_requirements,
      labelling_requirements: r.labelling_requirements,
      regulation_ref: r.regulation_ref,
    })),
    _citation: buildCitation(`SE product requirements — ${args.product ?? ''}`, `product requirements (${args.product ?? ''})`, 'get_product_requirements', { product: String(args.product ?? '') }, 'https://www.livsmedelsverket.se/'),
    _meta: buildMeta({ source_url: 'https://www.livsmedelsverket.se/' }),
  };
}
