import { createDatabase, type Database } from '../../src/db.js';

export function createSeededDatabase(dbPath: string): Database {
  const db = createDatabase(dbPath);

  // Products
  db.run(
    `INSERT INTO products (id, name, product_type, species, jurisdiction)
     VALUES (?, ?, ?, ?, ?)`,
    ['prod-001', 'Notkreaturskott', 'meat', 'cattle', 'SE']
  );
  db.run(
    `INSERT INTO products (id, name, product_type, species, jurisdiction)
     VALUES (?, ?, ?, ?, ?)`,
    ['prod-002', 'Obehandlad mjolk', 'dairy', 'cattle', 'SE']
  );
  db.run(
    `INSERT INTO products (id, name, product_type, species, jurisdiction)
     VALUES (?, ?, ?, ?, ?)`,
    ['prod-003', 'Honung', 'honey', 'bee', 'SE']
  );

  // Product requirements
  db.run(
    `INSERT INTO product_requirements (product_id, sales_channel, registration_required, approval_required, temperature_control, traceability_requirements, labelling_requirements, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['prod-001', 'detaljhandel', 1, 1, 'Max 7C vid transport och forvarning', 'Sarskilda krav pa batchsparbarhet och ursprungsmarkning', 'Ursprungsland, styckningsanlaggning, hallbarhetsdatum', 'EU 853/2004', 'SE']
  );
  db.run(
    `INSERT INTO product_requirements (product_id, sales_channel, registration_required, approval_required, temperature_control, traceability_requirements, labelling_requirements, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['prod-001', 'gardsforjsaljning', 1, 0, 'Max 7C vid forvarning', 'Notering av forsaljningsdatum och mangd', 'Produktnamn, datum, producent', 'LIVSFS 2005:20', 'SE']
  );
  db.run(
    `INSERT INTO product_requirements (product_id, sales_channel, registration_required, approval_required, temperature_control, traceability_requirements, labelling_requirements, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['prod-002', 'gardsforjsaljning', 1, 0, 'Max 8C inom 2 timmar efter mjolkning', 'Datum och mangd per forsaljningstillfalle', 'Varningstext: obehandlad mjolk', 'LIVSFS 2005:20', 'SE']
  );

  // Assurance schemes
  db.run(
    `INSERT INTO assurance_schemes (id, name, product_types, standards_summary, audit_frequency, cost_indication, url, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['scheme-001', 'Svenskt Sigill', 'meat, dairy, vegetables', 'IP-certifiering for livsmedelssakerhet, djurvalfard, miljo', 'arligen', '5000-15000 SEK/ar', 'https://www.sigill.se/', 'SE']
  );
  db.run(
    `INSERT INTO assurance_schemes (id, name, product_types, standards_summary, audit_frequency, cost_indication, url, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['scheme-002', 'KRAV', 'meat, dairy, vegetables, cereals', 'Ekologisk certifiering - miljo, djurvalfard, halsa', 'arligen', '3000-20000 SEK/ar', 'https://www.krav.se/', 'SE']
  );

  // Hygiene rules
  db.run(
    `INSERT INTO hygiene_rules (activity, premises_type, registration_type, haccp_required, temperature_controls, cleaning_requirements, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['slakt', 'gard', 'registrering hos Livsmedelsverket', 1, 'Max 7C inom 4 timmar', 'Daglig rengoring och desinfektion av utrustning', 'EU 852/2004', 'SE']
  );
  db.run(
    `INSERT INTO hygiene_rules (activity, premises_type, registration_type, haccp_required, temperature_controls, cleaning_requirements, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['forpackning', 'mejeri', 'godkannande av Livsmedelsverket', 1, 'Produktspecifika krav', 'HACCP-baserat rengoringsschema', 'EU 853/2004', 'SE']
  );

  // Raw milk rules
  db.run(
    `INSERT INTO raw_milk_rules (region, permitted, sales_methods, conditions, warning_label_required, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['hela Sverige', 1, 'Direkt fran gard till konsument', 'Max 70 liter per vecka, kylning inom 2 timmar', 1, 'LIVSFS 2005:20', 'SE']
  );
  db.run(
    `INSERT INTO raw_milk_rules (region, permitted, sales_methods, conditions, warning_label_required, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['hela Sverige', 0, 'Detaljhandel och restaurang', 'Ej tillatid forsaljning via butik eller servering', 0, 'LIVSFS 2005:20', 'SE']
  );

  // Labelling rules
  db.run(
    `INSERT INTO labelling_rules (product_type, field, mandatory, format, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['meat', 'ursprungsland', 1, 'Text: "Ursprung: [land]"', 'EU 1169/2011', 'SE']
  );
  db.run(
    `INSERT INTO labelling_rules (product_type, field, mandatory, format, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['meat', 'hallbarhetsdatum', 1, '"Sista forbrukningsdag" for farskt kott', 'EU 1169/2011', 'SE']
  );
  db.run(
    `INSERT INTO labelling_rules (product_type, field, mandatory, format, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['honey', 'ursprungsland', 1, 'Text: "Ursprung: [land]" eller "Blandning fran EU/icke-EU"', 'LIVSFS 2003:10', 'SE']
  );
  db.run(
    `INSERT INTO labelling_rules (product_type, field, mandatory, format, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['all', 'ingrediensforteckning', 1, 'I fallande ordning efter vikt', 'EU 1169/2011', 'SE']
  );

  // FTS5 search index
  db.run(
    `INSERT INTO search_index (title, body, product_type, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Notkreaturskott forsaljning', 'Krav pa registrering och godkannande for forsaljning av notkreaturskott. Temperaturkontroll max 7C.', 'meat', 'SE']
  );
  db.run(
    `INSERT INTO search_index (title, body, product_type, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Obehandlad mjolk gardsforjsaljning', 'Regler for gardsforjsaljning av obehandlad mjolk. Varningstext obligatorisk.', 'dairy', 'SE']
  );
  db.run(
    `INSERT INTO search_index (title, body, product_type, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Honung markning', 'Markningskrav for honung. Ursprungsland obligatoriskt.', 'honey', 'SE']
  );

  return db;
}
