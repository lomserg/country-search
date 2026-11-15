import { describe, it, expect } from 'vitest';
import { mapCountryResponse } from '../../src/api/mapCountryResponse';

describe('mapCountryResponse', () => {
  it('should map country data for a card', () => {
    const raw = {
      name: 'Canada',
      flag: '🇨🇦',
      capital: 'Ottawa',
      region: 'Americas',
      population: 38005238,
      languages: [{ name: 'English' }, { name: 'French' }],
    };

    const result = mapCountryResponse(raw);

    expect(result).toEqual({
      name: 'Canada',
      flag: '🇨🇦',
      capital: 'Ottawa',
      region: 'Americas',
      population: 38005238,
      languages: ['English', 'French'],
    });
  });
});
