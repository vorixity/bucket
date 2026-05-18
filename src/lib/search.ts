import type { Category, Place } from '../types';

const categoryAliases: Record<string, Category> = {
  stadiums: 'Stadiums',
  stadium: 'Stadiums',
  parks: 'National Parks',
  'national parks': 'National Parks',
  beaches: 'Beaches',
  beach: 'Beaches',
  museums: 'Museums',
  museum: 'Museums',
  universities: 'Universities',
  university: 'Universities',
  roads: 'Scenic Roads',
  'scenic roads': 'Scenic Roads',
  airports: 'Airports',
  airport: 'Airports',
};

const fillerWords = new Set(['in', 'of', 'the', 'a', 'an', 'places', 'place', 'spots']);

export function searchPlaces(places: Place[], rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const stateMatch = [...new Set(places.map((place) => place.state))].find((state) => query.includes(state.toLowerCase()));
  const categoryMatch = Object.entries(categoryAliases).find(([alias]) => query.includes(alias))?.[1];

  const normalizedTokens = query
    .replace('photography spots', 'photography')
    .replace('places in ', '')
    .split(/\s+/)
    .filter((token) => token && !fillerWords.has(token))
    .filter((token) => token !== stateMatch?.toLowerCase())
    .filter((token) => !categoryMatch?.toLowerCase().includes(token));

  return places
    .filter((place) => {
      if (stateMatch && place.state !== stateMatch) return false;
      if (categoryMatch && place.category !== categoryMatch) return false;

      const haystack = [
        place.name,
        place.state,
        place.region,
        place.category,
        place.shortDescription,
        ...place.tags,
      ]
        .join(' ')
        .toLowerCase();

      return normalizedTokens.every((token) => haystack.includes(token));
    })
    .slice(0, 12);
}
