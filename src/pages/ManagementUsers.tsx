import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, GraduationCap, MapPin, Save, Search, ShieldCheck, Users } from 'lucide-react';
import { MANAGED_PLAYERS, RESERVATION_PLACES } from '@/data/mock';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ManagedPlayer } from '@/types';

type AssignedRoles = { professor: boolean; manager: boolean };

const userRolesStorageKey = 'joga-junto-management-user-roles';

const ManagementUsers = () => {
  const { t } = useLanguage();
  const { isGestorMode, currentUser } = useSession();
  const { toast } = useToast();
  const ownedComplexIds = currentUser.ownedComplexIds ?? [];

  const [selectedComplexId, setSelectedComplexId] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [userRoles, setUserRoles] = useState<Record<string, AssignedRoles>>({});

  const visiblePlaces = useMemo(
    () => RESERVATION_PLACES.filter((place) => ownedComplexIds.includes(place.id)),
    [ownedComplexIds],
  );

  const visiblePlayers = useMemo(
    () => MANAGED_PLAYERS.filter((player) => ownedComplexIds.includes(player.complexId)),
    [ownedComplexIds],
  );

  const filteredPlayers = visiblePlayers.filter((player) => {
    if (selectedComplexId !== 'all' && player.complexId !== selectedComplexId) return false;
    if (searchQuery.trim() && !player.name.toLowerCase().includes(searchQuery.trim().toLowerCase())) return false;
    return true;
  });

  const PAGE_SIZE = 12;
  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / PAGE_SIZE));
  const pagedPlayers = filteredPlayers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(userRolesStorageKey);
    if (stored) {
      try { setUserRoles(JSON.parse(stored) as Record<string, AssignedRoles>); } catch { setUserRoles({}); }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(userRolesStorageKey, JSON.stringify(userRoles));
  }, [userRoles]);

  useEffect(() => { setPage(1); }, [selectedComplexId, searchQuery]);

  const handleToggleRole = (playerId: string, role: 'professor' | 'manager') => {
    setUserRoles((current) => {
      const cur = current[playerId] ?? { professor: false, manager: false };
      if (role === 'professor') {
        const professor = !cur.professor;
        return { ...current, [playerId]: { professor, manager: false } };
      }
      const manager = !cur.manager;
      return { ...current, [playerId]: { professor: false, manager } };
    });
  };

  const handleSaveRoles = () => {
    toast({ title: t('rolesSaved'), description: t('usersSavedDescription') });
  };

  if (!isGestorMode) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black"><span className="neon-text">{t('users')}</span></h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t('ownerOnlyDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(116rem,calc(100vw-3rem))]">
      <header>
        <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('users')}</p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('managementUsersIntro')}</p>
      </header>

      <div className="rounded-[2rem] border border-border bg-gradient-card p-4 shadow-card sm:p-6">
        {/* Filters */}
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('sportComplex')}</div>
            <Select value={selectedComplexId} onValueChange={setSelectedComplexId}>
              <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                <SelectItem value="all">{t('allComplexes')}</SelectItem>
                {visiblePlaces.map((place) => (
                  <SelectItem key={place.id} value={place.id}>{place.name}</SelectItem>
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

        {filteredPlayers.length === 0 ? (
          <div className="rounded-2xl border border-border bg-background/25 p-10 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">{t('noUsersFound')}</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {pagedPlayers.map((player: ManagedPlayer) => {
                const assignment = userRoles[player.id] ?? { professor: false, manager: false };
                const complexName = visiblePlaces.find((p) => p.id === player.complexId)?.name ?? '-';
                return (
                  <div key={player.id} className="rounded-2xl border border-border bg-background/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-foreground">{player.name}</div>
                        <div className="mt-0.5 truncate text-xs text-muted-foreground">{player.email}</div>
                      </div>
                      <StatusBadge assignment={assignment} t={t} />
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{complexName}</span>
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-border/60 pt-3">
                      <RoleChip active={assignment.professor} icon={<GraduationCap className="h-3.5 w-3.5" />} label={t('professor')} color="cyan" onClick={() => handleToggleRole(player.id, 'professor')} />
                      <RoleChip active={assignment.manager} icon={<ShieldCheck className="h-3.5 w-3.5" />} label={t('manager')} color="pink" onClick={() => handleToggleRole(player.id, 'manager')} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded-2xl border border-border md:block">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-[36%]" />
                  <col className="w-[28%]" />
                  <col className="w-[16%]" />
                  <col className="w-[20%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border bg-background/30 text-left text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    <th className="px-5 py-3">{t('fullName')}</th>
                    <th className="px-5 py-3">{t('sportComplex')}</th>
                    <th className="px-5 py-3">{t('role')}</th>
                    <th className="px-5 py-3">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pagedPlayers.map((player: ManagedPlayer) => {
                    const assignment = userRoles[player.id] ?? { professor: false, manager: false };
                    const complexName = visiblePlaces.find((p) => p.id === player.complexId)?.name ?? '-';
                    return (
                      <tr key={player.id} className="transition-smooth hover:bg-primary/5">
                        <td className="px-5 py-4">
                          <div className="truncate font-semibold text-foreground">{player.name}</div>
                          <div className="mt-0.5 truncate text-xs text-muted-foreground">{player.email}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="block truncate text-sm text-muted-foreground">{complexName}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <IconRoleToggle
                              active={assignment.professor}
                              icon={<GraduationCap className="h-4 w-4" />}
                              color="cyan"
                              title={t('professor')}
                              onClick={() => handleToggleRole(player.id, 'professor')}
                            />
                            <IconRoleToggle
                              active={assignment.manager}
                              icon={<ShieldCheck className="h-4 w-4" />}
                              color="pink"
                              title={t('manager')}
                              onClick={() => handleToggleRole(player.id, 'manager')}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge assignment={assignment} t={t} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {filteredPlayers.length > 0 && (
          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
              <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button type="button" onClick={handleSaveRoles} title={t('saveChanges')} className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary-glow shadow-[0_0_12px_hsl(var(--primary)/0.18)] transition-smooth hover:bg-primary/16 hover:brightness-110">
              <Save className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* Icon-only toggle for desktop table CARGO column */
const IconRoleToggle = ({
  active, icon, color, title, onClick,
}: { active: boolean; icon: React.ReactNode; color: 'cyan' | 'pink'; title: string; onClick: () => void }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-smooth ${
      active
        ? color === 'cyan'
          ? 'border-neon-cyan/50 bg-neon-cyan/15 text-neon-cyan shadow-[0_0_8px_hsl(var(--neon-cyan)/0.3)]'
          : 'border-neon-pink/50 bg-neon-pink/15 text-neon-pink shadow-[0_0_8px_hsl(var(--neon-pink)/0.3)]'
        : 'border-border bg-background/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
    }`}
  >
    {icon}
  </button>
);

/* Text chip for mobile cards */
const RoleChip = ({
  active, icon, label, color, onClick,
}: { active: boolean; icon: React.ReactNode; label: string; color: 'cyan' | 'pink'; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-smooth ${
      active
        ? color === 'cyan'
          ? 'border-neon-cyan/40 bg-neon-cyan/15 text-neon-cyan'
          : 'border-neon-pink/40 bg-neon-pink/15 text-neon-pink'
        : 'border-border bg-background/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
    }`}
  >
    {icon}
    {label}
  </button>
);

/* Status badge — always same box model regardless of role */
const StatusBadge = ({ assignment, t }: { assignment: AssignedRoles; t: (k: string) => string }) => {
  if (assignment.professor) {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-neon-cyan">
        <GraduationCap className="h-3 w-3 shrink-0" />
        {t('professor')}
      </span>
    );
  }
  if (assignment.manager) {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-neon-pink/30 bg-neon-pink/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-neon-pink">
        <ShieldCheck className="h-3 w-3 shrink-0" />
        {t('manager')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full border border-border bg-background/40 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
      {t('player')}
    </span>
  );
};

export default ManagementUsers;
