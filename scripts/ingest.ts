/**
 * Sweden Food Safety MCP -- Data Ingestion Script
 *
 * Sources:
 * - Livsmedelsverket (Swedish Food Agency)
 * - Jordbruksverket (Swedish Board of Agriculture)
 * - EU Regulation 852/2004, 853/2004
 * - LIVSFS (Swedish food regulation series)
 *
 * Usage: npm run ingest
 */

import { createDatabase } from '../src/db.js';
import { mkdirSync, writeFileSync } from 'fs';

mkdirSync('data', { recursive: true });
const db = createDatabase('data/database.db');

const now = new Date().toISOString().split('T')[0];

// ---------------------------------------------------------------------------
// PRODUCTS (15+ Swedish food products)
// ---------------------------------------------------------------------------
const products = [
  { id: 'notkott', name: 'Notkott', product_type: 'meat', species: 'bovine' },
  { id: 'flaskkott', name: 'Flaskkott', product_type: 'meat', species: 'porcine' },
  { id: 'kycklingkott', name: 'Kycklingkott', product_type: 'meat', species: 'poultry' },
  { id: 'agg', name: 'Agg', product_type: 'eggs', species: 'poultry' },
  { id: 'mjolk', name: 'Mjolk', product_type: 'dairy', species: 'bovine' },
  { id: 'smor', name: 'Smor', product_type: 'dairy', species: 'bovine' },
  { id: 'ost', name: 'Ost', product_type: 'dairy', species: 'bovine' },
  { id: 'honung', name: 'Honung', product_type: 'honey', species: 'bee' },
  { id: 'jordgubbar', name: 'Jordgubbar', product_type: 'produce', species: null },
  { id: 'potatis', name: 'Potatis', product_type: 'produce', species: null },
  { id: 'morottor', name: 'Morottor', product_type: 'produce', species: null },
  { id: 'lok', name: 'Lok', product_type: 'produce', species: null },
  { id: 'brod', name: 'Brod', product_type: 'bakery', species: null },
  { id: 'korv', name: 'Korv', product_type: 'meat', species: 'mixed' },
  { id: 'rokta-produkter', name: 'Rokta produkter', product_type: 'smoked', species: 'mixed' },
  { id: 'lax', name: 'Lax', product_type: 'fish', species: 'salmon' },
  { id: 'renkott', name: 'Renkott', product_type: 'meat', species: 'reindeer' },
];

const insertProduct = db.instance.prepare(
  'INSERT OR REPLACE INTO products (id, name, product_type, species, jurisdiction) VALUES (?, ?, ?, ?, ?)'
);

for (const p of products) {
  insertProduct.run(p.id, p.name, p.product_type, p.species, 'SE');
}
console.log(`Inserted ${products.length} products`);

// ---------------------------------------------------------------------------
// PRODUCT REQUIREMENTS (20+ entries)
// ---------------------------------------------------------------------------
const productRequirements = [
  // Notkott (beef)
  { product_id: 'notkott', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Max 7 C for fresh meat; -18 C for frozen', traceability_requirements: 'Batch number, slaughter date, origin (born/raised/slaughtered), individual animal ID (ear tag). EU Reg 1760/2000 beef labelling.', labelling_requirements: 'Origin country mandatory (born, raised, slaughtered). Cut name, weight, best-before date.', regulation_ref: 'EU Reg 853/2004 Annex III Section I; LIVSFS 2005:20; EU Reg 1760/2000' },
  { product_id: 'notkott', sales_channel: 'direct', registration_required: 1, approval_required: 0, temperature_control: 'Max 7 C, cold chain from slaughter to consumer', traceability_requirements: 'Simplified for small volumes to end consumer. Producer must keep records of animals slaughtered and sold.', labelling_requirements: 'Origin, weight, date of slaughter or packaging, producer contact details.', regulation_ref: 'LIVSFS 2005:20; Jordbruksverket SJVFS 2019:25' },
  // Flaskkott (pork)
  { product_id: 'flaskkott', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Max 7 C fresh; max 4 C minced; -18 C frozen', traceability_requirements: 'Batch number, slaughter date, origin (reared/slaughtered). EU Reg 1337/2013 origin labelling for pork.', labelling_requirements: 'Origin mandatory (reared in, slaughtered in). Cut name, weight, best-before, allergen info if processed.', regulation_ref: 'EU Reg 853/2004 Annex III Section I; EU Reg 1337/2013; LIVSFS 2005:20' },
  { product_id: 'flaskkott', sales_channel: 'direct', registration_required: 1, approval_required: 0, temperature_control: 'Max 7 C fresh, cold chain maintained', traceability_requirements: 'Producer records: animals slaughtered, quantities sold, dates. Simplified for gårdsförsäljning.', labelling_requirements: 'Producer name and address, weight, date, storage instructions.', regulation_ref: 'LIVSFS 2005:20; SJVFS 2019:25' },
  // Kycklingkott (chicken)
  { product_id: 'kycklingkott', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Max 4 C fresh; -18 C frozen. Salmonella-free (Swedish national programme).', traceability_requirements: 'Batch traceability, flock ID, slaughter date. Sweden salmonella guarantee applies.', labelling_requirements: 'Origin, weight, use-by date (not best-before), storage temperature. Salmonella status if exported.', regulation_ref: 'EU Reg 853/2004 Annex III Section II; SJVFS 2007:90 (salmonella)' },
  // Agg (eggs)
  { product_id: 'agg', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Store at stable temperature, avoid condensation. Best-before 28 days from laying.', traceability_requirements: 'Each Class A egg stamped with producer code (farming method + country + producer ID). Batch records at packing centre.', labelling_requirements: 'Class (A), weight grade (S/M/L/XL), farming method, best-before date (max 28 days), producer code stamp on egg.', regulation_ref: 'EU Reg 589/2008; EU Reg 1308/2013; LIVSFS 2005:20' },
  { product_id: 'agg', sales_channel: 'direct', registration_required: 0, approval_required: 0, temperature_control: 'Stable temperature, no washing required for farm-gate sales', traceability_requirements: 'Records of flock size and eggs sold. Salmonella testing as per Swedish national guarantee.', labelling_requirements: 'Farming method, best-before date, producer name. Egg stamping not required for direct farm-gate sales under 10,000 hens.', regulation_ref: 'EU Reg 589/2008 Art 2; SJVFS 2007:90; LIVSFS 2005:20' },
  // Mjolk (milk)
  { product_id: 'mjolk', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Max 8 C. Pasteurisation mandatory for retail milk.', traceability_requirements: 'Dairy ID, batch number, pasteurisation records, supplier herd registration.', labelling_requirements: 'Fat content, pasteurised/UHT, best-before, nutrition declaration, origin if Swedish.', regulation_ref: 'EU Reg 853/2004 Annex III Section IX; LIVSFS 2005:20' },
  { product_id: 'mjolk', sales_channel: 'direct', registration_required: 1, approval_required: 0, temperature_control: 'Max 8 C. Raw milk: must be cooled within 2 hours of milking.', traceability_requirements: 'Herd registration, TB and brucellosis free status, milking records.', labelling_requirements: 'If raw milk: clear label stating opastöriserad (unpasteurised), risk warning, producer details.', regulation_ref: 'EU Reg 853/2004 Annex III Section IX; Jordbruksverket raw milk guidelines' },
  // Smor (butter)
  { product_id: 'smor', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Max 8 C storage', traceability_requirements: 'Dairy approval number, batch, cream source records.', labelling_requirements: 'Fat content (min 80% for butter), salt content, origin, best-before, nutrition declaration.', regulation_ref: 'EU Reg 1308/2013 Annex VII Part VII; LIVSFS 2005:20' },
  // Ost (cheese)
  { product_id: 'ost', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Temperature varies by type: fresh cheese max 8 C, hard cheese ambient acceptable', traceability_requirements: 'Dairy approval number, milk source, batch, maturation records.', labelling_requirements: 'Fat content (in dry matter), milk type, origin, best-before or use-by, allergens (milk).', regulation_ref: 'EU Reg 853/2004 Annex III Section IX; LIVSFS 2005:20' },
  // Honung (honey)
  { product_id: 'honung', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Ambient storage. Avoid heat above 40 C.', traceability_requirements: 'Country of origin mandatory. Batch number, harvest date, beekeeper registration.', labelling_requirements: 'Country of origin (mandatory, specific country names), batch number, weight, beekeeper/producer ID, best-before date. "Blandning av honung" if blended origins.', regulation_ref: 'EU Directive 2001/110/EC (Honey Directive); LIVSFS 2003:10' },
  { product_id: 'honung', sales_channel: 'direct', registration_required: 0, approval_required: 0, temperature_control: 'Ambient, protected from sunlight', traceability_requirements: 'Beekeeper must be registered with Jordbruksverket. Records of apiaries and harvest dates.', labelling_requirements: 'Country of origin, producer name and address, weight, best-before date.', regulation_ref: 'EU Directive 2001/110/EC; LIVSFS 2003:10' },
  // Jordgubbar (strawberries)
  { product_id: 'jordgubbar', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Max 8 C recommended. Perishable, short shelf life.', traceability_requirements: 'Supplier, harvest date, lot number. Pesticide residue records (MRL compliance).', labelling_requirements: 'Origin country, class (Extra/I/II), weight, variety optional. Pesticide treatment records available on request.', regulation_ref: 'EU Reg 543/2011 (marketing standards); EU Reg 396/2005 (MRLs); LIVSFS 2005:20' },
  { product_id: 'jordgubbar', sales_channel: 'direct', registration_required: 0, approval_required: 0, temperature_control: 'Cool storage recommended, no mandatory temperature', traceability_requirements: 'Farm records of pesticide use if applicable.', labelling_requirements: 'Origin, weight or count. Simplified for direct farm-gate sales to end consumer.', regulation_ref: 'EU Reg 543/2011; LIVSFS 2005:20' },
  // Potatis
  { product_id: 'potatis', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Cool, dark storage. No specific temperature regulation.', traceability_requirements: 'Supplier, variety, lot number, country of origin.', labelling_requirements: 'Origin country, variety, weight class, quality class.', regulation_ref: 'EU Reg 543/2011; LIVSFS 2005:20' },
  // Morottor (carrots)
  { product_id: 'morottor', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Cool storage recommended', traceability_requirements: 'Supplier, lot number, origin.', labelling_requirements: 'Origin country, class, weight.', regulation_ref: 'EU Reg 543/2011; LIVSFS 2005:20' },
  // Lok (onions)
  { product_id: 'lok', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Dry, cool, ventilated storage', traceability_requirements: 'Supplier, lot number, origin.', labelling_requirements: 'Origin country, weight.', regulation_ref: 'EU Reg 543/2011; LIVSFS 2005:20' },
  // Brod (bread)
  { product_id: 'brod', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Ambient. Best-before applies.', traceability_requirements: 'Ingredient supplier records, batch number, production date.', labelling_requirements: 'Ingredients list (descending order), allergens (gluten, milk, eggs, sesame etc. highlighted), weight, best-before, nutrition declaration, producer.', regulation_ref: 'EU Reg 1169/2011 (FIC); LIVSFS 2005:20' },
  // Korv (sausage)
  { product_id: 'korv', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Max 8 C for fresh korv; ambient for dried/cured korv', traceability_requirements: 'Meat origin, batch number, production date, processing establishment approval number.', labelling_requirements: 'Ingredients (including meat content %), origin of meat, allergens, nutrition declaration, use-by or best-before, approval mark.', regulation_ref: 'EU Reg 853/2004; EU Reg 1169/2011; LIVSFS 2005:20' },
  // Rokta produkter (smoked products)
  { product_id: 'rokta-produkter', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Varies: cold-smoked max 8 C; hot-smoked max 8 C or ambient if shelf-stable', traceability_requirements: 'Raw material origin, smoking process records (time, temperature, wood type), batch number.', labelling_requirements: 'Ingredients, smoking method, origin, allergens, nutrition declaration, storage instructions.', regulation_ref: 'EU Reg 853/2004; EU Reg 1169/2011; LIVSFS 2005:20; EU Reg 835/2011 (PAH limits)' },
  // Lax (salmon)
  { product_id: 'lax', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Max 2 C fresh (on ice); -18 C frozen', traceability_requirements: 'Catch area or aquaculture site, species (Latin name), batch, landing/harvest date.', labelling_requirements: 'Species (common + Latin name), production method (caught/farmed), catch area (FAO zone), origin country if farmed.', regulation_ref: 'EU Reg 1379/2013 (CMO fisheries); EU Reg 853/2004; LIVSFS 2005:20' },
  // Renkott (reindeer meat)
  { product_id: 'renkott', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Max 7 C fresh; -18 C frozen', traceability_requirements: 'Slaughter approval, herd owner, reindeer mark (renmärke), batch number.', labelling_requirements: 'Origin (Sweden), species, cut, weight, best-before, producer/slaughterhouse.', regulation_ref: 'EU Reg 853/2004; SJVFS 2019:25; Sametinget reindeer regulations' },
  { product_id: 'renkott', sales_channel: 'direct', registration_required: 1, approval_required: 0, temperature_control: 'Max 7 C, cold chain from slaughter', traceability_requirements: 'Reindeer herder registration with Sametinget, slaughter records.', labelling_requirements: 'Producer name, origin, weight, date.', regulation_ref: 'SJVFS 2019:25; Sametinget guidelines' },
];

const insertReq = db.instance.prepare(
  `INSERT INTO product_requirements (product_id, sales_channel, registration_required, approval_required, temperature_control, traceability_requirements, labelling_requirements, regulation_ref, jurisdiction)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SE')`
);

for (const r of productRequirements) {
  insertReq.run(r.product_id, r.sales_channel, r.registration_required, r.approval_required, r.temperature_control, r.traceability_requirements, r.labelling_requirements, r.regulation_ref);
}
console.log(`Inserted ${productRequirements.length} product requirements`);

// ---------------------------------------------------------------------------
// ASSURANCE SCHEMES (Swedish quality marks)
// ---------------------------------------------------------------------------
const assuranceSchemes = [
  {
    id: 'ip-sigill',
    name: 'IP Sigill / Svenskt Sigill',
    product_types: 'meat, dairy, produce, grain, poultry, eggs',
    standards_summary: 'Good agricultural practice standard owned by LRF (Federation of Swedish Farmers). Covers food safety, animal welfare, environmental responsibility. Baseline for Swedish agricultural production. Certified farms follow IP Livsmedel (food) and IP Sigill (environment) standards.',
    audit_frequency: 'Annual third-party audit',
    cost_indication: 'Membership fee via LRF + audit costs (approx 5,000-15,000 SEK/year depending on farm size)',
    url: 'https://www.sigill.se/',
  },
  {
    id: 'krav',
    name: 'KRAV',
    product_types: 'meat, dairy, produce, grain, poultry, eggs, honey, fish, processed food',
    standards_summary: 'Swedish organic certification, stricter than EU organic regulation (EU 2018/848). Additional requirements on animal welfare (more space per animal, outdoor access mandatory), climate impact, social responsibility for workers. KRAV-certified products carry both KRAV logo and EU organic leaf.',
    audit_frequency: 'Annual third-party audit by accredited certification body',
    cost_indication: 'Inspection fee 3,000-20,000 SEK/year + KRAV licence fee based on turnover',
    url: 'https://www.krav.se/',
  },
  {
    id: 'naturbeteskott',
    name: 'Naturbeteskott fran Sverige',
    product_types: 'beef',
    standards_summary: 'Beef from cattle grazing natural pastures (naturbetesmarker). Animals must graze certified natural or semi-natural pastures during the grazing season (min 4 months). Supports biodiversity conservation. Managed by Naturbeteskott i Sverige.',
    audit_frequency: 'Annual verification of grazing records and pasture classification',
    cost_indication: 'Membership fee approximately 2,000-5,000 SEK/year',
    url: 'https://www.naturbete.se/',
  },
  {
    id: 'svensk-fagel',
    name: 'Svensk Fagel',
    product_types: 'poultry, eggs',
    standards_summary: 'Swedish poultry industry programme. Guarantees Swedish origin, salmonella control (all flocks tested, positive flocks destroyed), animal welfare standards above EU minimum. Max stocking density 36 kg/m2 (vs EU max 42). No preventive antibiotic use.',
    audit_frequency: 'Continuous salmonella monitoring + annual welfare audit',
    cost_indication: 'Included in industry membership for Swedish poultry producers',
    url: 'https://www.svenskfagel.se/',
  },
  {
    id: 'fran-sverige',
    name: 'Fran Sverige',
    product_types: 'meat, dairy, produce, grain, bakery, processed food',
    standards_summary: 'Origin mark guaranteeing that raw materials are Swedish, and processing and packaging occur in Sweden. Managed by Svenskmark. Not a quality or welfare standard per se, but verifies Swedish provenance. Widely recognised consumer label.',
    audit_frequency: 'Annual verification by Svenskmark',
    cost_indication: 'License fee based on product turnover',
    url: 'https://fransverige.se/',
  },
];

const insertScheme = db.instance.prepare(
  `INSERT OR REPLACE INTO assurance_schemes (id, name, product_types, standards_summary, audit_frequency, cost_indication, url, jurisdiction)
   VALUES (?, ?, ?, ?, ?, ?, ?, 'SE')`
);

for (const s of assuranceSchemes) {
  insertScheme.run(s.id, s.name, s.product_types, s.standards_summary, s.audit_frequency, s.cost_indication, s.url);
}
console.log(`Inserted ${assuranceSchemes.length} assurance schemes`);

// ---------------------------------------------------------------------------
// HYGIENE RULES (10+ entries)
// ---------------------------------------------------------------------------
const hygieneRules = [
  {
    activity: 'slaughter',
    premises_type: 'approved slaughterhouse',
    registration_type: 'Livsmedelsverket approval required',
    haccp_required: 1,
    temperature_controls: 'Carcass chilling to max 7 C within prescribed time. Cold chain mandatory throughout.',
    cleaning_requirements: 'Daily cleaning and disinfection of slaughter hall, equipment, knives. Documented cleaning schedule. Pre-operational hygiene checks.',
    regulation_ref: 'EU Reg 853/2004 Annex III Section I; EU Reg 852/2004 Annex II',
  },
  {
    activity: 'slaughter',
    premises_type: 'farm slaughterhouse (gardsslakteri)',
    registration_type: 'Livsmedelsverket approval required. Max 10,000 poultry or 1,000 rabbits per year for simplified approval.',
    haccp_required: 1,
    temperature_controls: 'Same temperature requirements as commercial slaughterhouse. Max 7 C for red meat, max 4 C for poultry.',
    cleaning_requirements: 'Cleaning and disinfection between batches. Documented procedures. Separate dirty and clean zones.',
    regulation_ref: 'EU Reg 853/2004 Annex III Section I; LIVSFS 2005:20; EU Reg 852/2004',
  },
  {
    activity: 'processing',
    premises_type: 'food processing facility',
    registration_type: 'Approval from Livsmedelsverket for animal-origin products. Registration with municipality (kommun) for other food.',
    haccp_required: 1,
    temperature_controls: 'Product-specific. Meat processing max 12 C in work areas. Cold storage max 7 C. Cooking to core temperature per product type.',
    cleaning_requirements: 'Documented cleaning schedule (CIP/COP). Validated cleaning procedures. Environmental monitoring for Listeria.',
    regulation_ref: 'EU Reg 852/2004 Annex II; EU Reg 853/2004; LIVSFS 2005:20',
  },
  {
    activity: 'processing',
    premises_type: 'small-scale (hemmaforadling)',
    registration_type: 'Registration with municipality for plant-origin products. Livsmedelsverket approval if animal products above threshold.',
    haccp_required: 1,
    temperature_controls: 'Same as commercial facilities but simplified HACCP procedures accepted for small operators.',
    cleaning_requirements: 'Cleaning between production runs. Separate storage for raw and processed products.',
    regulation_ref: 'EU Reg 852/2004; LIVSFS 2005:20 Ch. 3 (small-scale exemptions)',
  },
  {
    activity: 'storage',
    premises_type: 'cold storage facility',
    registration_type: 'Registration with municipality or Livsmedelsverket depending on products stored',
    haccp_required: 1,
    temperature_controls: 'Fresh meat max 7 C. Poultry max 4 C. Fish max 2 C (on ice). Frozen -18 C. Temperature logging mandatory.',
    cleaning_requirements: 'Regular cleaning of storage areas. Pest control programme. Temperature monitoring with alarms.',
    regulation_ref: 'EU Reg 852/2004 Annex II Ch. IX; EU Reg 853/2004',
  },
  {
    activity: 'transport',
    premises_type: 'food transport vehicle',
    registration_type: 'Registration with Livsmedelsverket for animal products. ATP certification for international transport.',
    haccp_required: 0,
    temperature_controls: 'Refrigerated vehicles: maintain product temperature throughout transport. Temperature logging required. ATP compliance for cross-border.',
    cleaning_requirements: 'Cleaning between loads, especially when switching between product types. Vehicle cleaning records.',
    regulation_ref: 'EU Reg 852/2004 Annex II Ch. IV; ATP Agreement (international)',
  },
  {
    activity: 'retail',
    premises_type: 'food retail store',
    registration_type: 'Registration with municipality (kommunens miljokontor)',
    haccp_required: 1,
    temperature_controls: 'Chilled display max 8 C. Frozen display -18 C. Deli counter products per product type. Temperature checks twice daily.',
    cleaning_requirements: 'Daily cleaning of display counters, cutting boards, slicers. Documented cleaning schedule.',
    regulation_ref: 'EU Reg 852/2004 Annex II; LIVSFS 2005:20',
  },
  {
    activity: 'restaurant',
    premises_type: 'restaurant / cafe',
    registration_type: 'Registration with municipality (kommunens miljokontor)',
    haccp_required: 1,
    temperature_controls: 'Cold holding max 8 C. Hot holding min 60 C. Reheating to min 72 C core. Cooling from 60 C to 8 C within 4 hours.',
    cleaning_requirements: 'Daily kitchen cleaning. Weekly deep clean. Separate chopping boards for raw/cooked. Allergen management procedures.',
    regulation_ref: 'EU Reg 852/2004 Annex II; LIVSFS 2005:20',
  },
  {
    activity: 'dairy processing',
    premises_type: 'dairy / mejeri',
    registration_type: 'Approval from Livsmedelsverket',
    haccp_required: 1,
    temperature_controls: 'Raw milk reception max 10 C. Pasteurisation min 72 C for 15 seconds (HTST) or equivalent. Product-specific post-pasteurisation storage.',
    cleaning_requirements: 'CIP systems validated. Environmental monitoring for Listeria. Water quality testing.',
    regulation_ref: 'EU Reg 853/2004 Annex III Section IX; EU Reg 852/2004',
  },
  {
    activity: 'egg packing',
    premises_type: 'egg packing centre',
    registration_type: 'Approval from Livsmedelsverket. Assigned packing centre code.',
    haccp_required: 1,
    temperature_controls: 'Stable temperature, avoid condensation. Eggs not washed in Sweden (dry cleaning only). Store away from odour sources.',
    cleaning_requirements: 'Cleaning of grading equipment between batches. Candling and grading equipment maintained.',
    regulation_ref: 'EU Reg 589/2008; EU Reg 853/2004 Annex III Section X',
  },
  {
    activity: 'honey extraction',
    premises_type: 'honey processing room',
    registration_type: 'Registration with municipality for commercial sale',
    haccp_required: 0,
    temperature_controls: 'Extraction at ambient (max 40 C to preserve enzymes). Storage ambient, dry conditions.',
    cleaning_requirements: 'Clean extraction equipment between apiaries. Stainless steel or food-grade plastic equipment.',
    regulation_ref: 'EU Reg 852/2004 Annex II; LIVSFS 2005:20',
  },
  {
    activity: 'fish processing',
    premises_type: 'fish processing facility',
    registration_type: 'Approval from Livsmedelsverket',
    haccp_required: 1,
    temperature_controls: 'Fresh fish max 2 C (melting ice). Processing area max 12 C. Smoked fish product-specific. Frozen -18 C.',
    cleaning_requirements: 'Cleaning after each production run. Histamine controls for tuna/mackerel family. Parasite control (freezing -20 C for 24h if eaten raw).',
    regulation_ref: 'EU Reg 853/2004 Annex III Section VIII; EU Reg 852/2004',
  },
];

const insertHygiene = db.instance.prepare(
  `INSERT INTO hygiene_rules (activity, premises_type, registration_type, haccp_required, temperature_controls, cleaning_requirements, regulation_ref, jurisdiction)
   VALUES (?, ?, ?, ?, ?, ?, ?, 'SE')`
);

for (const h of hygieneRules) {
  insertHygiene.run(h.activity, h.premises_type, h.registration_type, h.haccp_required, h.temperature_controls, h.cleaning_requirements, h.regulation_ref);
}
console.log(`Inserted ${hygieneRules.length} hygiene rules`);

// ---------------------------------------------------------------------------
// RAW MILK RULES
// ---------------------------------------------------------------------------
const rawMilkRules = [
  {
    region: 'National (hela Sverige)',
    permitted: 1,
    sales_methods: 'Direct from farm to end consumer only (gårdsförsäljning). No intermediary sales. Not permitted via shops, restaurants, or online delivery.',
    conditions: 'Herd must be officially free from tuberculosis (TB) and brucellosis. Regular veterinary inspections. Milk must be cooled to max 8 C within 2 hours of milking. Producer must inform consumer that milk is unpasteurised (opastöriserad) and of associated health risks. Not recommended for children, elderly, pregnant women, or immunocompromised individuals.',
    warning_label_required: 1,
    regulation_ref: 'EU Reg 853/2004 Annex III Section IX Ch. IV; Jordbruksverket guidelines; LIVSFS 2005:20',
  },
  {
    region: 'National (hela Sverige)',
    permitted: 0,
    sales_methods: 'Retail, shops, restaurants, online delivery, any intermediary channel',
    conditions: 'Raw milk sale through retail channels is NOT permitted in Sweden. All milk sold through shops must be pasteurised or heat-treated (UHT/ESL). Restaurants may not serve raw milk.',
    warning_label_required: 0,
    regulation_ref: 'EU Reg 853/2004 Annex III Section IX; LIVSFS 2005:20; Livsmedelsverket position on raw milk',
  },
  {
    region: 'National (hela Sverige)',
    permitted: 1,
    sales_methods: 'Raw milk cheese production (ostar av opastöriserad mjölk)',
    conditions: 'Raw milk cheese is permitted for sale if aged for sufficient time to reduce pathogen risk (varies by cheese type, typically >60 days for hard cheese). Producer must have Livsmedelsverket approval. HACCP with specific critical control points for raw milk cheese. Microbiological testing regime required.',
    warning_label_required: 1,
    regulation_ref: 'EU Reg 853/2004 Annex III Section IX; EU Reg 2073/2005 (microbiological criteria); LIVSFS 2005:20',
  },
];

const insertRawMilk = db.instance.prepare(
  `INSERT INTO raw_milk_rules (region, permitted, sales_methods, conditions, warning_label_required, regulation_ref, jurisdiction)
   VALUES (?, ?, ?, ?, ?, ?, 'SE')`
);

for (const r of rawMilkRules) {
  insertRawMilk.run(r.region, r.permitted, r.sales_methods, r.conditions, r.warning_label_required, r.regulation_ref);
}
console.log(`Inserted ${rawMilkRules.length} raw milk rules`);

// ---------------------------------------------------------------------------
// LABELLING RULES (EU FIC 1169/2011 + Swedish additions)
// ---------------------------------------------------------------------------
const labellingRules = [
  // Mandatory fields applicable to all pre-packed food
  { product_type: 'all', field: 'Ingredients list', mandatory: 1, format: 'Descending order by weight. Allergens highlighted (bold, underline, or CAPS).', regulation_ref: 'EU Reg 1169/2011 Art 18-20' },
  { product_type: 'all', field: 'Allergen declaration', mandatory: 1, format: '14 mandatory allergens: gluten, crustaceans, eggs, fish, peanuts, soy, milk, tree nuts, celery, mustard, sesame, sulphites (>10 mg/kg), lupin, molluscs. Must be emphasised in ingredients list.', regulation_ref: 'EU Reg 1169/2011 Art 21, Annex II' },
  { product_type: 'all', field: 'Nutrition declaration', mandatory: 1, format: 'Per 100g/100ml: energy (kJ/kcal), fat, saturated fat, carbohydrates, sugars, protein, salt. Per portion optional.', regulation_ref: 'EU Reg 1169/2011 Art 29-35' },
  { product_type: 'all', field: 'Net quantity', mandatory: 1, format: 'Weight (g/kg) or volume (ml/l). Font size per EU rules based on package surface area.', regulation_ref: 'EU Reg 1169/2011 Art 23; EU Directive 76/211/EEC' },
  { product_type: 'all', field: 'Date marking', mandatory: 1, format: 'Best-before (bast fore) for shelf-stable; use-by (sista forbrukningsdag) for perishable. Day/month/year format.', regulation_ref: 'EU Reg 1169/2011 Art 24, Annex X' },
  { product_type: 'all', field: 'Storage conditions', mandatory: 1, format: 'Required when specific storage conditions affect shelf life (e.g. "Förvaras i kylskåp, max 8°C").', regulation_ref: 'EU Reg 1169/2011 Art 25' },
  { product_type: 'all', field: 'Producer / business name and address', mandatory: 1, format: 'Name and address of the food business operator responsible for the product in the EU.', regulation_ref: 'EU Reg 1169/2011 Art 8' },
  { product_type: 'all', field: 'Lot number', mandatory: 1, format: 'Batch/lot identification prefixed with "L" (e.g. L2026-04-01). Enables traceability and recall.', regulation_ref: 'EU Directive 2011/91/EU' },
  { product_type: 'all', field: 'Country of origin', mandatory: 0, format: 'Mandatory for: beef, pork, poultry, lamb, honey, olive oil, fruit/veg, fish. Voluntary for other foods unless omission is misleading.', regulation_ref: 'EU Reg 1169/2011 Art 26; EU Reg 1337/2013 (meat); EU Reg 1760/2000 (beef)' },
  { product_type: 'all', field: 'Language', mandatory: 1, format: 'Labels must be in Swedish (svenska) for products sold in Sweden. Additional languages permitted.', regulation_ref: 'EU Reg 1169/2011 Art 15; LIVSFS 2005:20' },
  // Product-specific mandatory fields
  { product_type: 'meat', field: 'Origin labelling', mandatory: 1, format: 'Beef: born in, reared in, slaughtered in. Pork/poultry/lamb: reared in, slaughtered in. Must name specific countries.', regulation_ref: 'EU Reg 1337/2013; EU Reg 1760/2000 (beef)' },
  { product_type: 'meat', field: 'Approval mark', mandatory: 1, format: 'Oval identification mark with country code (SE), approval number, and EC. Required on all meat from approved establishments.', regulation_ref: 'EU Reg 853/2004 Annex II Section I' },
  { product_type: 'honey', field: 'Country of origin', mandatory: 1, format: 'Specific country names required (not just "EU/non-EU blend"). If blended: list countries or "blandning av honung fran [countries]".', regulation_ref: 'EU Directive 2001/110/EC Art 2(4); LIVSFS 2003:10' },
  { product_type: 'fish', field: 'Species and catch info', mandatory: 1, format: 'Commercial name + scientific name, production method (caught/farmed), catch area (FAO zone number + subarea name), fishing gear category.', regulation_ref: 'EU Reg 1379/2013 Art 35' },
  { product_type: 'eggs', field: 'Egg marking', mandatory: 1, format: 'Stamped on shell: farming method code (0=organic, 1=free-range, 2=barn, 3=cage) + SE + producer ID. Exemption for direct farm-gate sales under 10,000 hens.', regulation_ref: 'EU Reg 589/2008 Art 7-9' },
];

const insertLabel = db.instance.prepare(
  `INSERT INTO labelling_rules (product_type, field, mandatory, format, regulation_ref, jurisdiction)
   VALUES (?, ?, ?, ?, ?, 'SE')`
);

for (const l of labellingRules) {
  insertLabel.run(l.product_type, l.field, l.mandatory, l.format, l.regulation_ref);
}
console.log(`Inserted ${labellingRules.length} labelling rules`);

// ---------------------------------------------------------------------------
// FTS5 SEARCH INDEX
// ---------------------------------------------------------------------------
const insertFts = db.instance.prepare(
  'INSERT INTO search_index (title, body, product_type, jurisdiction) VALUES (?, ?, ?, ?)'
);

// Index products
for (const p of products) {
  insertFts.run(
    p.name,
    `${p.product_type} ${p.species ?? ''} product`,
    p.product_type ?? '',
    'SE'
  );
}

// Index product requirements
for (const r of productRequirements) {
  const product = products.find(p => p.id === r.product_id);
  insertFts.run(
    `${product?.name ?? r.product_id} - ${r.sales_channel} requirements`,
    `${r.temperature_control} ${r.traceability_requirements} ${r.labelling_requirements}`,
    product?.product_type ?? '',
    'SE'
  );
}

// Index assurance schemes
for (const s of assuranceSchemes) {
  insertFts.run(
    s.name,
    `${s.standards_summary} ${s.product_types}`,
    s.product_types,
    'SE'
  );
}

// Index hygiene rules
for (const h of hygieneRules) {
  insertFts.run(
    `Hygiene: ${h.activity} - ${h.premises_type}`,
    `${h.temperature_controls} ${h.cleaning_requirements} ${h.registration_type}`,
    h.activity,
    'SE'
  );
}

// Index raw milk rules
for (const r of rawMilkRules) {
  insertFts.run(
    `Raw milk rules: ${r.sales_methods?.substring(0, 80)}`,
    `${r.conditions} ${r.sales_methods}`,
    'dairy',
    'SE'
  );
}

// Index labelling rules
for (const l of labellingRules) {
  insertFts.run(
    `Labelling: ${l.field} (${l.product_type})`,
    `${l.format} ${l.regulation_ref}`,
    l.product_type,
    'SE'
  );
}

const totalFts = products.length + productRequirements.length + assuranceSchemes.length +
  hygieneRules.length + rawMilkRules.length + labellingRules.length;
console.log(`Inserted ${totalFts} FTS index entries`);

// ---------------------------------------------------------------------------
// METADATA
// ---------------------------------------------------------------------------
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('last_ingest', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('build_date', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('schema_version', '1.0')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('mcp_name', 'Sweden Food Safety MCP')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('jurisdiction', 'SE')", []);

// ---------------------------------------------------------------------------
// COVERAGE FILE
// ---------------------------------------------------------------------------
writeFileSync('data/coverage.json', JSON.stringify({
  mcp_name: 'Sweden Food Safety MCP',
  jurisdiction: 'SE',
  build_date: now,
  products: products.length,
  product_requirements: productRequirements.length,
  assurance_schemes: assuranceSchemes.length,
  hygiene_rules: hygieneRules.length,
  raw_milk_rules: rawMilkRules.length,
  labelling_rules: labellingRules.length,
  fts_entries: totalFts,
  status: 'populated',
}, null, 2));

db.close();
console.log(`\nSweden Food Safety MCP database built successfully.`);
console.log(`Products: ${products.length}`);
console.log(`Product requirements: ${productRequirements.length}`);
console.log(`Assurance schemes: ${assuranceSchemes.length}`);
console.log(`Hygiene rules: ${hygieneRules.length}`);
console.log(`Raw milk rules: ${rawMilkRules.length}`);
console.log(`Labelling rules: ${labellingRules.length}`);
console.log(`FTS entries: ${totalFts}`);
