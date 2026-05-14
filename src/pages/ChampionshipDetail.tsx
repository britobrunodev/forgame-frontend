import { useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin, Calendar } from 'lucide-react';
import { Bracket } from '@/components/Bracket';
import { BracketMobile } from '@/components/BracketMobile';
import { LiveBadge } from '@/components/LiveBadge';
import { MapsButton } from '@/components/MapsButton';
import { MatchCard } from '@/components/MatchCard';
import { MatchNode } from '@/components/MatchNode';
import { YouTubeButton } from '@/components/YouTubeButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  championshipApi,
  type ChampionshipGroupOut,
  type ChampionshipMatchOut,
  type ChampionshipMatchesData,
} from '@/lib/api';
import { formatUtcDate } from '@/lib/datetime';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import type { Match, SportId } from '@/types';

type BracketRounds = Array<{ name: string; matches: Match[] }>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapSportSlug = (slug: string | null | undefined): SportId | null => {
  if (slug === 'footvolley') return 'footvolley';
  if (slug === 'beach-tennis') return 'beach-tennis';
  if (slug === 'volleyball') return 'volleyball';
  return null;
};

const mapChampionshipStatus = (
  status: string,
): 'scheduled' | 'upcoming' | 'live' | 'finished' => {
  if (status === 'live' || status === 'running') return 'live';
  if (status === 'ended' || status === 'finished') return 'finished';
  return 'upcoming';
};

const toFrontendMatch = (
  m: ChampionshipMatchOut,
  round: string,
  timezone: string | null,
): Match => ({
  id: String(m.id),
  round,
  teamA: m.team_1 ? { id: String(m.team_1.id), name: m.team_1.name } : null,
  teamB: m.team_2 ? { id: String(m.team_2.id), name: m.team_2.name } : null,
  scoreA: m.score_json?.score_1,
  scoreB: m.score_json?.score_2,
  setScoreA: m.score_json?.sets_1,
  setScoreB: m.score_json?.sets_2,
  status:
    m.status === 'finished' ? 'finished' : m.status === 'live' ? 'live' : 'scheduled',
  time: m.scheduled_at
    ? new Date(m.scheduled_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone || 'UTC',
      })
    : undefined,
});

// ── Page ──────────────────────────────────────────────────────────────────────

const ChampionshipDetail = () => {
  const { t, sportName, language } = useLanguage();
  const { id } = useParams();
  const { token } = useSession();
  const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'bracket' | 'simple'>('bracket');

  const { data: championship, isLoading: loadingChampionship } = useQuery({
    queryKey: ['championship', id],
    queryFn: () => championshipApi.get(token!, id!),
    enabled: !!token && !!id,
  });

  const { data: sports = [] } = useQuery({
    queryKey: ['championship-sports'],
    queryFn: () => championshipApi.listSports(token!),
    enabled: !!token,
  });

  useEffect(() => {
    if (championship?.categories.length && selectedCategoryId === null) {
      setSelectedCategoryId(championship.categories[0].id ?? null);
    }
  }, [championship, selectedCategoryId]);

  const { data: matchesData, isLoading: loadingMatches } = useQuery({
    queryKey: ['championship-matches', id, selectedCategoryId],
    queryFn: () => championshipApi.getMatches(token!, id!, selectedCategoryId!),
    enabled: !!token && !!id && selectedCategoryId !== null,
  });

  if (loadingChampionship) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!championship) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        {t('championshipNotFound')}
      </div>
    );
  }

  const sportsById = new Map(sports.map((s) => [s.id, s]));
  const sport = championship.sport_id ? sportsById.get(championship.sport_id) : null;
  const sportId = sport ? mapSportSlug(sport.slug) : null;
  const status = mapChampionshipStatus(championship.status);
  const selectedCategory = championship.categories.find((c) => c.id === selectedCategoryId);
  const formatSlug = selectedCategory?.format_slug ?? '';
  const isCumbuca = formatSlug.includes('cumbuca');

  const startDate = formatUtcDate(championship.start_at, championship.timezone, locale);
  const endDate = formatUtcDate(championship.end_at, championship.timezone, locale);
  const location = championship.complex_name ?? championship.complex_city ?? '-';

  return (
    <div className="mx-auto w-full max-w-[min(110rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(118rem,calc(100vw-3rem))]">
      {/* Header */}
      <div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-border bg-secondary">
        {championship.image_url ? (
          <img
            src={championship.image_url}
            alt={championship.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 hex-grid opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="relative p-5 sm:p-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-background/60 px-2.5 py-1 text-xs font-bold uppercase leading-none tracking-wider backdrop-blur-md">
              <span className="translate-y-[0.5px] leading-none">
                {sportId ? sportName(sportId) : t('championships')}
              </span>
            </span>
          </div>
          <h1 className="mb-3 font-display text-2xl font-black drop-shadow-lg sm:text-3xl lg:text-4xl">
            {championship.name}
          </h1>
          <div className="flex flex-wrap gap-5 text-sm font-semibold">
            {location && location !== '-' && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {startDate}
              {endDate && endDate !== startDate ? ` → ${endDate}` : ''}
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <LiveBadge status={status} />
            <div className="flex items-center gap-2 sm:justify-end">
              <MapsButton url={championship.address_url ?? undefined} />
              <YouTubeButton url={championship.transmission_url ?? undefined} />
            </div>
          </div>
        </div>
      </div>

      {/* Content section */}
      <section>
        <div className="rounded-2xl border border-border bg-gradient-card p-4 sm:p-6">
          {/* Top bar */}
          <div className="flex flex-col gap-4 border-b border-border pb-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-neon-cyan">
                {t('bracket')}
              </h2>
              {selectedCategory && (
                <div className="mt-2">
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-glow">
                    {t(selectedCategory.category_slug)}
                    {selectedCategory.audience_slug
                      ? ` · ${t(selectedCategory.audience_slug)}`
                      : ''}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-end gap-4">
              {championship.categories.length > 1 && (
                <div>
                  <div className="mb-2 text-[10px] font-display font-bold uppercase tracking-[0.25em] text-muted-foreground">
                    {t('category')}
                  </div>
                  <Select
                    value={String(selectedCategoryId ?? '')}
                    onValueChange={(v) => setSelectedCategoryId(Number(v))}
                  >
                    <SelectTrigger className="h-10 w-52 rounded-xl border-border bg-secondary/60 text-sm font-semibold text-foreground shadow-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-gradient-card p-1.5 text-foreground shadow-card backdrop-blur-xl">
                      {championship.categories.map((cat) => (
                        <SelectItem
                          key={cat.id}
                          value={String(cat.id)}
                          className="rounded-lg py-2 pl-8 pr-3 text-sm font-semibold focus:bg-primary/15 focus:text-primary-glow"
                        >
                          {t(cat.category_slug)}
                          {cat.audience_slug ? ` · ${t(cat.audience_slug)}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <div className="mb-2 text-[10px] font-display font-bold uppercase tracking-[0.25em] text-muted-foreground">
                  {t('view') || 'Visualização'}
                </div>
                <div className="flex h-10 items-center gap-1 rounded-xl border border-border bg-secondary/60 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('bracket')}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-smooth ${
                      viewMode === 'bracket'
                        ? 'bg-primary/20 text-primary-glow shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Bracket
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('simple')}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-smooth ${
                      viewMode === 'simple'
                        ? 'bg-primary/20 text-primary-glow shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Lista
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Match content */}
          {loadingMatches ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : matchesData ? (
            isCumbuca ? (
              <CumbucaView
                data={matchesData}
                viewMode={viewMode}
                timezone={championship.timezone}
                t={t}
              />
            ) : (
              <GenericMatchesView
                data={matchesData}
                viewMode={viewMode}
                timezone={championship.timezone}
                t={t}
              />
            )
          ) : null}
        </div>
      </section>
    </div>
  );
};

// ── Cumbuca view ─────────────────────────────────────────────────────────────

const CumbucaView = ({
  data,
  viewMode,
  timezone,
  t,
}: {
  data: ChampionshipMatchesData;
  viewMode: 'bracket' | 'simple';
  timezone: string | null;
  t: (k: string) => string;
}) => {
  const [groupOpen, setGroupOpen] = useState(true);
  const [goldenOpen, setGoldenOpen] = useState(true);
  const [silverOpen, setSilverOpen] = useState(false);
  const [openFallbackGroups, setOpenFallbackGroups] = useState<Record<string, boolean>>({});
  const normalizeGroupName = (name: string) => name.trim().toLowerCase();

  const groupPhase = data.groups.filter((g) => g.phase === 'group');
  const bracketGroups = data.groups.filter((g) => g.phase === 'bracket');
  const golden = data.groups.find(
    (g) => g.phase === 'bracket' && normalizeGroupName(g.name).includes('golden'),
  );
  const silver = data.groups.find(
    (g) => g.phase === 'bracket' && normalizeGroupName(g.name).includes('silver'),
  );
  const fallbackBrackets = bracketGroups.filter(
    (g) => g !== golden && g !== silver,
  );

  return (
    <div className="mt-6 space-y-4">
      {groupPhase.length > 0 && (
        <BracketPanel
          title={t('groupStage')}
          isOpen={groupOpen}
          onToggle={() => setGroupOpen((v) => !v)}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {groupPhase.map((g) => (
              <GroupStandingsCard key={g.name} group={g} />
            ))}
          </div>
        </BracketPanel>
      )}

      {golden && (
        <>
          <SeriesDivider color="gold" label={t('goldBracket')} />
          <BracketPanel
            title={t('goldenSeries') || 'Golden Series'}
            isOpen={goldenOpen}
            onToggle={() => setGoldenOpen((v) => !v)}
          >
            {viewMode === 'bracket' ? (
              <SeriesBracketView series={golden} timezone={timezone} t={t} />
            ) : (
              <SeriesMatchListView series={golden} timezone={timezone} />
            )}
          </BracketPanel>
        </>
      )}

      {silver && (
        <>
          <SeriesDivider color="silver" label={t('silverBracket')} />
          <BracketPanel
            title={t('silverSeries') || 'Silver Series'}
            isOpen={silverOpen}
            onToggle={() => setSilverOpen((v) => !v)}
          >
            {viewMode === 'bracket' ? (
              <SeriesBracketView series={silver} timezone={timezone} t={t} />
            ) : (
              <SeriesMatchListView series={silver} timezone={timezone} />
            )}
          </BracketPanel>
        </>
      )}

      {fallbackBrackets.map((group) => (
        <BracketPanel
          key={group.name}
          title={group.name}
          isOpen={openFallbackGroups[group.name] ?? true}
          onToggle={() =>
            setOpenFallbackGroups((current) => ({
              ...current,
              [group.name]: !(current[group.name] ?? true),
            }))
          }
        >
          {viewMode === 'bracket' ? (
            <SeriesBracketView series={group} timezone={timezone} t={t} />
          ) : (
            <SeriesMatchListView series={group} timezone={timezone} />
          )}
        </BracketPanel>
      ))}

      {data.groups.length === 0 && (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Nenhuma partida ainda
        </div>
      )}
    </div>
  );
};

// ── Series bracket view (visual) ─────────────────────────────────────────────

const SeriesBracketView = ({
  series,
  timezone,
  t,
}: {
  series: ChampionshipGroupOut;
  timezone: string | null;
  t: (k: string) => string;
}) => {
  const matches = [...series.matches].sort((a, b) => a.match_number - b.match_number);

  if (matches.length < 6) {
    return <SeriesMatchListView series={series} timezone={timezone} />;
  }

  const toMatch = (m: ChampionshipMatchOut, round: string): Match =>
    toFrontendMatch(m, round, timezone);

  const winnerRounds: BracketRounds = [
    { name: 'R1', matches: [toMatch(matches[0], 'R1'), toMatch(matches[1], 'R1')] },
    { name: t('winnerBracket'), matches: [toMatch(matches[2], t('winnerBracket'))] },
  ];
  const loserRounds: BracketRounds = [
    { name: 'R1', matches: [toMatch(matches[3], 'L-R1')] },
    { name: t('loserBracket'), matches: [toMatch(matches[4], t('loserBracket'))] },
  ];
  const grandFinal = toMatch(matches[5], 'Grande Final');

  return (
    <>
      <div className="md:hidden">
        <BracketMobile
          rounds={[
            ...winnerRounds,
            ...loserRounds,
            { name: 'Grande Final', matches: [grandFinal] },
          ]}
        />
      </div>
      <div className="hidden md:block space-y-6">
        <div>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neon-cyan">
            {t('winnerBracket')}
          </div>
          <Bracket rounds={winnerRounds} />
        </div>
        <div>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neon-pink">
            {t('loserBracket')}
          </div>
          <Bracket rounds={loserRounds} />
        </div>
        <div>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-400">
            Grande Final
          </div>
          <MatchNode match={grandFinal} />
        </div>
      </div>
    </>
  );
};

// ── Series match list view (simple) ──────────────────────────────────────────

const SeriesMatchListView = ({
  series,
  timezone,
}: {
  series: ChampionshipGroupOut;
  timezone: string | null;
}) => {
  const matches = [...series.matches].sort((a, b) => a.match_number - b.match_number);
  return (
    <div className="space-y-2">
      {matches.map((m, idx) => (
        <MatchCard
          key={m.id}
          match={toFrontendMatch(m, `M${idx + 1}`, timezone)}
          number={idx + 1}
          round={`M${idx + 1}`}
        />
      ))}
      {matches.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Nenhuma partida ainda
        </div>
      )}
    </div>
  );
};

// ── Group standings card ──────────────────────────────────────────────────────

const GroupStandingsCard = ({ group }: { group: ChampionshipGroupOut }) => (
  <div className="rounded-2xl border border-border bg-background/30 p-4">
    <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-neon-cyan">
      {group.name}
    </div>
    {group.standings.length > 0 ? (
      <>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="pb-1.5 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                Equipe
              </th>
              <th className="pb-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                V
              </th>
              <th className="pb-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                D
              </th>
              <th className="pb-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {group.standings.map((row, i) => (
              <tr key={row.team.id} className={i >= 2 ? 'opacity-50' : ''}>
                <td className="py-1.5 pr-2">
                  <div className="flex items-center gap-1.5">
                    {i < 2 && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neon-cyan shadow-[0_0_6px_hsl(var(--neon-cyan))]" />
                    )}
                    <span
                      className={`text-xs leading-tight ${
                        i < 2
                          ? 'font-semibold text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {row.team.name}
                    </span>
                  </div>
                </td>
                <td className="py-1.5 text-center text-xs text-muted-foreground">
                  {row.wins}
                </td>
                <td className="py-1.5 text-center text-xs text-muted-foreground">
                  {row.losses}
                </td>
                <td className="py-1.5 text-center text-xs font-bold text-foreground">
                  {row.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan shadow-[0_0_6px_hsl(var(--neon-cyan))]" />
          avançam para fase seguinte
        </div>
      </>
    ) : (
      <div className="space-y-2">
        {group.matches.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-lg bg-background/30 px-2 py-1.5 text-xs"
          >
            <span className="truncate font-semibold text-foreground">
              {m.team_1?.name ?? 'TBD'}
            </span>
            <span className="mx-2 shrink-0 text-muted-foreground">×</span>
            <span className="truncate text-right font-semibold text-foreground">
              {m.team_2?.name ?? 'TBD'}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ── Generic matches view (non-cumbuca formats) ────────────────────────────────

const GenericMatchesView = ({
  data,
  timezone,
}: {
  data: ChampionshipMatchesData;
  viewMode: 'bracket' | 'simple';
  timezone: string | null;
  t: (k: string) => string;
}) => (
  <div className="mt-6 space-y-4">
    {data.groups.map((group) => (
      <div
        key={group.name}
        className="rounded-2xl border border-border bg-background/20 p-4"
      >
        <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-neon-cyan">
          {group.name}
        </div>
        <div className="space-y-2">
          {group.matches.map((m) => (
            <MatchCard
              key={m.id}
              match={toFrontendMatch(m, group.name, timezone)}
              number={m.match_number}
              round={group.name}
            />
          ))}
          {group.matches.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma partida ainda
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

// ── Series divider ────────────────────────────────────────────────────────────

const SeriesDivider = ({ color, label }: { color: 'gold' | 'silver'; label: string }) => {
  const isGold = color === 'gold';
  return (
    <div className="flex items-center gap-3 pt-2">
      <div
        className={`h-px flex-1 bg-gradient-to-r from-transparent ${
          isGold ? 'via-yellow-500/40' : 'via-slate-400/40'
        } to-transparent`}
      />
      <span
        className={`rounded-full border px-4 py-1 text-[10px] font-bold uppercase tracking-[0.3em] ${
          isGold
            ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
            : 'border-slate-400/30 bg-slate-400/10 text-slate-300'
        }`}
      >
        {label}
      </span>
      <div
        className={`h-px flex-1 bg-gradient-to-l from-transparent ${
          isGold ? 'via-yellow-500/40' : 'via-slate-400/40'
        } to-transparent`}
      />
    </div>
  );
};

// ── Bracket panel ─────────────────────────────────────────────────────────────

const BracketPanel = ({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) => (
  <div className="rounded-2xl border border-border bg-background/20">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-smooth hover:bg-secondary/30"
    >
      <div className="font-display text-sm font-bold uppercase tracking-[0.2em] text-foreground">
        {title}
      </div>
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-display text-lg font-bold text-primary-glow">
        {isOpen ? '−' : '+'}
      </span>
    </button>
    {isOpen && (
      <div className="border-t border-border px-2 pb-2 pt-4 sm:px-4 sm:pb-4">
        {children}
      </div>
    )}
  </div>
);

export default ChampionshipDetail;
