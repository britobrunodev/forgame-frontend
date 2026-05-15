import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { ChampionshipTeamOut } from '@/lib/api';
import type { Match } from '@/types';
import { LiveBadge } from './LiveBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export type ScoreUpdateFn = (
  matchId: string,
  scores1: Array<number | null>,
  scores2: Array<number | null>,
) => Promise<void>;

export type TeamUpdateFn = (
  matchId: string,
  team1Id: number | null,
  team2Id: number | null,
) => Promise<void>;

interface Props {
  match: Match;
  canEdit?: boolean;
  isClassified?: boolean;
  teamOptions?: ChampionshipTeamOut[];
  onScoreUpdate?: ScoreUpdateFn;
  onTeamUpdate?: TeamUpdateFn;
}

export const MatchNode = ({
  match,
  canEdit,
  isClassified,
  teamOptions = [],
  onScoreUpdate,
  onTeamUpdate,
}: Props) => {
  const [editScoresA, setEditScoresA] = useState<Array<string | null> | null>(null);
  const [editScoresB, setEditScoresB] = useState<Array<string | null> | null>(null);
  const [editTeamAId, setEditTeamAId] = useState<string | null>(null);
  const [editTeamBId, setEditTeamBId] = useState<string | null>(null);
  const [editingTeamSlot, setEditingTeamSlot] = useState<'A' | 'B' | null>(null);
  const [saving, setSaving] = useState(false);

  const maxSets = match.maxSets ?? 1;
  const baseScoresA = Array.from(
    { length: maxSets },
    (_, index) => match.scoresA?.[index] ?? null,
  );
  const baseScoresB = Array.from(
    { length: maxSets },
    (_, index) => match.scoresB?.[index] ?? null,
  );
  const scoresA = editScoresA ?? baseScoresA.map((score) => toEditableScore(score));
  const scoresB = editScoresB ?? baseScoresB.map((score) => toEditableScore(score));
  const setWins = getSetWins(scoresA, scoresB);

  const currentTeamAId = editTeamAId ?? match.teamA?.id ?? null;
  const currentTeamBId = editTeamBId ?? match.teamB?.id ?? null;
  const currentTeamAName = getSelectedTeamName(currentTeamAId, teamOptions, match.teamA?.name);
  const currentTeamBName = getSelectedTeamName(currentTeamBId, teamOptions, match.teamB?.name);
  const scoresChanged = editScoresA !== null || editScoresB !== null;
  const teamsChanged =
    currentTeamAId !== (match.teamA?.id ?? null) || currentTeamBId !== (match.teamB?.id ?? null);
  const hasChanges = scoresChanged || teamsChanged;

  const winnerA = match.status === 'finished' && setWins.a > setWins.b;
  const winnerB = match.status === 'finished' && setWins.b > setWins.a;

  const handleSave = async () => {
    if (!onScoreUpdate && !onTeamUpdate) return;
    setSaving(true);
    try {
      if (teamsChanged && onTeamUpdate) {
        await onTeamUpdate(
          match.id,
          parseTeamId(currentTeamAId),
          parseTeamId(currentTeamBId),
        );
      }
      if (scoresChanged && onScoreUpdate) {
        await onScoreUpdate(match.id, scoresA.map(parseScoreValue), scoresB.map(parseScoreValue));
      }
      setEditScoresA(null);
      setEditScoresB(null);
      setEditTeamAId(null);
      setEditTeamBId(null);
      setEditingTeamSlot(null);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditScoresA(null);
    setEditScoresB(null);
    setEditTeamAId(null);
    setEditTeamBId(null);
    setEditingTeamSlot(null);
  };

  return (
    <div className={`relative h-[109px] w-72 overflow-hidden rounded-lg border bg-gradient-card transition-smooth ${isClassified ? 'border-amber-500/40 hover:border-amber-500/60' : 'border-border hover:border-primary/40'}`}>
      <div className={`flex h-7 items-center justify-between border-b px-3 ${isClassified ? 'border-amber-500/20 bg-amber-500/5' : 'border-border bg-background/40'}`}>
        {canEdit && hasChanges ? (
          <>
            <button
              type="button"
              onClick={handleCancel}
              className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-neon-cyan hover:text-neon-cyan/80 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-3 w-3 animate-spin" />}
              Salvar
            </button>
          </>
        ) : (
          <>
            {isClassified ? (
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-400">
                Classificados
              </span>
            ) : (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {match.time ?? '15:30'}
              </span>
            )}
            <LiveBadge status={match.status} />
          </>
        )}
      </div>
      <TeamRow
        name={currentTeamAName}
        teamId={currentTeamAId}
        maxSets={maxSets}
        scores={scoresA}
        opponentScores={scoresB}
        winner={winnerA}
        isClassified={isClassified}
        emptyLabel="-"
        canEdit={canEdit}
        teamOptions={teamOptions}
        isEditingTeam={editingTeamSlot === 'A'}
        blockedTeamId={currentTeamBId}
        onStartEditingTeam={() => setEditingTeamSlot('A')}
        onTeamChange={(value) => {
          setEditTeamAId(value);
          setEditingTeamSlot(null);
        }}
        onScoreChange={(index, value) =>
          setEditScoresA(
            updateEditableScores(scoresA, index, value, {
              openTwo: match.openTwo,
              minimumClose: match.minimumClose,
            }),
          )
        }
      />
      <div className="h-px bg-border" />
      <TeamRow
        name={currentTeamBName}
        teamId={currentTeamBId}
        maxSets={maxSets}
        scores={scoresB}
        opponentScores={scoresA}
        winner={winnerB}
        isClassified={isClassified}
        emptyLabel="-"
        canEdit={canEdit}
        teamOptions={teamOptions}
        isEditingTeam={editingTeamSlot === 'B'}
        blockedTeamId={currentTeamAId}
        onStartEditingTeam={() => setEditingTeamSlot('B')}
        onTeamChange={(value) => {
          setEditTeamBId(value);
          setEditingTeamSlot(null);
        }}
        onScoreChange={(index, value) =>
          setEditScoresB(
            updateEditableScores(scoresB, index, value, {
              openTwo: match.openTwo,
              minimumClose: match.minimumClose,
            }),
          )
        }
      />
    </div>
  );
};

const stripSeedPrefix = (name?: string) => name?.replace(/^\d+\s*-\s*/, '') ?? name;

const toEditableScore = (score: number | null | undefined) =>
  score === null || score === undefined ? null : String(score);

const parseScoreValue = (value: string | null) => {
  if (value === null || value.trim() === '') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseTeamId = (value: string | null) => {
  if (value === null || value === '__none__') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const getSelectedTeamName = (
  teamId: string | null,
  teamOptions: ChampionshipTeamOut[],
  fallbackName?: string,
) => {
  if (teamId === null) return undefined;
  return teamOptions.find((team) => String(team.id) === teamId)?.name ?? fallbackName;
};

const getSetWins = (
  scoresA: Array<string | null>,
  scoresB: Array<string | null>,
) =>
  scoresA.reduce(
    (totals, scoreA, index) => {
      const parsedA = parseScoreValue(scoreA);
      const parsedB = parseScoreValue(scoresB[index] ?? null);
      if (parsedA === null || parsedB === null) return totals;
      if (parsedA > parsedB) totals.a += 1;
      if (parsedB > parsedA) totals.b += 1;
      return totals;
    },
    { a: 0, b: 0 },
  );

const updateEditableScores = (
  scores: Array<string | null>,
  index: number,
  value: string,
  rules?: { openTwo?: boolean; minimumClose?: number },
) =>
  scores.map((score, scoreIndex) =>
    scoreIndex === index ? normalizeScoreInput(value, rules) : score,
  );

const normalizeScoreInput = (
  value: string,
  rules?: { openTwo?: boolean; minimumClose?: number },
) => {
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly === '') return null;
  const parsed = Number.parseInt(digitsOnly, 10);
  if (
    rules?.openTwo === false &&
    typeof rules.minimumClose === 'number' &&
    rules.minimumClose > 0
  ) {
    return String(Math.min(parsed, rules.minimumClose));
  }
  return String(parsed);
};

const TeamRow = ({
  name,
  teamId,
  maxSets,
  scores,
  opponentScores,
  winner,
  isClassified,
  emptyLabel,
  canEdit,
  teamOptions,
  isEditingTeam,
  blockedTeamId,
  onStartEditingTeam,
  onTeamChange,
  onScoreChange,
}: {
  name?: string;
  teamId: string | null;
  maxSets: number;
  scores: Array<string | null>;
  opponentScores: Array<string | null>;
  winner: boolean;
  isClassified?: boolean;
  emptyLabel: string;
  canEdit?: boolean;
  teamOptions: ChampionshipTeamOut[];
  isEditingTeam: boolean;
  blockedTeamId: string | null;
  onStartEditingTeam?: () => void;
  onTeamChange?: (value: string) => void;
  onScoreChange?: (index: number, val: string) => void;
}) => {
  const filteredTeamOptions = teamOptions.filter(
    (team) => String(team.id) === teamId || String(team.id) !== blockedTeamId,
  );

  const classifiedWinner = isClassified && winner;

  return (
    <div className={`flex h-10 items-center gap-2 px-3 py-2 ${classifiedWinner ? 'bg-amber-500/10' : winner ? 'bg-primary/10' : ''}`}>
      <div className="min-w-0 flex-1">
        {canEdit && isEditingTeam ? (
          <Select value={teamId ?? '__none__'} onValueChange={onTeamChange}>
            <SelectTrigger className="h-7 w-full min-w-0 rounded-md border-border/60 bg-background/60 px-2 text-left text-xs font-semibold text-foreground shadow-none">
              <SelectValue placeholder={emptyLabel} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border bg-gradient-card text-foreground shadow-card backdrop-blur-xl">
              <SelectItem value="__none__" className="text-xs">
                {emptyLabel}
              </SelectItem>
              {filteredTeamOptions.map((team) => (
                <SelectItem key={team.id} value={String(team.id)} className="text-xs">
                  {stripSeedPrefix(team.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <button
            type="button"
            disabled={!canEdit}
            onClick={onStartEditingTeam}
            className={`flex h-7 w-full min-w-0 items-center rounded-md px-1 text-left text-sm ${
              name
                ? classifiedWinner
                  ? 'font-bold text-amber-300'
                  : winner
                    ? 'font-bold text-foreground'
                    : 'font-semibold text-foreground/90'
                : 'italic text-muted-foreground'
            } ${canEdit ? 'cursor-pointer hover:bg-background/50 hover:text-primary-glow' : 'cursor-default'}`}
          >
            <span className={`block min-w-0 max-w-full truncate ${classifiedWinner ? 'rounded border border-amber-500/50 px-1' : ''}`}>
              {name ? stripSeedPrefix(name) : emptyLabel}
            </span>
          </button>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {Array.from({ length: maxSets }, (_, index) => {
          const currentScore = scores[index] ?? '';
          const opponentScore = parseScoreValue(opponentScores[index] ?? null);
          const teamScore = parseScoreValue(scores[index] ?? null);
          const setWon =
            teamScore !== null &&
            opponentScore !== null &&
            teamScore > opponentScore;
          const setLost =
            teamScore !== null &&
            opponentScore !== null &&
            teamScore < opponentScore;

          return (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              value={currentScore}
              readOnly={!canEdit}
              placeholder={canEdit ? '' : '-'}
              onChange={(event) => onScoreChange?.(index, event.target.value)}
              onFocus={(event) => canEdit && event.target.select()}
              className={`h-[28px] w-[28px] rounded-full border bg-transparent text-center font-display text-xs font-bold transition-colors focus:outline-none ${
                canEdit ? 'cursor-text' : 'cursor-default'
              } ${
                setWon
                  ? winner
                    ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan'
                    : 'border-primary/50 bg-primary/15 text-primary-glow'
                  : setLost
                    ? 'border-muted-foreground/30 bg-background/20 text-muted-foreground'
                    : 'border-muted-foreground/20 text-foreground'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
