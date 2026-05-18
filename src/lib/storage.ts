import type { BucketState } from '../types';

const STORAGE_KEY = 'bucket-state-v1';

export function loadState(fallback: BucketState): BucketState {
  if (typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as Partial<BucketState>;
    return {
      ...fallback,
      ...parsed,
      profile: { ...fallback.profile, ...parsed.profile },
      settings: { ...fallback.settings, ...parsed.settings },
      places: parsed.places?.length ? parsed.places : fallback.places,
      customLists: parsed.customLists ?? fallback.customLists,
      savedMapViews: parsed.savedMapViews ?? fallback.savedMapViews,
      notInterestedPlaceIds: parsed.notInterestedPlaceIds ?? fallback.notInterestedPlaceIds,
    };
  } catch {
    return fallback;
  }
}

export function saveState(state: BucketState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
