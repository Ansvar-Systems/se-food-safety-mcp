import { buildMeta } from '../metadata.js';
import type { Database } from '../db.js';

interface Source {
  name: string;
  authority: string;
  official_url: string;
  retrieval_method: string;
  update_frequency: string;
  license: string;
  coverage: string;
  last_retrieved?: string;
}

export function handleListSources(db: Database): { sources: Source[]; _meta: ReturnType<typeof buildMeta> } {
  const lastIngest = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['last_ingest']);

  const sources: Source[] = [
    {
      name: 'Livsmedelsverket (Swedish Food Agency)',
      authority: 'Livsmedelsverket',
      official_url: 'https://www.livsmedelsverket.se/',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'quarterly',
      license: 'Swedish government open data',
      coverage: 'Food safety regulations, hygiene rules, labelling requirements, product requirements for Sweden',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Jordbruksverket (Swedish Board of Agriculture)',
      authority: 'Jordbruksverket',
      official_url: 'https://www.jordbruksverket.se/',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'quarterly',
      license: 'Swedish government open data',
      coverage: 'Animal health, raw milk regulations, farm-level food production rules',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'EU Regulation 852/2004 (General food hygiene)',
      authority: 'European Commission',
      official_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32004R0852',
      retrieval_method: 'REFERENCE',
      update_frequency: 'as amended',
      license: 'EU public domain',
      coverage: 'General hygiene requirements for food business operators',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'EU Regulation 853/2004 (Animal-origin foods)',
      authority: 'European Commission',
      official_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32004R0853',
      retrieval_method: 'REFERENCE',
      update_frequency: 'as amended',
      license: 'EU public domain',
      coverage: 'Specific hygiene rules for food of animal origin',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'LIVSFS (Livsmedelsverkets forfattningssamling)',
      authority: 'Livsmedelsverket',
      official_url: 'https://www.livsmedelsverket.se/om-oss/lagstiftning1/gallande-lagstiftning',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'as published',
      license: 'Swedish government open data',
      coverage: 'Swedish national food safety regulations supplementing EU rules',
      last_retrieved: lastIngest?.value,
    },
  ];

  return {
    sources,
    _meta: buildMeta({ source_url: 'https://www.livsmedelsverket.se/' }),
  };
}
