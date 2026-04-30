import { COURTS } from '@/data/mock';
import type { Court } from '@/types';

const storageKey = 'joga-junto-custom-courts';

export const COURT_DIMENSIONS = ['8x16m', '9x18m', '10x20m', '12x24m'];

const isReservation = (value: unknown): value is Court['reservations'][number] => {
  if (!value || typeof value !== 'object') return false;
  const reservation = value as Record<string, unknown>;
  return typeof reservation.date === 'string'
    && typeof reservation.start === 'string'
    && typeof reservation.end === 'string'
    && typeof reservation.user === 'string'
    && (reservation.type === undefined || reservation.type === 'single' || reservation.type === 'monthly');
};

const isCourt = (value: unknown): value is Court => {
  if (!value || typeof value !== 'object') return false;
  const court = value as Record<string, unknown>;
  return typeof court.id === 'string'
    && typeof court.name === 'string'
    && typeof court.complexId === 'string'
    && typeof court.dimensions === 'string'
    && typeof court.application === 'string'
    && typeof court.hourlyRate === 'number'
    && typeof court.monthlyRate === 'number'
    && Array.isArray(court.slotOptions)
    && court.slotOptions.every((slot) => !!slot && typeof slot === 'object' && typeof (slot as Record<string, unknown>).start === 'string' && typeof (slot as Record<string, unknown>).end === 'string')
    && Array.isArray(court.reservations)
    && court.reservations.every(isReservation);
};

export const getCustomCourts = (): Court[] => {
  if (typeof window === 'undefined') return [];
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as unknown[];
    return Array.isArray(parsed) ? parsed.filter(isCourt) : [];
  } catch {
    return [];
  }
};

export const getAllCourts = (): Court[] => [...COURTS, ...getCustomCourts()];

export const saveCustomCourt = (court: Court) => {
  if (typeof window === 'undefined') return;
  const nextCourts = [...getCustomCourts(), court];
  window.localStorage.setItem(storageKey, JSON.stringify(nextCourts));
};
