import { RESERVATION_PLACES } from '@/data/mock';
import type { ReservationPlace, SportId } from '@/types';

const storageKey = 'joga-junto-custom-sport-complexes';

const isSportId = (value: unknown): value is SportId =>
  value === 'footvolley' || value === 'beach-tennis' || value === 'beach-soccer' || value === 'volleyball';

const isReservationPlace = (value: unknown): value is ReservationPlace => {
  if (!value || typeof value !== 'object') return false;
  const place = value as Record<string, unknown>;
  return typeof place.id === 'string'
    && typeof place.name === 'string'
    && typeof place.city === 'string'
    && Array.isArray(place.sports)
    && place.sports.every(isSportId)
    && typeof place.courts === 'number'
    && typeof place.rating === 'number'
    && (place.image === undefined || typeof place.image === 'string')
    && (place.country === undefined || typeof place.country === 'string')
    && (place.zipCode === undefined || typeof place.zipCode === 'string')
    && (place.street === undefined || typeof place.street === 'string')
    && (place.addressNumber === undefined || typeof place.addressNumber === 'string')
    && (place.addressComplement === undefined || typeof place.addressComplement === 'string');
};

export const getCustomSportComplexes = (): ReservationPlace[] => {
  if (typeof window === 'undefined') return [];
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as unknown[];
    return Array.isArray(parsed) ? parsed.filter(isReservationPlace) : [];
  } catch {
    return [];
  }
};

export const saveCustomSportComplex = (complex: ReservationPlace) => {
  if (typeof window === 'undefined') return;
  const nextComplexes = [...getCustomSportComplexes(), complex];
  window.localStorage.setItem(storageKey, JSON.stringify(nextComplexes));
};

export const getManagedSportComplexes = (ownedComplexIds: string[]): ReservationPlace[] => [
  ...RESERVATION_PLACES.filter((place) => ownedComplexIds.includes(place.id)),
  ...getCustomSportComplexes(),
];
