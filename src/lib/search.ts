import type { Place } from '../types';

const categoryAliases: Record<string, string> = {
  stadiums: 'Stadiums',
  stadium: 'Stadiums',
  parks: 'National Parks',
  'national parks': 'National Parks',
  beaches: 'Beaches',
  beach: 'Beaches',
  museums: 'Museums',
  universities: 'Universities',
  roads: 'Scenic Roads',
  airports: 'Airports',
};

export function searchPlaces(places: Place[], rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const stateMatch = [...new Set(places.map((place) => place.state))].find((state) => query.includes(state.toLowerCase()));
  const categoryMatch = Object.entries(categoryAliases).find(([alias]) => query.includes(alias))?.[1];

  const normalizedTokens = query
    .replace('places in ', '')
    .replace('photography spots', 'photography')
    .split(/\s+/)
    .filter(Boolean);

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
