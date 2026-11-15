import { HttpError } from './HttpError.js';
import type { RawCountry } from '../types/Country.js';

export async function searchCountries(query: string, signal: AbortSignal): Promise<RawCountry[]> {
  const url = `https://countries.dev/name/${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    signal,
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new HttpError(response.status);
  }

  return (await response.json()) as RawCountry[];
}
