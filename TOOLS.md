# Tools Reference

## Meta Tools

### `about`

Get server metadata: name, version, coverage, data sources, and links.

**Parameters:** None

**Returns:** Server name, version, jurisdiction list, data source names (5 sources), tool count, homepage/repository links.

---

### `list_sources`

List all data sources with authority, URL, license, and freshness info.

**Parameters:** None

**Returns:** Array of sources (Livsmedelsverket, Jordbruksverket, EU 852/2004, EU 853/2004, LIVSFS), each with `name`, `authority`, `official_url`, `retrieval_method`, `update_frequency`, `license`, `coverage`, `last_retrieved`.

---

### `check_data_freshness`

Check when data was last ingested, staleness status, and how to trigger a refresh.

**Parameters:** None

**Returns:** `status` (fresh/stale/unknown), `last_ingest`, `build_date`, `schema_version`, `days_since_ingest`, `staleness_threshold_days` (90), `refresh_command`.

---

## Domain Tools

### `search_food_safety`

Full-text search across food safety topics by product type. Uses tiered FTS5 search.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Free-text search query (Swedish terms work best) |
| `product_type` | string | No | Filter by product type (e.g. "dairy", "meat", "eggs") |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |
| `limit` | number | No | Max results (default: 20, max: 50) |

**Returns:** `results_count`, array of results with `title`, `body`, `product_type`, `relevance_rank`.

**Example:** `{ "query": "mjolk hygien" }`

---

### `get_product_requirements`

Get regulatory requirements for a specific food product by product name/ID and sales channel.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `product` | string | Yes | Product ID or name |
| `sales_channel` | string | No | Sales channel filter (e.g. "detaljhandel", "gardsforjsaljning") |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** Product details, array of requirements with `sales_channel`, `registration_required`, `approval_required`, `temperature_control`, `traceability_requirements`, `labelling_requirements`, `regulation_ref`.

**Example:** `{ "product": "ost", "sales_channel": "gardsforjsaljning" }`

---

### `get_traceability_rules`

Get traceability requirements by product type and species.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `product_type` | string | Yes | Product type (e.g. "dairy", "meat", "eggs", "honey") |
| `species` | string | No | Species filter (e.g. "cattle", "pig") |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** Array of traceability rules with `name`, `product_type`, `species`, `traceability_requirements`, `regulation_ref`, `sales_channel`.

**Example:** `{ "product_type": "meat", "species": "cattle" }`

---

### `check_direct_sales_rules`

Check farm-gate and direct-to-consumer sales rules for a product (gardsforjsaljning).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `product` | string | Yes | Product ID or name |
| `sales_method` | string | No | Sales method filter |
| `volume` | string | No | Volume description for threshold assessment |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** Product details, direct sales requirements (registration, approval, temperature, labelling), plus raw milk cross-reference for dairy products.

**Example:** `{ "product": "mjolk" }`

---

### `get_labelling_requirements`

Get labelling rules for a product type: mandatory and optional fields, formats, regulation references.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `product` | string | Yes | Product ID, name, or product type |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** Array of labelling rules with `field`, `mandatory` (boolean), `format`, `regulation_ref`, separated into mandatory and optional groups.

**Example:** `{ "product": "honung" }`

---

### `get_assurance_scheme_requirements`

Get details on Swedish food quality assurance schemes. Can look up a specific scheme or list all.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `scheme` | string | No | Scheme ID or name (omit to list all schemes) |
| `product_type` | string | No | Filter by product type |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** For a specific scheme: `name`, `product_types`, `standards_summary`, `audit_frequency`, `cost_indication`, `url`. For listing: array of all matching schemes.

**Example:** `{ "scheme": "Svenskt Sigill" }`

---

### `get_hygiene_requirements`

Get hygiene rules for a specific food handling activity and premises type.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `activity` | string | Yes | Activity (e.g. "slakt", "forpackning", "tillagning", "forvarning") |
| `premises_type` | string | No | Premises type filter (e.g. "gard", "mejeri", "restaurang") |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** Array of rules with `activity`, `premises_type`, `registration_type`, `haccp_required` (boolean), `temperature_controls`, `cleaning_requirements`, `regulation_ref`.

**Example:** `{ "activity": "slakt", "premises_type": "gard" }`

---

### `check_raw_milk_rules`

Check raw milk sales rules by region and sales method.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | No | Region filter |
| `sales_method` | string | No | Sales method filter |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** Array of rules with `region`, `permitted` (boolean), `sales_methods`, `conditions`, `warning_label_required` (boolean), `regulation_ref`.

**Example:** `{ "region": "hela Sverige" }`
