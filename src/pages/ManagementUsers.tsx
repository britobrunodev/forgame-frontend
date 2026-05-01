import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { MANAGED_PLAYERS, RESERVATION_PLACES } from '@/data/mock';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import type { ManagedPlayer } from '@/types';

type AssignedRoles = {
    professor: boolean;
    manager: boolean;
};

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
            try {
                setUserRoles(JSON.parse(stored) as Record<string, AssignedRoles>);
            } catch {
                setUserRoles({});
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(userRolesStorageKey, JSON.stringify(userRoles));
    }, [userRoles]);

    useEffect(() => {
        setPage(1);
    }, [selectedComplexId, searchQuery]);

    const handleToggleRole = (playerId: string, role: 'professor' | 'manager') => {
        setUserRoles((current) => {
            const currentRoles = current[playerId] ?? { professor: false, manager: false };

            if (role === 'professor') {
                const professor = !currentRoles.professor;
                return {
                    ...current,
                    [playerId]: {
                        professor,
                        manager: professor ? false : currentRoles.manager,
                    },
                };
            }

            const manager = !currentRoles.manager;
            return {
                ...current,
                [playerId]: {
                    professor: manager ? false : currentRoles.professor,
                    manager,
                },
            };
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
                        {t('ownerOnlyTitle')}
                    </div>
                    <h1 className="mt-5 font-display text-4xl font-black">
                        <span className="neon-text">{t('users')}</span>
                    </h1>
                    <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t('ownerOnlyDescription')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(116rem,calc(100vw-3rem))]">
            <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('users')}</p>
                    <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('managementUsersIntro')}</p>
                </div>
            </header>

            <div className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
                <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_240px]">
                    <div className="space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('sportComplex')}</div>
                        <div className="rounded-lg border border-border bg-background/60 px-3 py-2 text-sm font-semibold">
                            <select
                                className="w-full bg-transparent text-sm outline-none"
                                value={selectedComplexId}
                                onChange={(event) => setSelectedComplexId(event.target.value)}
                            >
                                <option value="all">{t('allComplexes')}</option>
                                {visiblePlaces.map((place) => (
                                    <option key={place.id} value={place.id}>{place.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('searchPlayers')}</div>
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder={t('searchPlayers')}
                                className="border-border bg-background/60 pl-9 text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border bg-background/25">
                    <div className="hidden grid-cols-[minmax(0,1.8fr)_240px_200px_120px] gap-4 border-b border-border bg-background/30 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground md:grid">
                        <div>{t('fullName')}</div>
                        <div>{t('role')}</div>
                        <div>{t('sportComplex')}</div>
                        <div>{t('actions')}</div>
                    </div>

                    <div className="divide-y divide-border">
                        {pagedPlayers.map((player) => {
                            const assignment = userRoles[player.id] ?? { professor: false, manager: false };
                            const assigned = [];
                            if (assignment.professor) assigned.push(t('professor'));
                            if (assignment.manager) assigned.push(t('manager'));

                            return (
                                <div key={player.id} className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(0,1.8fr)_240px_200px_120px] md:items-center">
                                    <div>
                                        <div className="font-display text-sm font-bold sm:text-[15px]">{player.name}</div>
                                        <div className="mt-1 text-xs text-muted-foreground">{player.email}</div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <label className="inline-flex min-w-[150px] items-center gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm font-semibold text-foreground">
                                            <Switch
                                                checked={assignment.professor}
                                                onCheckedChange={() => handleToggleRole(player.id, 'professor')}
                                            />
                                            <span>{t('professor')}</span>
                                        </label>
                                        <label className="inline-flex min-w-[150px] items-center gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm font-semibold text-foreground">
                                            <Switch
                                                checked={assignment.manager}
                                                disabled={assignment.professor}
                                                onCheckedChange={() => handleToggleRole(player.id, 'manager')}
                                            />
                                            <span>{t('manager')}</span>
                                        </label>
                                    </div>

                                    <div className="text-sm text-muted-foreground">{visiblePlaces.find((place) => place.id === player.complexId)?.name ?? '-'}</div>

                                    <div className="flex flex-wrap gap-2">
                                        {assigned.length > 0 ? (
                                            assigned.map((role) => (
                                                <Badge key={`${player.id}-${role}`} variant="secondary">{role}</Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{t('player')}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {filteredPlayers.length === 0 ? (
                            <div className="px-4 py-6 text-sm text-muted-foreground">{t('noUsersFound')}</div>
                        ) : null}
                    </div>
                </div>

                {filteredPlayers.length > 0 ? (
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{filteredPlayers.length} · {page}/{totalPages}</span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ) : null}

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={handleSaveRoles}
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 px-4 text-sm font-semibold text-primary-glow shadow-[0_0_12px_hsl(var(--primary)/0.18)] transition-smooth hover:bg-primary/16 hover:brightness-110"
                    >
                        {t('saveChanges')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManagementUsers;
