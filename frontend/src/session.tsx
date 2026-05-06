import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CURRENT_USER } from '@/data/mock';
import type { AuthUser } from '@/lib/api';
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
  token: string | null;
  pendingApproval: boolean;
  login: (token: string, authUser: AuthUser, pendingApproval?: boolean) => void;
  logout: () => void;
};

const storageKey = 'joga-junto-active-profile';
const profilesStorageKey = 'joga-junto-available-profiles';
const userStorageKey = 'joga-junto-current-user';
const gestorRoleStorageKey = 'joga-junto-active-gestor-role';
const gestorRolesStorageKey = 'joga-junto-available-gestor-roles';
const tokenStorageKey = 'joga-junto-token';
const pendingApprovalStorageKey = 'joga-junto-pending-approval';

const GESTOR_ROLES: GestorRole[] = ['owner', 'manager', 'professor'];

const getAvailableProfiles = (user: User): UserProfile[] => {
  if (user.profiles && user.profiles.length > 0) return user.profiles;
  return user.type === 'gestor' ? ['gestor'] : ['player'];
};

const getAvailableGestorRoles = (user: User): GestorRole[] => {
  if (user.gestorRoles && user.gestorRoles.length > 0) return user.gestorRoles;
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
        // ignore
      }
    }
    return CURRENT_USER;
  });

  const [availableProfiles, setAvailableProfilesState] = useState<UserProfile[]>(() => {
    const stored = window.localStorage.getItem(profilesStorageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as UserProfile[];
        const valid = parsed
          .map((p) => (p === 'owner' ? 'gestor' : p))
          .filter((p): p is UserProfile => p === 'player' || p === 'gestor');
        if (valid.length > 0) return Array.from(new Set(valid));
      } catch {
        // ignore
      }
    }
    return getAvailableProfiles(currentUser);
  });

  const [availableGestorRoles, setAvailableGestorRolesState] = useState<GestorRole[]>(() => {
    const stored = window.localStorage.getItem(gestorRolesStorageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GestorRole[];
        const valid = parsed.filter((r): r is GestorRole => GESTOR_ROLES.includes(r));
        if (valid.length > 0) return Array.from(new Set(valid));
      } catch {
        // ignore
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
    if ((stored === 'owner' || stored === 'manager' || stored === 'professor') && availableGestorRoles.includes(stored)) {
      return stored;
    }
    return availableGestorRoles[0] ?? 'owner';
  });

  const [token, setToken] = useState<string | null>(() => window.localStorage.getItem(tokenStorageKey));
  const [pendingApproval, setPendingApproval] = useState<boolean>(() => {
    return window.localStorage.getItem(pendingApprovalStorageKey) === 'true';
  });

  const value = useMemo<SessionContextValue>(
    () => ({
      currentUser,
      updateCurrentUser: (patch) => {
        setCurrentUser((prev) => {
          const next = { ...prev, ...patch };
          window.localStorage.setItem(userStorageKey, JSON.stringify(next));
          return next;
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
        const next = Array.from(new Set(profiles.filter((p): p is UserProfile => p === 'player' || p === 'gestor')));
        const safe = next.length > 0 ? next : (['player'] as UserProfile[]);
        window.localStorage.setItem(profilesStorageKey, JSON.stringify(safe));
        setAvailableProfilesState(safe);
        setCurrentUser((prev) => {
          const u = { ...prev, profiles: safe };
          window.localStorage.setItem(userStorageKey, JSON.stringify(u));
          return u;
        });
        if (!safe.includes(activeProfile)) {
          window.localStorage.setItem(storageKey, safe[0]);
          setActiveProfileState(safe[0]);
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
        const next = Array.from(new Set(roles.filter((r): r is GestorRole => GESTOR_ROLES.includes(r))));
        const safe = next.length > 0 ? next : (['owner'] as GestorRole[]);
        window.localStorage.setItem(gestorRolesStorageKey, JSON.stringify(safe));
        setAvailableGestorRolesState(safe);
        setCurrentUser((prev) => {
          const u = { ...prev, gestorRoles: safe };
          window.localStorage.setItem(userStorageKey, JSON.stringify(u));
          return u;
        });
        if (!safe.includes(activeGestorRole)) {
          window.localStorage.setItem(gestorRoleStorageKey, safe[0]);
          setActiveGestorRoleState(safe[0]);
        }
      },
      isGestorMode: activeProfile === 'gestor' && availableProfiles.includes('gestor'),
      token,
      pendingApproval,
      login: (newToken, authUser, pending = false) => {
        const backendRoles = new Set(authUser.roles);
        const isGestor = GESTOR_ROLES.some((r) => backendRoles.has(r));
        const profiles: UserProfile[] = isGestor ? ['player', 'gestor'] : ['player'];
        const gestorRoles = GESTOR_ROLES.filter((r) => backendRoles.has(r));

        const nextUser: User = {
          ...CURRENT_USER,
          id: authUser.id,
          email: authUser.email,
          name: authUser.name,
          avatarUrl: authUser.picture_url ?? undefined,
          type: isGestor ? 'gestor' : 'player',
          profiles,
          gestorRoles,
          preferences: [],
        };

        window.localStorage.setItem(tokenStorageKey, newToken);
        window.localStorage.setItem(pendingApprovalStorageKey, String(pending));
        window.localStorage.setItem(userStorageKey, JSON.stringify(nextUser));
        window.localStorage.setItem(profilesStorageKey, JSON.stringify(profiles));
        window.localStorage.setItem(storageKey, profiles[profiles.length - 1]);

        if (gestorRoles.length > 0) {
          window.localStorage.setItem(gestorRolesStorageKey, JSON.stringify(gestorRoles));
          window.localStorage.setItem(gestorRoleStorageKey, gestorRoles[0]);
          setAvailableGestorRolesState(gestorRoles);
          setActiveGestorRoleState(gestorRoles[0]);
        }

        setToken(newToken);
        setPendingApproval(pending);
        setCurrentUser(nextUser);
        setAvailableProfilesState(profiles);
        setActiveProfileState(profiles[profiles.length - 1]);
      },
      logout: () => {
        [tokenStorageKey, pendingApprovalStorageKey, userStorageKey, profilesStorageKey, storageKey, gestorRolesStorageKey, gestorRoleStorageKey].forEach(
          (key) => window.localStorage.removeItem(key),
        );
        setToken(null);
        setPendingApproval(false);
        setCurrentUser(CURRENT_USER);
        const defaultProfiles = getAvailableProfiles(CURRENT_USER);
        setAvailableProfilesState(defaultProfiles);
        setActiveProfileState(defaultProfiles[0] ?? 'player');
        const defaultGestorRoles = getAvailableGestorRoles(CURRENT_USER);
        setAvailableGestorRolesState(defaultGestorRoles);
        setActiveGestorRoleState(defaultGestorRoles[0] ?? 'owner');
      },
    }),
    [activeGestorRole, activeProfile, availableGestorRoles, availableProfiles, currentUser, token, pendingApproval],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
};
