import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Flag, GraduationCap, MapPin, Save, Search, ShieldCheck, Target, Users } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { notify } from '@/lib/notify';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  accessControlApi,
  championshipAccessControlApi,
  type AccessControlSnapshot,
  type ChampionshipAccessControlSnapshot,
  type ChampionshipRoleAssignment,
  type ComplexRoleAssignment,
} from '@/lib/api';
import { RoleChipToggle, RoleIconToggle } from './RoleToggle';
import { StatusBadge } from './StatusBadge';

type AssignableRole = 'owner' | 'manager' | 'professor' | 'referee' | 'scorer';
type AssignedRoles = Record<AssignableRole, boolean>;
type AccessScope = 'complex' | 'championship';
type ScopeSnapshot = AccessControlSnapshot | ChampionshipAccessControlSnapshot;

const EMPTY_ROLES: AssignedRoles = {
  owner: false,
  manager: false,
  professor: false,
  referee: false,
  scorer: false,
};

const ROLE_ORDER: AssignableRole[] = ['owner', 'manager', 'professor', 'referee', 'scorer'];
const EXCLUSIVE_ROLES: AssignableRole[] = ['manager', 'professor', 'referee', 'scorer'];

export const StaffAccessManager = ({
  adminOnly = false,
  scope,
  title,
  intro,
  showBackButton = false,
}: {
  adminOnly?: boolean;
  scope: AccessScope;
  title: string;
  intro: string;
  showBackButton?: boolean;
}) => {
  const { t } = useLanguage();
  const { currentUser, token } = useSession();
  const navigate = useNavigate();
  const [selectedScopeId, setSelectedScopeId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [snapshot, setSnapshot] = useState<ScopeSnapshot | null>(null);
  const [assignmentsByScope, setAssignmentsByScope] = useState<Record<string, Record<string, AssignedRoles>>>({});
  const PAGE_SIZE = 12;

  const canView = adminOnly ? currentUser.isAdmin : (currentUser.isAdmin || currentUser.roles?.includes('owner'));

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (!token || !canView) return;

    let cancelled = false;

    const load = async () => {
      try {
        const data = scope === 'complex'
          ? await accessControlApi.getSnapshot(token, page, PAGE_SIZE, debouncedSearch)
          : await championshipAccessControlApi.getSnapshot(token, page, PAGE_SIZE, debouncedSearch);
        if (cancelled) return;

        setSnapshot(data);
        setAssignmentsByScope((current) => {
          const nextAssignments = buildAssignmentsIndex(scope, data.assignments);
          return Object.keys(current).length > 0
            ? { ...nextAssignments, ...current }
            : nextAssignments;
        });
        setSelectedScopeId((current) => current || String(getScopeOptions(scope, data)[0]?.id ?? ''));
      } catch (err) {
        if (cancelled) return;
        notify.error(t('profileLoadError'), err instanceof Error ? err.message : undefined);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [token, canView, page, debouncedSearch, scope, t]);

  const allowedRoles = useMemo(
    () => (snapshot?.assignable_roles ?? []).filter((role): role is AssignableRole => ROLE_ORDER.includes(role as AssignableRole)),
    [snapshot],
  );

  const users = snapshot?.users ?? [];
  const scopeOptions = snapshot ? getScopeOptions(scope, snapshot) : [];
  const totalPages = snapshot?.total_pages ?? 1;
  const totalUsers = snapshot?.total ?? 0;
  const selectorLabel = scope === 'complex' ? t('sportComplex') : t('championshipLabel');
  const selectedScope = scopeOptions.find((item) => String(item.id) === selectedScopeId);
  const selectedScopeName = selectedScope?.name ?? '-';
  const selectedChampionshipOwner = scope === 'championship' && selectedScope && 'owner_id' in selectedScope
    ? {
        id: selectedScope.owner_id,
        name: selectedScope.owner_name,
        email: selectedScope.owner_email,
      }
    : null;

  const visibleUsers = useMemo(() => {
    if (scope !== 'championship' || !selectedChampionshipOwner?.id) return users;
    const ownerAlreadyVisible = users.some((user) => Number(user.id) === Number(selectedChampionshipOwner.id));
    if (ownerAlreadyVisible || !selectedChampionshipOwner.name || !selectedChampionshipOwner.email) return users;
    return [
      {
        id: selectedChampionshipOwner.id,
        name: selectedChampionshipOwner.name,
        email: selectedChampionshipOwner.email,
        is_admin: false,
      },
      ...users,
    ];
  }, [scope, selectedChampionshipOwner, users]);

  const getDisplayAssignment = (userId: string): AssignedRoles => {
    const stored = assignmentsByScope[selectedScopeId]?.[userId] ?? EMPTY_ROLES;
    if (scope === 'championship' && selectedChampionshipOwner?.id != null && Number(userId) === Number(selectedChampionshipOwner.id)) {
      return { ...stored, owner: true };
    }
    return stored;
  };

  const toggleRole = (userId: string, role: AssignableRole) => {
    if (!selectedScopeId) return;
    if (scope === 'championship' && selectedChampionshipOwner?.id != null && Number(userId) === Number(selectedChampionshipOwner.id)) return;

    setAssignmentsByScope((current) => {
      const currentScopeRoles = current[selectedScopeId] ?? {};
      const existing = currentScopeRoles[userId] ?? EMPTY_ROLES;
      const nextValue = !existing[role];
      const nextRoles: AssignedRoles = { ...EMPTY_ROLES, ...existing, [role]: nextValue };

      if (nextValue && EXCLUSIVE_ROLES.includes(role)) {
        for (const other of EXCLUSIVE_ROLES) {
          if (other !== role) nextRoles[other] = false;
        }
      }

      return {
        ...current,
        [selectedScopeId]: {
          ...currentScopeRoles,
          [userId]: nextRoles,
        },
      };
    });
  };

  const handleSave = async () => {
    if (!token || !selectedScopeId) return;

    const assignments = Object.entries(assignmentsByScope[selectedScopeId] ?? {}).flatMap(([userId, roles]) =>
      Object.entries(roles)
        .filter(([role, active]) => active && allowedRoles.includes(role as AssignableRole))
        .map(([role]) => ({ user_id: Number(userId), role })),
    );

    setSaving(true);
    try {
      const updated = scope === 'complex'
        ? await accessControlApi.updateAssignments(token, {
            complex_id: Number(selectedScopeId),
            assignments,
          })
        : await championshipAccessControlApi.updateAssignments(token, {
            championship_id: Number(selectedScopeId),
            assignments,
          });

      setAssignmentsByScope((current) => ({
        ...current,
        [selectedScopeId]: buildAssignmentsIndex(scope, updated)[selectedScopeId] ?? {},
      }));

      notify.success(t('rolesSaved'), t('usersSavedDescription'));
    } catch (err) {
      notify.error(t('profileSaveError'), err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  if (!canView) {
    return (
      <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))]">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black"><span className="neon-text">{title}</span></h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t('ownerOnlyDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))] space-y-8">
      <header className="flex items-center gap-4">
        {showBackButton ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
            aria-label={t('back')}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{intro}</p>
        </div>
      </header>

      <div className="space-y-5">
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{selectorLabel}</div>
            <Select value={selectedScopeId} onValueChange={setSelectedScopeId}>
              <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                {scopeOptions.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('searchPlayers')}</div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlayers')}
                className="border-border bg-background/60 pl-9 text-sm"
              />
            </div>
          </div>
        </div>

        {!selectedScopeId ? (
          <div className="rounded-2xl border border-border bg-background/25 p-10 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground/30" />
          </div>
        ) : visibleUsers.length === 0 ? (
          <div className="rounded-2xl border border-border bg-background/25 p-10 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground/30" />
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {visibleUsers.map((user) => {
                const assignment = getDisplayAssignment(String(user.id));
                const activeRoles = ROLE_ORDER.filter((role) => assignment[role]);
                const readOnlyOwner = assignment.owner;
                return (
                  <div key={user.id} className="rounded-2xl border border-border bg-background/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-foreground">{user.name}</div>
                        <div className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</div>
                      </div>
                      <StatusBadge activeRoles={activeRoles} t={t} />
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{selectedScopeName}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
                      {!readOnlyOwner && allowedRoles.includes('professor') ? (
                        <RoleChipToggle active={assignment.professor} icon={<GraduationCap className="h-3.5 w-3.5" />} label={t('professor')} tone="cyan" onClick={() => toggleRole(user.id, 'professor')} />
                      ) : null}
                      {!readOnlyOwner && allowedRoles.includes('manager') ? (
                        <RoleChipToggle active={assignment.manager} icon={<ShieldCheck className="h-3.5 w-3.5" />} label={t('manager')} tone="pink" onClick={() => toggleRole(user.id, 'manager')} />
                      ) : null}
                      {!readOnlyOwner && allowedRoles.includes('referee') ? (
                        <RoleChipToggle active={assignment.referee} icon={<Flag className="h-3.5 w-3.5" />} label={t('referee')} tone="violet" onClick={() => toggleRole(user.id, 'referee')} />
                      ) : null}
                      {!readOnlyOwner && allowedRoles.includes('scorer') ? (
                        <RoleChipToggle active={assignment.scorer} icon={<Target className="h-3.5 w-3.5" />} label={t('scorer')} tone="amber" onClick={() => toggleRole(user.id, 'scorer')} />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <div className="min-w-[860px]">
                <div className="grid grid-cols-[36%_28%_16%_20%] border-t border-b border-border px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:px-6">
                  <div className="text-center">{t('fullName')}</div>
                  <div className="text-center">{selectorLabel}</div>
                  <div className="text-center">{t('role')}</div>
                  <div className="text-center">{t('actions')}</div>
                </div>
                <div className="mt-2 space-y-2">
                  {visibleUsers.map((user) => {
                    const assignment = getDisplayAssignment(String(user.id));
                    const activeRoles = ROLE_ORDER.filter((role) => assignment[role]);
                    const readOnlyOwner = assignment.owner;
                    return (
                      <div key={user.id} className="grid grid-cols-[36%_28%_16%_20%] items-center rounded-xl border border-border px-5 py-4 transition-smooth hover:bg-primary/5 sm:px-6">
                        <div className="text-center">
                          <div className="truncate font-semibold text-foreground">{user.name}</div>
                          <div className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</div>
                        </div>
                        <div className="text-center">
                          <span className="block truncate text-sm text-muted-foreground">{selectedScopeName}</span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {!readOnlyOwner && allowedRoles.includes('professor') ? (
                              <RoleIconToggle active={assignment.professor} icon={<GraduationCap className="h-4 w-4" />} tone="cyan" title={t('professor')} onClick={() => toggleRole(user.id, 'professor')} />
                            ) : null}
                            {!readOnlyOwner && allowedRoles.includes('manager') ? (
                              <RoleIconToggle active={assignment.manager} icon={<ShieldCheck className="h-4 w-4" />} tone="pink" title={t('manager')} onClick={() => toggleRole(user.id, 'manager')} />
                            ) : null}
                            {!readOnlyOwner && allowedRoles.includes('referee') ? (
                              <RoleIconToggle active={assignment.referee} icon={<Flag className="h-4 w-4" />} tone="violet" title={t('referee')} onClick={() => toggleRole(user.id, 'referee')} />
                            ) : null}
                            {!readOnlyOwner && allowedRoles.includes('scorer') ? (
                              <RoleIconToggle active={assignment.scorer} icon={<Target className="h-4 w-4" />} tone="amber" title={t('scorer')} onClick={() => toggleRole(user.id, 'scorer')} />
                            ) : null}
                          </div>
                        </div>
                        <div className="text-center">
                          <StatusBadge activeRoles={activeRoles} t={t} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {snapshot ? (
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => current - 1)}
                disabled={page <= 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= totalPages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
                aria-label="Próxima página"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="ml-2 text-xs text-muted-foreground">{totalUsers} {t('users').toLowerCase()}</span>
            </div>
            <button type="button" onClick={handleSave} disabled={saving || !selectedScopeId} title={t('saveChanges')} className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary-glow shadow-[0_0_12px_hsl(var(--primary)/0.18)] transition-smooth hover:bg-primary/16 hover:brightness-110 disabled:opacity-60">
              <Save className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const getScopeOptions = (
  scope: AccessScope,
  snapshot: ScopeSnapshot,
) => (scope === 'complex' ? snapshot.complexes : snapshot.championships);

const buildAssignmentsIndex = (
  scope: AccessScope,
  assignments: ComplexRoleAssignment[] | ChampionshipRoleAssignment[],
) =>
  assignments.reduce<Record<string, Record<string, AssignedRoles>>>((acc, assignment) => {
    const role = assignment.role as AssignableRole;
    if (!ROLE_ORDER.includes(role)) return acc;

    const scopeKey = String(
      scope === 'complex'
        ? (assignment as ComplexRoleAssignment).complex_id
        : (assignment as ChampionshipRoleAssignment).championship_id,
    );
    const userKey = String(assignment.user_id);
    const byScope = acc[scopeKey] ?? {};
    const userRoles = byScope[userKey] ?? { ...EMPTY_ROLES };
    userRoles[role] = true;

    return {
      ...acc,
      [scopeKey]: {
        ...byScope,
        [userKey]: userRoles,
      },
    };
  }, {});
