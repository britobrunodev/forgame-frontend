import { MANAGED_CHAMPIONSHIPS } from '@/data/mock';
import type { ManagedChampionship } from '@/types';

const storageKey = 'joga-junto-championships';

export const getChampionships = (): ManagedChampionship[] => {
  if (typeof window === 'undefined') return MANAGED_CHAMPIONSHIPS;
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return MANAGED_CHAMPIONSHIPS;
  try {
    return JSON.parse(stored) as ManagedChampionship[];
  } catch {
    return MANAGED_CHAMPIONSHIPS;
  }
};

export const updateChampionship = (id: string, updates: Partial<Omit<ManagedChampionship, 'id' | 'payments'>>) => {
  if (typeof window === 'undefined') return;
  const all = getChampionships();
  const updated = all.map((c) => c.id === id ? { ...c, ...updates } : c);
  window.localStorage.setItem(storageKey, JSON.stringify(updated));
};

export const deleteChampionship = (id: string) => {
  if (typeof window === 'undefined') return;
  const filtered = getChampionships().filter((c) => c.id !== id);
  window.localStorage.setItem(storageKey, JSON.stringify(filtered));
};
