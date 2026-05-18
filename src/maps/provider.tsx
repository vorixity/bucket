import type { ComponentType } from 'react';
import FakeMap from '../components/FakeMap';
import type { MapFilters, Place } from '../types';

export interface MapProviderProps {
  places: Place[];
  filters: MapFilters;
  onSelectPlace: (place: Place) => void;
}

export interface MapProviderDefinition {
  id: 'fake';
  label: string;
  Component: ComponentType<MapProviderProps>;
}

export const activeMapProvider: MapProviderDefinition = {
  id: 'fake',
  label: 'USA placeholder map',
  Component: FakeMap,
};
