import type { Place, Recommendation, RecommendationMode } from '../types';

function visited(place: Place) {
  return place.visitCount > 0 || place.status === 'beenThere' || place.status === 'returnList';
}

function scoreOverlap(a: Place, b: Place) {
  const sharedTags = a.tags.filter((tag) => b.tags.includes(tag)).length;
  const sameCategory = a.category === b.category ? 2 : 0;
  const sameState = a.state === b.state ? 1 : 0;
  return sharedTags + sameCategory + sameState;
}

export function getRecommendations(
  places: Place[],
  mode: RecommendationMode,
  homeState: string,
  notInterestedPlaceIds: string[],
): Recommendation[] {
  const saved = places.filter((place) => place.status === 'bucketList');
  const seen = places.filter(visited);
  const blocked = new Set(notInterestedPlaceIds);

  const candidates = places.filter((place) => !blocked.has(place.id) && !visited(place));

  if (mode === 'Complete my state') {
    return candidates
      .filter((place) => place.state === homeState)
      .slice(0, 8)
      .map((place) => ({ place, reason: `You have not saved this ${homeState} place yet, and it would deepen your home-state atlas.` }));
  }

  if (mode === 'National parks I might like') {
    return candidates
      .filter((place) => place.category === 'National Parks')
      .slice(0, 8)
      .map((place) => ({ place, reason: 'You seem drawn to landscape-heavy trips, and this is a strong national park match.' }));
  }

  if (mode === 'Stadiums I have not visited') {
    return candidates
      .filter((place) => place.category === 'Stadiums')
      .slice(0, 8)
      .map((place) => ({ place, reason: 'This fills in a stadium you have not visited yet.' }));
  }

  if (mode === 'Photography heavy places') {
    return candidates
      .filter((place) => place.tags.includes('photography'))
      .slice(0, 8)
      .map((place) => ({ place, reason: 'Chosen because it is strongly aligned with photography-focused travel.' }));
  }

  if (mode === 'Weekend trip ideas') {
    return candidates
      .filter((place) => place.tags.includes('weekend') || place.category === 'Cities' || place.category === 'Beaches')
      .slice(0, 8)
      .map((place) => ({ place, reason: 'This reads like a manageable short escape rather than a major expedition.' }));
  }

  if (mode === 'Hidden gems') {
    return candidates
      .filter((place) => place.bucketScore < 88 && place.category !== 'Cities')
      .slice(0, 8)
      .map((place) => ({ place, reason: 'Lower-profile than the headline stops, but still aligned with your atlas.' }));
  }

  if (mode === 'Near places on my list') {
    const nearbyIds = new Set(saved.flatMap((place) => place.nearbyPlaceIds));
    return candidates
      .filter((place) => nearbyIds.has(place.id))
      .slice(0, 8)
      .map((place) => ({ place, reason: 'Near a place already on your list, so it could fit naturally into the same trip.' }));
  }

  if (mode === 'More like my Bucket List' && saved.length) {
    return candidates
      .map((place) => ({ place, score: Math.max(...saved.map((savedPlace) => scoreOverlap(place, savedPlace))) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ place }) => ({ place, reason: 'Similar tags and categories to places already on your Bucket List.' }));
  }

  if (mode === 'More like places I’ve been' && seen.length) {
    return candidates
      .map((place) => ({ place, score: Math.max(...seen.map((seenPlace) => scoreOverlap(place, seenPlace))) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ place }) => ({ place, reason: 'Matches patterns in the places you have already visited.' }));
  }

  return candidates
    .slice()
    .sort((a, b) => b.bucketScore - a.bucketScore)
    .slice(0, 8)
    .map((place) => ({ place, reason: mode === 'Surprise me' ? 'A high-fit surprise outside the obvious path.' : 'A strong fit based on your current atlas.' }));
}
