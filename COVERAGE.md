# Coverage

## What Is Included

- **Product requirements** -- Registration, approval, temperature control, traceability, and labelling requirements by product and sales channel
- **Hygiene rules** -- Activity-specific hygiene requirements: premises type, registration type, HACCP obligations, temperature controls, cleaning requirements
- **Labelling rules** -- Mandatory and optional labelling fields by product type with format specifications and regulation references
- **Raw milk rules** -- Regional rules for raw milk sales: permitted status, sales methods, conditions, warning label requirements
- **Assurance schemes** -- Swedish quality assurance scheme details: product coverage, standards summaries, audit frequencies, cost indications
- **Traceability rules** -- Product-type-specific traceability requirements with species and sales channel context
- **Direct sales rules** -- Farm-gate and direct-to-consumer sales requirements (gardsforjsaljning) including raw milk cross-references
- **Full-text search** -- Tiered FTS5 search across food safety topics by product type

## Jurisdictions

| Code | Country | Status |
|------|---------|--------|
| SE | Sweden | Supported |

## Data Sources

| Source | Authority | Coverage |
|--------|-----------|----------|
| Livsmedelsverket | Swedish Food Agency | Food safety regulations, hygiene rules, labelling, LIVSFS |
| Jordbruksverket | Swedish Board of Agriculture | Animal health, raw milk, farm-level food production |
| EU Regulation 852/2004 | European Commission | General food hygiene requirements |
| EU Regulation 853/2004 | European Commission | Specific hygiene rules for animal-origin foods |
| LIVSFS | Livsmedelsverkets forfattningssamling | Swedish food regulation series |

## What Is NOT Included

- **Feed safety** -- Animal feed regulations are not covered (separate regulatory framework)
- **Food contact materials** -- Packaging and contact material rules are not included
- **Novel food approvals** -- EU Novel Food regulation applications not covered
- **Import/export requirements** -- Focus is domestic production and sales
- **Allergen management** -- Beyond labelling requirements, allergen risk assessment is not covered
- **Water quality for food production** -- Dricksvattenforskrifterna not included
- **Other Nordic countries** -- Sweden only

## Known Gaps

1. Labelling rules cover common product types but not all LIVSFS product categories
2. Raw milk rules are region-level; some municipalities may have additional restrictions
3. Assurance scheme costs are indicative ranges, not current fee schedules
4. Hygiene requirements are summarised from regulation text, not verbatim
5. FTS5 search works best with Swedish terms (e.g. "mjolk", "gardsforjsaljning", "markning") rather than English

## Data Freshness

Run `check_data_freshness` to see when data was last updated. Staleness threshold is 90 days. Manual refresh: `gh workflow run ingest.yml`.
