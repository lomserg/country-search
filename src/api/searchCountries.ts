import { HttpError } from './HttpError';

export async function searchCountries(query: string, signal: AbortSignal) {
  const url = `https://countries.dev/name/${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    signal: signal,
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new HttpError(response.status);
  }
  return await response.json();
}
