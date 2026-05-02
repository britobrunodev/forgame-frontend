import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CURRENT_USER } from '@/data/mock';
import type { GestorRole, User, UserProfile } from '@/types';

type SessionContextValue = {
  currentUser: User;
  updateCurrentUser: (patch: Partial<User>) => void;
  activeProfile: UserProfile;
  setActiveProfile: (profile: UserProfile) => void;
  availableProfiles: UserProfile[];
  setAvailableProfiles: (profiles: UserProfile[]) => void;
  activeGestorRole: GestorRole;
  setActiveGestorRole: (role: GestorRole) => void;
  availableGestorRoles: GestorRole[];
  setAvailableGestorRoles: (roles: GestorRole[]) => void;
  isGestorMode: boolean;
};

const storageKey = 'joga-junto-active-profile';
const profilesStorageKey = 'joga-junto-available-profiles';
const userStorageKey = 'joga-junto-current-user';
const gestorRoleStorageKey = 'joga-junto-active-gestor-role';
const gestorRolesStorageKey = 'joga-junto-available-gestor-roles';

const getAvailableProfiles = (user: User): UserProfile[] => {
  if (user.profiles && user.profiles.length > 0) {
    return user.profiles;
  }

  return user.type === 'gestor' ? ['gestor'] : ['player'];
};

const getAvailableGestorRoles = (user: User): GestorRole[] => {
  if (user.gestorRoles && user.gestorRoles.length > 0) {
    return user.gestorRoles;
  }

  return user.type === 'gestor' ? ['owner'] : [];
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
        const valid = parsed.map((profile) => profile === 'owner' ? 'gestor' : profile).filter(
          (profile): profile is UserProfile => profile === 'player' || profile === 'gestor',
        );
        if (valid.length > 0) {
          return Array.from(new Set(valid));
        }
      } catch {
        // Ignore corrupted local storage and fall back to mock profiles.
      }
    }

    return getAvailableProfiles(currentUser);
  });

  const [availableGestorRoles, setAvailableGestorRolesState] = useState<GestorRole[]>(() => {
    const stored = window.localStorage.getItem(gestorRolesStorageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GestorRole[];
        const valid = parsed.filter(
          (role): role is GestorRole => role === 'owner' || role === 'manager' || role === 'professor',
        );
        if (valid.length > 0) {
          return Array.from(new Set(valid));
        }
      } catch {
        // Ignore corrupted local storage and fall back to mock roles.
      }
    }

    return getAvailableGestorRoles(currentUser);
  });

  const [activeProfile, setActiveProfileState] = useState<UserProfile>(() => {
    const stored = window.localStorage.getItem(storageKey);
    const normalized = stored === 'owner' ? 'gestor' : stored;
    if ((normalized === 'player' || normalized === 'gestor') && availableProfiles.includes(normalized)) {
      return normalized;
    }
    return availableProfiles[0] ?? 'player';
  });

  const [activeGestorRole, setActiveGestorRoleState] = useState<GestorRole>(() => {
    const stored = window.localStorage.getItem(gestorRoleStorageKey);
    if (
      (stored === 'owner' || stored === 'manager' || stored === 'professor')
      && availableGestorRoles.includes(stored)
    ) {
      return stored;
    }

    return availableGestorRoles[0] ?? 'owner';
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
        const nextProfiles = Array.from(new Set(profiles.filter(
          (profile): profile is UserProfile => profile === 'player' || profile === 'gestor',
        )));
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
      activeGestorRole,
      setActiveGestorRole: (role) => {
        if (!availableGestorRoles.includes(role)) return;
        window.localStorage.setItem(gestorRoleStorageKey, role);
        setActiveGestorRoleState(role);
      },
      availableGestorRoles,
      setAvailableGestorRoles: (roles) => {
        const nextRoles = Array.from(new Set(roles.filter(
          (role): role is GestorRole => role === 'owner' || role === 'manager' || role === 'professor',
        )));
        const safeRoles = nextRoles.length > 0 ? nextRoles : ['owner'];
        window.localStorage.setItem(gestorRolesStorageKey, JSON.stringify(safeRoles));
        setAvailableGestorRolesState(safeRoles);
        setCurrentUser((previousUser) => {
          const nextUser = { ...previousUser, gestorRoles: safeRoles };
          window.localStorage.setItem(userStorageKey, JSON.stringify(nextUser));
          return nextUser;
        });

        if (!safeRoles.includes(activeGestorRole)) {
          const nextActiveRole = safeRoles[0];
          window.localStorage.setItem(gestorRoleStorageKey, nextActiveRole);
          setActiveGestorRoleState(nextActiveRole);
        }
      },
      isGestorMode: activeProfile === 'gestor' && availableProfiles.includes('gestor'),
    }),
    [activeGestorRole, activeProfile, availableGestorRoles, availableProfiles, currentUser],
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
