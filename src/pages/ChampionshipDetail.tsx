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
) => {
  const target = stageType ?? 'group';
  if (target === 'group') {
    return teams.filter((team) => (team.stage_type ?? 'group') === 'group');
  }
  // The generator stamps all bracket teams as 'quarterfinal' regardless of the
  // specific round, so we show every non-group team for bracket matches.
  return teams.filter((team) => (team.stage_type ?? 'group') !== 'group');
};

const getStageConfigName = (
  config: ChampionshipFormatConfig | null | undefined,
  stageKey: 'first_stage' | 'second_stage' | 'third_stage',
): string | null => {
  const value = config?.[stageKey]?.name;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
};

const getStageConfigView = (
  config: ChampionshipFormatConfig | null | undefined,
  stageKey: 'first_stage' | 'second_stage' | 'third_stage',
): string | null => {
  const rawValue = config?.[stageKey]?.default_view;
  if (typeof rawValue !== 'string' || !rawValue.trim()) return null;
  return rawValue.toLowerCase() === 'brakets' ? 'brackets' : rawValue.toLowerCase();
};

const getStageConfigOpenTwo = (
  config: ChampionshipFormatConfig | null | undefined,
  stageKey: 'first_stage' | 'second_stage' | 'third_stage',
): boolean => config?.[stageKey]?.open_two === true;

const getStageConfigMinimumClose = (
  config: ChampionshipFormatConfig | null | undefined,
  stageKey: 'first_stage' | 'second_stage' | 'third_stage',
): number => {
  const rawValue = config?.[stageKey]?.minimum_close;
  return typeof rawValue === 'number' ? rawValue : 0;
};

const toFrontendMatch = (
  m: ChampionshipMatchOut,
  round: string,
  timezone: string | null,
  formatConfig: ChampionshipFormatConfig | null | undefined,
  maxSets?: number,
): Match => {
  const scoresA = normalizeSetScores(m.score_json?.scores_1, maxSets);
  const scoresB = normalizeSetScores(m.score_json?.scores_2, maxSets);
  const setWins = getSetWins(scoresA, scoresB);
  const series = typeof m.config_json?.series === 'string' ? m.config_json.series : null;
  const stageKey =
    series === 'gold'
      ? 'second_stage'
      : series === 'silver'
        ? 'third_stage'
        : 'first_stage';

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
    openTwo: getStageConfigOpenTwo(formatConfig, stageKey),
    minimumClose: getStageConfigMinimumClose(formatConfig, stageKey),
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
  const rawFirstStageName = getStageConfigName(data.format_config, 'first_stage');
  const firstStageView = getStageConfigView(data.format_config, 'first_stage');
  const thirdStageName = getStageConfigName(data.format_config, 'third_stage');

  const translateStageName = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower === 'gold' || lower === 'golden') return t('goldBracket');
    if (lower === 'silver') return t('silverBracket');
    if (lower === 'groups' || lower === 'group stage') return t('groupStage');
    return name;
  };

  const firstStageTitle = rawFirstStageName ? translateStageName(rawFirstStageName) : t('groupStage');

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
                  formatConfig={data.format_config}
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
        const hasFinais = bracket.finais.length > 0;

        // WB rounds — when DE, final/third_place are in finais not here.
        // Position-based names from end:
        //   fromEnd=0 (last, SF) → 'Quartas'   fromEnd=1 → 'Oitavas'   fromEnd=2+ → backend name
        const wbFiltered = bracket.winner_rounds.filter((r) => r.stage_type !== 'third_place');
        const DE_NAMES_FROM_END: Record<number, string> = { 0: 'Quartas', 1: 'Oitavas' };
        const mainRounds: BracketRounds = wbFiltered.map((r, idx) => {
          const fromEnd = wbFiltered.length - 1 - idx;
          const name = hasFinais && DE_NAMES_FROM_END[fromEnd] != null
            ? DE_NAMES_FROM_END[fromEnd]
            : r.name;
          return {
            name,
            matches: r.matches.map((m) =>
              toFrontendMatch(
                m,
                name,
                timezone,
                data.format_config,
                settingsByStage.get(m.stage_type ?? '') ?? undefined,
              ),
            ),
          };
        });

        // For non-DE brackets, keep 3rd place as trailing
        const thirdPlaceRound = !hasFinais
          ? bracket.winner_rounds.find((r) => r.stage_type === 'third_place')
          : undefined;
        const trailingRounds: BracketRounds = thirdPlaceRound?.matches.length
          ? [
              {
                name: thirdPlaceRound.name,
                matches: thirdPlaceRound.matches.map((m) =>
                  toFrontendMatch(
                    m,
                    thirdPlaceRound.name,
                    timezone,
                    data.format_config,
                    settingsByStage.get('third_place') ?? undefined,
                  ),
                ),
              },
            ]
          : [];

        // LB rounds — same position-based renaming: last→'Quartas', second-to-last→'Oitavas'
        const lbRounds = bracket.loser_rounds;
        const loserRounds: BracketRounds = lbRounds.map((r, idx) => {
          const fromEnd = lbRounds.length - 1 - idx;
          const name = hasFinais && DE_NAMES_FROM_END[fromEnd] != null
            ? DE_NAMES_FROM_END[fromEnd]
            : r.name;
          return {
            name,
            matches: r.matches.map((m) =>
              toFrontendMatch(
                m,
                name,
                timezone,
                data.format_config,
                settingsByStage.get(m.stage_type ?? '') ?? undefined,
              ),
            ),
          };
        });

        const lastWbRound = mainRounds[mainRounds.length - 1];
        const lastLbRound = loserRounds[loserRounds.length - 1];

        // Legacy grand_final (non-DE)
        const grandFinalMatch = bracket.grand_final
          ? toFrontendMatch(
              bracket.grand_final,
              'Grande Final',
              timezone,
              data.format_config,
              settingsByStage.get('final') ?? undefined,
            )
          : null;

        // DE Finais rounds — split 3rd place as trailing so it renders beside the bracket
        const finaisMainRounds: BracketRounds = bracket.finais
          .filter((r) => r.stage_type !== 'third_place')
          .map((r) => ({
            name: r.name,
            matches: r.matches.map((m) =>
              toFrontendMatch(
                m,
                r.name,
                timezone,
                data.format_config,
                settingsByStage.get(m.stage_type ?? '') ?? undefined,
              ),
            ),
          }));
        const finaisThirdRound = bracket.finais.find((r) => r.stage_type === 'third_place');
        const finaisTrailingRounds: BracketRounds = finaisThirdRound
          ? [{
              name: finaisThirdRound.name,
              matches: finaisThirdRound.matches.map((m) =>
                toFrontendMatch(
                  m,
                  finaisThirdRound.name,
                  timezone,
                  data.format_config,
                  settingsByStage.get('third_place') ?? undefined,
                ),
              ),
            }]
          : [];

        return (
          <div key={bracket.name}>
            <SeriesDivider
              color={bracket.name === thirdStageName ? 'silver' : 'gold'}
              label={translateStageName(bracket.name)}
            />

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
                    classifiedRound={hasFinais ? lastWbRound : undefined}
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
                    classifiedRound={hasFinais ? lastLbRound : undefined}
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

              {hasFinais && (
                <BracketPanel
                  title={t('finais')}
                  isOpen={isOpen(`__finais_${bracket.name}__`, false)}
                  onToggle={() => toggle(`__finais_${bracket.name}__`, false)}
                  accent="amber"
                >
                  <Bracket
                    rounds={finaisMainRounds}
                    trailingRounds={finaisTrailingRounds}
                    canEdit={canEdit}
                    teamOptions={getAvailableTeamsForStage(
                      data.available_teams,
                      finaisMainRounds[0]?.matches[0]?.stageType,
                    )}
                    onScoreUpdate={onScoreUpdate}
                    onTeamUpdate={onTeamUpdate}
                  />
                </BracketPanel>
              )}
            </div>
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
  formatConfig,
  settingsByStage,
  availableTeams,
  canEdit,
  onScoreUpdate,
  onTeamUpdate,
}: {
  table: ChampionshipTableOut;
  timezone: string | null;
  formatConfig: ChampionshipFormatConfig | null | undefined;
  settingsByStage: Map<string, number>;
  availableTeams: ChampionshipTeamOut[];
  canEdit: boolean;
  onScoreUpdate: ScoreUpdateFn;
  onTeamUpdate: TeamUpdateFn;
}) => {
  const { t } = useLanguage();
  const groupMaxSets = settingsByStage.get('group') ?? 1;
  const hasGoldQualified = table.player_standings.some(
    (player) => player.qualification_status === 'gold',
  );
  const hasSilverQualified = table.player_standings.some(
    (player) => player.qualification_status === 'silver',
  );
  const hasPendingTiebreak = table.player_standings.some(
    (player) => player.qualification_status === 'tiebreak',
  );

  return (
    <div className="rounded-2xl border border-border bg-background/30 p-4">
      <div className="mb-4 text-center font-display text-sm font-bold uppercase tracking-[0.2em] text-neon-cyan">
        {table.name.replace(/^Group(\s+)/i, `${t('group')}$1`)}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        {/* Matches column */}
        <div className="flex flex-col items-center gap-2 sm:items-stretch">
          {table.matches.map((m) => (
            <MatchNode
              key={m.id}
              match={toFrontendMatch(m, table.name, timezone, formatConfig, groupMaxSets)}
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
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('points')}
            </div>
            <div className="flex flex-col gap-1">
              {table.player_standings.map((p, i) => {
                const isTiebreak = p.qualification_status === 'tiebreak';
                const isGoldQualified = p.qualification_status === 'gold';
                const isSilverQualified = p.qualification_status === 'silver';
                const isQualified =
                  isGoldQualified ||
                  isSilverQualified ||
                  p.qualification_status === 'qualified' ||
                  (!p.qualification_status && i < 2);
                const showDot = isQualified || isTiebreak;

                return (
                  <div key={p.user_id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    {showDot && (
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          isTiebreak
                            ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]'
                            : isGoldQualified
                              ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]'
                              : isSilverQualified
                                ? 'bg-slate-300 shadow-[0_0_6px_rgba(203,213,225,0.9)]'
                                : 'bg-neon-cyan shadow-[0_0_6px_hsl(var(--neon-cyan))]'
                        }`}
                      />
                    )}
                    <span
                      className={`text-[13px] ${
                        isTiebreak
                          ? 'font-semibold text-emerald-300'
                          : isGoldQualified
                            ? 'font-semibold text-amber-300'
                            : isSilverQualified
                              ? 'font-semibold text-slate-200'
                          : isQualified
                            ? 'font-semibold text-foreground'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {p.name}
                    </span>
                  </div>
                  <span
                    className={`text-[13px] font-bold tabular-nums ${
                      isTiebreak
                        ? 'text-emerald-300'
                        : isGoldQualified
                          ? 'text-amber-300'
                          : isSilverQualified
                            ? 'text-slate-200'
                        : isQualified
                          ? 'text-neon-cyan'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {p.points}pts
                  </span>
                  </div>
                );
              })}
            </div>
            {hasGoldQualified && (
              <div className="mt-2.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
                {t('goldBracket')}
              </div>
            )}
            {hasSilverQualified && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shadow-[0_0_6px_rgba(203,213,225,0.9)]" />
                {t('silverBracket')}
              </div>
            )}
            {hasPendingTiebreak && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                {t('randomTiebreakPending')}
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
}: {
  color: 'gold' | 'silver';
  label: string;
}) => {
  const isGold = color === 'gold';
  return (
    <div className="flex w-full items-center gap-3 pt-4">
      <div
        className={`h-px flex-1 bg-gradient-to-r from-transparent ${
          isGold ? 'via-amber-700/50 dark:via-yellow-500/40' : 'via-slate-400/40'
        } to-transparent`}
      />
      <span
        className={`rounded-full border px-4 py-1 text-[10px] font-bold uppercase tracking-[0.3em] ${
          isGold
            ? 'border-amber-700/40 bg-amber-700/10 text-amber-700 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-400'
            : 'border-slate-400/30 bg-slate-400/10 text-slate-300'
        }`}
      >
        {label}
      </span>
      <div
        className={`h-px flex-1 bg-gradient-to-l from-transparent ${
          isGold ? 'via-amber-700/50 dark:via-yellow-500/40' : 'via-slate-400/40'
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
  accent,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  accent?: 'amber';
}) => (
  <div className={`rounded-2xl border bg-background/20 ${accent === 'amber' ? 'border-amber-500/30' : 'border-border'}`}>
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-smooth hover:bg-secondary/30"
    >
      <div className={`font-display text-sm font-bold uppercase tracking-[0.2em] ${accent === 'amber' ? 'text-amber-400' : 'text-foreground'}`}>
        {title}
      </div>
      <span className={`flex h-8 w-8 items-center justify-center rounded-full border font-display text-lg font-bold ${accent === 'amber' ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-primary/30 bg-primary/10 text-primary-glow'}`}>
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
