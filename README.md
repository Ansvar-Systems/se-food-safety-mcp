# Sweden Food Safety MCP

Swedish food safety regulations, product requirements, labelling rules, hygiene standards, and traceability requirements. Query Swedish food safety data through the [Model Context Protocol](https://modelcontextprotocol.io).

> **Data sources:** Livsmedelsverket (Swedish Food Agency), Jordbruksverket (Swedish Board of Agriculture), EU Regulation 852/2004, EU Regulation 853/2004, LIVSFS. Licensed under applicable Swedish open data terms.

## Quick Start

### Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "se-food-safety": {
      "command": "npx",
      "args": ["-y", "@ansvar/se-food-safety-mcp"]
    }
  }
}
```

### Streamable HTTP (Docker)

```
https://mcp.ansvar.eu/se-food-safety/mcp
```

## Tools

| Tool | Description |
|------|-------------|
| `about` | Get server metadata: name, version, coverage, data sources, and links. |
| `list_sources` | List all data sources with authority, URL, license, and freshness info. |
| `check_data_freshness` | Check when data was last ingested, staleness status, and how to trigger a refresh. |
| `search_food_safety` | Search Swedish food safety regulations, product requirements, hygiene rules, and labelling standards. |
| `get_product_requirements` | Get food safety requirements for a specific product: temperature, registration, traceability, labelling. |
| `get_traceability_rules` | Get traceability requirements by product type and species: batch tracking, origin documentation, supply chain records. |
| `check_direct_sales_rules` | Check rules for direct sales (gardsforjsaljning): farm gate, farmers markets, small-volume exemptions. |
| `get_labelling_requirements` | Get mandatory and optional labelling fields for a food product per EU FIC 1169/2011 and Swedish additions. |
| `get_assurance_scheme_requirements` | Get details about Swedish food quality schemes: IP Sigill, KRAV, Svensk Fagel, Fran Sverige, Naturbeteskott. |
| `get_hygiene_requirements` | Get hygiene rules for food activities: slaughter, processing, storage, transport, HACCP, temperature controls. |
| `check_raw_milk_rules` | Check Swedish rules for raw (unpasteurised) milk sales: permitted methods, herd health, consumer warnings. |

## Example Queries

- "Vilka regler galler for gardsforjsaljning av kott?" (What rules apply to farm-gate meat sales?)
- "What labelling is required for selling honey at a farmers market in Sweden?"
- "Vilka hygienregler galler for smakalig slakt?" (What hygiene rules apply to small-scale slaughter?)
- "What are the KRAV certification requirements for dairy?"

## Stats

| Metric | Value |
|--------|-------|
| Jurisdiction | SE (Sweden) |
| Tools | 11 |
| Transport | stdio + Streamable HTTP |
| License | Apache-2.0 |

## Links

- [Ansvar MCP Network](https://ansvar.eu/open-agriculture)
- [GitHub](https://github.com/ansvar-systems/se-food-safety-mcp)
- [All Swedish Agriculture MCPs](https://mcp.ansvar.eu)
