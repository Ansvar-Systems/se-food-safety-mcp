export interface Meta {
  disclaimer: string;
  data_age: string;
  source_url: string;
  copyright: string;
  server: string;
  version: string;
}

const DISCLAIMER =
  'This data is provided for informational purposes only. It does not constitute professional ' +
  'food safety or legal advice. Always consult Livsmedelsverket (Swedish Food Agency) or a ' +
  'qualified food safety advisor before making compliance decisions. Data sourced from ' +
  'Livsmedelsverket, Jordbruksverket, and EU regulations.';

export function buildMeta(overrides?: Partial<Meta>): Meta {
  return {
    disclaimer: DISCLAIMER,
    data_age: overrides?.data_age ?? 'unknown',
    source_url: overrides?.source_url ?? 'https://www.livsmedelsverket.se/',
    copyright: 'Data: Swedish Food Agency (Livsmedelsverket). Server: Apache-2.0 Ansvar Systems.',
    server: 'se-food-safety-mcp',
    version: '0.1.0',
    ...overrides,
  };
}

export function buildStalenessWarning(publishedDate: string): string | undefined {
  const published = new Date(publishedDate);
  const now = new Date();
  const daysSincePublished = Math.floor(
    (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSincePublished > 14) {
    return `Data is ${daysSincePublished} days old (published ${publishedDate}). Check current regulations before making decisions.`;
  }
  return undefined;
}
