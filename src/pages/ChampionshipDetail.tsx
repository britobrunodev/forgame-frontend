import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MapPin, Calendar } from 'lucide-react';
import { Bracket } from '@/components/Bracket';
import { LiveBadge } from '@/components/LiveBadge';
import { MapsButton } from '@/components/MapsButton';
import { MatchNode, type ScoreUpdateFn, type TeamUpdateFn } from '@/components/MatchNode';
import { PositionedCoverImage } from '@/components/PositionedCoverImage';
import { YouTubeButton } from '@/components/YouTubeButton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  championshipApi,
  type ChampionshipFormatConfig,
  type CategoryMatchSettingsOut,
  type ChampionshipMatchOut,
  type ChampionshipMatchesData,
  type ChampionshipTeamOut,
  type ChampionshipTableOut,
} from '@/lib/api';
import { formatUtcDate } from '@/lib/datetime';
import { notify } from '@/lib/notify';
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

const normalizeSetScores = (
  rawScores: Array<number | null> | undefined,
  maxSets?: number,
): Array<number | null> => {
  const size = Math.max(maxSets ?? rawScores?.length ?? 0, rawScores?.length ?? 0, 1);
  return Array.from({ length: size }, (_, index) => rawScores?.[index] ?? null);
};

const getSetWins = (scoresA: Array<number | null>, scoresB: Array<number | null>) =>
  scoresA.reduce(
    (totals, scoreA, index) => {
      const scoreB = scoresB[index];
      if (scoreA === null || scoreA === undefined || scoreB === null || scoreB === undefined) {
        return totals;
      }
      if (scoreA > scoreB) totals.a += 1;
      if (scoreB > scoreA) totals.b += 1;
      return totals;
    },
    { a: 0, b: 0 },
  );

const getAvailableTeamsForStage = (
  teams: ChampionshipTeamOut[],
  stageType: string | null | undefined,
) =>
  teams.filter((team) => (team.stage_type ?? 'group') === (stageType ?? 'group'));

const getStageConfigName = (
  config: ChampionshipFormatConfig | null | undefined,
  stageKey: 'first_stage' | 'second_stage' | 'third_stage',
  fallback: string,
) => {
  const value = config?.[stageKey]?.name;
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
};

const getStageConfigView = (
  config: ChampionshipFormatConfig | null | undefined,
  stageKey: 'first_stage' | 'second_stage' | 'third_stage',
  fallback: string,
) => {
  const rawValue = config?.[stageKey]?.default_view;
  if (typeof rawValue !== 'string' || !rawValue.trim()) return fallback;
  return rawValue.toLowerCase() === 'brakets' ? 'brackets' : rawValue.toLowerCase();
};

const toFrontendMatch = (
  m: ChampionshipMatchOut,
  round: string,
  timezone: string | null,
  maxSets?: number,
): Match => {
  const scoresA = normalizeSetScores(m.score_json?.scores_1, maxSets);
  const scoresB = normalizeSetScores(m.score_json?.scores_2, maxSets);
  const setWins = getSetWins(scoresA, scoresB);

  return {
    id: String(m.id),
    round,
    stageType: m.stage_type,
    teamA: m.team_1
      ? {
          id: String(m.team_1.id),
          name: m.team_1.name,
          stageType: m.team_1.stage_type,
          teamType: m.team_1.team_type,
          userIds: m.team_1.user_ids,
        }
      : null,
    teamB: m.team_2
      ? {
          id: String(m.team_2.id),
          name: m.team_2.name,
          stageType: m.team_2.stage_type,
          teamType: m.team_2.team_type,
          userIds: m.team_2.user_ids,
        }
      : null,
    scoresA,
    scoresB,
    setScoreA: m.score_json?.sets_1 ?? setWins.a,
    setScoreB: m.score_json?.sets_2 ?? setWins.b,
    status:
      m.status === 'finished' ? 'finished' : m.status === 'live' ? 'live' : 'scheduled',
    time: m.scheduled_at
      ? new Date(m.scheduled_at).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: timezone || 'UTC',
        })
      : undefined,
    maxSets,
  };
};

// ── Page ──────────────────────────────────────────────────────────────────────

const ChampionshipDetail = () => {
  const { t, sportName, language } = useLanguage();
  const { id } = useParams();
  const { token } = useSession();
  const queryClient = useQueryClient();
  const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [generatingNextPhase, setGeneratingNextPhase] = useState(false);

  const { data: championship, isLoading: loadingChampionship } = useQuery({
    queryKey: ['championship', id],
    queryFn: () => championshipApi.get(token ?? '', id!),
    enabled: !!id,
  });

  const { data: sports = [] } = useQuery({
    queryKey: ['championship-sports'],
    queryFn: () => championshipApi.listSports(token ?? ''),
    enabled: true,
  });

  useEffect(() => {
    if (championship?.categories.length && selectedCategoryId === null) {
      setSelectedCategoryId(championship.categories[0].id ?? null);
    }
  }, [championship, selectedCategoryId]);

  const { data: matchesData, isLoading: loadingMatches } = useQuery({
    queryKey: ['championship-matches', id, selectedCategoryId],
    queryFn: () => championshipApi.getMatches(token ?? '', id!, selectedCategoryId!),
    enabled: !!id && selectedCategoryId !== null,
  });

  const handleScoreUpdate = useCallback(
    async (matchId: string, scores1: Array<number | null>, scores2: Array<number | null>) => {
      await championshipApi.updateMatchScore(token ?? '', id!, matchId, {
        scores_1: scores1,
        scores_2: scores2,
      });
      await queryClient.invalidateQueries({
        queryKey: ['championship-matches', id, selectedCategoryId],
      });
    },
    [token, id, selectedCategoryId, queryClient],
  );

  const handleMatchUpdate = useCallback(
    async (matchId: string, team1Id: number | null, team2Id: number | null) => {
      await championshipApi.updateMatch(token ?? '', id!, matchId, {
        team_1_id: team1Id,
        team_2_id: team2Id,
      });
      await queryClient.invalidateQueries({
        queryKey: ['championship-matches', id, selectedCategoryId],
      });
    },
    [token, id, selectedCategoryId, queryClient],
  );

  const handleGenerateNextPhase = useCallback(async () => {
    if (!selectedCategoryId) return;

    setGeneratingNextPhase(true);
    try {
      const result = await championshipApi.generateNextPhase(token ?? '', id!, {
        category_id: selectedCategoryId,
      });
      await queryClient.invalidateQueries({
        queryKey: ['championship-matches', id, selectedCategoryId],
      });
      notify.success(
        t('nextPhaseGenerated'),
        language === 'pt-BR'
          ? `${result.advanced_player_count} jogadores foram colocados na próxima fase.`
          : `${result.advanced_player_count} players were seeded into the next phase.`,
      );
    } catch (error) {
      notify.error(
        t('nextPhaseGenerationFailed'),
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setGeneratingNextPhase(false);
    }
  }, [token, id, selectedCategoryId, queryClient, t, language]);

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
  const startDate = formatUtcDate(championship.start_at, championship.timezone, locale);
  const endDate = formatUtcDate(championship.end_at, championship.timezone, locale);
  const location = championship.complex_name ?? championship.complex_city ?? '-';
  const groupStageMatches = matchesData?.tables.flatMap((table) => table.matches) ?? [];
  const showGenerateNextPhaseButton =
    matchesData?.format_slug === 'cumbuca' && Boolean(matchesData?.user_can_edit_scores);
  const canGenerateNextPhase =
    showGenerateNextPhaseButton &&
    groupStageMatches.length > 0 &&
    groupStageMatches.every((match) => match.status === 'finished');

  return (
    <div className="mx-auto w-full max-w-[min(110rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(118rem,calc(100vw-3rem))]">
      {/* Header - two-column layout */}
      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-card">
        <div className="flex flex-col md:flex-row">
          {/* Mobile: image on top */}
          <div className="relative aspect-[3/2] md:hidden">
            {championship.image_url ? (
              <PositionedCoverImage
                src={championship.image_url}
                alt={championship.name}
                offsetX={championship.image_offset_x ?? 0}
                offsetY={championship.image_offset_y ?? 0}
                zoom={championship.image_zoom ?? 1}
                className="absolute inset-0 overflow-hidden"
              />
            ) : (
              <div className="absolute inset-0 hex-grid opacity-30" />
            )}
          </div>

          {/* Info side */}
          <div className="flex flex-1 flex-col justify-center p-5 sm:p-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/60 px-2.5 py-1 text-xs font-bold uppercase leading-none tracking-wider">
                <span className="translate-y-[0.5px] leading-none">
                  {sportId ? sportName(sportId) : t('championships')}
                </span>
              </span>
            </div>
            <h1 className="mb-3 font-display text-2xl font-black sm:text-3xl lg:text-4xl">
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

          {/* Desktop: image on the right */}
          <div className="relative hidden self-stretch overflow-hidden md:block md:w-64 lg:w-80 xl:w-96">
            {championship.image_url ? (
              <PositionedCoverImage
                src={championship.image_url}
                alt={championship.name}
                offsetX={championship.image_offset_x ?? 0}
                offsetY={championship.image_offset_y ?? 0}
                zoom={championship.image_zoom ?? 1}
                className="absolute inset-0 overflow-hidden"
              />
            ) : (
              <div className="absolute inset-0 hex-grid opacity-30" />
            )}
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
              </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <div className="text-[10px] font-display font-bold uppercase tracking-[0.25em] text-muted-foreground">
                {t('category')}
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {showGenerateNextPhaseButton && (
                  <Button
                    type="button"
                    onClick={handleGenerateNextPhase}
                    disabled={!canGenerateNextPhase || generatingNextPhase}
                    className="h-10 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-violet-400 transition-smooth hover:bg-violet-500/20 disabled:opacity-50 disabled:hover:bg-violet-500/10"
                  >
                    {generatingNextPhase && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('generateNextPhase')}
                  </Button>
                )}
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
            </div>
          </div>

          {/* Match content */}
          {loadingMatches ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : matchesData ? (
            <UnifiedMatchesView
              data={matchesData}
              timezone={championship.timezone}
              t={t}
              canEdit={matchesData.user_can_edit_scores}
              onScoreUpdate={handleScoreUpdate}
              onTeamUpdate={handleMatchUpdate}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
};

// ── Unified matches view ──────────────────────────────────────────────────────

const UnifiedMatchesView = ({
  data,
  timezone,
  t,
  canEdit,
  onScoreUpdate,
  onTeamUpdate,
}: {
  data: ChampionshipMatchesData;
  timezone: string | null;
  t: (k: string) => string;
  canEdit: boolean;
  onScoreUpdate: ScoreUpdateFn;
  onTeamUpdate: TeamUpdateFn;
}) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const isOpen = (key: string, def = true) => openGroups[key] ?? def;
  const toggle = (key: string, def = true) =>
    setOpenGroups((cur) => ({ ...cur, [key]: !(cur[key] ?? def) }));

  const settingsByStage = new Map<string, number>(
    (data.match_settings ?? []).map((s: CategoryMatchSettingsOut) => [s.stage_type, s.max_sets]),
  );

  const isEmpty = data.tables.length === 0 && data.brackets.length === 0;
  const firstStageTitle = getStageConfigName(data.format_config, 'first_stage', t('groupStage'));
  const firstStageView = getStageConfigView(data.format_config, 'first_stage', 'table_with_points');
  const secondStageName = getStageConfigName(data.format_config, 'second_stage', 'Gold');
  const thirdStageName = getStageConfigName(data.format_config, 'third_stage', 'Silver');

  return (
    <div className="mt-6 space-y-4">
      {/* Group tables */}
      {data.tables.length > 0 && firstStageView === 'table_with_points' && (
        <div className="mb-3">
          <BracketPanel
            title={firstStageTitle}
            isOpen={isOpen('__group_stage__')}
            onToggle={() => toggle('__group_stage__')}
          >
            <div className="flex flex-wrap justify-center gap-4">
              {data.tables.map((table) => (
                <GroupStandingsCard
                  key={table.name}
                  table={table}
                  timezone={timezone}
                  settingsByStage={settingsByStage}
                  availableTeams={data.available_teams}
                  canEdit={canEdit}
                  onScoreUpdate={onScoreUpdate}
                  onTeamUpdate={onTeamUpdate}
                />
              ))}
            </div>
          </BracketPanel>
        </div>
      )}

      {/* Bracket groups */}
      {data.brackets.map((bracket, index) => {
        const defaultOpen = index === 0;
        const seriesKey = `__series_${bracket.name}__`;
        const isSeriesOpen = isOpen(seriesKey, true);

        const mainRounds: BracketRounds = bracket.winner_rounds
          .filter((r) => r.stage_type !== 'third_place')
          .map((r) => ({
            name: r.name,
            matches: r.matches.map((m) =>
              toFrontendMatch(m, r.name, timezone, settingsByStage.get(m.stage_type ?? '') ?? undefined),
            ),
          }));

        const thirdPlaceRound = bracket.winner_rounds.find((r) => r.stage_type === 'third_place');
        const trailingRounds: BracketRounds = thirdPlaceRound?.matches.length
          ? [
              {
                name: thirdPlaceRound.name,
                matches: thirdPlaceRound.matches.map((m) =>
                  toFrontendMatch(
                    m,
                    thirdPlaceRound.name,
                    timezone,
                    settingsByStage.get('third_place') ?? undefined,
                  ),
                ),
              },
            ]
          : [];

        const loserRounds: BracketRounds = bracket.loser_rounds.map((r) => ({
          name: r.name,
          matches: r.matches.map((m) =>
            toFrontendMatch(m, r.name, timezone, settingsByStage.get(m.stage_type ?? '') ?? undefined),
          ),
        }));

        const grandFinalMatch = bracket.grand_final
          ? toFrontendMatch(
              bracket.grand_final,
              'Grande Final',
              timezone,
              settingsByStage.get('final') ?? undefined,
            )
          : null;

        return (
          <div key={bracket.name}>
            <SeriesDivider
              color={bracket.name === thirdStageName ? 'silver' : 'gold'}
              label={bracket.name === secondStageName ? secondStageName : bracket.name}
              isOpen={isSeriesOpen}
              onToggle={() => toggle(seriesKey)}
            />

            {isSeriesOpen && (
              <div className="mt-3 space-y-3">
                {mainRounds.length > 0 && (
                  <BracketPanel
                    title={t('winnerBracket')}
                    isOpen={isOpen(`__wb_${bracket.name}__`, defaultOpen)}
                    onToggle={() => toggle(`__wb_${bracket.name}__`, defaultOpen)}
                  >
                    <Bracket
                      rounds={mainRounds}
                      trailingRounds={trailingRounds}
                      canEdit={canEdit}
                      teamOptions={getAvailableTeamsForStage(
                        data.available_teams,
                        mainRounds[0]?.matches[0]?.stageType,
                      )}
                      onScoreUpdate={onScoreUpdate}
                      onTeamUpdate={onTeamUpdate}
                    />
                  </BracketPanel>
                )}

                {loserRounds.length > 0 && (
                  <BracketPanel
                    title={t('loserBracket')}
                    isOpen={isOpen(`__lb_${bracket.name}__`, false)}
                    onToggle={() => toggle(`__lb_${bracket.name}__`, false)}
                  >
                    <Bracket
                      rounds={loserRounds}
                      canEdit={canEdit}
                      teamOptions={getAvailableTeamsForStage(
                        data.available_teams,
                        loserRounds[0]?.matches[0]?.stageType,
                      )}
                      onScoreUpdate={onScoreUpdate}
                      onTeamUpdate={onTeamUpdate}
                    />
                  </BracketPanel>
                )}

                {grandFinalMatch && (
                  <BracketPanel
                    title="Grande Final"
                    isOpen={isOpen(`__gf_${bracket.name}__`, true)}
                    onToggle={() => toggle(`__gf_${bracket.name}__`, true)}
                  >
                    <div className="flex justify-center py-2">
                      <MatchNode
                        match={grandFinalMatch}
                        canEdit={canEdit}
                        teamOptions={getAvailableTeamsForStage(data.available_teams, grandFinalMatch.stageType)}
                        onScoreUpdate={onScoreUpdate}
                        onTeamUpdate={onTeamUpdate}
                      />
                    </div>
                  </BracketPanel>
                )}
              </div>
            )}
          </div>
        );
      })}

      {isEmpty && (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Nenhuma partida ainda
        </div>
      )}
    </div>
  );
};

// ── Group standings card ──────────────────────────────────────────────────────

const GroupStandingsCard = ({
  table,
  timezone,
  settingsByStage,
  availableTeams,
  canEdit,
  onScoreUpdate,
  onTeamUpdate,
}: {
  table: ChampionshipTableOut;
  timezone: string | null;
  settingsByStage: Map<string, number>;
  availableTeams: ChampionshipTeamOut[];
  canEdit: boolean;
  onScoreUpdate: ScoreUpdateFn;
  onTeamUpdate: TeamUpdateFn;
}) => {
  const groupMaxSets = settingsByStage.get('group') ?? 1;

  return (
    <div className="rounded-2xl border border-border bg-background/30 p-4">
      <div className="mb-4 text-center font-display text-sm font-bold uppercase tracking-[0.2em] text-neon-cyan">
        {table.name}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        {/* Matches column */}
        <div className="flex flex-col items-center gap-2 sm:items-stretch">
          {table.matches.map((m) => (
            <MatchNode
              key={m.id}
              match={toFrontendMatch(m, table.name, timezone, groupMaxSets)}
              teamOptions={getAvailableTeamsForStage(availableTeams, 'group')}
              canEdit={canEdit}
              onScoreUpdate={onScoreUpdate}
              onTeamUpdate={onTeamUpdate}
            />
          ))}
        </div>

        {/* Per-player points column */}
        {table.player_standings.length > 0 && (
          <div className="min-w-[120px] flex-1">
            <div className="mb-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Pontos
            </div>
            <div className="flex flex-col gap-1">
              {table.player_standings.map((p, i) => (
                <div key={p.user_id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    {i < 2 && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neon-cyan shadow-[0_0_6px_hsl(var(--neon-cyan))]" />
                    )}
                    <span className={`text-xs ${i < 2 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {p.name}
                    </span>
                  </div>
                  <span className={`text-xs font-bold tabular-nums ${i < 2 ? 'text-neon-cyan' : 'text-muted-foreground'}`}>
                    {p.points}pts
                  </span>
                </div>
              ))}
            </div>
            {table.player_standings.length > 0 && (
              <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan shadow-[0_0_6px_hsl(var(--neon-cyan))]" />
                avançam para fase seguinte
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Series divider ────────────────────────────────────────────────────────────

const SeriesDivider = ({
  color,
  label,
  onToggle,
}: {
  color: 'gold' | 'silver';
  label: string;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const isGold = color === 'gold';
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-3 pt-4 text-left transition-opacity hover:opacity-80"
    >
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
    </button>
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
