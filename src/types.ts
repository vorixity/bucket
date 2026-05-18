export type PlaceStatus = 'none' | 'bucketList' | 'beenThere' | 'returnList';

export type Category =
  | 'National Parks'
  | 'State Parks'
  | 'Stadiums'
  | 'Landmarks'
  | 'Cities'
  | 'Beaches'
  | 'Museums'
  | 'Universities'
  | 'Theme Parks'
  | 'Scenic Roads'
  | 'Airports'
  | 'Food Spots'
  | 'Historic Sites'
  | 'Custom Places';

export interface ResearchDetails {
  whatIsIt: string;
  whyPeopleGo: string;
  bestTimeToVisit: string;
  howLongToSpend: string;
  whatToKnow: string;
  bestPhotoSpots: string[];
  nearbyThingsToDo: string[];
}

export interface Visit {
  id: string;
  placeId: string;
  photo?: string;
  startDate: string;
  endDate?: string;
  visitLabel: string;
}

export interface Place {
  id: string;
  name: string;
  country: string;
  state: string;
  region: string;
  category: Category;
  latitude: number;
  longitude: number;
  shortDescription: string;
  longDescription: string;
  researchDetails: ResearchDetails;
  tags: string[];
  status: PlaceStatus;
  visitCount: number;
  visits: Visit[];
  datesVisited: string[];
  photos: string[];
  isFavorite: boolean;
  bucketScore: number;
  nearbyPlaceIds: string[];
  similarPlaceIds: string[];
  notes: string;
  recentlyAddedAt?: string;
}

export interface Profile {
  name: string;
  homeCountry: string;
  homeState: string;
  favoriteState: string;
}

export interface Settings {
  privateProfile: boolean;
  showBucketListPublicly: boolean;
  showBeenTherePublicly: boolean;
  useRecommendations: boolean;
  darkModeAlwaysOn: boolean;
  showUnsavedPlacesOnMap: boolean;
  reduceMotion: boolean;
  compactCards: boolean;
}

export interface MapFilters {
  beenThere: boolean;
  bucketList: boolean;
  returnList: boolean;
  unsaved: boolean;
  categories: Category[];
}

export interface SavedMapView {
  id: string;
  name: string;
  filters: MapFilters;
}

export interface CustomList {
  id: string;
  name: string;
  placeIds: string[];
}

export interface BucketState {
  onboardingComplete: boolean;
  profile: Profile;
  settings: Settings;
  places: Place[];
  customLists: CustomList[];
  savedMapViews: SavedMapView[];
  notInterestedPlaceIds: string[];
}

export type RecommendationMode =
  | 'More like my Bucket List'
  | 'More like places I’ve been'
  | 'Near places on my list'
  | 'Complete my state'
  | 'Surprise me'
  | 'National parks I might like'
  | 'Stadiums I have not visited'
  | 'Photography heavy places'
  | 'Weekend trip ideas'
  | 'Hidden gems';

export interface Recommendation {
  place: Place;
  reason: string;
}
