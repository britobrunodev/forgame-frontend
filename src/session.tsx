import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CURRENT_USER } from '@/data/mock';
import type { User, UserProfile } from '@/types';

type SessionContextValue = {
  currentUser: User;
  updateCurrentUser: (patch: Partial<User>) => void;
  activeProfile: UserProfile;
  setActiveProfile: (profile: UserProfile) => void;
  availableProfiles: UserProfile[];
  setAvailableProfiles: (profiles: UserProfile[]) => void;
  isOwnerMode: boolean;
};

const storageKey = 'joga-junto-active-profile';
const profilesStorageKey = 'joga-junto-available-profiles';
const userStorageKey = 'joga-junto-current-user';

const getAvailableProfiles = (user: User): UserProfile[] => {
  if (user.profiles && user.profiles.length > 0) {
    return user.profiles;
  }

  return user.type === 'distributor' ? ['owner'] : ['player'];
};

const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const stored = window.localStorage.getItem(userStorageKey);
    if (stored) {
      try {
        return { ...CURRENT_USER, ...JSON.parse(stored) as Partial<User> };
      } catch {
        // Ignore corrupted local storage and fall back to mock user.
      }
    }

    return CURRENT_USER;
  });

  const [availableProfiles, setAvailableProfilesState] = useState<UserProfile[]>(() => {
    const stored = window.localStorage.getItem(profilesStorageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as UserProfile[];
        const valid = parsed.filter((profile) => profile === 'player' || profile === 'owner');
        if (valid.length > 0) {
          return Array.from(new Set(valid));
        }
      } catch {
        // Ignore corrupted local storage and fall back to mock profiles.
      }
    }

    return getAvailableProfiles(currentUser);
  });

  const [activeProfile, setActiveProfileState] = useState<UserProfile>(() => {
    const stored = window.localStorage.getItem(storageKey);
    if ((stored === 'player' || stored === 'owner') && availableProfiles.includes(stored)) {
      return stored;
    }
    return availableProfiles[0] ?? 'player';
  });

  const value = useMemo<SessionContextValue>(
    () => ({
      currentUser,
      updateCurrentUser: (patch) => {
        setCurrentUser((previousUser) => {
          const nextUser = { ...previousUser, ...patch };
          window.localStorage.setItem(userStorageKey, JSON.stringify(nextUser));
          return nextUser;
        });
      },
      activeProfile,
      setActiveProfile: (profile) => {
        if (!availableProfiles.includes(profile)) return;
        window.localStorage.setItem(storageKey, profile);
        setActiveProfileState(profile);
      },
      availableProfiles,
      setAvailableProfiles: (profiles) => {
        const nextProfiles = Array.from(new Set(profiles.filter((profile) => profile === 'player' || profile === 'owner')));
        const safeProfiles = nextProfiles.length > 0 ? nextProfiles : ['player'];
        window.localStorage.setItem(profilesStorageKey, JSON.stringify(safeProfiles));
        setAvailableProfilesState(safeProfiles);
        setCurrentUser((previousUser) => {
          const nextUser = { ...previousUser, profiles: safeProfiles };
          window.localStorage.setItem(userStorageKey, JSON.stringify(nextUser));
          return nextUser;
        });

        if (!safeProfiles.includes(activeProfile)) {
          const nextActiveProfile = safeProfiles[0];
          window.localStorage.setItem(storageKey, nextActiveProfile);
          setActiveProfileState(nextActiveProfile);
        }
      },
      isOwnerMode: activeProfile === 'owner' && availableProfiles.includes('owner'),
    }),
    [activeProfile, availableProfiles, currentUser],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};
