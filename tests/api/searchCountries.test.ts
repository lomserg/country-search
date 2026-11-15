import { describe, it, expect, vi } from 'vitest';
import { searchCountries } from '../../src/api/searchCountries';
import { HttpError } from '../../src/api/HttpError';

describe('searchCountries', () => {
  it('should fetch countries by query', async () => {
    const mockCountries = [
      {
        name: 'Canada',
        flag: '🇨🇦',
        capital: 'Ottawa',
        region: 'Americas',
        population: 38005238,
        languages: [{ name: 'English' }, { name: 'French' }],
      },
    ];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockCountries),
    });

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    await searchCountries('canada', controller.signal);

    expect(fetchMock).toHaveBeenCalledWith('https://countries.dev/name/canada', {
      signal: controller.signal,
    });

    vi.unstubAllGlobals();
  });
  it('should return countries data', async () => {
    const mockCountries = [
      {
        name: 'Canada',
        flag: '🇨🇦',
        capital: 'Ottawa',
        region: 'Americas',
        population: 38005238,
        languages: [{ name: 'English' }, { name: 'French' }],
      },
    ];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockCountries),
    });

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    const result = await searchCountries('canada', controller.signal);

    expect(result).toEqual(mockCountries);

    vi.unstubAllGlobals();
  });
  it('should return an empty array when country is not found', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    const result = await searchCountries('unknown-country', controller.signal);

    expect(result).toEqual([]);

    vi.unstubAllGlobals();
  });
  it('should throw an error when server responds with an error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    await expect(searchCountries('canada', controller.signal)).rejects.toThrow();

    vi.unstubAllGlobals();
  });
  it('should create an error with status', () => {
    const error = new HttpError(500);

    expect(error.status).toBe(500);
  });

  it('should have correct name', () => {
    const error = new HttpError(404);

    expect(error.name).toBe('HttpError');
  });
});
