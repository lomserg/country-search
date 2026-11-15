import type { Country, RawCountry } from '../types/Country.js';
export function mapCountryResponse(raw: RawCountry): Country {
  return {
    name: raw.name,
    flag: raw.flag,
    capital: raw.capital,
    region: raw.region,
    population: raw.population,
    languages: raw.languages.map((language) => language.name),
  };
}
