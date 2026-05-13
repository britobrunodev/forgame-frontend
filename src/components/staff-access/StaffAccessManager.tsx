import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, GraduationCap, MapPin, Save, Search, ShieldCheck, Target, Users } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { notify } from '@/lib/notify';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { accessControlApi, type AccessControlSnapshot, type ComplexRoleAssignment } from '@/lib/api';
import { RoleChipToggle, RoleIconToggle } from './RoleToggle';
import { StatusBadge } from './StatusBadge';

type AssignableRole = 'owner' | 'manager' | 'professor' | 'scorer';
type AssignedRoles = Record<AssignableRole, boolean>;

const EMPTY_ROLES: AssignedRoles = {
  owner: false,
  manager: false,
  professor: false,
  scorer: false,
};

const ROLE_ORDER: AssignableRole[] = ['owner', 'manager', 'professor', 'scorer'];
const EXCLUSIVE_ROLES: AssignableRole[] = ['manager', 'professor', 'scorer'];

export const StaffAccessManager = ({
  adminOnly = false,
  title,
  intro,
}: {
  adminOnly?: boolean;
  title: string;
  intro: string;
}) => {
  const { t } = useLanguage();
  const { currentUser, token } = useSession();
  const [selectedComplexId, setSelectedComplexId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [snapshot, setSnapshot] = useState<AccessControlSnapshot | null>(null);
  const [assignmentsByComplex, setAssignmentsByComplex] = useState<Record<string, Record<string, AssignedRoles>>>({});
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
        const data = await accessControlApi.getSnapshot(token, page, PAGE_SIZE, debouncedSearch);
        if (cancelled) return;

        setSnapshot(data);
        setAssignmentsByComplex((current) => {
          const nextAssignments = buildAssignmentsIndex(data.assignments);
          return Object.keys(current).length > 0
            ? { ...nextAssignments, ...current }
            : nextAssignments;
        });
        setSelectedComplexId((current) => current || String(data.complexes[0]?.id ?? ''));
      } catch (err) {
        if (cancelled) return;
        notify.error(t('profileLoadError'), err instanceof Error ? err.message : undefined);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [token, canView, page, debouncedSearch]);

  const allowedRoles = useMemo(
    () => (snapshot?.assignable_roles ?? []).filter((role): role is AssignableRole => ROLE_ORDER.includes(role as AssignableRole)),
    [snapshot],
  );

  const users = snapshot?.users ?? [];
  const complexes = snapshot?.complexes ?? [];
  const totalPages = snapshot?.total_pages ?? 1;
  const totalUsers = snapshot?.total ?? 0;

  const toggleRole = (userId: string, role: AssignableRole) => {
    if (!selectedComplexId) return;

    setAssignmentsByComplex((current) => {
      const currentComplexRoles = current[selectedComplexId] ?? {};
      const existing = currentComplexRoles[userId] ?? EMPTY_ROLES;
      const nextValue = !existing[role];
      const nextRoles: AssignedRoles = { ...EMPTY_ROLES, ...existing, [role]: nextValue };

      if (nextValue && EXCLUSIVE_ROLES.includes(role)) {
        for (const other of EXCLUSIVE_ROLES) {
          if (other !== role) nextRoles[other] = false;
        }
      }

      return {
        ...current,
        [selectedComplexId]: {
          ...currentComplexRoles,
          [userId]: nextRoles,
        },
      };
    });
  };

  const handleSave = async () => {
    if (!token || !selectedComplexId) return;

    const assignments = Object.entries(assignmentsByComplex[selectedComplexId] ?? {}).flatMap(([userId, roles]) =>
      Object.entries(roles)
        .filter(([role, active]) => active && allowedRoles.includes(role as AssignableRole))
        .map(([role]) => ({ user_id: Number(userId), role })),
    );

    setSaving(true);
    try {
      const updated = await accessControlApi.updateAssignments(token, {
        complex_id: Number(selectedComplexId),
        assignments,
      });

      setAssignmentsByComplex((current) => ({
        ...current,
        [selectedComplexId]: buildAssignmentsIndex(updated)[selectedComplexId] ?? {},
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
      <header>
        <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{title}</p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{intro}</p>
      </header>

      <div className="rounded-[2rem] border border-border bg-gradient-card p-4 shadow-card sm:p-6">
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('sportComplex')}</div>
            <Select value={selectedComplexId} onValueChange={setSelectedComplexId}>
              <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                {complexes.map((complex) => (
                  <SelectItem key={complex.id} value={String(complex.id)}>
                    {complex.name}
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

        {!selectedComplexId ? (
          <div className="rounded-2xl border border-border bg-background/25 p-10 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground/30" />
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-border bg-background/25 p-10 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground/30" />
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {users.map((user) => {
                const complexName = complexes.find((complex) => String(complex.id) === selectedComplexId)?.name ?? '-';
                const assignment = assignmentsByComplex[selectedComplexId]?.[user.id] ?? EMPTY_ROLES;
                const activeRoles = ROLE_ORDER.filter((role) => assignment[role]);
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
                      <span className="truncate">{complexName}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
                      {allowedRoles.includes('professor') ? (
                        <RoleChipToggle active={assignment.professor} icon={<GraduationCap className="h-3.5 w-3.5" />} label={t('professor')} tone="cyan" onClick={() => toggleRole(user.id, 'professor')} />
                      ) : null}
                      {allowedRoles.includes('manager') ? (
                        <RoleChipToggle active={assignment.manager} icon={<ShieldCheck className="h-3.5 w-3.5" />} label={t('manager')} tone="pink" onClick={() => toggleRole(user.id, 'manager')} />
                      ) : null}
                      {allowedRoles.includes('scorer') ? (
                        <RoleChipToggle active={assignment.scorer} icon={<Target className="h-3.5 w-3.5" />} label={t('scorer')} tone="amber" onClick={() => toggleRole(user.id, 'scorer')} />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <div className="min-w-[860px]">
                <div className="grid grid-cols-[36%_28%_16%_20%] border-b border-border px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  <div className="text-center">{t('fullName')}</div>
                  <div className="text-center">{t('sportComplex')}</div>
                  <div className="text-center">{t('role')}</div>
                  <div className="text-center">{t('actions')}</div>
                </div>
                <div className="mt-2 space-y-2">
                  {users.map((user) => {
                    const assignment = assignmentsByComplex[selectedComplexId]?.[user.id] ?? EMPTY_ROLES;
                    const activeRoles = ROLE_ORDER.filter((role) => assignment[role]);
                    const complexName = complexes.find((complex) => String(complex.id) === selectedComplexId)?.name ?? '-';
                    return (
                      <div key={user.id} className="grid grid-cols-[36%_28%_16%_20%] items-center rounded-xl border border-border px-5 py-4 transition-smooth hover:bg-primary/5">
                        <div className="text-center">
                          <div className="truncate font-semibold text-foreground">{user.name}</div>
                          <div className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</div>
                        </div>
                        <div className="text-center">
                          <span className="block truncate text-sm text-muted-foreground">{complexName}</span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {allowedRoles.includes('professor') ? (
                              <RoleIconToggle active={assignment.professor} icon={<GraduationCap className="h-4 w-4" />} tone="cyan" title={t('professor')} onClick={() => toggleRole(user.id, 'professor')} />
                            ) : null}
                            {allowedRoles.includes('manager') ? (
                              <RoleIconToggle active={assignment.manager} icon={<ShieldCheck className="h-4 w-4" />} tone="pink" title={t('manager')} onClick={() => toggleRole(user.id, 'manager')} />
                            ) : null}
                            {allowedRoles.includes('scorer') ? (
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

        {users.length > 0 && selectedComplexId ? (
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
            <button type="button" onClick={handleSave} disabled={saving} title={t('saveChanges')} className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary-glow shadow-[0_0_12px_hsl(var(--primary)/0.18)] transition-smooth hover:bg-primary/16 hover:brightness-110 disabled:opacity-60">
              <Save className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const buildAssignmentsIndex = (assignments: ComplexRoleAssignment[]) =>
  assignments.reduce<Record<string, Record<string, AssignedRoles>>>((acc, assignment) => {
    const role = assignment.role as AssignableRole;
    if (!ROLE_ORDER.includes(role)) return acc;

    const complexKey = String(assignment.complex_id);
    const userKey = String(assignment.user_id);
    const byComplex = acc[complexKey] ?? {};
    const userRoles = byComplex[userKey] ?? { ...EMPTY_ROLES };
    userRoles[role] = true;

    return {
      ...acc,
      [complexKey]: {
        ...byComplex,
        [userKey]: userRoles,
      },
    };
  }, {});
