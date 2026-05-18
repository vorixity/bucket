import clsx from 'clsx';
import type { MapFilters, Place } from '../types';

interface FakeMapProps {
  places: Place[];
  filters: MapFilters;
  onSelectPlace: (place: Place) => void;
}

const bounds = {
  north: 49.5,
  south: 31,
  west: -124.8,
  east: -82,
};

function positionFor(place: Place) {
  const left = ((place.longitude - bounds.west) / (bounds.east - bounds.west)) * 100;
  const top = ((bounds.north - place.latitude) / (bounds.north - bounds.south)) * 100;
  return { left: `${left}%`, top: `${top}%` };
}

function shouldShow(place: Place, filters: MapFilters) {
  const categoryVisible = !filters.categories.length || filters.categories.includes(place.category);
  if (!categoryVisible) return false;
  if (place.status === 'beenThere') return filters.beenThere;
  if (place.status === 'bucketList') return filters.bucketList;
  if (place.status === 'returnList') return filters.returnList;
  return filters.unsaved;
}

export default function FakeMap({ places, filters, onSelectPlace }: FakeMapProps) {
  const visiblePlaces = places.filter((place) => shouldShow(place, filters));

  return (
    <div className="fake-map glass-panel relative overflow-hidden rounded-[2rem] border border-white/10">
      <div className="absolute inset-0 opacity-80">
        <div className="terrain terrain-one" />
        <div className="terrain terrain-two" />
        <div className="terrain terrain-three" />
        <div className="map-grid" />
      </div>

      <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/60 backdrop-blur-md">
        Personal atlas
      </div>

      {visiblePlaces.map((place) => (
        <button
          key={place.id}
          type="button"
          title={place.name}
          onClick={() => onSelectPlace(place)}
          className={clsx(
            'absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition duration-300 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-white/70',
            place.status === 'beenThere' && 'h-4 w-4 bg-aurora shadow-[0_0_24px_rgba(142,231,215,0.9)]',
            place.status === 'bucketList' && 'h-4 w-4 bg-white/45',
            place.status === 'returnList' && 'h-5 w-5 border-2 border-white/35 bg-glacier shadow-[0_0_24px_rgba(145,183,255,0.9)]',
            place.status === 'none' && 'h-2.5 w-2.5 bg-white/20',
          )}
          style={positionFor(place)}
        />
      ))}

      <div className="absolute bottom-5 left-5 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/25 p-3 text-xs text-white/70 backdrop-blur-xl">
        <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-aurora" />Been There</span>
        <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-white/45" />Bucket List</span>
        <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full border border-white/40 bg-glacier" />Return List</span>
      </div>
    </div>
  );
}
