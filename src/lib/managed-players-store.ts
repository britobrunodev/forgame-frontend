import { MANAGED_PLAYERS } from '@/data/mock';
import { PLAYER_LEVELS, type ManagedPlayer, type PlayerLevel } from '@/types';

const storageKey = 'joga-junto-managed-player-profiles';

type StoredPlayerProfile = {
  level: PlayerLevel;
  score: number;
};

const isLevel = (value: unknown): value is PlayerLevel =>
  typeof value === 'string' && PLAYER_LEVELS.includes(value as PlayerLevel);

const isStoredProfile = (value: unknown): value is StoredPlayerProfile => {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Record<string, unknown>;
  return isLevel(profile.level) && typeof profile.score === 'number';
};

const getStoredProfiles = (): Record<string, StoredPlayerProfile> => {
  if (typeof window === 'undefined') return {};
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return {};

  try {
    const parsed = JSON.parse(stored) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).flatMap(([playerId, value]) => {
        if (isStoredProfile(value)) {
          return [[playerId, value]];
        }
        if (isLevel(value)) {
          return [[playerId, { level: value, score: 0 }]];
        }
        return [];
      }),
    ) as Record<string, StoredPlayerProfile>;
  } catch {
    return {};
  }
};

export const getManagedPlayers = (): ManagedPlayer[] => {
  const storedProfiles = getStoredProfiles();
  return MANAGED_PLAYERS.map((player) => ({
    ...player,
    level: storedProfiles[player.id]?.level ?? player.level,
    score: storedProfiles[player.id]?.score ?? player.score,
  }));
};

export const saveManagedPlayerProfile = (playerId: string, profile: StoredPlayerProfile) => {
  if (typeof window === 'undefined') return;
  const current = getStoredProfiles();
  window.localStorage.setItem(storageKey, JSON.stringify({ ...current, [playerId]: profile }));
};
