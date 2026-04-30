import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, GraduationCap, Save } from 'lucide-react';
import { RESERVATION_PLACES } from '@/data/mock';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getManagedPlayers, saveManagedPlayerProfile } from '@/lib/managed-players-store';
import type { PlayerLevel, SportId } from '@/types';

const levelOptions: PlayerLevel[] = ['beginner', 'intermediate', 'advanced', 'silver', 'gold', 'professional'];

const StudentsManagement = () => {
  const { t, sportName } = useLanguage();
  const { isGestorMode, currentUser } = useSession();
  const { toast } = useToast();
  const ownedComplexIds = currentUser.ownedComplexIds ?? [];
  const visiblePlaces = useMemo(
    () => RESERVATION_PLACES.filter((place) => ownedComplexIds.includes(place.id)),
    [ownedComplexIds],
  );
  const players = useMemo(
    () => getManagedPlayers().filter((player) => ownedComplexIds.includes(player.complexId)),
    [ownedComplexIds],
  );
  const [selectedComplexId, setSelectedComplexId] = useState<'all' | string>('all');
  const [selectedSportId, setSelectedSportId] = useState<'all' | SportId>('all');
  const [playerProfiles, setPlayerProfiles] = useState<Record<string, { level: PlayerLevel; score: string }>>(
    () => Object.fromEntries(players.map((player) => [player.id, { level: player.level, score: String(player.score) }])),
  );

  const availableSports = useMemo(
    () => Array.from(new Set(players.flatMap((player) => player.sports))),
    [players],
  );

  const visiblePlayers = players.filter((player) => {
    if (selectedComplexId !== 'all' && player.complexId !== selectedComplexId) return false;
    if (selectedSportId !== 'all' && !player.sports.includes(selectedSportId)) return false;
    return true;
  });

  if (!isGestorMode) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black">
            <span className="neon-text">{t('students')}</span>
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
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('students')}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('studentsIntro')}</p>
        </div>
      </header>
      <div className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
        <div className="mb-6 grid w-full gap-3 md:max-w-2xl md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('sportComplex')}</div>
            <Select value={selectedComplexId} onValueChange={setSelectedComplexId}>
              <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                <SelectItem value="all">{t('allStudents')}</SelectItem>
                {visiblePlaces.map((place) => (
                  <SelectItem key={place.id} value={place.id}>
                    {place.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('sport')}</div>
            <Select value={selectedSportId} onValueChange={(value) => setSelectedSportId(value as 'all' | SportId)}>
              <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                <SelectItem value="all">{t('allSports')}</SelectItem>
                {availableSports.map((sportId) => (
                  <SelectItem key={sportId} value={sportId}>
                    {sportName(sportId)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-background/25">
          <div className="hidden grid-cols-[minmax(0,1.5fr)_220px_180px_140px] gap-4 border-b border-border bg-background/30 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground md:grid">
            <div>{t('fullName')}</div>
            <div>{t('playerLevel')}</div>
            <div>{t('scorePoints')}</div>
            <div className="text-right">{t('saveScore')}</div>
          </div>

          <div className="divide-y divide-border">
            {visiblePlayers.map((player) => (
              <div key={player.id} className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(0,1.5fr)_220px_180px_140px] md:items-center">
                <div>
                  <div className="font-display text-lg font-bold">{player.name}</div>
                </div>

                <div className="space-y-2 md:space-y-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground md:hidden">{t('playerLevel')}</div>
                  <Select
                    value={playerProfiles[player.id]?.level ?? player.level}
                    onValueChange={(value) => {
                      setPlayerProfiles((current) => ({
                        ...current,
                        [player.id]: {
                          level: value as PlayerLevel,
                          score: current[player.id]?.score ?? String(player.score),
                        },
                      }));
                    }}
                  >
                    <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                      {levelOptions.map((level) => (
                        <SelectItem key={level} value={level}>
                          {t(level)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:space-y-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground md:hidden">{t('scorePoints')}</div>
                  <div className="flex overflow-hidden rounded-lg border border-border bg-background/60">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={playerProfiles[player.id]?.score ?? String(player.score)}
                      onChange={(event) => {
                        const nextValue = event.target.value.replace(/[^\d]/g, '');
                        setPlayerProfiles((current) => ({
                          ...current,
                          [player.id]: {
                            level: current[player.id]?.level ?? player.level,
                            score: nextValue,
                          },
                        }));
                      }}
                      className="border-0 bg-transparent pr-0 shadow-none focus-visible:ring-0"
                    />
                    <div className="flex w-10 flex-col border-l border-border">
                      <button
                        type="button"
                        onClick={() => {
                          const currentScore = Number(playerProfiles[player.id]?.score ?? player.score) || 0;
                          setPlayerProfiles((current) => ({
                            ...current,
                            [player.id]: {
                              level: current[player.id]?.level ?? player.level,
                              score: String(currentScore + 1),
                            },
                          }));
                        }}
                        className="flex h-1/2 items-center justify-center text-muted-foreground transition-smooth hover:bg-secondary/70 hover:text-foreground"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const currentScore = Number(playerProfiles[player.id]?.score ?? player.score) || 0;
                          setPlayerProfiles((current) => ({
                            ...current,
                            [player.id]: {
                              level: current[player.id]?.level ?? player.level,
                              score: String(Math.max(0, currentScore - 1)),
                            },
                          }));
                        }}
                        className="flex h-1/2 items-center justify-center border-t border-border text-muted-foreground transition-smooth hover:bg-secondary/70 hover:text-foreground"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-start md:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const level = playerProfiles[player.id]?.level ?? player.level;
                      const score = Number(playerProfiles[player.id]?.score ?? player.score) || 0;
                      saveManagedPlayerProfile(player.id, { level, score });
                      toast({
                        title: t('studentScoreSaved'),
                        description: `${player.name} · ${t(level)} · ${score}`,
                      });
                    }}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary-glow shadow-[0_0_12px_hsl(var(--primary)/0.18)] transition-smooth hover:bg-primary/16 hover:brightness-110"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {visiblePlayers.length === 0 ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">
                {t('noStudentsFound')}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-background/30 p-4 text-sm text-muted-foreground">
          <div className="mb-2 inline-flex items-center gap-2 font-semibold text-foreground">
            <GraduationCap className="h-4 w-4 text-neon-cyan" />
            {t('students')}
          </div>
          <p>{t('studentsHint')}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentsManagement;
