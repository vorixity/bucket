import { useEffect, useMemo, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { MapFilters, Place } from '../types';

interface RealMapProps {
  places: Place[];
  filters: MapFilters;
  onSelectPlace: (place: Place) => void;
}

function shouldShow(place: Place, filters: MapFilters) {
  const categoryVisible = !filters.categories.length || filters.categories.includes(place.category);
  if (!categoryVisible) return false;
  if (place.status === 'beenThere') return filters.beenThere;
  if (place.status === 'bucketList') return filters.bucketList;
  if (place.status === 'returnList') return filters.returnList;
  return filters.unsaved;
}

function markerClass(place: Place) {
  if (place.status === 'beenThere') return 'real-map-marker real-map-marker-been';
  if (place.status === 'bucketList') return 'real-map-marker real-map-marker-bucket';
  if (place.status === 'returnList') return 'real-map-marker real-map-marker-return';
  return 'real-map-marker real-map-marker-unsaved';
}

export default function RealMap({ places, filters, onSelectPlace }: RealMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const onSelectPlaceRef = useRef(onSelectPlace);

  const visiblePlaces = useMemo(() => places.filter((place) => shouldShow(place, filters)), [places, filters]);
  const cameraSignature = useMemo(
    () =>
      visiblePlaces
        .map((place) => `${place.id}:${place.longitude}:${place.latitude}`)
        .sort()
        .join('|'),
    [visiblePlaces],
  );

  useEffect(() => {
    onSelectPlaceRef.current = onSelectPlace;
  }, [onSelectPlace]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [-98.5795, 39.8283],
      zoom: 3.15,
      attributionControl: { compact: true },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextVisibleIds = new Set(visiblePlaces.map((place) => place.id));

    markersRef.current.forEach((marker, placeId) => {
      if (!nextVisibleIds.has(placeId)) {
        marker.remove();
        markersRef.current.delete(placeId);
      }
    });

    visiblePlaces.forEach((place) => {
      const existingMarker = markersRef.current.get(place.id);

      if (existingMarker) {
        const element = existingMarker.getElement() as HTMLButtonElement;
        element.className = markerClass(place);
        element.title = place.name;
        element.setAttribute('aria-label', place.name);
        element.onclick = () => onSelectPlaceRef.current(place);
        existingMarker.setLngLat([place.longitude, place.latitude]);
        return;
      }

      const element = document.createElement('button');
      element.type = 'button';
      element.className = markerClass(place);
      element.title = place.name;
      element.setAttribute('aria-label', place.name);
      element.onclick = () => onSelectPlaceRef.current(place);

      const marker = new maplibregl.Marker({ element })
        .setLngLat([place.longitude, place.latitude])
        .addTo(map);

      markersRef.current.set(place.id, marker);
    });
  }, [visiblePlaces]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (visiblePlaces.length) {
      const bounds = new maplibregl.LngLatBounds();
      visiblePlaces.forEach((place) => bounds.extend([place.longitude, place.latitude]));
      map.fitBounds(bounds, { padding: 72, maxZoom: 5.5, duration: 700 });
    } else {
      map.easeTo({ center: [-98.5795, 39.8283], zoom: 3.15, duration: 700 });
    }
  }, [cameraSignature, visiblePlaces]);

  return (
    <div className="real-map glass-panel relative overflow-hidden rounded-[2rem] border border-white/10">
      <div ref={containerRef} className="absolute inset-0" />

      <div className="pointer-events-none absolute left-5 top-5 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/70 backdrop-blur-md">
        Personal atlas
      </div>

      <div className="pointer-events-none absolute bottom-5 left-5 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/35 p-3 text-xs text-white/80 backdrop-blur-xl">
        <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-aurora" />Been There</span>
        <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-white/45" />Bucket List</span>
        <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full border border-white/40 bg-glacier" />Return List</span>
      </div>
    </div>
  );
}
