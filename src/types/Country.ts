export type RawCountry = {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: {
    name: string;
  }[];
};

export type Country = {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: string[];
};
