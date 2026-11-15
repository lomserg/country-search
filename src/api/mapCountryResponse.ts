type RawCountry = {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: {
    name: string;
  }[];
};

export function mapCountryResponse(raw: RawCountry) {
  return {
    name: raw.name,
    flag: raw.flag,
    capital: raw.capital,
    region: raw.region,
    population: raw.population,
    languages: raw.languages.map((language) => language.name),
  };
  // TODO: implement
}
