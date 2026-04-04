import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface DirectSalesArgs {
  product: string;
  sales_method?: string;
  volume?: string;
  jurisdiction?: string;
}

export function handleCheckDirectSalesRules(db: Database, args: DirectSalesArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  // Find matching product
  const product = db.get<{ id: string; name: string; product_type: string }>(
    'SELECT id, name, product_type FROM products WHERE (id = ? OR LOWER(name) = LOWER(?)) AND jurisdiction = ?',
    [args.product, args.product, jv.jurisdiction]
  );

  if (!product) {
    return {
      error: 'not_found',
      message: `Product '${args.product}' not found. Use search_food_safety to find available products.`,
    };
  }

  // Get direct sales requirements (gardsforjsaljning)
  const directRules = db.all<{
    sales_channel: string; registration_required: number; approval_required: number;
    temperature_control: string; traceability_requirements: string;
    labelling_requirements: string; regulation_ref: string;
  }>(
    `SELECT * FROM product_requirements
     WHERE product_id = ? AND jurisdiction = ?
     AND (LOWER(sales_channel) LIKE '%direkt%' OR LOWER(sales_channel) LIKE '%gard%' OR LOWER(sales_channel) LIKE '%farm%' OR sales_channel IS NULL)`,
    [product.id, jv.jurisdiction]
  );

  // Also check raw_milk_rules if the product is milk-related
  let rawMilkInfo = null;
  if (product.product_type === 'dairy' || product.name.toLowerCase().includes('mjolk') || product.name.toLowerCase().includes('mjölk')) {
    const rawMilk = db.all<{
      region: string; permitted: number; sales_methods: string;
      conditions: string; warning_label_required: number; regulation_ref: string;
    }>(
      'SELECT * FROM raw_milk_rules WHERE jurisdiction = ?',
      [jv.jurisdiction]
    );
    if (rawMilk.length > 0) {
      rawMilkInfo = rawMilk.map(r => ({
        region: r.region,
        permitted: Boolean(r.permitted),
        sales_methods: r.sales_methods,
        conditions: r.conditions,
        warning_label_required: Boolean(r.warning_label_required),
        regulation_ref: r.regulation_ref,
      }));
    }
  }

  if (directRules.length === 0 && !rawMilkInfo) {
    return {
      error: 'not_found',
      message: `No direct sales rules found for '${product.name}'. General product requirements may still apply.`,
    };
  }

  return {
    product: product.name,
    product_id: product.id,
    product_type: product.product_type,
    jurisdiction: jv.jurisdiction,
    sales_method: args.sales_method ?? 'all',
    volume: args.volume ?? 'not specified',
    direct_sales_rules: directRules.map(r => ({
      sales_channel: r.sales_channel,
      registration_required: Boolean(r.registration_required),
      approval_required: Boolean(r.approval_required),
      temperature_control: r.temperature_control,
      traceability_requirements: r.traceability_requirements,
      labelling_requirements: r.labelling_requirements,
      regulation_ref: r.regulation_ref,
    })),
    ...(rawMilkInfo ? { raw_milk_rules: rawMilkInfo } : {}),
    _meta: buildMeta({ source_url: 'https://www.livsmedelsverket.se/' }),
  };
}
