import type { ComponentType } from 'react';
import RealMap from '../components/RealMap';
import type { MapFilters, Place } from '../types';

export interface MapProviderProps {
  places: Place[];
  filters: MapFilters;
  onSelectPlace: (place: Place) => void;
}

export interface MapProviderDefinition {
  id: 'real' | 'fake';
  label: string;
  Component: ComponentType<MapProviderProps>;
}

export const activeMapProvider: MapProviderDefinition = {
  id: 'real',
  label: 'Interactive map',
  Component: RealMap,
};
