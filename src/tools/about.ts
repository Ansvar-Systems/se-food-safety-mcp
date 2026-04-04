import { buildMeta } from '../metadata.js';
import { SUPPORTED_JURISDICTIONS } from '../jurisdiction.js';

export function handleAbout() {
  return {
    name: 'Sweden Food Safety MCP',
    description:
      'Swedish food safety regulations, product requirements, labelling rules, hygiene standards, ' +
      'raw milk rules, quality assurance schemes, and traceability requirements. Based on ' +
      'Livsmedelsverket (Swedish Food Agency) regulations, EU Regulation 852/2004 and 853/2004, ' +
      'and Swedish additions (LIVSFS).',
    version: '0.1.0',
    jurisdiction: [...SUPPORTED_JURISDICTIONS],
    data_sources: [
      'Livsmedelsverket (Swedish Food Agency)',
      'Jordbruksverket (Swedish Board of Agriculture)',
      'EU Regulation 852/2004 (hygiene)',
      'EU Regulation 853/2004 (animal-origin foods)',
      'LIVSFS (Swedish food regulation series)',
    ],
    tools_count: 11,
    links: {
      homepage: 'https://ansvar.eu/open-agriculture',
      repository: 'https://github.com/ansvar-systems/se-food-safety-mcp',
      mcp_network: 'https://ansvar.ai/mcp',
    },
    _meta: buildMeta(),
  };
}
