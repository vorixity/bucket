import { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  Camera,
  Globe2,
  Heart,
  Image as ImageIcon,
  MapPinned,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  Trophy,
  UserRound,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { ALL_CATEGORIES, BASE_PLACES } from './data/places';
import { US_STATES } from './data/states';
import { getRecommendations } from './lib/recommendations';
import { searchPlaces } from './lib/search';
import { clearState, loadState, saveState } from './lib/storage';
import { activeMapProvider } from './maps/provider';
import type {
  BucketState,
  Category,
  CustomList,
  MapFilters,
  Place,
  PlaceStatus,
  Recommendation,
  RecommendationMode,
  SavedMapView,
  Visit,
} from './types';

const defaultMapFilters: MapFilters = {
  beenThere: true,
  bucketList: true,
  returnList: true,
  unsaved: false,
  categories: [],
  homeStateOnly: false,
};

const initialState: BucketState = {
  onboardingComplete: false,
  profile: {
    name: 'Traveler',
    homeCountry: 'United States',
    homeState: '',
    favoriteState: '',
  },
  settings: {
    privateProfile: true,
    showBucketListPublicly: false,
    showBeenTherePublicly: false,
    useRecommendations: true,
    darkModeAlwaysOn: true,
    showUnsavedPlacesOnMap: false,
    reduceMotion: false,
    compactCards: false,
  },
  places: BASE_PLACES,
  customLists: [],
  savedMapViews: [],
  notInterestedPlaceIds: [],
};

const recommendationModes: RecommendationMode[] = [
  'More like my Bucket List',
  'More like places I’ve been',
  'Near places on my list',
  'Complete my state',
  'Surprise me',
  'National parks I might like',
  'Stadiums I have not visited',
  'Photography heavy places',
  'Weekend trip ideas',
  'Hidden gems',
];

const settingsLabels: Record<keyof BucketState['settings'], string> = {
  privateProfile: 'Private profile',
  showBucketListPublicly: 'Show Bucket List publicly',
  showBeenTherePublicly: 'Show Been There publicly',
  useRecommendations: 'Use recommendations',
  darkModeAlwaysOn: 'Dark mode always on',
  showUnsavedPlacesOnMap: 'Show unsaved places on map',
  reduceMotion: 'Reduce motion',
  compactCards: 'Compact cards',
};

function isVisited(place: Place) {
  return place.visitCount > 0 || place.status === 'beenThere' || place.status === 'returnList';
}

function sortByName(a: Place, b: Place) {
  return a.name.localeCompare(b.name);
}

function percentage(part: number, whole: number) {
  return whole ? Math.round((part / whole) * 100) : 0;
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function statusLabel(status: PlaceStatus) {
  if (status === 'bucketList') return 'Bucket List';
  if (status === 'beenThere') return 'Been There';
  if (status === 'returnList') return 'Return List';
  return 'Unsaved';
}

function visitDateLabel(visit: Visit) {
  if (!visit.startDate && !visit.endDate) return 'Date not added';
  return `${visit.startDate || 'Date not added'}${visit.endDate ? ` → ${visit.endDate}` : ''}`;
}

function heroGradient(place: Place) {
  const palette: Record<string, string> = {
    California: 'from-amber-300/50 via-rose-400/20 to-slate-900',
    Washington: 'from-sky-300/40 via-emerald-300/15 to-slate-900',
    Michigan: 'from-cyan-300/35 via-blue-400/10 to-slate-900',
    Utah: 'from-orange-300/50 via-red-300/20 to-slate-900',
    Arizona: 'from-amber-400/45 via-orange-300/15 to-slate-900',
  };
  return palette[place.state] ?? 'from-white/20 to-slate-900';
}

export default function App() {
  const [state, setState] = useState<BucketState>(() => loadState(initialState));
  const [activeTab, setActiveTab] = useState<'Map' | 'Bucket' | 'Explore' | 'Passport' | 'Profile'>('Map');
  const [query, setQuery] = useState('');
  const [mapFilters, setMapFilters] = useState<MapFilters>(defaultMapFilters);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [detailMode, setDetailMode] = useState<'view' | 'research'>('view');
  const [visitPlaceId, setVisitPlaceId] = useState<string | null>(null);
  const [recommendationMode, setRecommendationMode] = useState<RecommendationMode>('More like my Bucket List');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [entryModal, setEntryModal] = useState<null | { kind: 'mapView' | 'customList'; placeId?: string }>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const selectedPlace = state.places.find((place) => place.id === selectedPlaceId) ?? null;
  const visitPlace = state.places.find((place) => place.id === visitPlaceId) ?? null;
  const searchResults = useMemo(() => searchPlaces(state.places, query), [state.places, query]);
  const effectiveFilters = useMemo(
    () => ({ ...mapFilters, unsaved: mapFilters.unsaved && state.settings.showUnsavedPlacesOnMap }),
    [mapFilters, state.settings.showUnsavedPlacesOnMap],
  );
  const mapPlaces = useMemo(
    () =>
      mapFilters.homeStateOnly && state.profile.homeState
        ? state.places.filter((place) => place.state === state.profile.homeState)
        : state.places,
    [mapFilters.homeStateOnly, state.places, state.profile.homeState],
  );

  const recommendations = useMemo<Recommendation[]>(
    () => getRecommendations(state.places, recommendationMode, state.profile.homeState, state.notInterestedPlaceIds),
    [state.places, recommendationMode, state.profile.homeState, state.notInterestedPlaceIds],
  );

  function updatePlace(placeId: string, updater: (place: Place) => Place) {
    setState((current) => ({
      ...current,
      places: current.places.map((place) => (place.id === placeId ? updater(place) : place)),
    }));
  }

  function setStatus(placeId: string, status: PlaceStatus) {
    updatePlace(placeId, (place) => ({
      ...place,
      status,
      recentlyAddedAt: status === 'bucketList' ? new Date().toISOString() : place.recentlyAddedAt,
    }));
  }

  function markBeenThere(placeId: string) {
    setStatus(placeId, 'beenThere');
  }

  function openVisitFlow(placeId: string) {
    setVisitPlaceId(placeId);
  }

  function saveVisit(placeId: string, visit: Visit) {
    updatePlace(placeId, (place) => ({
      ...place,
      status: 'beenThere',
      visitCount: place.visitCount + 1,
      visits: [visit, ...place.visits],
      datesVisited: visit.startDate ? [visit.startDate, ...place.datesVisited] : place.datesVisited,
      photos: visit.photo ? [visit.photo, ...place.photos] : place.photos,
    }));
    setVisitPlaceId(null);
  }

  function toggleFavorite(placeId: string) {
    updatePlace(placeId, (place) => ({ ...place, isFavorite: !place.isFavorite }));
  }

  function saveNotes(placeId: string, notes: string) {
    updatePlace(placeId, (place) => ({ ...place, notes }));
  }

  function saveMapView(name: string) {
    const nextView: SavedMapView = {
      id: uid('view'),
      name,
      filters: mapFilters,
    };
    setState((current) => ({ ...current, savedMapViews: [nextView, ...current.savedMapViews] }));
  }

  function applyPreset(preset: string) {
    if (preset === 'My Whole Map') setMapFilters(defaultMapFilters);
    if (preset === 'Only Been There') setMapFilters({ ...defaultMapFilters, bucketList: false, returnList: false });
    if (preset === 'Only Bucket List') setMapFilters({ ...defaultMapFilters, beenThere: false, returnList: false });
    if (preset === 'Parks Only') setMapFilters({ ...defaultMapFilters, categories: ['National Parks', 'State Parks'] });
    if (preset === 'Stadium Map') setMapFilters({ ...defaultMapFilters, categories: ['Stadiums'] });
    if (preset === 'Home State Progress') setMapFilters({ ...defaultMapFilters, homeStateOnly: true });
    if (preset === 'National Parks Progress') setMapFilters({ ...defaultMapFilters, categories: ['National Parks'] });
  }

  function toggleCategory(category: Category) {
    setMapFilters((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category],
    }));
  }

  function addToCustomList(placeId: string, name: string) {
    setState((current) => {
      const existing = current.customLists.find((list) => list.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        return {
          ...current,
          customLists: current.customLists.map((list) =>
            list.id === existing.id && !list.placeIds.includes(placeId)
              ? { ...list, placeIds: [...list.placeIds, placeId] }
              : list,
          ),
        };
      }

      const nextList: CustomList = { id: uid('list'), name, placeIds: [placeId] };
      return { ...current, customLists: [nextList, ...current.customLists] };
    });
  }

  function resetData() {
    clearState();
    setState(initialState);
    setActiveTab('Map');
    setSelectedPlaceId(null);
    setVisitPlaceId(null);
    setQuery('');
    setShowResetDialog(false);
  }

  function markNotInterested(placeId: string) {
    setState((current) => ({
      ...current,
      notInterestedPlaceIds: current.notInterestedPlaceIds.includes(placeId)
        ? current.notInterestedPlaceIds
        : [...current.notInterestedPlaceIds, placeId],
    }));
  }

  if (!state.onboardingComplete) {
    return (
      <Onboarding
        state={state}
        onSetState={setState}
        onMarkBeenThere={markBeenThere}
        visitPlace={visitPlace}
        onSaveVisit={saveVisit}
        onCloseVisit={() => setVisitPlaceId(null)}
      />
    );
  }

  return (
    <main className="app-background min-h-screen px-4 py-4 text-white md:px-6 md:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-4 md:min-h-[calc(100vh-3rem)] md:flex-row md:gap-6">
        <aside className="glass-panel flex shrink-0 flex-col justify-between rounded-[2rem] border border-white/10 p-4 md:w-64 md:p-5">
          <div>
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">Personal atlas</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Bucket</h1>
            </div>

            <nav className="grid grid-cols-5 gap-2 md:grid-cols-1">
              {[
                ['Map', MapPinned],
                ['Bucket', Bookmark],
                ['Explore', Sparkles],
                ['Passport', Globe2],
                ['Profile', UserRound],
              ].map(([tab, Icon]) => (
                <button
                  key={tab as string}
                  type="button"
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={clsx(
                    'flex items-center justify-center gap-3 rounded-2xl px-3 py-3 text-sm transition md:justify-start',
                    activeTab === tab ? 'bg-white text-slate-950' : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{tab as string}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">Travel identity</p>
            <p className="mt-3 text-base text-white">{state.profile.homeState || 'Home state unset'}</p>
            <p className="mt-1">{state.places.filter(isVisited).length} places visited</p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-4">
          {activeTab === 'Map' && (
            <MapTab
              state={state}
              query={query}
              setQuery={setQuery}
              searchResults={searchResults}
              mapFilters={mapFilters}
              effectiveFilters={effectiveFilters}
              mapPlaces={mapPlaces}
              setMapFilters={setMapFilters}
              toggleCategory={toggleCategory}
              applyPreset={applyPreset}
              onSaveMapView={() => setEntryModal({ kind: 'mapView' })}
              onSelectPlace={(place) => {
                setSelectedPlaceId(place.id);
                setDetailMode('view');
              }}
              onResearch={(place) => {
                setSelectedPlaceId(place.id);
                setDetailMode('research');
              }}
              onBucketList={(place) => setStatus(place.id, 'bucketList')}
              onBeenThere={(place) => markBeenThere(place.id)}
            />
          )}

          {activeTab === 'Bucket' && (
            <BucketTab
              state={state}
              onSelectPlace={(place) => {
                setSelectedPlaceId(place.id);
                setDetailMode('view');
              }}
            />
          )}

          {activeTab === 'Explore' && (
            <ExploreTab
              state={state}
              mode={recommendationMode}
              setMode={setRecommendationMode}
              showRecommendations={showRecommendations}
              setShowRecommendations={setShowRecommendations}
              recommendations={recommendations}
              onSelectPlace={(place) => {
                setSelectedPlaceId(place.id);
                setDetailMode('view');
              }}
              onResearch={(place) => {
                setSelectedPlaceId(place.id);
                setDetailMode('research');
              }}
              onBucketList={(place) => setStatus(place.id, 'bucketList')}
              onNotInterested={(place) => markNotInterested(place.id)}
            />
          )}

          {activeTab === 'Passport' && <PassportTab state={state} />}

          {activeTab === 'Profile' && (
            <ProfileTab
              state={state}
              setState={setState}
              onReset={() => setShowResetDialog(true)}
            />
          )}
        </section>
      </div>

      {selectedPlace && (
        <PlacePanel
          place={selectedPlace}
          mode={detailMode}
          allPlaces={state.places}
          onClose={() => setSelectedPlaceId(null)}
          onBucketList={() => setStatus(selectedPlace.id, 'bucketList')}
          onBeenThere={() => markBeenThere(selectedPlace.id)}
          onAddVisitDetails={() => openVisitFlow(selectedPlace.id)}
          onReturn={() => setStatus(selectedPlace.id, 'returnList')}
          onFavorite={() => toggleFavorite(selectedPlace.id)}
          onSaveNotes={(notes) => saveNotes(selectedPlace.id, notes)}
          onAddToCustomList={() => setEntryModal({ kind: 'customList', placeId: selectedPlace.id })}
          onOpenPlace={(place, nextMode = 'view') => {
            setSelectedPlaceId(place.id);
            setDetailMode(nextMode);
          }}
        />
      )}

      {visitPlace && (
        <VisitModal
          place={visitPlace}
          onClose={() => setVisitPlaceId(null)}
          onSave={(visit) => saveVisit(visitPlace.id, visit)}
        />
      )}

      {entryModal && (
        <TextEntryModal
          title={entryModal.kind === 'mapView' ? 'Save custom map view' : 'Add to custom list'}
          placeholder={entryModal.kind === 'mapView' ? 'Weekend parks' : 'Photography trips'}
          actionLabel={entryModal.kind === 'mapView' ? 'Save view' : 'Save list'}
          onClose={() => setEntryModal(null)}
          onSubmit={(value) => {
            if (entryModal.kind === 'mapView') saveMapView(value);
            if (entryModal.kind === 'customList' && entryModal.placeId) addToCustomList(entryModal.placeId, value);
            setEntryModal(null);
          }}
        />
      )}

      {showResetDialog && (
        <ConfirmDialog
          title="Reset local data?"
          description="This clears your Bucket data on this browser, including visits, photos, notes, saved views, and preferences."
          confirmLabel="Reset local data"
          onClose={() => setShowResetDialog(false)}
          onConfirm={resetData}
        />
      )}
    </main>
  );
}

function Onboarding({
  state,
  onSetState,
  onMarkBeenThere,
  visitPlace,
  onSaveVisit,
  onCloseVisit,
}: {
  state: BucketState;
  onSetState: React.Dispatch<React.SetStateAction<BucketState>>;
  onMarkBeenThere: (placeId: string) => void;
  visitPlace: Place | null;
  onSaveVisit: (placeId: string, visit: Visit) => void;
  onCloseVisit: () => void;
}) {
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState('United States');
  const [homeState, setHomeState] = useState('');
  const popularPlaces = state.places.filter((place) => place.state === homeState).slice(0, 6);

  function finishOnboarding() {
    onSetState((current) => ({
      ...current,
      onboardingComplete: true,
      profile: {
        ...current.profile,
        homeCountry: country,
        homeState,
        favoriteState: homeState,
      },
    }));
  }

  return (
    <main className="app-background min-h-screen p-4 text-white md:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-5xl items-center justify-center">
        <section className="glass-panel w-full rounded-[2rem] border border-white/10 p-6 md:p-10">
          {step === 0 && (
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.35em] text-white/45">Welcome</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">Welcome to Bucket</h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/70">
                Your personal atlas for the places you have been, the ones still calling, and the memories that make them yours.
              </p>
              <button type="button" className="soft-button mt-8" onClick={() => setStep(1)}>
                Begin
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="max-w-xl">
              <h2 className="text-3xl font-semibold">What country do you call home?</h2>
              <select className="input-shell mt-6" value={country} onChange={(event) => setCountry(event.target.value)}>
                <option>United States</option>
              </select>
              <button type="button" className="soft-button mt-6" onClick={() => setStep(2)}>
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-xl">
              <h2 className="text-3xl font-semibold">Choose your home state</h2>
              <select className="input-shell mt-6" value={homeState} onChange={(event) => setHomeState(event.target.value)}>
                <option value="">Select a state</option>
                {US_STATES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button type="button" className="soft-button mt-6" disabled={!homeState} onClick={() => setStep(3)}>
                Continue
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-white/45">Favorite state selected</p>
              <h2 className="mt-3 text-3xl font-semibold">Start with {homeState}</h2>
              <p className="mt-3 max-w-2xl text-white/70">
                Mark a few places so Bucket can begin to understand your atlas. “Been There” is instant; you can add dates and photos later if you want them.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {popularPlaces.map((place) => (
                  <article key={place.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <p className="text-sm text-white/45">{place.category}</p>
                    <h3 className="mt-1 text-xl font-medium">{place.name}</h3>
                    <p className="mt-2 text-sm text-white/65">{place.shortDescription}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" className="soft-button" onClick={() => onMarkBeenThere(place.id)}>
                        Been There
                      </button>
                      <button
                        type="button"
                        className="soft-button"
                        onClick={() =>
                          onSetState((current) => ({
                            ...current,
                            places: current.places.map((candidate) =>
                              candidate.id === place.id ? { ...candidate, status: 'bucketList', recentlyAddedAt: new Date().toISOString() } : candidate,
                            ),
                          }))
                        }
                      >
                        Bucket List
                      </button>
                      <button type="button" className="soft-button">
                        Skip
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <button type="button" className="soft-button mt-8" onClick={finishOnboarding}>
                Enter Bucket
              </button>
            </div>
          )}
        </section>
      </div>

      {visitPlace && (
        <VisitModal
          place={visitPlace}
          onClose={onCloseVisit}
          onSave={(visit) => onSaveVisit(visitPlace.id, visit)}
        />
      )}
    </main>
  );
}

function MapTab({
  state,
  query,
  setQuery,
  searchResults,
  mapFilters,
  effectiveFilters,
  mapPlaces,
  setMapFilters,
  toggleCategory,
  applyPreset,
  onSaveMapView,
  onSelectPlace,
  onResearch,
  onBucketList,
  onBeenThere,
}: {
  state: BucketState;
  query: string;
  setQuery: (query: string) => void;
  searchResults: Place[];
  mapFilters: MapFilters;
  effectiveFilters: MapFilters;
  mapPlaces: Place[];
  setMapFilters: React.Dispatch<React.SetStateAction<MapFilters>>;
  toggleCategory: (category: Category) => void;
  applyPreset: (preset: string) => void;
  onSaveMapView: () => void;
  onSelectPlace: (place: Place) => void;
  onResearch: (place: Place) => void;
  onBucketList: (place: Place) => void;
  onBeenThere: (place: Place) => void;
}) {
  const presets = ['My Whole Map', 'Only Been There', 'Only Bucket List', 'Parks Only', 'Stadium Map', 'Home State Progress', 'National Parks Progress'];
  const ActiveMap = activeMapProvider.Component;

  return (
    <>
      <section className="glass-panel rounded-[2rem] border border-white/10 p-4 md:p-6">
        <label className="relative block">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Where to?"
            className="input-shell pl-12 text-lg"
          />
        </label>

        {query && (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {searchResults.length ? (
              searchResults.map((place) => (
                <article key={place.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-white/45">{place.state} · {place.category}</p>
                      <h3 className="mt-1 text-xl font-medium">{place.name}</h3>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">{statusLabel(place.status)}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/70">{place.shortDescription}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="soft-button" onClick={() => onSelectPlace(place)}>View</button>
                    <button className="soft-button" onClick={() => onResearch(place)}>Research</button>
                    <button className="soft-button" onClick={() => onBucketList(place)}>Bucket List</button>
                    <button className="soft-button" onClick={() => onBeenThere(place)}>Been There</button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-white/65">No places matched that search in the current prototype.</div>
            )}
          </div>
        )}
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-3">
          {mapFilters.homeStateOnly && state.profile.homeState && (
            <div className="glass-panel rounded-3xl border border-white/10 px-4 py-3 text-sm text-white/70">
              Showing only <span className="text-white">{state.profile.homeState}</span> places for home state progress.
            </div>
          )}
          <ActiveMap places={mapPlaces} filters={effectiveFilters} onSelectPlace={onSelectPlace} />
        </div>

        <section className="glass-panel rounded-[2rem] border border-white/10 p-4 md:p-5">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-white/50" />
            <h2 className="text-lg font-medium">Map controls</h2>
          </div>

          <div className="mt-5">
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">Status filters</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {([
                ['beenThere', 'Been There'],
                ['bucketList', 'Bucket List'],
                ['returnList', 'Return List'],
                ['unsaved', 'Unsaved Places'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={clsx('soft-button', mapFilters[key] && 'soft-button-active')}
                  onClick={() => setMapFilters((current) => ({ ...current, [key]: !current[key] }))}
                >
                  {label}
                </button>
              ))}
            </div>
            {!state.settings.showUnsavedPlacesOnMap && mapFilters.unsaved && (
              <p className="mt-3 text-xs text-white/45">Unsaved places stay hidden until enabled in Profile settings.</p>
            )}
          </div>

          <div className="mt-5">
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">Categories</p>
            <div className="mt-3 flex max-h-44 flex-wrap gap-2 overflow-auto pr-1">
              {ALL_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={clsx('soft-button', mapFilters.categories.includes(category) && 'soft-button-active')}
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">Presets</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button key={preset} type="button" className="soft-button" onClick={() => applyPreset(preset)}>
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="soft-button mt-5 inline-flex items-center gap-2" onClick={onSaveMapView}>
            <Plus className="h-4 w-4" /> Save custom map view
          </button>

          {!!state.savedMapViews.length && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.28em] text-white/40">Saved views</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {state.savedMapViews.map((view) => (
                  <button key={view.id} className="soft-button" onClick={() => setMapFilters(view.filters)}>
                    {view.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function BucketTab({ state, onSelectPlace }: { state: BucketState; onSelectPlace: (place: Place) => void }) {
  const [categoryFilter, setCategoryFilter] = useState<'All' | Category>('All');
  const [sortMode, setSortMode] = useState<'Name' | 'Newest' | 'Bucket Score'>('Name');

  function filterAndSort(places: Place[]) {
    const filtered = categoryFilter === 'All' ? places : places.filter((place) => place.category === categoryFilter);
    return filtered.slice().sort((a, b) => {
      if (sortMode === 'Newest') return (b.recentlyAddedAt ?? '').localeCompare(a.recentlyAddedAt ?? '');
      if (sortMode === 'Bucket Score') return b.bucketScore - a.bucketScore;
      return sortByName(a, b);
    });
  }

  const sections = [
    ['Bucket List', filterAndSort(state.places.filter((place) => place.status === 'bucketList'))],
    ['Been There', filterAndSort(state.places.filter(isVisited))],
    ['Return List', filterAndSort(state.places.filter((place) => place.status === 'returnList'))],
    ['Favorites', filterAndSort(state.places.filter((place) => place.isFavorite))],
    ['Recently Added', filterAndSort(state.places.filter((place) => place.recentlyAddedAt))],
  ] as const;

  return (
    <div className="grid gap-4">
      <section className="glass-panel rounded-[2rem] border border-white/10 p-4 md:p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm text-white/45">Filter by category</span>
            <select className="input-shell" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as 'All' | Category)}>
              <option>All</option>
              {ALL_CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm text-white/45">Sort by</span>
            <select className="input-shell" value={sortMode} onChange={(event) => setSortMode(event.target.value as 'Name' | 'Newest' | 'Bucket Score')}>
              <option>Name</option>
              <option>Newest</option>
              <option>Bucket Score</option>
            </select>
          </label>
        </div>
      </section>

      {sections.map(([title, places]) => (
        <section key={title} className="glass-panel rounded-[2rem] border border-white/10 p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <span className="text-sm text-white/45">{places.length}</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {places.length ? (
              places.map((place) => (
                <button key={place.id} className="rounded-3xl border border-white/10 bg-black/20 p-4 text-left hover:bg-white/10" onClick={() => onSelectPlace(place)}>
                  <p className="text-sm text-white/45">{place.state} · {place.category}</p>
                  <h3 className="mt-1 text-lg font-medium">{place.name}</h3>
                  <p className="mt-3 text-sm text-white/55">Bucket Score {place.bucketScore}</p>
                </button>
              ))
            ) : (
              <p className="text-white/55">Nothing here yet.</p>
            )}
          </div>
        </section>
      ))}

      <section className="glass-panel rounded-[2rem] border border-white/10 p-4 md:p-6">
        <h2 className="text-2xl font-semibold">Custom Lists</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {state.customLists.length ? (
            state.customLists.map((list) => (
              <article key={list.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="text-lg font-medium">{list.name}</p>
                <p className="mt-2 text-sm text-white/55">{list.placeIds.length} places</p>
              </article>
            ))
          ) : (
            <p className="text-white/55">Create a custom list from any place page.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function ExploreTab({
  state,
  mode,
  setMode,
  showRecommendations,
  setShowRecommendations,
  recommendations,
  onSelectPlace,
  onResearch,
  onBucketList,
  onNotInterested,
}: {
  state: BucketState;
  mode: RecommendationMode;
  setMode: (mode: RecommendationMode) => void;
  showRecommendations: boolean;
  setShowRecommendations: (show: boolean) => void;
  recommendations: Recommendation[];
  onSelectPlace: (place: Place) => void;
  onResearch: (place: Place) => void;
  onBucketList: (place: Place) => void;
  onNotInterested: (place: Place) => void;
}) {
  return (
    <div className="grid gap-4">
      <section className="glass-panel rounded-[2rem] border border-white/10 p-5 md:p-7">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Explore</p>
        <h2 className="mt-3 text-3xl font-semibold">Ready for new ideas?</h2>
        <p className="mt-3 max-w-2xl text-white/70">Recommendations stay quiet until you ask for them. Then Bucket studies your atlas and suggests the next meaningful direction.</p>
        <button type="button" className="soft-button mt-5" onClick={() => setShowRecommendations(true)}>
          Analyze My Bucket
        </button>
      </section>

      {showRecommendations && state.settings.useRecommendations && (
        <section className="glass-panel rounded-[2rem] border border-white/10 p-5 md:p-7">
          <div className="flex flex-wrap gap-2">
            {recommendationModes.map((item) => (
              <button key={item} className={clsx('soft-button', item === mode && 'soft-button-active')} onClick={() => setMode(item)}>
                {item}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {recommendations.length ? (
              recommendations.map(({ place, reason }) => (
                <article key={place.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/45">{place.state} · {place.category}</p>
                  <h3 className="mt-1 text-xl font-medium">{place.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/70">{reason}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="soft-button" onClick={() => onSelectPlace(place)}>View</button>
                    <button className="soft-button" onClick={() => onResearch(place)}>Research</button>
                    <button className="soft-button" onClick={() => onBucketList(place)}>Bucket List</button>
                    <button className="soft-button" onClick={() => onNotInterested(place)}>Not Interested</button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-white/60">No fresh matches in this mode right now.</div>
            )}
          </div>
        </section>
      )}

      {showRecommendations && !state.settings.useRecommendations && (
        <section className="glass-panel rounded-[2rem] border border-white/10 p-5 text-white/65">
          Recommendations are currently disabled in Profile settings.
        </section>
      )}
    </div>
  );
}

function PassportTab({ state }: { state: BucketState }) {
  const visitedPlaces = state.places.filter(isVisited);
  const visitedStates = [...new Set(visitedPlaces.map((place) => place.state))];
  const bucketListCount = state.places.filter((place) => place.status === 'bucketList').length;
  const returnListCount = state.places.filter((place) => place.status === 'returnList').length;
  const nationalParksVisited = visitedPlaces.filter((place) => place.category === 'National Parks').length;
  const stadiumsVisited = visitedPlaces.filter((place) => place.category === 'Stadiums').length;
  const landmarksVisited = visitedPlaces.filter((place) => place.category === 'Landmarks').length;
  const categoryCounts = ALL_CATEGORIES.map((category) => ({
    category,
    count: visitedPlaces.filter((place) => place.category === category).length,
    total: state.places.filter((place) => place.category === category).length,
  }));
  const mostVisitedCategory = visitedPlaces.length ? categoryCounts.slice().sort((a, b) => b.count - a.count)[0]?.category ?? '—' : '—';
  const mostVisitedState = visitedStates
    .map((stateName) => ({ stateName, count: visitedPlaces.filter((place) => place.state === stateName).length }))
    .sort((a, b) => b.count - a.count)[0]?.stateName ?? '—';
  const homePlaces = state.places.filter((place) => place.state === state.profile.homeState);
  const homeVisited = homePlaces.filter(isVisited).length;
  const longitudeSpread = visitedPlaces.length ? Math.max(...visitedPlaces.map((place) => place.longitude)) - Math.min(...visitedPlaces.map((place) => place.longitude)) : 0;

  const badges = [
    ['First National Park', nationalParksVisited >= 1],
    ['Home State Explorer', homeVisited >= 3],
    ['Stadium Chaser', stadiumsVisited >= 3],
    ['Coast to Coast', longitudeSpread >= 25],
    ['10 Places Visited', visitedPlaces.length >= 10],
    ['25 Places Visited', visitedPlaces.length >= 25],
    ['California 10%', percentage(visitedPlaces.filter((place) => place.state === 'California').length, state.places.filter((place) => place.state === 'California').length) >= 10],
    ['Returned Again', state.places.some((place) => place.visitCount > 1)],
    ['Park Person', nationalParksVisited >= 3],
    ['Landmark Collector', landmarksVisited >= 3],
    ['Road Trip Starter', visitedPlaces.some((place) => place.category === 'Scenic Roads')],
    ['Bucket Builder', bucketListCount >= 5],
  ];

  return (
    <div className="grid gap-4">
      <section className="glass-panel rounded-[2rem] border border-white/10 p-5 md:p-7">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['States visited', visitedStates.length],
            ['Places visited', visitedPlaces.length],
            ['Bucket List count', bucketListCount],
            ['Return List count', returnListCount],
            ['National parks visited', nationalParksVisited],
            ['Stadiums visited', stadiumsVisited],
            ['Landmarks visited', landmarksVisited],
            ['Home state progress', `${percentage(homeVisited, homePlaces.length)}%`],
          ].map(([label, value]) => (
            <article key={label} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/45">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="glass-panel rounded-[2rem] border border-white/10 p-5 md:p-7">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-white/50" />
            <h2 className="text-2xl font-semibold">Badges</h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.map(([label, earned]) => (
              <span key={label as string} className={clsx('rounded-full border px-3 py-2 text-sm', earned ? 'border-emerald-200/30 bg-emerald-200/15 text-emerald-50' : 'border-white/10 bg-white/5 text-white/35')}>
                {label as string}
              </span>
            ))}
          </div>
        </article>

        <article className="glass-panel rounded-[2rem] border border-white/10 p-5 md:p-7">
          <h2 className="text-2xl font-semibold">Travel identity summary</h2>
          <p className="mt-4 leading-7 text-white/70">
            {visitedPlaces.length
              ? <>
                  You are most drawn to <span className="text-white">{mostVisitedCategory}</span>, with the deepest footprint in <span className="text-white">{mostVisitedState}</span>. Your atlas currently leans toward {nationalParksVisited >= stadiumsVisited ? 'landscape-led travel' : 'event-led travel'}.
                </>
              : 'Your atlas is just beginning. Save a few places or record your first visit and Bucket will start shaping a travel identity around you.'}
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="glass-panel rounded-[2rem] border border-white/10 p-5 md:p-7">
          <h2 className="text-2xl font-semibold">Timeline of visits</h2>
          <div className="mt-4 space-y-3">
            {visitedPlaces.flatMap((place) => place.visits.map((visit) => ({ place, visit }))).length ? (
              visitedPlaces
                .flatMap((place) => place.visits.map((visit) => ({ place, visit })))
                .sort((a, b) => (b.visit.startDate || '').localeCompare(a.visit.startDate || ''))
                .map(({ place, visit }) => (
                  <div key={visit.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="font-medium">{place.name}</p>
                    <p className="text-sm text-white/55">{visitDateLabel(visit)}</p>
                  </div>
                ))
            ) : (
              <p className="text-white/55">Your visit timeline will appear here.</p>
            )}
          </div>
        </article>

        <article className="glass-panel rounded-[2rem] border border-white/10 p-5 md:p-7">
          <h2 className="text-2xl font-semibold">State completion grid</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[...new Set(state.places.map((place) => place.state))].map((stateName) => {
              const statePlaces = state.places.filter((place) => place.state === stateName);
              const done = statePlaces.filter(isVisited).length;
              return (
                <div key={stateName} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="flex justify-between gap-3 text-sm">
                    <span>{stateName}</span>
                    <span className="text-white/45">{percentage(done, statePlaces.length)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="glass-panel rounded-[2rem] border border-white/10 p-5 md:p-7">
        <h2 className="text-2xl font-semibold">Category completion grid</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categoryCounts.map(({ category, count, total }) => (
            <div key={category} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex justify-between gap-3 text-sm">
                <span>{category}</span>
                <span className="text-white/45">{percentage(count, total)}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProfileTab({
  state,
  setState,
  onReset,
}: {
  state: BucketState;
  setState: React.Dispatch<React.SetStateAction<BucketState>>;
  onReset: () => void;
}) {
  const totalVisited = state.places.filter(isVisited).length;
  const totalSaved = state.places.filter((place) => place.status !== 'none').length;
  const totalPhotos = state.places.reduce((sum, place) => sum + place.photos.length, 0);

  return (
    <div className="grid gap-4">
      <section className="glass-panel rounded-[2rem] border border-white/10 p-5 md:p-7">
        <h2 className="text-3xl font-semibold">{state.profile.name}</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            ['Home country', state.profile.homeCountry],
            ['Home state', state.profile.homeState],
            ['Favorite state', state.profile.favoriteState],
            ['Total places visited', totalVisited],
            ['Total saved', totalSaved],
            ['Total photos', totalPhotos],
          ].map(([label, value]) => (
            <article key={label} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/45">{label}</p>
              <p className="mt-2 text-xl font-medium">{value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-[2rem] border border-white/10 p-5 md:p-7">
        <h2 className="text-2xl font-semibold">Settings</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {Object.entries(state.settings).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
              <span className="text-white/75">{settingsLabels[key as keyof BucketState['settings']]}</span>
              <input
                type="checkbox"
                checked={value}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    settings: { ...current.settings, [key]: event.target.checked },
                  }))
                }
              />
            </label>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className="soft-button">Data export placeholder</button>
          <button className="soft-button inline-flex items-center gap-2" onClick={onReset}>
            <RotateCcw className="h-4 w-4" /> Reset local data
          </button>
        </div>
      </section>
    </div>
  );
}

function PlacePanel({
  place,
  mode,
  allPlaces,
  onClose,
  onBucketList,
  onBeenThere,
  onAddVisitDetails,
  onReturn,
  onFavorite,
  onSaveNotes,
  onAddToCustomList,
  onOpenPlace,
}: {
  place: Place;
  mode: 'view' | 'research';
  allPlaces: Place[];
  onClose: () => void;
  onBucketList: () => void;
  onBeenThere: () => void;
  onAddVisitDetails: () => void;
  onReturn: () => void;
  onFavorite: () => void;
  onSaveNotes: (notes: string) => void;
  onAddToCustomList: () => void;
  onOpenPlace: (place: Place, mode?: 'view' | 'research') => void;
}) {
  const similarPlaces = place.similarPlaceIds.map((id) => allPlaces.find((candidate) => candidate.id === id)).filter(Boolean) as Place[];
  const nearbyPlaces = place.nearbyPlaceIds.map((id) => allPlaces.find((candidate) => candidate.id === id)).filter(Boolean) as Place[];

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm md:items-center md:p-6">
      <section className="glass-panel max-h-[92vh] w-full max-w-5xl overflow-auto rounded-[2rem] border border-white/10">
        <div className={clsx('relative min-h-56 rounded-t-[2rem] bg-gradient-to-br', heroGradient(place))}>
          <button className="absolute right-4 top-4 rounded-full bg-black/25 p-2" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-5 left-5">
            <p className="text-sm text-white/70">{place.state} · {place.region} · {place.category}</p>
            <h2 className="mt-1 text-4xl font-semibold">{place.name}</h2>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-2 text-sm">Bucket Score {place.bucketScore}</span>
            <span className="rounded-full bg-white/10 px-3 py-2 text-sm">{statusLabel(place.status)}</span>
            {place.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-black/20 px-3 py-2 text-sm text-white/70">#{tag}</span>
            ))}
          </div>

          {mode === 'view' ? (
            <>
              <p className="max-w-3xl leading-8 text-white/75">{place.longDescription}</p>
              <div className="flex flex-wrap gap-2">
                <button className="soft-button" onClick={onBeenThere}>Been There</button>
                <button className="soft-button" onClick={onAddVisitDetails}>Add visit details</button>
                <button className="soft-button" onClick={onBucketList}>Bucket List</button>
                <button className="soft-button" onClick={onReturn}>Want to Return</button>
                <button className="soft-button inline-flex items-center gap-2" onClick={onFavorite}>
                  <Heart className="h-4 w-4" /> {place.isFavorite ? 'Favorited' : 'Favorite'}
                </button>
                <button className="soft-button" onClick={onAddToCustomList}>Add to custom list</button>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <article className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <h3 className="text-xl font-medium">Personal notes</h3>
                  <textarea
                    defaultValue={place.notes}
                    onBlur={(event) => onSaveNotes(event.target.value)}
                    className="input-shell mt-3 min-h-32"
                    placeholder="What do you want to remember?"
                  />
                </article>

                <article className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <h3 className="text-xl font-medium">Visit history</h3>
                  <div className="mt-3 space-y-3">
                    {place.visits.length ? (
                      place.visits.map((visit) => (
                        <div key={visit.id} className="rounded-2xl border border-white/10 p-3 text-sm text-white/70">
                          <p>{visit.visitLabel}</p>
                          <p>{visitDateLabel(visit)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-white/55">No visit details added yet.</p>
                    )}
                  </div>
                </article>
              </div>

              <article className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-xl font-medium">Photo scrapbook</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {place.photos.length ? (
                    place.photos.map((photo, index) => (
                      <img key={`${photo}-${index}`} src={photo} alt="Travel memory" className="scrapbook-photo w-full rounded-2xl" />
                    ))
                  ) : (
                    <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-white/15 text-white/40">
                      <ImageIcon className="mr-2 h-4 w-4" /> No photos yet
                    </div>
                  )}
                </div>
              </article>
            </>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {[
                ['What is this place?', place.researchDetails.whatIsIt],
                ['Why people go', place.researchDetails.whyPeopleGo],
                ['Best time to visit', place.researchDetails.bestTimeToVisit],
                ['How long to spend there', place.researchDetails.howLongToSpend],
                ['What to know before going', place.researchDetails.whatToKnow],
              ].map(([label, value]) => (
                <article key={label} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/45">{label}</p>
                  <p className="mt-2 leading-7 text-white/75">{value}</p>
                </article>
              ))}
              <article className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/45">Best photo spots</p>
                <p className="mt-2 leading-7 text-white/75">{place.researchDetails.bestPhotoSpots.join(', ')}</p>
              </article>
              <article className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/45">Nearby things to do</p>
                <p className="mt-2 leading-7 text-white/75">{place.researchDetails.nearbyThingsToDo.join(', ')}</p>
              </article>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <RelatedPlaces title="Similar places" places={similarPlaces} onOpenPlace={onOpenPlace} />
            <RelatedPlaces title="Nearby places" places={nearbyPlaces} onOpenPlace={onOpenPlace} />
          </div>
        </div>
      </section>
    </div>
  );
}

function RelatedPlaces({ title, places, onOpenPlace }: { title: string; places: Place[]; onOpenPlace: (place: Place) => void }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <h3 className="text-xl font-medium">{title}</h3>
      <div className="mt-3 space-y-2">
        {places.map((place) => (
          <button key={place.id} className="block w-full rounded-2xl border border-white/10 p-3 text-left hover:bg-white/10" onClick={() => onOpenPlace(place)}>
            <p className="font-medium">{place.name}</p>
            <p className="text-sm text-white/45">{place.state} · {place.category}</p>
          </button>
        ))}
      </div>
    </article>
  );
}

function VisitModal({ place, onClose, onSave }: { place: Place; onClose: () => void; onSave: (visit: Visit) => void }) {
  const [photo, setPhoto] = useState<string | undefined>();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [visitLabel, setVisitLabel] = useState(`${place.name} visit`);

  function handlePhoto(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/65 p-3 backdrop-blur-sm md:items-center md:p-6">
      <section className="glass-panel w-full max-w-xl rounded-[2rem] border border-white/10 p-5 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">Visit details</p>
            <h2 className="mt-2 text-3xl font-semibold">Add memory details</h2>
            <p className="mt-2 text-white/65">{place.name}</p>
            <p className="mt-2 text-sm text-white/50">Everything here is optional.</p>
          </div>
          <button className="rounded-full bg-black/20 p-2" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-4 text-sm text-white/70">
            <span className="inline-flex items-center gap-2"><Camera className="h-4 w-4" /> Upload a photo from the place (optional)</span>
            <input type="file" accept="image/*" className="mt-3 block w-full text-sm" onChange={(event) => handlePhoto(event.target.files?.[0])} />
          </label>

          {photo && <img src={photo} alt="Visit preview" className="scrapbook-photo w-full rounded-3xl" />}

          <label>
            <span className="mb-2 block text-sm text-white/55">Visit label</span>
            <input className="input-shell" value={visitLabel} onChange={(event) => setVisitLabel(event.target.value)} />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm text-white/55">Date you went (optional)</span>
              <input type="date" className="input-shell" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </label>
            <label>
              <span className="mb-2 block text-sm text-white/55">Date you left (optional)</span>
              <input type="date" className="input-shell" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </label>
          </div>
          <p className="text-xs text-white/45">You can leave all of this blank and still keep the place marked as visited.</p>
        </div>

        <button
          type="button"
          className="soft-button mt-5"
          onClick={() =>
            onSave({
              id: uid('visit'),
              placeId: place.id,
              photo,
              startDate,
              endDate: endDate || undefined,
              visitLabel: visitLabel || `${place.name} visit`,
            })
          }
        >
          Save visit details
        </button>
      </section>
    </div>
  );
}

function TextEntryModal({
  title,
  placeholder,
  actionLabel,
  onClose,
  onSubmit,
}: {
  title: string;
  placeholder: string;
  actionLabel: string;
  onClose: () => void;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState('');

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <section className="glass-panel w-full max-w-md rounded-[2rem] border border-white/10 p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <button className="rounded-full bg-black/20 p-2" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <input className="input-shell mt-5" value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} />
        <button className="soft-button mt-4" disabled={!value.trim()} onClick={() => onSubmit(value.trim())}>
          {actionLabel}
        </button>
      </section>
    </div>
  );
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <section className="glass-panel w-full max-w-md rounded-[2rem] border border-white/10 p-5">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="mt-3 leading-7 text-white/70">{description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className="soft-button" onClick={onClose}>Cancel</button>
          <button className="soft-button" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
