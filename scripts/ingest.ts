/**
 * Sweden Food Safety MCP -- Data Ingestion Script (Full Production Coverage)
 *
 * Sources:
 * - Livsmedelsverket (Swedish Food Agency) -- LIVSFS 2005:20, LIVSFS 2014:4, LIVSFS 2024:6, LIVSFS 2024:11
 * - Jordbruksverket (Swedish Board of Agriculture) -- SJVFS 2019:25, SJVFS 2007:90
 * - EU Regulation 178/2002 (General Food Law)
 * - EU Regulation 852/2004 (General Food Hygiene)
 * - EU Regulation 853/2004 (Specific Hygiene Rules for Animal-Origin Foods)
 * - EU Regulation 1169/2011 (FIC -- Food Information to Consumers)
 * - EU Regulation 1337/2013 (Origin Labelling for Meat)
 * - EU Regulation 1760/2000 (Beef Identification and Labelling)
 * - EU Regulation 589/2008 (Marketing Standards for Eggs)
 * - EU Regulation 1379/2013 (Common Organisation of Markets -- Fisheries)
 * - EU Regulation 543/2011 (Marketing Standards for Fruit/Veg)
 * - EU Regulation 396/2005 (Maximum Residue Levels)
 * - EU Regulation 2073/2005 (Microbiological Criteria)
 * - EU Regulation 835/2011 (PAH Maximum Levels)
 * - EU Directive 2001/110/EC (Honey Directive)
 * - EU Regulation 2018/848 (Organic Production)
 * - Sametinget -- Reindeer husbandry regulations
 *
 * Usage: npm run ingest
 */

import { createDatabase } from '../src/db.js';
import { mkdirSync, writeFileSync } from 'fs';

mkdirSync('data', { recursive: true });
const db = createDatabase('data/database.db');

const now = new Date().toISOString().split('T')[0];

// ---------------------------------------------------------------------------
// PRODUCTS (32 Swedish food products -- all major categories)
// ---------------------------------------------------------------------------
const products = [
  // Meat
  { id: 'notkott', name: 'Notkott', product_type: 'meat', species: 'bovine' },
  { id: 'flaskkott', name: 'Flaskkott', product_type: 'meat', species: 'porcine' },
  { id: 'kycklingkott', name: 'Kycklingkott', product_type: 'meat', species: 'poultry' },
  { id: 'lammkott', name: 'Lammkott', product_type: 'meat', species: 'ovine' },
  { id: 'viltkott', name: 'Viltkott', product_type: 'meat', species: 'game' },
  { id: 'vildsvin', name: 'Vildsvinskott', product_type: 'meat', species: 'wild_boar' },
  { id: 'renkott', name: 'Renkott', product_type: 'meat', species: 'reindeer' },
  { id: 'korv', name: 'Korv', product_type: 'processed_meat', species: 'mixed' },
  { id: 'charkuterier', name: 'Charkuterier', product_type: 'processed_meat', species: 'mixed' },
  { id: 'rokta-produkter', name: 'Rokta produkter', product_type: 'smoked', species: 'mixed' },
  // Fish and seafood
  { id: 'lax', name: 'Lax', product_type: 'fish', species: 'salmon' },
  { id: 'sill', name: 'Sill', product_type: 'fish', species: 'herring' },
  { id: 'torsk', name: 'Torsk', product_type: 'fish', species: 'cod' },
  { id: 'skaldjur', name: 'Skaldjur', product_type: 'shellfish', species: 'crustacean' },
  { id: 'musslor', name: 'Musslor', product_type: 'shellfish', species: 'bivalve' },
  // Dairy
  { id: 'mjolk', name: 'Mjolk', product_type: 'dairy', species: 'bovine' },
  { id: 'ost', name: 'Ost', product_type: 'dairy', species: 'bovine' },
  { id: 'smor', name: 'Smor', product_type: 'dairy', species: 'bovine' },
  // Eggs
  { id: 'agg', name: 'Agg', product_type: 'eggs', species: 'poultry' },
  // Honey
  { id: 'honung', name: 'Honung', product_type: 'honey', species: 'bee' },
  // Produce
  { id: 'jordgubbar', name: 'Jordgubbar', product_type: 'produce', species: null },
  { id: 'blabar', name: 'Blabar', product_type: 'produce', species: null },
  { id: 'lingon', name: 'Lingon', product_type: 'produce', species: null },
  { id: 'potatis', name: 'Potatis', product_type: 'produce', species: null },
  { id: 'morottor', name: 'Morottor', product_type: 'produce', species: null },
  { id: 'lok', name: 'Lok', product_type: 'produce', species: null },
  { id: 'svamp', name: 'Svamp', product_type: 'produce', species: null },
  { id: 'gronsaker', name: 'Gronsaker', product_type: 'produce', species: null },
  // Grain and bakery
  { id: 'spannmal', name: 'Spannmal', product_type: 'grain', species: null },
  { id: 'brod', name: 'Brod', product_type: 'bakery', species: null },
  // Preserved and fermented
  { id: 'sylt-saft', name: 'Sylt och saft', product_type: 'preserved', species: null },
  { id: 'fermenterade', name: 'Fermenterade produkter', product_type: 'fermented', species: null },
];

const insertProduct = db.instance.prepare(
  'INSERT OR REPLACE INTO products (id, name, product_type, species, jurisdiction) VALUES (?, ?, ?, ?, ?)'
);

for (const p of products) {
  insertProduct.run(p.id, p.name, p.product_type, p.species, 'SE');
}
console.log(`Inserted ${products.length} products`);

// ---------------------------------------------------------------------------
// PRODUCT REQUIREMENTS (55 entries -- retail + direct + online + food service)
// ---------------------------------------------------------------------------
const productRequirements = [
  // ---- Notkott (beef) ----
  { product_id: 'notkott', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Max 7 C for fresh meat; -18 C for frozen. Cold chain from slaughter through distribution.', traceability_requirements: 'Batch number, slaughter date, origin (born/raised/slaughtered), individual animal ID (ear tag). Full traceability per EU Reg 1760/2000 beef labelling system. CDB (Central Animal Database) registration.', labelling_requirements: 'Origin country mandatory (born, raised, slaughtered -- each country named). Cut name, weight, best-before date, approval mark. Nutrition declaration per EU Reg 1169/2011.', regulation_ref: 'EU Reg 853/2004 Annex III Section I; LIVSFS 2005:20; EU Reg 1760/2000; EU Reg 1169/2011' },
  { product_id: 'notkott', sales_channel: 'direct', registration_required: 1, approval_required: 0, temperature_control: 'Max 7 C, cold chain from slaughter to consumer. Transport in insulated containers if not refrigerated vehicle.', traceability_requirements: 'Simplified for small volumes to end consumer. Producer must keep records of animals slaughtered and sold, with dates and quantities.', labelling_requirements: 'Origin, weight, date of slaughter or packaging, producer name and contact details.', regulation_ref: 'LIVSFS 2005:20; Jordbruksverket SJVFS 2019:25' },
  { product_id: 'notkott', sales_channel: 'online', registration_required: 1, approval_required: 0, temperature_control: 'Max 7 C maintained during delivery. Insulated packaging with cold packs required. Delivery within 24 hours recommended.', traceability_requirements: 'Same as retail. Distance selling rules under EU Reg 1169/2011 Art 14 apply -- all mandatory info available before purchase.', labelling_requirements: 'Full retail labelling. All mandatory info must appear on website/order page before purchase. Physical label on delivered product.', regulation_ref: 'EU Reg 1169/2011 Art 14; LIVSFS 2005:20; LIVSFS 2014:4' },
  { product_id: 'notkott', sales_channel: 'food_service', registration_required: 1, approval_required: 0, temperature_control: 'Cold holding max 8 C. Cooking to safe core temperature. Hot holding min 60 C.', traceability_requirements: 'Supplier records, batch traceability, purchase invoices with origin information.', labelling_requirements: 'From 1 March 2025: restaurants must inform consumers of origin country for beef served. Can be on menu, sign, or verbal on request (LIVSFS 2024:11).', regulation_ref: 'LIVSFS 2024:11; EU Reg 1169/2011 Art 44; LIVSFS 2005:20' },

  // ---- Flaskkott (pork) ----
  { product_id: 'flaskkott', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Max 7 C fresh; max 4 C minced pork; -18 C frozen.', traceability_requirements: 'Batch number, slaughter date, origin (reared/slaughtered). EU Reg 1337/2013 origin labelling for pork.', labelling_requirements: 'Origin mandatory (reared in, slaughtered in -- specific countries). Cut name, weight, best-before, allergen info if processed. Nutrition declaration.', regulation_ref: 'EU Reg 853/2004 Annex III Section I; EU Reg 1337/2013; LIVSFS 2005:20' },
  { product_id: 'flaskkott', sales_channel: 'direct', registration_required: 1, approval_required: 0, temperature_control: 'Max 7 C fresh, cold chain maintained from slaughter.', traceability_requirements: 'Producer records: animals slaughtered, quantities sold, dates. Simplified rules for gardsforjsaljning.', labelling_requirements: 'Producer name and address, weight, date, storage instructions.', regulation_ref: 'LIVSFS 2005:20; SJVFS 2019:25' },
  { product_id: 'flaskkott', sales_channel: 'food_service', registration_required: 1, approval_required: 0, temperature_control: 'Cold holding max 8 C. Core cooking temperature min 70 C for pork. Hot holding min 60 C.', traceability_requirements: 'Supplier invoices with origin. Batch records.', labelling_requirements: 'From 1 March 2025: restaurants must inform consumers of origin country for pork served (LIVSFS 2024:11).', regulation_ref: 'LIVSFS 2024:11; LIVSFS 2005:20' },

  // ---- Kycklingkott (chicken) ----
  { product_id: 'kycklingkott', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Max 4 C fresh; -18 C frozen. Swedish national salmonella programme applies -- all flocks tested, positive flocks destroyed.', traceability_requirements: 'Batch traceability, flock ID, slaughter date. Swedish salmonella guarantee (additional guarantees under EU accession).', labelling_requirements: 'Origin, weight, use-by date (not best-before for fresh poultry), storage temperature max 4 C. Salmonella status for exported products.', regulation_ref: 'EU Reg 853/2004 Annex III Section II; SJVFS 2007:90 (salmonella programme); EU Reg 1337/2013' },
  { product_id: 'kycklingkott', sales_channel: 'direct', registration_required: 1, approval_required: 0, temperature_control: 'Max 4 C, immediate cold chain. Small producers (max 10,000 birds/year) may slaughter on-farm with simplified approval.', traceability_requirements: 'Flock records, slaughter dates, quantities sold. Salmonella testing mandatory per national programme.', labelling_requirements: 'Producer details, weight, date, storage instructions (max 4 C).', regulation_ref: 'LIVSFS 2005:20; SJVFS 2007:90; EU Reg 853/2004' },
  { product_id: 'kycklingkott', sales_channel: 'food_service', registration_required: 1, approval_required: 0, temperature_control: 'Cold holding max 4 C. Core cooking temperature min 74 C. Hot holding min 60 C. No cross-contamination with raw poultry.', traceability_requirements: 'Supplier records with origin. Swedish salmonella guarantee for imported poultry.', labelling_requirements: 'From 1 March 2025: origin information for poultry served at restaurants mandatory (LIVSFS 2024:11).', regulation_ref: 'LIVSFS 2024:11; LIVSFS 2005:20; SJVFS 2007:90' },

  // ---- Lammkott (lamb) ----
  { product_id: 'lammkott', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Max 7 C fresh; -18 C frozen.', traceability_requirements: 'Batch number, slaughter date, origin (reared/slaughtered). Individual animal ID via ear tags per EU Reg 21/2004.', labelling_requirements: 'Origin mandatory (reared in, slaughtered in). Cut name, weight, best-before date, nutrition declaration.', regulation_ref: 'EU Reg 853/2004 Annex III Section I; EU Reg 1337/2013; EU Reg 21/2004' },
  { product_id: 'lammkott', sales_channel: 'direct', registration_required: 1, approval_required: 0, temperature_control: 'Max 7 C, cold chain from slaughter.', traceability_requirements: 'Producer slaughter records, animal ID, quantities sold.', labelling_requirements: 'Producer name, origin, weight, date.', regulation_ref: 'LIVSFS 2005:20; SJVFS 2019:25' },
  { product_id: 'lammkott', sales_channel: 'food_service', registration_required: 1, approval_required: 0, temperature_control: 'Cold holding max 8 C. Cooking to safe core temperature.', traceability_requirements: 'Supplier records with origin information.', labelling_requirements: 'From 1 March 2025: origin information for sheep meat served at restaurants mandatory (LIVSFS 2024:11).', regulation_ref: 'LIVSFS 2024:11; LIVSFS 2005:20' },

  // ---- Viltkott (wild game) ----
  { product_id: 'viltkott', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Max 7 C fresh; -18 C frozen. Carcass must be eviscerated within reasonable time and chilled promptly.', traceability_requirements: 'Trained hunter declaration (utbildad person), species identification, shooting location, date, wild game inspection report.', labelling_requirements: 'Species, origin (country/region), weight, date, approval mark from game handling establishment.', regulation_ref: 'EU Reg 853/2004 Annex III Section IV; LIVSFS 2005:20; LIVSFS 2024:6' },
  { product_id: 'viltkott', sales_channel: 'direct', registration_required: 1, approval_required: 0, temperature_control: 'Max 7 C. Prompt field dressing and cooling required.', traceability_requirements: 'Hunter must keep records: species, date, location, quantity. Trained person (utbildad person) declaration required for large game.', labelling_requirements: 'Species, hunter/producer details, date, weight. Consumer informed of wild game status.', regulation_ref: 'LIVSFS 2005:20; LIVSFS 2024:6; EU Reg 853/2004 Annex III Section IV' },

  // ---- Vildsvin (wild boar -- new rules LIVSFS 2024:6) ----
  { product_id: 'vildsvin', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Max 7 C fresh; -18 C frozen. Trichinella sampling mandatory before sale.', traceability_requirements: 'Hunter registration with lansstyrelsen. Max 25 wild boar per hunter per calendar year to local retail. Trichinella test results, cesium sampling where applicable. Individual carcass traceability.', labelling_requirements: 'Species (vildsvin), origin (Sweden), weight, date, approval mark, trichinella test status.', regulation_ref: 'LIVSFS 2024:6; EU Reg 853/2004 Annex III Section IV; EU Reg 2015/1375 (Trichinella)' },
  { product_id: 'vildsvin', sales_channel: 'direct', registration_required: 1, approval_required: 0, temperature_control: 'Max 7 C. Prompt evisceration and cooling in the field.', traceability_requirements: 'Hunter with special training, registered with lansstyrelsen. Max 10 whole wild boar + meat from 10 wild boar per year to consumers. Trichinella and cesium sampling required. Documentation of sales.', labelling_requirements: 'Hunter contact details, species, date, weight. Written consumer information about wild game.', regulation_ref: 'LIVSFS 2024:6; LIVSFS 2005:20' },

  // ---- Renkott (reindeer meat) ----
  { product_id: 'renkott', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Max 7 C fresh; -18 C frozen.', traceability_requirements: 'Slaughter approval, herd owner identification, renmarke (reindeer mark), batch number. Sameby (Sami community) registration.', labelling_requirements: 'Origin (Sweden), species, cut, weight, best-before, producer/slaughterhouse approval mark.', regulation_ref: 'EU Reg 853/2004; SJVFS 2019:25; Sametinget reindeer regulations' },
  { product_id: 'renkott', sales_channel: 'direct', registration_required: 1, approval_required: 0, temperature_control: 'Max 7 C, cold chain from slaughter. Slaughter at approved premises or under derogation for traditional Sami slaughter.', traceability_requirements: 'Reindeer herder registration with Sametinget and Jordbruksverket. Slaughter records, renmarke.', labelling_requirements: 'Producer name, origin, weight, date.', regulation_ref: 'SJVFS 2019:25; Sametinget guidelines; LIVSFS 2005:20' },

  // ---- Agg (eggs) ----
  { product_id: 'agg', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Store at stable temperature, avoid condensation. Best-before 28 days from laying. Not washed in Sweden (dry cleaning only).', traceability_requirements: 'Each Class A egg stamped with producer code: farming method digit + SE + producer ID. Batch records at packing centre. Swedish salmonella programme applies.', labelling_requirements: 'Quality class (A), weight grade (S/M/L/XL), farming method (0=organic, 1=free-range, 2=barn, 3=cage), best-before date (max 28 days), producer code stamp on egg, packing centre code.', regulation_ref: 'EU Reg 589/2008; EU Reg 1308/2013; LIVSFS 2005:20; SJVFS 2007:90' },
  { product_id: 'agg', sales_channel: 'direct', registration_required: 0, approval_required: 0, temperature_control: 'Stable temperature, no washing required for farm-gate sales. Avoid temperature fluctuations causing condensation.', traceability_requirements: 'Records of flock size and eggs sold. Salmonella testing per Swedish national guarantee. Max 10,000 hens for stamping exemption.', labelling_requirements: 'Farming method, best-before date, producer name and address. Egg shell stamping NOT required for direct farm-gate sales with <10,000 hens.', regulation_ref: 'EU Reg 589/2008 Art 2; SJVFS 2007:90; LIVSFS 2005:20' },
  { product_id: 'agg', sales_channel: 'online', registration_required: 1, approval_required: 0, temperature_control: 'Stable temperature during transport. Packaging must prevent breakage and temperature shock.', traceability_requirements: 'Full retail traceability. All eggs must be stamped with producer code. Packing centre registration required.', labelling_requirements: 'Full retail labelling. All mandatory fields visible in online listing before purchase.', regulation_ref: 'EU Reg 589/2008; EU Reg 1169/2011 Art 14; LIVSFS 2014:4' },

  // ---- Mjolk (milk) ----
  { product_id: 'mjolk', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Max 8 C. Pasteurisation mandatory for retail milk in Sweden. UHT or ESL treatment for long-life products.', traceability_requirements: 'Dairy ID, batch number, pasteurisation records, supplier herd registration. Dairy approval number (oval identification mark).', labelling_requirements: 'Fat content (%), heat treatment method (pasteuriserad/UHT), best-before date, nutrition declaration, origin indication. Allergen: milk.', regulation_ref: 'EU Reg 853/2004 Annex III Section IX; LIVSFS 2005:20; EU Reg 1169/2011' },
  { product_id: 'mjolk', sales_channel: 'direct', registration_required: 1, approval_required: 0, temperature_control: 'Max 8 C. Raw milk: cooled within 2 hours of milking to max 8 C. Drawn from tank in customer presence.', traceability_requirements: 'Herd registration, TB and brucellosis free status, milking records. Registration with lansstyrelsen for raw milk sales. Max 70 litres per week.', labelling_requirements: 'If raw milk: clear label "opastoriserad mjolk" (unpasteurised), written health risk warning, producer details. Not recommended for children, elderly, pregnant, immunocompromised.', regulation_ref: 'EU Reg 853/2004 Annex III Section IX; LIVSFS 2005:20; Jordbruksverket raw milk guidelines' },

  // ---- Smor (butter) ----
  { product_id: 'smor', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Max 8 C storage. Frozen storage at -18 C permitted for extended shelf life.', traceability_requirements: 'Dairy approval number, batch number, cream source records. Oval identification mark.', labelling_requirements: 'Fat content (min 80% milkfat for "smor"), salt content if salted, origin, best-before, nutrition declaration. Allergen: milk.', regulation_ref: 'EU Reg 1308/2013 Annex VII Part VII; LIVSFS 2005:20; EU Reg 1169/2011' },

  // ---- Ost (cheese) ----
  { product_id: 'ost', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Fresh cheese max 8 C. Soft ripened cheese max 8 C. Hard cheese ambient storage acceptable if intact rind. Cut cheese max 8 C.', traceability_requirements: 'Dairy approval number, milk source (cow/goat/sheep), batch number, maturation start date and duration. If raw milk cheese: aging records.', labelling_requirements: 'Fat content (in dry matter or absolute), milk type, milk treatment (pasteurised or opasteuriserad), origin, best-before or use-by, allergens (milk, possible rennet source).', regulation_ref: 'EU Reg 853/2004 Annex III Section IX; LIVSFS 2005:20; EU Reg 1169/2011' },
  { product_id: 'ost', sales_channel: 'direct', registration_required: 1, approval_required: 1, temperature_control: 'Fresh cheese max 8 C. Gardsmejeri (farm dairy) must hold Livsmedelsverket approval.', traceability_requirements: 'Dairy approval, milk source, batch, maturation records. HACCP plan for raw milk cheese with specific CCPs.', labelling_requirements: 'Cheese type, milk source, fat content, origin, best-before, producer. If raw milk: "tillverkad av opastoriserad mjolk".', regulation_ref: 'EU Reg 853/2004; LIVSFS 2005:20; EU Reg 2073/2005' },

  // ---- Honung (honey) ----
  { product_id: 'honung', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Ambient storage. Avoid heating above 40 C (preserves enzyme activity). Protect from sunlight and moisture.', traceability_requirements: 'Country of origin mandatory. Batch number, harvest date, beekeeper registration with Jordbruksverket. Apiary location records.', labelling_requirements: 'Country of origin (specific country names mandatory, not just "EU/non-EU"). Batch number, weight, beekeeper/producer ID, best-before date. "Blandning av honung fran [countries]" if blended origins.', regulation_ref: 'EU Directive 2001/110/EC (Honey Directive); LIVSFS 2003:10; EU Reg 1169/2011' },
  { product_id: 'honung', sales_channel: 'direct', registration_required: 0, approval_required: 0, temperature_control: 'Ambient, protected from sunlight and moisture.', traceability_requirements: 'Beekeeper registered with Jordbruksverket. Records of apiaries, harvest dates, quantities.', labelling_requirements: 'Country of origin (Sverige/Sweden), producer name and address, weight, best-before date.', regulation_ref: 'EU Directive 2001/110/EC; LIVSFS 2003:10' },

  // ---- Lax (salmon) ----
  { product_id: 'lax', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Max 2 C fresh (on melting ice); -18 C frozen. Smoked salmon: per product-specific shelf life study.', traceability_requirements: 'Catch area (FAO zone) or aquaculture site, species (Latin + common name), batch, landing/harvest date, fishing vessel or farm ID.', labelling_requirements: 'Species (common + scientific name: Salmo salar), production method (caught/farmed), catch area (FAO zone number + subarea name) or country of aquaculture, fishing gear category if wild-caught.', regulation_ref: 'EU Reg 1379/2013 Art 35 (CMO fisheries); EU Reg 853/2004 Annex III Section VIII; LIVSFS 2005:20' },
  { product_id: 'lax', sales_channel: 'food_service', registration_required: 1, approval_required: 0, temperature_control: 'Fresh max 2 C. Sushi-grade: frozen at -20 C for 24h or -35 C for 15h for parasite control before raw consumption.', traceability_requirements: 'Supplier records with species, catch area, production method.', labelling_requirements: 'Species and production method should be available to consumer on request. Allergen: fish.', regulation_ref: 'EU Reg 1379/2013; EU Reg 853/2004 Annex III Section VIII; LIVSFS 2005:20' },

  // ---- Sill (herring) ----
  { product_id: 'sill', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Max 2 C fresh (on ice). Pickled sill: per product-specific conditions. -18 C frozen.', traceability_requirements: 'Catch area (FAO zone), species, fishing vessel, landing date, batch.', labelling_requirements: 'Species (Clupea harengus), production method (caught), catch area, fishing gear. If pickled: ingredients list with allergens (fish, possible mustard/sulphites).', regulation_ref: 'EU Reg 1379/2013; EU Reg 853/2004 Annex III Section VIII; LIVSFS 2005:20' },

  // ---- Torsk (cod) ----
  { product_id: 'torsk', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Max 2 C fresh (on melting ice); -18 C frozen.', traceability_requirements: 'Catch area, species (Gadus morhua), fishing vessel, landing date, batch. MSC chain-of-custody if certified.', labelling_requirements: 'Species (common + scientific name), production method, catch area (FAO zone + subarea), fishing gear category.', regulation_ref: 'EU Reg 1379/2013; EU Reg 853/2004 Annex III Section VIII; LIVSFS 2005:20' },

  // ---- Skaldjur (shellfish/crustaceans) ----
  { product_id: 'skaldjur', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Max 2 C fresh (on ice). Live crustaceans: temperature appropriate for species. Cooked: max 4 C. Frozen: -18 C.', traceability_requirements: 'Catch area, species, landing date, batch. For farmed shrimp: aquaculture site and country.', labelling_requirements: 'Species (common + scientific name), production method, catch/farming area, allergen: crustaceans.', regulation_ref: 'EU Reg 1379/2013; EU Reg 853/2004 Annex III Section VIII; LIVSFS 2005:20' },

  // ---- Musslor (mussels/bivalves) ----
  { product_id: 'musslor', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Live bivalves: max 6 C during transport, never frozen alive. Processed: per product type.', traceability_requirements: 'Classified production area (A/B/C), dispatch centre registration, harvest date, purification records if applicable. Biotoxin monitoring results.', labelling_requirements: 'Species, production area, harvest date, dispatch centre mark, allergen: molluscs. Live bivalves: date of minimum durability replaced by "live at time of sale".', regulation_ref: 'EU Reg 853/2004 Annex III Section VII; EU Reg 854/2004; LIVSFS 2005:20' },

  // ---- Jordgubbar (strawberries) ----
  { product_id: 'jordgubbar', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Max 8 C recommended. Perishable, short shelf life (2-5 days).', traceability_requirements: 'Supplier, harvest date, lot number. Pesticide residue records (MRL compliance per EU Reg 396/2005).', labelling_requirements: 'Origin country, quality class (Extra/I/II), weight or count, variety optional. Pesticide treatment records available on request.', regulation_ref: 'EU Reg 543/2011 (marketing standards); EU Reg 396/2005 (MRLs); LIVSFS 2005:20' },
  { product_id: 'jordgubbar', sales_channel: 'direct', registration_required: 0, approval_required: 0, temperature_control: 'Cool storage recommended, no mandatory temperature for farm-gate sales.', traceability_requirements: 'Farm records of pesticide use if applicable. Lot/field identification.', labelling_requirements: 'Origin, weight or count. Simplified for direct farm-gate sales to end consumer.', regulation_ref: 'EU Reg 543/2011; LIVSFS 2005:20' },

  // ---- Blabar (blueberries) ----
  { product_id: 'blabar', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Max 8 C recommended for fresh. Frozen blueberries -18 C.', traceability_requirements: 'Supplier, harvest location (wild-picked: region), lot number.', labelling_requirements: 'Origin country, weight. Wild-picked vs cultivated distinction if marketed.', regulation_ref: 'EU Reg 543/2011; LIVSFS 2005:20' },
  { product_id: 'blabar', sales_channel: 'direct', registration_required: 0, approval_required: 0, temperature_control: 'No mandatory temperature for farm-gate or roadside sales.', traceability_requirements: 'Picking location records if wild-harvested.', labelling_requirements: 'Origin, weight or volume.', regulation_ref: 'LIVSFS 2005:20' },

  // ---- Lingon (lingonberries) ----
  { product_id: 'lingon', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Fresh: max 8 C. Preserved (sylt): ambient. Frozen: -18 C.', traceability_requirements: 'Supplier, harvest region for wild-picked, lot number.', labelling_requirements: 'Origin country, weight. If processed (lingonsylt): full labelling per EU Reg 1169/2011 including ingredients and nutrition.', regulation_ref: 'EU Reg 543/2011; EU Reg 1169/2011; LIVSFS 2005:20' },

  // ---- Potatis (potatoes) ----
  { product_id: 'potatis', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Cool, dark storage (4-8 C ideal). No specific mandatory temperature. Avoid frost and greening (solanine).', traceability_requirements: 'Supplier, variety, lot number, country of origin. Seed potato certification if applicable.', labelling_requirements: 'Origin country, variety, weight class, quality class. Cooking type indication (fast/mjölig) common in Sweden.', regulation_ref: 'EU Reg 543/2011; LIVSFS 2005:20' },
  { product_id: 'potatis', sales_channel: 'direct', registration_required: 0, approval_required: 0, temperature_control: 'Cool, dark, frost-free storage.', traceability_requirements: 'Farm records of variety and field.', labelling_requirements: 'Origin, variety, weight.', regulation_ref: 'EU Reg 543/2011; LIVSFS 2005:20' },

  // ---- Morottor (carrots) ----
  { product_id: 'morottor', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Cool storage recommended (0-4 C for extended shelf life).', traceability_requirements: 'Supplier, lot number, origin country.', labelling_requirements: 'Origin country, quality class, weight. Pesticide MRL compliance.', regulation_ref: 'EU Reg 543/2011; EU Reg 396/2005; LIVSFS 2005:20' },

  // ---- Lok (onions) ----
  { product_id: 'lok', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Dry, cool, ventilated storage. Ambient acceptable for dried onions.', traceability_requirements: 'Supplier, lot number, origin country.', labelling_requirements: 'Origin country, weight.', regulation_ref: 'EU Reg 543/2011; LIVSFS 2005:20' },

  // ---- Svamp (mushrooms) ----
  { product_id: 'svamp', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Max 8 C fresh. Short shelf life for wild mushrooms.', traceability_requirements: 'Supplier, species identification, harvest location (wild) or farm (cultivated), lot number. Commercial wild mushroom sellers must have species competence.', labelling_requirements: 'Species name (Swedish common name), origin, weight. Wild mushrooms: clear species identification required. Cultivated: origin country.', regulation_ref: 'LIVSFS 2005:20; Livsmedelsverket guidance on svampforjsaljning' },
  { product_id: 'svamp', sales_channel: 'direct', registration_required: 0, approval_required: 0, temperature_control: 'Fresh storage, short shelf life.', traceability_requirements: 'Species identification competence. Picking location.', labelling_requirements: 'Species name, origin.', regulation_ref: 'LIVSFS 2005:20' },

  // ---- Gronsaker (vegetables general) ----
  { product_id: 'gronsaker', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Product-specific. Leafy greens max 8 C. Root vegetables ambient acceptable. Pre-cut salads max 8 C with use-by date.', traceability_requirements: 'Supplier, lot number, origin country. MRL compliance for pesticide residues.', labelling_requirements: 'Origin country, quality class where applicable, weight. Pre-packed: full labelling per EU Reg 1169/2011.', regulation_ref: 'EU Reg 543/2011; EU Reg 396/2005; EU Reg 1169/2011; LIVSFS 2005:20' },

  // ---- Spannmal (grain/cereals) ----
  { product_id: 'spannmal', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Dry, cool storage. Moisture content max 14% for safe storage. Protection from pests.', traceability_requirements: 'Supplier, lot number, origin, species/variety. Mycotoxin testing records (aflatoxin, ochratoxin, deoxynivalenol limits per EU Reg 1881/2006).', labelling_requirements: 'Species, origin, weight, best-before, allergen declaration (gluten for wheat, rye, barley, oats unless certified gluten-free).', regulation_ref: 'EU Reg 1169/2011; EU Reg 1881/2006 (contaminants); LIVSFS 2005:20' },

  // ---- Brod (bread) ----
  { product_id: 'brod', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Ambient for standard bread. Best-before applies. Pre-packed sandwiches: max 8 C with use-by date.', traceability_requirements: 'Ingredient supplier records, batch number, production date. Flour origin traceability.', labelling_requirements: 'Ingredients list (descending weight order), allergens highlighted (gluten, milk, eggs, sesame, soy etc.), weight, best-before, nutrition declaration, producer name and address.', regulation_ref: 'EU Reg 1169/2011 (FIC); LIVSFS 2005:20; LIVSFS 2014:4' },
  { product_id: 'brod', sales_channel: 'direct', registration_required: 1, approval_required: 0, temperature_control: 'Ambient. Suitable packaging to prevent contamination.', traceability_requirements: 'Ingredient records, batch identification.', labelling_requirements: 'Ingredients list with allergens highlighted, weight, best-before, producer details. Non-prepacked: allergen info must be available on request (LIVSFS 2014:4).', regulation_ref: 'EU Reg 1169/2011; LIVSFS 2014:4; LIVSFS 2005:20' },

  // ---- Korv (sausage) ----
  { product_id: 'korv', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Fresh korv max 8 C. Dried/cured korv ambient acceptable. Cooked korv max 8 C.', traceability_requirements: 'Meat origin (species and country), batch number, production date, processing establishment approval number. Meat content percentage records.', labelling_requirements: 'Ingredients (including meat content % by species), origin of meat, allergens (possible gluten, milk, mustard, celery, sulphites), nutrition declaration, use-by or best-before, oval approval mark.', regulation_ref: 'EU Reg 853/2004; EU Reg 1169/2011; LIVSFS 2005:20' },
  { product_id: 'korv', sales_channel: 'food_service', registration_required: 1, approval_required: 0, temperature_control: 'Cold holding max 8 C. Grilling/cooking to safe core temperature. Hot holding min 60 C.', traceability_requirements: 'Supplier records with meat origin and composition.', labelling_requirements: 'Allergen info must be available to consumer (14 allergens). Origin info available on request.', regulation_ref: 'EU Reg 1169/2011 Art 44; LIVSFS 2014:4; LIVSFS 2005:20' },

  // ---- Charkuterier (charcuterie/cured meats) ----
  { product_id: 'charkuterier', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Sliced charcuterie max 8 C. Whole cured pieces: ambient if shelf-stable (aw <0.91). Vacuum-packed: per shelf life study.', traceability_requirements: 'Meat origin, curing/processing records, batch number, production establishment approval. Nitrite/nitrate usage records per EU Reg 1333/2008.', labelling_requirements: 'Ingredients (meat content %, curing agents E249/E250/E251/E252), origin of meat, allergens, nutrition declaration, best-before or use-by, approval mark.', regulation_ref: 'EU Reg 853/2004; EU Reg 1169/2011; EU Reg 1333/2008 (additives); LIVSFS 2005:20' },

  // ---- Rokta produkter (smoked products) ----
  { product_id: 'rokta-produkter', sales_channel: 'retail', registration_required: 1, approval_required: 1, temperature_control: 'Cold-smoked max 8 C. Hot-smoked max 8 C or ambient if shelf-stable. PAH levels must comply with EU Reg 835/2011.', traceability_requirements: 'Raw material origin, smoking process records (time, temperature, wood type), batch number, PAH testing if applicable.', labelling_requirements: 'Ingredients, smoking method indication, origin, allergens, nutrition declaration, storage instructions, best-before or use-by.', regulation_ref: 'EU Reg 853/2004; EU Reg 1169/2011; LIVSFS 2005:20; EU Reg 835/2011 (PAH limits)' },

  // ---- Sylt och saft (jam and juice) ----
  { product_id: 'sylt-saft', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Ambient for sealed jars/bottles. Refrigerate after opening.', traceability_requirements: 'Fruit/berry supplier, batch number, production date, sugar content records.', labelling_requirements: 'Ingredients (fruit content % mandatory for jam per EU Directive 2001/113/EC), sugar content, origin of fruit, weight/volume, best-before, nutrition declaration, allergens if applicable.', regulation_ref: 'EU Directive 2001/113/EC (Jam Directive); EU Reg 1169/2011; LIVSFS 2005:20' },
  { product_id: 'sylt-saft', sales_channel: 'direct', registration_required: 1, approval_required: 0, temperature_control: 'Ambient for preserved products. Proper heat treatment documented.', traceability_requirements: 'Fruit/berry source records, batch, processing date.', labelling_requirements: 'Ingredients, fruit content %, weight, best-before, producer details.', regulation_ref: 'EU Directive 2001/113/EC; LIVSFS 2005:20' },

  // ---- Fermenterade produkter (fermented products) ----
  { product_id: 'fermenterade', sales_channel: 'retail', registration_required: 1, approval_required: 0, temperature_control: 'Product-specific. Live-culture products (e.g. surkål, kimchi): max 8 C to control fermentation. Shelf-stable ferments (e.g. vinegar): ambient.', traceability_requirements: 'Ingredient suppliers, batch number, fermentation start date and duration, pH records.', labelling_requirements: 'Ingredients list, allergens (possible soy, gluten, fish sauce), nutrition declaration, storage conditions, best-before or use-by, producer.', regulation_ref: 'EU Reg 1169/2011; LIVSFS 2005:20' },
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
// ASSURANCE SCHEMES (10 schemes)
// ---------------------------------------------------------------------------
const assuranceSchemes = [
  {
    id: 'ip-sigill',
    name: 'IP Sigill / Svenskt Sigill',
    product_types: 'meat, dairy, produce, grain, poultry, eggs, flowers',
    standards_summary: 'Good agricultural practice standard owned by Sigill Kvalitetssystem AB (subsidiary of LRF, Federation of Swedish Farmers). Covers food safety, animal welfare, environmental responsibility. Baseline certification for Swedish agricultural production. Certified farms follow IP Livsmedel (food safety) and IP Sigill (environment + animal welfare) standards. Independent third-party certification by accredited bodies (e.g. SMAK, Intertek). Covers pesticide management, nutrient planning, biodiversity measures.',
    audit_frequency: 'Annual third-party audit by accredited certification body',
    cost_indication: 'Membership fee via LRF + audit costs (approx 5,000-15,000 SEK/year depending on farm size and scope)',
    url: 'https://www.sigill.se/',
  },
  {
    id: 'sigill-klimat',
    name: 'Svenskt Sigill Klimatcertifierad',
    product_types: 'meat, dairy, produce, grain, poultry, eggs, flowers',
    standards_summary: 'Sweden\'s only climate certification for food and flowers. Add-on to Svenskt Sigill base certification. Research-based requirements developed with RISE (Research Institutes of Sweden). Certified products demonstrate ~30% lower climate impact compared to average production, aligned with Paris Agreement targets. Key measures: choice of feed (reduced soy import), nitrogen fertiliser efficiency, improved animal welfare (longer-lived animals), energy efficiency (renewable energy sources). Covers scope 1 and 2 emissions on farm.',
    audit_frequency: 'Annual third-party audit (combined with Svenskt Sigill base audit)',
    cost_indication: 'Additional fee on top of Svenskt Sigill base certification (approx 2,000-8,000 SEK/year)',
    url: 'https://www.sigill.se/om-sigill/vara-markningar/svenskt-sigill-klimatcertifierad',
  },
  {
    id: 'krav',
    name: 'KRAV',
    product_types: 'meat, dairy, produce, grain, poultry, eggs, honey, fish, processed food, textiles',
    standards_summary: 'Swedish organic certification, stricter than EU organic regulation (EU 2018/848). Additional requirements: animal welfare (more space per animal, mandatory outdoor access, longer suckling periods), climate impact reduction measures, social responsibility for workers (fair wages, safe conditions), stricter pesticide and GMO prohibitions. KRAV-certified products carry both the KRAV logo and the EU organic leaf. Certification bodies: Kiwa, SMAK. Covers entire supply chain from farm to retail.',
    audit_frequency: 'Annual third-party audit by accredited certification body (Kiwa or SMAK)',
    cost_indication: 'Inspection fee 3,000-20,000 SEK/year + KRAV licence fee based on product turnover (0.15-0.5%)',
    url: 'https://www.krav.se/',
  },
  {
    id: 'naturbeteskott',
    name: 'Naturbeteskott fran Sverige',
    product_types: 'beef, lamb',
    standards_summary: 'Beef and lamb from cattle and sheep grazing natural or semi-natural pastures (naturbetesmarker). Animals must graze certified natural pastures during the grazing season (minimum 4 months, typically May-October). Supports biodiversity conservation of Sweden\'s species-rich grasslands (among the most biodiverse habitats in northern Europe). Managed by Naturbeteskott i Sverige. Also available as add-on mark under Svenskt Sigill ("Naturbeteskott"). Requires permanent natural pasture comprising at least 50% of total grazing.',
    audit_frequency: 'Annual verification of grazing records and pasture classification',
    cost_indication: 'Membership fee approximately 2,000-5,000 SEK/year',
    url: 'https://www.naturbete.se/',
  },
  {
    id: 'svensk-fagel',
    name: 'Svensk Fagel',
    product_types: 'poultry, eggs',
    standards_summary: 'Swedish poultry industry programme guaranteeing Swedish origin, salmonella control (all flocks tested -- positive flocks destroyed per national programme), and animal welfare above EU minimum. Max stocking density 36 kg/m2 (EU max 42 kg/m2). No preventive antibiotic use. Foot pad scoring programme (indicator of litter quality and welfare). All Swedish commercial poultry producers are members. Swedish salmonella guarantee: additional guarantees negotiated at EU accession (Council Decision 95/409/EC).',
    audit_frequency: 'Continuous salmonella monitoring + annual welfare audit by Svensk Fagel inspectors',
    cost_indication: 'Included in industry membership fee for Swedish poultry producers',
    url: 'https://www.svenskfagel.se/',
  },
  {
    id: 'fran-sverige',
    name: 'Fran Sverige',
    product_types: 'meat, dairy, produce, grain, bakery, processed food, beverages',
    standards_summary: 'Origin mark guaranteeing that the primary raw materials are Swedish, and processing and packaging occur in Sweden. Managed by Svenskmark (industry-owned). Not a quality, welfare, or environmental standard -- strictly origin verification. Widely recognised consumer label in Sweden. Covers a broad range of food categories. Requires minimum 100% Swedish primary ingredient for single-ingredient products, or Swedish origin for the characterising ingredients.',
    audit_frequency: 'Annual verification by Svenskmark',
    cost_indication: 'License fee based on product turnover (varies by company size)',
    url: 'https://fransverige.se/',
  },
  {
    id: 'msc',
    name: 'MSC (Marine Stewardship Council)',
    product_types: 'fish, shellfish, seafood',
    standards_summary: 'International sustainability certification for wild-caught fisheries. Certified fisheries meet three principles: sustainable fish stocks, minimal environmental impact, effective management. In Sweden, several major fisheries hold MSC certification including Baltic Sea herring, North Sea cod, Norway lobster (Nephrops). Swedish retailers (ICA, Coop, Axfood) stock MSC-labelled products. Chain of Custody certification required for all supply chain actors handling MSC products. Blue MSC label on consumer packaging.',
    audit_frequency: 'Fishery: 5-year certification with annual surveillance audits. Chain of Custody: annual audit.',
    cost_indication: 'Fishery assessment: USD 20,000-150,000. CoC: approx 5,000-15,000 SEK/year for Swedish processors.',
    url: 'https://www.msc.org/se',
  },
  {
    id: 'asc',
    name: 'ASC (Aquaculture Stewardship Council)',
    product_types: 'farmed fish, farmed shellfish, farmed seafood',
    standards_summary: 'International sustainability certification for responsible aquaculture. Covers environmental impact (water quality, feed sustainability, escapes), social responsibility (worker welfare, community engagement), and animal health. Relevant in Sweden for farmed salmon (mostly imported from Norway), rainbow trout, and mussel farming. Chain of Custody certification required for supply chain. Green ASC label on consumer packaging. Audited by accredited certification bodies (e.g. SCS Global Services).',
    audit_frequency: '3-year certification cycle with annual surveillance audits. CoC: annual audit.',
    cost_indication: 'Farm assessment varies. CoC: approx 5,000-15,000 SEK/year for Swedish handlers.',
    url: 'https://www.asc-aqua.org/',
  },
  {
    id: 'rainforest-alliance',
    name: 'Rainforest Alliance',
    product_types: 'coffee, tea, cocoa, bananas, palm oil (imported products sold in Sweden)',
    standards_summary: 'International sustainability certification (merged with UTZ in 2018, unified standard from 2020). Covers social, environmental, and economic sustainability for tropical agricultural products. In the Swedish market, found primarily on coffee (Lofbergs, Zoegas, Gevalia), tea, chocolate, and bananas. Not an organic certification but promotes sustainable farming practices including reduced pesticide use, biodiversity protection, and worker welfare. The green frog seal on packaging. Relevant for Swedish food businesses sourcing tropical ingredients.',
    audit_frequency: 'Annual third-party audit of certified farms and supply chain actors',
    cost_indication: 'Certification costs borne primarily by producers. Swedish importers pay licensing fees based on volume.',
    url: 'https://www.rainforest-alliance.org/',
  },
  {
    id: 'eu-ekologisk',
    name: 'EU Ekologisk / EU Organic',
    product_types: 'all food categories',
    standards_summary: 'EU organic production regulation (EU 2018/848, replacing 834/2007). Baseline organic standard in Sweden. Covers crop production (no synthetic pesticides/fertilisers, GMO-free), animal husbandry (outdoor access, organic feed, restricted antibiotic use), and processing (limited additives). Products carry the EU organic leaf logo. In Sweden, certified by KRAV-approved bodies (Kiwa, SMAK) or directly by accredited bodies. Often combined with KRAV certification (KRAV is stricter). Swedish organic market worth approx 22 billion SEK (2023).',
    audit_frequency: 'Annual inspection by accredited certification body',
    cost_indication: 'Inspection fee 3,000-15,000 SEK/year depending on operation size and complexity',
    url: 'https://jordbruksverket.se/stod/jordbruk-tradgard-och-rennaring/jordbruksmark/ekologisk-produktion',
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
// HYGIENE RULES (22 entries -- all premises types)
// ---------------------------------------------------------------------------
const hygieneRules = [
  // Slaughter
  {
    activity: 'slaughter',
    premises_type: 'approved slaughterhouse',
    registration_type: 'Livsmedelsverket approval (godkannande) required before operation. Assigned approval number used in oval identification mark.',
    haccp_required: 1,
    temperature_controls: 'Carcass chilling to max 7 C (red meat) or max 4 C (poultry) within prescribed time. Cold chain mandatory. Chilling rooms monitored with data loggers.',
    cleaning_requirements: 'Daily cleaning and disinfection of slaughter hall, equipment, knives, floors, walls. Documented cleaning schedule with CCP verification. Pre-operational hygiene checks before each shift. Environmental swabbing programme.',
    regulation_ref: 'EU Reg 853/2004 Annex III Section I; EU Reg 852/2004 Annex II',
  },
  {
    activity: 'slaughter',
    premises_type: 'farm slaughterhouse (gardsslakteri)',
    registration_type: 'Livsmedelsverket approval required. Simplified approval for small volumes: max 10,000 poultry or 1,000 rabbits/year. Red meat gardsslakteri also requires approval but with adapted facility requirements.',
    haccp_required: 1,
    temperature_controls: 'Same temperature requirements as commercial slaughterhouse. Max 7 C for red meat, max 4 C for poultry. Cold room with temperature logging.',
    cleaning_requirements: 'Cleaning and disinfection between slaughter batches. Documented procedures. Separate dirty (slaughter) and clean (cutting) zones. Knife sterilisation at 82 C.',
    regulation_ref: 'EU Reg 853/2004 Annex III Section I; LIVSFS 2005:20; EU Reg 852/2004',
  },
  {
    activity: 'slaughter',
    premises_type: 'mobile slaughter unit (mobilt slakteri)',
    registration_type: 'Livsmedelsverket approval required. Unit must meet same hygiene standards as fixed premises. Growing concept in Sweden for animal welfare (reduced transport stress).',
    haccp_required: 1,
    temperature_controls: 'Same as fixed slaughterhouse. Carcass cooling capacity must be demonstrated. May use farm cold room if approved.',
    cleaning_requirements: 'Full cleaning between locations. Water supply and drainage at each site. Pre-operational checks before each use.',
    regulation_ref: 'EU Reg 853/2004 Annex III Section I; LIVSFS 2005:20; EU Reg 852/2004',
  },
  // Processing
  {
    activity: 'processing',
    premises_type: 'food processing facility',
    registration_type: 'Approval from Livsmedelsverket for animal-origin products (animaliska livsmedel). Registration with municipality (kommun) for plant-origin food processing.',
    haccp_required: 1,
    temperature_controls: 'Product-specific. Meat processing work areas max 12 C. Cold storage max 7 C. Cooking to validated core temperatures per product type. Cooling from 60 C to 8 C within 4 hours.',
    cleaning_requirements: 'Documented cleaning schedule (CIP/COP systems). Validated cleaning procedures with ATP or microbiological verification. Environmental monitoring for Listeria monocytogenes. Allergen cleaning validation between product changeovers.',
    regulation_ref: 'EU Reg 852/2004 Annex II; EU Reg 853/2004; LIVSFS 2005:20',
  },
  {
    activity: 'processing',
    premises_type: 'small-scale on-farm (hemmaforadling / gardsforadling)',
    registration_type: 'Registration with municipality for plant-origin products. Livsmedelsverket approval required if processing animal products for sale beyond direct consumer. Simplified HACCP accepted for small operators (LIVSFS 2005:20 Ch. 3).',
    haccp_required: 1,
    temperature_controls: 'Same core requirements as commercial facilities. Simplified documentation accepted. Critical limits: cooking, cooling, cold storage same as commercial.',
    cleaning_requirements: 'Cleaning between production runs. Separate storage for raw and finished products. Cleaning records maintained.',
    regulation_ref: 'EU Reg 852/2004; LIVSFS 2005:20 Ch. 3 (small-scale exemptions)',
  },
  {
    activity: 'processing',
    premises_type: 'bakery (bageri)',
    registration_type: 'Registration with municipality (kommunens miljo- och halsoforvaltning). No Livsmedelsverket approval needed unless handling animal products beyond basic dairy/egg ingredients.',
    haccp_required: 1,
    temperature_controls: 'Ambient for baked goods. Chilled storage max 8 C for cream/custard-filled products. Baking temperatures per product recipe (not regulated, but HACCP validated).',
    cleaning_requirements: 'Daily cleaning of work surfaces, equipment, ovens. Allergen management procedures critical -- separate areas or cleaning between allergen-containing batches. Pest control programme.',
    regulation_ref: 'EU Reg 852/2004 Annex II; LIVSFS 2005:20',
  },
  // Storage
  {
    activity: 'storage',
    premises_type: 'cold storage facility (kyllager)',
    registration_type: 'Registration with municipality or Livsmedelsverket depending on products stored. Livsmedelsverket approval if exclusively animal-origin products.',
    haccp_required: 1,
    temperature_controls: 'Fresh meat max 7 C. Poultry max 4 C. Fish max 2 C (on melting ice). Frozen -18 C. Temperature logging mandatory with alarm systems. Daily log review.',
    cleaning_requirements: 'Regular cleaning of storage areas. Pest control programme. Temperature monitoring with calibrated instruments. Stock rotation FIFO. Condensation management.',
    regulation_ref: 'EU Reg 852/2004 Annex II Ch. IX; EU Reg 853/2004',
  },
  {
    activity: 'storage',
    premises_type: 'dry storage (torrlager)',
    registration_type: 'Registration with municipality.',
    haccp_required: 1,
    temperature_controls: 'Ambient temperature, dry conditions. Protection from extreme heat (affects shelf life). Monitoring of temperature and humidity for sensitive products (chocolate, spices, grain).',
    cleaning_requirements: 'Regular cleaning. Pest control programme (rodents, insects). Stock rotation FIFO. Damaged packaging removal. Allergen separation.',
    regulation_ref: 'EU Reg 852/2004 Annex II; LIVSFS 2005:20',
  },
  // Transport
  {
    activity: 'transport',
    premises_type: 'food transport vehicle',
    registration_type: 'Registration with Livsmedelsverket for transport of animal products. ATP certification required for international temperature-controlled transport.',
    haccp_required: 0,
    temperature_controls: 'Refrigerated vehicles must maintain product temperature throughout transport. Temperature logging required with printout at delivery. ATP compliance for cross-border transport. Domestic: product-specific temperatures maintained.',
    cleaning_requirements: 'Cleaning between loads, especially when switching between product types (raw/cooked, meat/dairy). Vehicle cleaning records. No transport of non-food goods in same load compartment without protection.',
    regulation_ref: 'EU Reg 852/2004 Annex II Ch. IV; ATP Agreement (international)',
  },
  {
    activity: 'transport',
    premises_type: 'direct delivery vehicle (gardsbutik leverans)',
    registration_type: 'Registration with municipality or Livsmedelsverket depending on products. Simplified requirements for small-volume direct-to-consumer delivery.',
    haccp_required: 0,
    temperature_controls: 'Insulated containers or cool boxes with cold packs acceptable for short-distance delivery. Temperature must be maintained for product type. Not required to have built-in refrigeration for small volumes.',
    cleaning_requirements: 'Cleaning between uses. Containers dedicated to food transport.',
    regulation_ref: 'EU Reg 852/2004 Annex II Ch. IV; LIVSFS 2005:20',
  },
  // Retail
  {
    activity: 'retail',
    premises_type: 'food retail store (livsmedelsbutik)',
    registration_type: 'Registration with municipality (kommunens miljokontor).',
    haccp_required: 1,
    temperature_controls: 'Chilled display max 8 C. Frozen display -18 C. Deli counter products per product type. Temperature checks minimum twice daily. Calibrated thermometers.',
    cleaning_requirements: 'Daily cleaning of display counters, cutting boards, slicers (disassembled and cleaned). Documented cleaning schedule. Pest control contract with professional provider.',
    regulation_ref: 'EU Reg 852/2004 Annex II; LIVSFS 2005:20',
  },
  {
    activity: 'retail',
    premises_type: 'farmers market stall (torghandel)',
    registration_type: 'Registration with municipality. Temporary/mobile food handling may require separate notification. Market organiser coordinates with miljokontor.',
    haccp_required: 1,
    temperature_controls: 'Same temperature requirements as fixed retail. Cold chain maintained with portable refrigeration, ice, or insulated display. Protection from sun and weather.',
    cleaning_requirements: 'Clean surfaces, utensils. Hand washing facility or hand sanitiser. Waste management on-site.',
    regulation_ref: 'EU Reg 852/2004 Annex II; LIVSFS 2005:20',
  },
  // Food service
  {
    activity: 'restaurant',
    premises_type: 'restaurant / cafe / bar',
    registration_type: 'Registration with municipality (kommunens miljokontor). At least 2 weeks before opening. Can start after receiving registration confirmation or after 2-week waiting period.',
    haccp_required: 1,
    temperature_controls: 'Cold holding max 8 C. Hot holding min 60 C. Reheating to min 72 C core. Cooling from 60 C to 8 C within 4 hours. Cooking core temperatures validated per product.',
    cleaning_requirements: 'Daily kitchen cleaning (surfaces, equipment, floors). Weekly deep clean. Separate chopping boards for raw/cooked. Allergen management procedures mandatory. Hand washing stations with soap and paper towels.',
    regulation_ref: 'EU Reg 852/2004 Annex II; LIVSFS 2005:20; LIVSFS 2014:4 (allergen info)',
  },
  {
    activity: 'restaurant',
    premises_type: 'school/hospital catering (storhushall)',
    registration_type: 'Registration with municipality. Additional requirements for vulnerable populations (children, elderly, patients).',
    haccp_required: 1,
    temperature_controls: 'Same as restaurant plus: stricter reheating (min 72 C core). Hot transport in insulated containers min 60 C. Cold transport max 8 C. No reheating of leftovers from previous day for vulnerable groups.',
    cleaning_requirements: 'Enhanced cleaning regime. Environmental sampling for Listeria. Allergen-free options documented. Temperature logging at all stages including transport to satellite kitchens.',
    regulation_ref: 'EU Reg 852/2004 Annex II; LIVSFS 2005:20; Livsmedelsverket guidelines for storhushall',
  },
  {
    activity: 'restaurant',
    premises_type: 'food truck / street food (gatukök)',
    registration_type: 'Registration with municipality in the operating area. May need registration in multiple municipalities if moving between areas.',
    haccp_required: 1,
    temperature_controls: 'Same core requirements as fixed restaurant. Cold holding max 8 C. Hot holding min 60 C. Adequate refrigeration capacity for volume served.',
    cleaning_requirements: 'Cleaning after each service. Water supply (fresh and waste water tanks). Hand washing. Waste management. Surface cleaning between different food types.',
    regulation_ref: 'EU Reg 852/2004 Annex II; LIVSFS 2005:20',
  },
  // Dairy
  {
    activity: 'dairy processing',
    premises_type: 'dairy / mejeri',
    registration_type: 'Approval from Livsmedelsverket. Assigned approval number in oval mark.',
    haccp_required: 1,
    temperature_controls: 'Raw milk reception max 10 C. Pasteurisation min 72 C for 15 seconds (HTST) or equivalent (63 C/30 min, 138 C/2 sec UHT). Product-specific post-pasteurisation storage temperatures.',
    cleaning_requirements: 'CIP systems validated (flow, temperature, concentration, time). Environmental monitoring for Listeria monocytogenes. Water quality testing. Equipment calibration records.',
    regulation_ref: 'EU Reg 853/2004 Annex III Section IX; EU Reg 852/2004',
  },
  {
    activity: 'dairy processing',
    premises_type: 'farm dairy (gardsmejeri)',
    registration_type: 'Approval from Livsmedelsverket required. Simplified facility requirements accepted if hygiene outcomes demonstrated. Artisan dairy with own milk supply.',
    haccp_required: 1,
    temperature_controls: 'Same pasteurisation requirements as commercial dairy. Raw milk cheese: maturation temperature and duration per cheese type. Cold room for aging.',
    cleaning_requirements: 'CIP or manual cleaning validated. Microbiological testing programme. Environmental monitoring. Water quality testing if private supply.',
    regulation_ref: 'EU Reg 853/2004 Annex III Section IX; LIVSFS 2005:20; EU Reg 2073/2005',
  },
  // Egg packing
  {
    activity: 'egg packing',
    premises_type: 'egg packing centre (aggpackeri)',
    registration_type: 'Approval from Livsmedelsverket. Assigned packing centre code. Swedish salmonella programme compliance mandatory.',
    haccp_required: 1,
    temperature_controls: 'Stable temperature, avoid condensation (causes bacterial penetration of shell). Eggs NOT washed in Sweden (dry cleaning only -- unlike US). Storage away from odour sources.',
    cleaning_requirements: 'Cleaning of grading and candling equipment between batches. Egg surface quality checks. Traceability from producer to consumer via stamped code.',
    regulation_ref: 'EU Reg 589/2008; EU Reg 853/2004 Annex III Section X; SJVFS 2007:90',
  },
  // Honey
  {
    activity: 'honey extraction',
    premises_type: 'honey processing room (slungningslokal)',
    registration_type: 'Registration with municipality for commercial sale. No Livsmedelsverket approval needed (honey is not animal-origin product under 853/2004 in the processing sense).',
    haccp_required: 0,
    temperature_controls: 'Extraction at ambient (max 40 C to preserve enzyme activity -- diastase and invertase). Storage ambient, dry conditions. Moisture content max 20% (honey standard).',
    cleaning_requirements: 'Clean extraction equipment between apiaries. Stainless steel or food-grade plastic equipment. Room must be bee-proof and pest-proof. Clean jars and lids.',
    regulation_ref: 'EU Reg 852/2004 Annex II; LIVSFS 2005:20; EU Directive 2001/110/EC',
  },
  // Fish processing
  {
    activity: 'fish processing',
    premises_type: 'fish processing facility (fiskberedning)',
    registration_type: 'Approval from Livsmedelsverket.',
    haccp_required: 1,
    temperature_controls: 'Fresh fish max 2 C (melting ice). Processing area max 12 C. Smoked fish per product-specific shelf-life study. Frozen -18 C. Histamine controls for scombroid fish (tuna, mackerel): max 200 mg/kg histamine.',
    cleaning_requirements: 'Cleaning after each production run. Environmental monitoring for Listeria. Parasite control for raw-consumption products (freezing -20 C for 24h or -35 C for 15h). Water quality testing.',
    regulation_ref: 'EU Reg 853/2004 Annex III Section VIII; EU Reg 852/2004; EU Reg 2073/2005',
  },
  // Primary production
  {
    activity: 'primary production',
    premises_type: 'farm / lantbruk',
    registration_type: 'Primary producers registered with Jordbruksverket (Board of Agriculture) and lansstyrelsen (county administrative board). Food safety control by Livsmedelsverket for primary production. Basic hygiene requirements per EU Reg 852/2004 Annex I.',
    haccp_required: 0,
    temperature_controls: 'Product-specific: milk cooling within 2 hours of milking. Egg collection and storage. Crop harvest and storage conditions. No general mandatory HACCP for primary production -- replaced by good hygiene practice (GHP) requirements.',
    cleaning_requirements: 'Keeping records of animal feed, veterinary treatments, crop protection products, pest control, water source analysis. Clean equipment used for milking, harvesting. Animal health records.',
    regulation_ref: 'EU Reg 852/2004 Annex I (primary production); EU Reg 178/2002; LIVSFS 2005:20; SJVFS 2019:25',
  },
  // Online/distance selling
  {
    activity: 'online food sales',
    premises_type: 'e-commerce / distance selling (distansforjsaljning)',
    registration_type: 'Registration with municipality same as retail. Distance selling rules under EU Reg 1169/2011 Art 14 apply. All mandatory labelling information must be available to consumer before purchase (on website).',
    haccp_required: 1,
    temperature_controls: 'Same as retail/storage. Delivery logistics must maintain cold chain. Insulated packaging with cool packs. Delivery time limits for perishable goods.',
    cleaning_requirements: 'Packing area clean and suitable. Packaging materials food-grade. Cold chain documentation during delivery.',
    regulation_ref: 'EU Reg 1169/2011 Art 14; EU Reg 852/2004; LIVSFS 2005:20; LIVSFS 2014:4',
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
// RAW MILK RULES (7 entries -- detailed Swedish regulations)
// ---------------------------------------------------------------------------
const rawMilkRules = [
  {
    region: 'National (hela Sverige)',
    permitted: 1,
    sales_methods: 'Direct from farm to end consumer only (gardsforjsaljning). Milk drawn from bulk tank or separate tank in customer\'s presence.',
    conditions: 'Herd must be officially free from tuberculosis (TB) and brucellosis. Regular veterinary inspections. Milk cooled to max 8 C within 2 hours of milking. Max 70 litres per week sold. Producer must register with lansstyrelsen (county administrative board). Written consumer information about health risks and handling instructions mandatory. Volume and sales documented. Main pathogens of concern: Campylobacter and EHEC.',
    warning_label_required: 1,
    regulation_ref: 'EU Reg 853/2004 Annex III Section IX Ch. IV; LIVSFS 2005:20; Jordbruksverket guidelines',
  },
  {
    region: 'National (hela Sverige)',
    permitted: 0,
    sales_methods: 'Retail shops, supermarkets, convenience stores, online retail delivery',
    conditions: 'Raw milk sale through retail channels is NOT permitted in Sweden. All milk sold in shops must be pasteurised (min 72 C/15 sec), UHT (min 135 C/1 sec), or ESL-treated. This is a long-standing Swedish public health measure.',
    warning_label_required: 0,
    regulation_ref: 'EU Reg 853/2004 Annex III Section IX; LIVSFS 2005:20; Livsmedelsverket position on raw milk',
  },
  {
    region: 'National (hela Sverige)',
    permitted: 0,
    sales_methods: 'Restaurants, cafes, food service, school/hospital catering',
    conditions: 'Restaurants and food service establishments may NOT serve raw milk to consumers. All milk used in food service must be heat-treated. Particularly strict for storhushall (institutional catering) serving vulnerable populations.',
    warning_label_required: 0,
    regulation_ref: 'LIVSFS 2005:20; Livsmedelsverket guidelines for storhushall',
  },
  {
    region: 'National (hela Sverige)',
    permitted: 1,
    sales_methods: 'Raw milk cheese production (ostar av opastoriserad mjolk)',
    conditions: 'Raw milk cheese is permitted for sale (both retail and direct). Hard cheese typically aged >60 days. Soft raw-milk cheese requires validated HACCP with specific CCPs for pathogen control. Producer must hold Livsmedelsverket approval (dairy/mejeri). Microbiological testing per EU Reg 2073/2005: Listeria monocytogenes <100 CFU/g at end of shelf life, Salmonella absent in 25g, E. coli limits per cheese type.',
    warning_label_required: 1,
    regulation_ref: 'EU Reg 853/2004 Annex III Section IX; EU Reg 2073/2005 (microbiological criteria); LIVSFS 2005:20',
  },
  {
    region: 'National (hela Sverige)',
    permitted: 1,
    sales_methods: 'Raw milk vending machines (mjolkautomat) at farm',
    conditions: 'Vending machines dispensing raw milk permitted at the farm premises. Same conditions as farm-gate direct sales apply: max 70 litres/week, herd health requirements, registration with lansstyrelsen. Machine must be cleaned and sanitised daily. Temperature maintained max 8 C in machine. Clear signage: "opastoriserad mjolk" with health risk warning. Customer draws milk themselves.',
    warning_label_required: 1,
    regulation_ref: 'LIVSFS 2005:20; Jordbruksverket raw milk guidelines; Livsmedelsverket operativt mal 19',
  },
  {
    region: 'National (hela Sverige)',
    permitted: 1,
    sales_methods: 'Raw goat/sheep milk -- farm-gate sales',
    conditions: 'Same rules as bovine raw milk: farm-gate sales only, max 70 litres/week, herd free from TB and brucellosis, consumer warnings. Goat and sheep milk has separate microbiological criteria. Registration with lansstyrelsen required.',
    warning_label_required: 1,
    regulation_ref: 'EU Reg 853/2004 Annex III Section IX; LIVSFS 2005:20',
  },
  {
    region: 'National (hela Sverige)',
    permitted: 0,
    sales_methods: 'Online ordering with home delivery of raw milk',
    conditions: 'Online sale of raw milk with home delivery is NOT permitted. Raw milk must be drawn in the customer\'s presence at the farm. Ordering online for farm pickup is a grey area -- Livsmedelsverket position is that the milk must be dispensed on-farm.',
    warning_label_required: 0,
    regulation_ref: 'LIVSFS 2005:20; Livsmedelsverket FAQ on raw milk',
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
// LABELLING RULES (30 entries -- all EU FIC requirements + Swedish additions)
// ---------------------------------------------------------------------------
const labellingRules = [
  // ---- Universal mandatory fields (all pre-packed food) ----
  { product_type: 'all', field: 'Food name (livsmedlets beteckning)', mandatory: 1, format: 'Legal name if defined by legislation (e.g. "smor", "honung", "juice"). Otherwise customary name or descriptive name. Must not mislead consumer.', regulation_ref: 'EU Reg 1169/2011 Art 17' },
  { product_type: 'all', field: 'Ingredients list', mandatory: 1, format: 'Descending order by weight at time of manufacture. Allergens highlighted (bold, underline, or CAPS). Compound ingredients broken down if >2%. Water listed if >5%.', regulation_ref: 'EU Reg 1169/2011 Art 18-20' },
  { product_type: 'all', field: 'Allergen declaration', mandatory: 1, format: '14 mandatory allergens: gluten (wheat, rye, barley, oats), crustaceans, eggs, fish, peanuts, soy, milk (including lactose), tree nuts (almond, hazelnut, walnut, cashew, pecan, brazil, pistachio, macadamia), celery, mustard, sesame, sulphites (>10 mg/kg SO2), lupin, molluscs. Must be emphasised in ingredients list. "May contain" (kan innehalla spår av) for cross-contamination is voluntary.', regulation_ref: 'EU Reg 1169/2011 Art 21, Annex II' },
  { product_type: 'all', field: 'Nutrition declaration', mandatory: 1, format: 'Per 100g/100ml mandatory: energy (kJ/kcal), fat, saturated fat (av vilka mattade fetter), carbohydrates, sugars (av vilka sockerarter), protein, salt. Per portion optional. Exemptions: unprocessed single-ingredient products, herbs/spices, water, tea/coffee, vinegar, very small packages.', regulation_ref: 'EU Reg 1169/2011 Art 29-35, Annex V (exemptions)' },
  { product_type: 'all', field: 'Net quantity (nettomangd)', mandatory: 1, format: 'Weight (g/kg) for solids, volume (ml/l/cl) for liquids. Font size minimum per package surface area: <80 cm2 = 2mm; 80-500 cm2 = 3mm; >500 cm2 = 4mm.', regulation_ref: 'EU Reg 1169/2011 Art 23; EU Directive 76/211/EEC' },
  { product_type: 'all', field: 'Date marking', mandatory: 1, format: 'Best-before (bast fore) for shelf-stable products. Use-by (sista forbrukningsdag) for perishable products where safety is the concern (fresh meat, fish, ready-to-eat salads). Format: day/month/year. Best-before month/year if shelf life >3 months. "Bast fore: se lock/botten" (see lid/bottom) permitted.', regulation_ref: 'EU Reg 1169/2011 Art 24, Annex X' },
  { product_type: 'all', field: 'Storage conditions', mandatory: 1, format: 'Required when specific conditions affect shelf life or safety. Swedish standard phrasing: "Forvaras i kylskap, max 8 C", "Forvaras svalt och torrt", "Forvaras frostfritt". Post-opening instructions: "Oppnad forpackning forvaras i kylskap, anvands inom X dagar".', regulation_ref: 'EU Reg 1169/2011 Art 25' },
  { product_type: 'all', field: 'Producer / business name and address', mandatory: 1, format: 'Name and address of the food business operator (FBO) responsible for the product in the EU. For imported products: name of EU importer.', regulation_ref: 'EU Reg 1169/2011 Art 8' },
  { product_type: 'all', field: 'Lot number (partinummer)', mandatory: 1, format: 'Batch/lot identification prefixed with "L" (e.g. L2026-04-01 or L1234). Enables traceability and targeted recall. Can be integrated into date marking.', regulation_ref: 'EU Directive 2011/91/EU' },
  { product_type: 'all', field: 'Country of origin (ursprungsland)', mandatory: 0, format: 'Mandatory for: beef (EU Reg 1760/2000), pork/poultry/lamb (EU Reg 1337/2013), honey (Directive 2001/110/EC), olive oil, fruit/vegetables, fish (EU Reg 1379/2013), wine. Voluntary for other foods unless omission would mislead (Art 26(2)). Must name specific countries, not just "EU/non-EU".', regulation_ref: 'EU Reg 1169/2011 Art 26; EU Reg 1337/2013; EU Reg 1760/2000' },
  { product_type: 'all', field: 'Language (sprak)', mandatory: 1, format: 'Labels must be in Swedish (svenska) for products sold in Sweden. Additional languages permitted but must not obscure Swedish text. Swedish-specific phrasing: "bast fore" (not "best before").', regulation_ref: 'EU Reg 1169/2011 Art 15; LIVSFS 2014:4' },
  { product_type: 'all', field: 'Usage instructions (anvandningsinstruktioner)', mandatory: 0, format: 'Required when product cannot be used properly without instructions. E.g. cooking instructions for raw meat, reconstitution instructions for dried products.', regulation_ref: 'EU Reg 1169/2011 Art 27' },
  { product_type: 'all', field: 'Alcohol content', mandatory: 0, format: 'Mandatory if alcohol >1.2% by volume. Format: "X % vol" or "X vol-%". Beverages >1.2% ABV exempt from nutrition declaration and ingredients list.', regulation_ref: 'EU Reg 1169/2011 Art 28, Annex XII' },

  // ---- Product-specific mandatory fields ----
  { product_type: 'meat', field: 'Origin labelling for fresh meat', mandatory: 1, format: 'Beef: born in [country], reared in [country], slaughtered in [country]. Pork/poultry/ovine: reared in [country], slaughtered in [country]. If born, reared, slaughtered in same country: "Ursprung: [country]". Must name specific countries.', regulation_ref: 'EU Reg 1337/2013; EU Reg 1760/2000 (beef)' },
  { product_type: 'meat', field: 'Approval mark (identifieringsmarke)', mandatory: 1, format: 'Oval identification mark: country code (SE) + establishment approval number + CE/EC. Required on all products of animal origin from approved establishments. Health mark (rundstampel) at slaughter.', regulation_ref: 'EU Reg 853/2004 Annex II Section I' },
  { product_type: 'meat', field: 'Meat content percentage', mandatory: 1, format: 'For processed meat products (korv, charkuterier): meat content as percentage by weight. "Kotthalt: X%". Must specify species of meat used (e.g. "notkott 45%, flaskkott 30%").', regulation_ref: 'EU Reg 1169/2011 Annex VII Part B (QUID)' },
  { product_type: 'meat', field: 'Restaurant origin disclosure (LIVSFS 2024:11)', mandatory: 1, format: 'From 1 March 2025: restaurants, cafes, and storhushall must inform consumers of origin country for beef, pork, ovine/caprine, and poultry meat. Can be on menu, separate sign, or verbal on request. Does not apply to composite products (e.g. sausages, pre-cooked hamburgers from suppliers).', regulation_ref: 'LIVSFS 2024:11; EU Reg 1169/2011 Art 44' },
  { product_type: 'honey', field: 'Country of origin for honey', mandatory: 1, format: 'Specific country names required (not just "EU/non-EU blend"). Multiple origins: "blandning av honung fran [country 1], [country 2]". Single origin: "Honung fran Sverige" etc.', regulation_ref: 'EU Directive 2001/110/EC Art 2(4); LIVSFS 2003:10' },
  { product_type: 'fish', field: 'Species and catch information', mandatory: 1, format: 'Commercial name + scientific (Latin) name. Production method: "fångad" (caught) or "odlad" (farmed). Catch area: FAO zone number + subarea name (e.g. "Nordostatlanten, FAO 27, Östersjön"). Fishing gear category (e.g. "not" = net, "trål" = trawl).', regulation_ref: 'EU Reg 1379/2013 Art 35' },
  { product_type: 'fish', field: 'Defrosting indication', mandatory: 1, format: '"Upptinad" (defrosted) must be indicated for products sold as fresh that were previously frozen. Exemption: ingredients in a final product, or where freezing is a required processing step (parasite control).', regulation_ref: 'EU Reg 1169/2011 Annex VI Part A point 2' },
  { product_type: 'eggs', field: 'Egg shell marking', mandatory: 1, format: 'Stamped on shell: farming method digit (0=ekologisk/organic, 1=frigående utomhus/free-range, 2=frigående inomhus/barn, 3=inredd bur/enriched cage) + SE + producer ID number. Example: "1-SE-12345". Exemption for direct farm-gate sales with <10,000 hens.', regulation_ref: 'EU Reg 589/2008 Art 7-9' },
  { product_type: 'dairy', field: 'Fat content', mandatory: 1, format: 'Mandatory for milk (fetthalt: 3% = standardmjolk, 1.5% = mellanmjolk, 0.5% = lattmjolk, 0.1% = minimjolk). For cheese: fat content in dry matter or absolute. For butter: min 80% milkfat.', regulation_ref: 'EU Reg 1308/2013; EU Reg 1169/2011' },
  { product_type: 'dairy', field: 'Heat treatment', mandatory: 1, format: 'Type of heat treatment mandatory: "pastöriserad" (pasteurised), "UHT-behandlad" (UHT), "opastöriserad" (unpasteurised/raw). For cheese: milk treatment method.', regulation_ref: 'EU Reg 853/2004 Annex III Section IX; EU Reg 1169/2011' },
  { product_type: 'organic', field: 'Organic labelling', mandatory: 1, format: 'EU organic leaf logo mandatory for pre-packed EU-produced organic food. Certification body code number (e.g. SE-EKO-01 for KRAV). Production location: "EU-/icke-EU-jordbruk" or specific country. KRAV logo in addition to EU leaf for KRAV-certified products.', regulation_ref: 'EU Reg 2018/848 Art 32-33; EU Reg 271/2010' },
  // ---- Non-prepacked food (Swedish additions) ----
  { product_type: 'non-prepacked', field: 'Allergen information at point of sale', mandatory: 1, format: 'For food sold non-prepacked (deli counter, bakery, restaurant): allergen information must be available to consumer. Can be written (sign, menu, binder) or oral (staff informed). If oral: sign must state "Fraga oss om allergener" or equivalent. LIVSFS 2014:4 implements EU Reg 1169/2011 Art 44.', regulation_ref: 'LIVSFS 2014:4; EU Reg 1169/2011 Art 44' },
  { product_type: 'non-prepacked', field: 'Food name for non-prepacked food', mandatory: 1, format: 'Non-prepacked food must display the food name (denomination) either on the product, a sign, or verbally. This includes loose bread, pastries, deli meats at counter.', regulation_ref: 'LIVSFS 2014:4; EU Reg 1169/2011 Art 44' },
  { product_type: 'prepacked-for-direct-sale', field: 'Allergen and date marking', mandatory: 1, format: 'Food prepacked at point of sale for immediate/same-day sale (e.g. sandwiches, salads made in-store): must have allergen information and date marking. Full FIC labelling not required if sold on same premises.', regulation_ref: 'LIVSFS 2014:4; EU Reg 1169/2011 Art 44' },
  // ---- Distance selling (online) ----
  { product_type: 'distance-selling', field: 'Pre-purchase information', mandatory: 1, format: 'All mandatory labelling information (except date marking and lot number) must be available to consumer BEFORE purchase is concluded -- on the website, app, or catalogue. Date marking and lot number on delivered product.', regulation_ref: 'EU Reg 1169/2011 Art 14; LIVSFS 2014:4' },
  // ---- Frozen food ----
  { product_type: 'frozen', field: 'Freezing date', mandatory: 1, format: 'For frozen meat, frozen meat preparations, and frozen unprocessed fishery products: date of freezing or date of first freezing. Format: "Infrysingsdatum: DD/MM/ÅÅÅÅ".', regulation_ref: 'EU Reg 1169/2011 Annex III point 6' },
  { product_type: 'frozen', field: 'Do not refreeze warning', mandatory: 0, format: '"Får ej frysas om" (do not refreeze) -- recommended practice for defrosted products sold at retail, though not always legally mandatory.', regulation_ref: 'EU Reg 1169/2011; LIVSFS 2005:20 guidance' },
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
// FTS5 SEARCH INDEX (comprehensive entries for all data)
// ---------------------------------------------------------------------------
const insertFts = db.instance.prepare(
  'INSERT INTO search_index (title, body, product_type, jurisdiction) VALUES (?, ?, ?, ?)'
);

// Index products
for (const p of products) {
  insertFts.run(
    p.name,
    `${p.product_type} ${p.species ?? ''} product Swedish food safety regulation`,
    p.product_type ?? '',
    'SE'
  );
}

// Index product requirements
for (const r of productRequirements) {
  const product = products.find(p => p.id === r.product_id);
  insertFts.run(
    `${product?.name ?? r.product_id} - ${r.sales_channel} requirements`,
    `${r.temperature_control} ${r.traceability_requirements} ${r.labelling_requirements} ${r.regulation_ref}`,
    product?.product_type ?? '',
    'SE'
  );
}

// Index assurance schemes
for (const s of assuranceSchemes) {
  insertFts.run(
    s.name,
    `${s.standards_summary} ${s.product_types} ${s.audit_frequency}`,
    s.product_types,
    'SE'
  );
}

// Index hygiene rules
for (const h of hygieneRules) {
  insertFts.run(
    `Hygiene: ${h.activity} - ${h.premises_type}`,
    `${h.temperature_controls} ${h.cleaning_requirements} ${h.registration_type} ${h.regulation_ref}`,
    h.activity,
    'SE'
  );
}

// Index raw milk rules
for (const r of rawMilkRules) {
  insertFts.run(
    `Raw milk rules: ${r.sales_methods?.substring(0, 80)}`,
    `${r.conditions} ${r.sales_methods} ${r.regulation_ref}`,
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

// ---------------------------------------------------------------------------
// Additional FTS entries for cross-cutting topics (boost search coverage)
// ---------------------------------------------------------------------------
const additionalFtsEntries = [
  // Registration and approval
  { title: 'Registering a food business (registrering av livsmedelsverksamhet)', body: 'All food businesses in Sweden must register with the municipality (kommun) or be approved by Livsmedelsverket before starting operations. Registration is a quick process -- you can start after 2 weeks even if no decision received. Approval (godkannande) required for animal-origin food establishments. Livsmedelsverket inspects approved premises. Municipality miljokontor inspects registered premises. LIVSFS 2005:20.', product_type: 'all', jurisdiction: 'SE' },
  { title: 'Livsmedelsverket approval vs municipality registration', body: 'Livsmedelsverket approval: required for slaughterhouses, cutting plants, dairy, egg packing centres, fish processing, game handling -- any establishment processing animal-origin products for onward sale. Municipality registration: required for restaurants, retail shops, bakeries, plant-origin food processing, small-scale operations selling direct to consumer.', product_type: 'all', jurisdiction: 'SE' },
  // HACCP
  { title: 'HACCP requirements in Sweden (egenkontroll)', body: 'All food businesses after primary production must implement HACCP-based procedures (EU Reg 852/2004 Art 5). In Sweden this is part of "egenkontroll" (own-control system). Seven HACCP principles: hazard analysis, CCP identification, critical limits, monitoring, corrective actions, verification, documentation. Simplified HACCP accepted for small operators per LIVSFS 2005:20. Primary production: good hygiene practice (GHP) per Annex I instead of full HACCP.', product_type: 'all', jurisdiction: 'SE' },
  // Salmonella programme
  { title: 'Swedish salmonella control programme', body: 'Sweden has a national salmonella control programme with additional guarantees under EU accession. All poultry flocks tested -- positive flocks destroyed. Applies to eggs, poultry meat, pigs, cattle. Sweden, Finland, and Norway have stricter salmonella controls than the EU baseline. SJVFS 2007:90. Imported poultry and eggs must be tested for salmonella before entering Swedish market or carry health certificate.', product_type: 'poultry', jurisdiction: 'SE' },
  // Temperature controls summary
  { title: 'Swedish food temperature requirements summary', body: 'Fresh red meat max 7 C. Fresh poultry max 4 C. Fresh fish max 2 C (on melting ice). Minced meat max 4 C. Milk and dairy max 8 C. Chilled display max 8 C. Frozen -18 C. Hot holding min 60 C. Reheating min 72 C core. Cooling: 60 C to 8 C within 4 hours. Pasteurisation: 72 C for 15 seconds. Slaughter work area max 12 C. Based on EU Reg 852/2004, 853/2004, and LIVSFS 2005:20.', product_type: 'all', jurisdiction: 'SE' },
  // Direct sales (gardsforjsaljning)
  { title: 'Farm-gate sales rules (gardsforjsaljning)', body: 'Swedish rules for direct sales from farm to consumer. Small quantities of primary products can be sold directly without full approval. Eggs: <10,000 hens exempt from stamping. Honey: no registration for small-scale direct sales. Meat: producer must be registered, slaughter at approved premises (or simplified approval for small poultry). Raw milk: max 70 litres/week, registration with lansstyrelsen. Wild boar: max 10 carcasses direct to consumer (LIVSFS 2024:6). Produce: no registration for direct farm-gate sales.', product_type: 'all', jurisdiction: 'SE' },
  // Wild boar new rules
  { title: 'Wild boar regulations Sweden (LIVSFS 2024:6)', body: 'New rules from 4 November 2024: hunters can deliver small amounts of wild boar to consumers and local retail. Max 25 wild boar per hunter per year to local retail establishments. Max 10 whole wild boar + meat from 10 wild boar direct to consumers. Hunter must complete special training and register with lansstyrelsen. Trichinella sampling mandatory. Cesium testing in certain areas. Documentation of all deliveries required.', product_type: 'meat', jurisdiction: 'SE' },
  // Origin labelling restaurant
  { title: 'Restaurant origin labelling for meat (LIVSFS 2024:11)', body: 'From 1 March 2025: restaurants, cafes, and storhushall (institutional catering) must inform guests about the country of origin of beef, pork, sheep/goat, and poultry meat served. Information can be displayed on menu, separate sign, or provided verbally by staff on request. Does not apply to meat in composite products (e.g. sausages, pre-cooked items from suppliers). Applies only to chilled and frozen meat, including minced. Swedish national measure.', product_type: 'meat', jurisdiction: 'SE' },
  // Allergen management
  { title: 'Allergen management and labelling in Sweden', body: '14 allergens must be declared per EU Reg 1169/2011 Annex II: gluten, crustaceans, eggs, fish, peanuts, soy, milk, tree nuts (8 types), celery, mustard, sesame, sulphites, lupin, molluscs. Pre-packed food: allergens emphasised in ingredients list (bold/caps/underline). Non-prepacked (restaurant, deli): LIVSFS 2014:4 requires allergen info available -- written or oral. Swedish Food Agency guidelines on cross-contamination labelling: "kan innehalla spar av" (may contain traces of) is voluntary, not mandatory.', product_type: 'all', jurisdiction: 'SE' },
  // EU FIC overview
  { title: 'EU Food Information to Consumers Regulation (FIC 1169/2011)', body: 'Harmonised EU labelling regulation since 13 December 2014. Mandatory information: food name, ingredients, allergens, net quantity, date marking, storage, producer, nutrition declaration, origin (where mandatory), lot number. Swedish implementation: LIVSFS 2014:4 adds requirements for Swedish language, non-prepacked food allergen disclosure, and distance selling. Minimum font size 1.2mm x-height (0.9mm for small packages <80 cm2).', product_type: 'all', jurisdiction: 'SE' },
  // Food safety legislation overview
  { title: 'Swedish food safety legislation overview (livsmedelslag)', body: 'Three-level regulatory framework: (1) EU regulations directly applicable -- 178/2002 (General Food Law), 852/2004 (hygiene), 853/2004 (animal-origin), 1169/2011 (FIC), etc. (2) Swedish law: Livsmedelslagen (2006:804), Livsmedelsforordningen (2006:813). (3) Agency regulations: LIVSFS (Livsmedelsverket), SJVFS (Jordbruksverket). Livsmedelsverket is the central competent authority. Municipalities perform most inspections. Jordbruksverket handles primary production control.', product_type: 'all', jurisdiction: 'SE' },
  // Traceability
  { title: 'Food traceability requirements in Sweden (sparbarhet)', body: 'EU Reg 178/2002 Art 18: all food businesses must identify suppliers and recipients of food products ("one step back, one step forward"). Internal traceability (linking incoming batches to outgoing products) not legally required but recommended. Specific traceability rules: beef (individual animal ID per EU Reg 1760/2000), eggs (producer code on shell), fish (species, catch area, vessel), honey (country of origin). Records retained minimum 5 years. Recall procedures documented.', product_type: 'all', jurisdiction: 'SE' },
  // Kontrollwiki
  { title: 'Food safety control in Sweden (kontroll)', body: 'Livsmedelsverket performs control of: slaughterhouses, game handling, approved dairy/fish processing, egg packing centres. Municipalities (kommunens miljokontor) control: restaurants, retail shops, bakeries, registered food businesses. Jordbruksverket: primary production. Control frequency based on risk classification. Livsmedelsverket publishes control guidance on Kontrollwiki (kontrollwiki.livsmedelsverket.se). Sanctions: prohibition orders, administrative fees, criminal penalties for serious violations.', product_type: 'all', jurisdiction: 'SE' },
  // Microbiological criteria
  { title: 'Microbiological criteria for food (EU Reg 2073/2005)', body: 'Process hygiene criteria and food safety criteria. Key limits: Listeria monocytogenes <100 CFU/g in ready-to-eat food at end of shelf life (or absent in 25g for products supporting growth). Salmonella absent in 25g for most categories. E. coli process hygiene limits for meat, dairy. Swedish national additional: salmonella programme for poultry (absent in all flocks). Food businesses must sample and test per HACCP plan. Testing labs must be accredited (SWEDAC).', product_type: 'all', jurisdiction: 'SE' },
  // Water for food production
  { title: 'Water quality in food production', body: 'Water used in food production must meet drinking water quality per EU Directive 98/83/EC (recast 2020/2184) and Swedish dricksvattenforeskrifterna (LIVSFS 2022:12). Regular testing required for food businesses using own water supply (private well). Municipal water supply assumed compliant. Clean water and clean seawater definitions for fishery products. Ice made from potable water.', product_type: 'all', jurisdiction: 'SE' },
  // Pest control
  { title: 'Pest control in food premises (skadedjursbekampning)', body: 'EU Reg 852/2004 Annex II Ch. IX requires adequate procedures to prevent pest access. Swedish food businesses typically contract professional pest control (Anticimex, Nomor, Rentokil). Monthly or quarterly inspections depending on risk. Bait stations, fly screens, door seals, waste management. Documentation of pest control activities required for HACCP/egenkontroll.', product_type: 'all', jurisdiction: 'SE' },
  // Staff training
  { title: 'Food handler training requirements (livsmedelshygien utbildning)', body: 'EU Reg 852/2004 Art 4(2) requires food business operators to ensure staff are supervised and instructed/trained in food hygiene matters. No mandatory certification in Sweden (unlike some countries), but operators must demonstrate competence. Livsmedelsverket recommends training covering: personal hygiene, cross-contamination, temperature control, allergens, cleaning. Training records maintained as part of egenkontroll.', product_type: 'all', jurisdiction: 'SE' },
  // Recall procedures
  { title: 'Food recall and withdrawal procedures (aterkallelseforfarande)', body: 'EU Reg 178/2002 Art 19: food business operators who consider or have reason to believe food is not safe must immediately initiate withdrawal from market and inform competent authority. If product may have reached consumers: public recall. In Sweden: notify Livsmedelsverket or municipality. Livsmedelsverket publishes recall notices on website and via Rapid Alert System for Food and Feed (RASFF). Traceability records enable targeted recall.', product_type: 'all', jurisdiction: 'SE' },
  // Organic production in Sweden
  { title: 'Organic production in Sweden (ekologisk produktion)', body: 'EU Reg 2018/848 sets baseline organic rules. KRAV certification (Swedish organic) is stricter. Organic production requires: no synthetic pesticides or fertilizers, no GMOs, crop rotation, animal welfare standards (outdoor access, organic feed, restricted antibiotics), limited food additives in processing. Certification bodies in Sweden: Kiwa (formerly HS Certifiering), SMAK. Annual inspections. EU organic leaf logo + certification body code (SE-EKO-01 etc.) mandatory on label.', product_type: 'all', jurisdiction: 'SE' },
  // Reindeer husbandry
  { title: 'Reindeer meat regulations (renkott rennaring)', body: 'Reindeer husbandry in Sweden is regulated by Rennäringslagen (Reindeer Herding Act). Only Sami people with membership in a sameby (Sami community) have the right to practice reindeer herding. Slaughter at approved facilities. Simplified rules for traditional Sami slaughter. Renmärke (reindeer mark) system for animal identification managed by Sametinget. Reindeer meat: premium product, sold fresh, frozen, dried (renkav), smoked. EU Reg 853/2004 applies.', product_type: 'meat', jurisdiction: 'SE' },
  // Shellfish monitoring
  { title: 'Shellfish production areas and monitoring (musselodling)', body: 'Bivalve molluscs (mussels, oysters) from classified production areas. Class A: direct sale. Class B: must be purified. Class C: relaying required before sale. Livsmedelsverket classifies areas and monitors for biotoxins (PSP, DSP, ASP) and microbiological contamination. Swedish mussel farming primarily blue mussels (Mytilus edulis) on the west coast (Bohuslan). Harvested mussels dispatched through registered dispatch centres.', product_type: 'shellfish', jurisdiction: 'SE' },
  // Novel food
  { title: 'Novel food in Sweden (nya livsmedel)', body: 'EU Reg 2015/2283 on novel foods. Products not consumed significantly in the EU before 1997 require authorisation. Includes: insects for food, algae extracts, CBD products, lab-grown meat. Livsmedelsverket enforces novel food rules in Sweden. Union list of authorised novel foods maintained by EU Commission. Applications through EFSA. Swedish market has some approved insect products (e.g. crickets) and algae products.', product_type: 'all', jurisdiction: 'SE' },
  // Food supplements
  { title: 'Food supplements in Sweden (kosttillskott)', body: 'Regulated by EU Directive 2002/46/EC and LIVSFS 2003:9. Must be registered with Livsmedelsverket before sale. Labelling must include "kosttillskott" designation, recommended daily dose, warning not to exceed recommended dose, statement that supplements do not replace a varied diet. Vitamins and minerals from permitted sources. Health claims per EU Reg 1924/2006. Livsmedelsverket publishes permitted health claims list.', product_type: 'all', jurisdiction: 'SE' },
  // Import requirements
  { title: 'Food import to Sweden (import av livsmedel)', body: 'Intra-EU: free movement under single market, traceability records required. From third countries: border control at designated Border Control Posts (BCP). Animal-origin products: health certificate from country of origin, border veterinary inspection, TRACES-NT notification. Plant-origin: phytosanitary certificate for certain products, random sampling for pesticide residues. Importer must be registered food business in Sweden.', product_type: 'all', jurisdiction: 'SE' },
  // Food waste reduction
  { title: 'Food waste and date marking guidance (matsvinn och datummarkning)', body: 'Livsmedelsverket guidance on reducing food waste through proper date marking. "Bast fore" (best before) = quality date, food often safe to eat after this date. "Sista forbrukningsdag" (use by) = safety date, food should not be eaten after this date. Livsmedelsverket and Naturvardsverket work together on food waste reduction targets. EU target: halve food waste by 2030. Redistribution of food past best-before date permitted if safe.', product_type: 'all', jurisdiction: 'SE' },
  // Food fraud
  { title: 'Food fraud and authenticity (livsmedelsfusk)', body: 'Livsmedelsverket has increased focus on food fraud since the 2013 horse meat scandal. Kontrollfunktionen mot livsmedelsbedragerier established. Common fraud areas: meat species substitution, olive oil adulteration, honey dilution, organic fraud. Swedish food chain testing programme. RASFF and AAC network for cross-border fraud. Penalties under Livsmedelslagen (2006:804). Livsmedelsverket can impose sanctions and forward cases to prosecution.', product_type: 'all', jurisdiction: 'SE' },
];

for (const entry of additionalFtsEntries) {
  insertFts.run(entry.title, entry.body, entry.product_type, entry.jurisdiction);
}

const totalFts = products.length + productRequirements.length + assuranceSchemes.length +
  hygieneRules.length + rawMilkRules.length + labellingRules.length + additionalFtsEntries.length;
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
