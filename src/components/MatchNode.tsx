import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Match } from '@/types';
import { LiveBadge } from './LiveBadge';

export type ScoreUpdateFn = (
  matchId: string,
  scores1: Array<number | null>,
  scores2: Array<number | null>,
) => Promise<void>;

interface Props {
  match: Match;
  canEdit?: boolean;
  onScoreUpdate?: ScoreUpdateFn;
}

export const MatchNode = ({ match, canEdit, onScoreUpdate }: Props) => {
  const [editScoresA, setEditScoresA] = useState<Array<string | null> | null>(null);
  const [editScoresB, setEditScoresB] = useState<Array<string | null> | null>(null);
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
  const hasChanges = editScoresA !== null || editScoresB !== null;

  const winnerA = match.status === 'finished' && setWins.a > setWins.b;
  const winnerB = match.status === 'finished' && setWins.b > setWins.a;

  const handleSave = async () => {
    if (!onScoreUpdate) return;
    setSaving(true);
    try {
      await onScoreUpdate(match.id, scoresA.map(parseScoreValue), scoresB.map(parseScoreValue));
      setEditScoresA(null);
      setEditScoresB(null);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditScoresA(null);
    setEditScoresB(null);
  };

  return (
    <div className="relative h-[109px] w-72 rounded-lg border border-border bg-gradient-card overflow-hidden transition-smooth hover:border-primary/40">
      <div className="flex h-7 items-center justify-between border-b border-border bg-background/40 px-3">
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
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {match.time ?? '15:30'}
            </span>
            <LiveBadge status={match.status} />
          </>
        )}
      </div>
      <TeamRow
        name={match.teamA?.name}
        maxSets={maxSets}
        scores={scoresA}
        opponentScores={scoresB}
        winner={winnerA}
        emptyLabel="-"
        canEdit={canEdit}
        onScoreChange={(index, value) => setEditScoresA(updateEditableScores(scoresA, index, value))}
      />
      <div className="h-px bg-border" />
      <TeamRow
        name={match.teamB?.name}
        maxSets={maxSets}
        scores={scoresB}
        opponentScores={scoresA}
        winner={winnerB}
        emptyLabel="-"
        canEdit={canEdit}
        onScoreChange={(index, value) => setEditScoresB(updateEditableScores(scoresB, index, value))}
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
) =>
  scores.map((score, scoreIndex) => (scoreIndex === index ? normalizeScoreInput(value) : score));
const normalizeScoreInput = (value: string) => {
  const digitsOnly = value.replace(/\D/g, '');
  return digitsOnly === '' ? null : digitsOnly;
};

const TeamRow = ({
  name,
  maxSets,
  scores,
  opponentScores,
  winner,
  emptyLabel,
  canEdit,
  onScoreChange,
}: {
  name?: string;
  maxSets: number;
  scores: Array<string | null>;
  opponentScores: Array<string | null>;
  winner: boolean;
  emptyLabel: string;
  canEdit?: boolean;
  onScoreChange?: (index: number, val: string) => void;
}) => (
  <div className={`flex h-10 items-center gap-2 px-3 py-2 ${winner ? 'bg-primary/10' : ''}`}>
    <span className={`min-w-0 flex-1 text-sm truncate ${name ? (winner ? 'font-bold text-foreground' : 'font-semibold text-foreground/90') : 'text-muted-foreground italic'}`}>
      {name ? stripSeedPrefix(name) : emptyLabel}
    </span>
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
            value={currentScore}
            readOnly={!canEdit}
            placeholder={canEdit ? '' : '–'}
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
