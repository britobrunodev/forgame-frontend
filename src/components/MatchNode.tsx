import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Match } from '@/types';
import { LiveBadge } from './LiveBadge';

export type ScoreUpdateFn = (
  matchId: string,
  sets1: number,
  sets2: number,
  score1?: number,
  score2?: number,
) => Promise<void>;

interface Props {
  match: Match;
  canEdit?: boolean;
  onScoreUpdate?: ScoreUpdateFn;
}

export const MatchNode = ({ match, canEdit, onScoreUpdate }: Props) => {
  const [editSetsA, setEditSetsA] = useState<number | null>(null);
  const [editSetsB, setEditSetsB] = useState<number | null>(null);
  const [editScore1, setEditScore1] = useState<string | null>(null);
  const [editScore2, setEditScore2] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const maxSets = match.maxSets ?? 1;

  const setsA = editSetsA ?? (match.setScoreA ?? 0);
  const setsB = editSetsB ?? (match.setScoreB ?? 0);
  const hasChanges =
    editSetsA !== null || editSetsB !== null || editScore1 !== null || editScore2 !== null;

  const winnerA = match.status === 'finished' && !hasChanges && (match.setScoreA ?? 0) > (match.setScoreB ?? 0);
  const winnerB = match.status === 'finished' && !hasChanges && (match.setScoreB ?? 0) > (match.setScoreA ?? 0);

  const handleSave = async () => {
    if (!onScoreUpdate) return;
    setSaving(true);
    try {
      const s1 = editScore1 !== null ? parseInt(editScore1, 10) : undefined;
      const s2 = editScore2 !== null ? parseInt(editScore2, 10) : undefined;
      await onScoreUpdate(
        match.id,
        setsA,
        setsB,
        s1 !== undefined && !isNaN(s1) ? s1 : undefined,
        s2 !== undefined && !isNaN(s2) ? s2 : undefined,
      );
      setEditSetsA(null);
      setEditSetsB(null);
      setEditScore1(null);
      setEditScore2(null);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditSetsA(null);
    setEditSetsB(null);
    setEditScore1(null);
    setEditScore2(null);
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
        setScore={setsA}
        maxSets={maxSets}
        winner={winnerA}
        emptyLabel="-"
        canEdit={canEdit}
        scoreInputValue={editScore1 ?? String(match.scoreA ?? '')}
        onCircleClick={(i) => setEditSetsA(setsA > i ? i : i + 1)}
        onScoreChange={(v) => setEditScore1(v)}
      />
      <div className="h-px bg-border" />
      <TeamRow
        name={match.teamB?.name}
        setScore={setsB}
        maxSets={maxSets}
        winner={winnerB}
        emptyLabel="-"
        canEdit={canEdit}
        scoreInputValue={editScore2 ?? String(match.scoreB ?? '')}
        onCircleClick={(i) => setEditSetsB(setsB > i ? i : i + 1)}
        onScoreChange={(v) => setEditScore2(v)}
      />
    </div>
  );
};

const stripSeedPrefix = (name?: string) => name?.replace(/^\d+\s*-\s*/, '') ?? name;

const TeamRow = ({
  name,
  setScore,
  maxSets,
  winner,
  emptyLabel,
  canEdit,
  scoreInputValue,
  onCircleClick,
  onScoreChange,
}: {
  name?: string;
  setScore: number;
  maxSets: number;
  winner: boolean;
  emptyLabel: string;
  canEdit?: boolean;
  scoreInputValue: string;
  onCircleClick?: (index: number) => void;
  onScoreChange?: (val: string) => void;
}) => (
  <div className={`flex h-10 items-center gap-2 px-3 py-2 ${winner ? 'bg-primary/10' : ''}`}>
    <span className={`min-w-0 flex-1 text-sm truncate ${name ? (winner ? 'font-bold text-foreground' : 'font-semibold text-foreground/90') : 'text-muted-foreground italic'}`}>
      {name ? stripSeedPrefix(name) : emptyLabel}
    </span>
    <div className="flex shrink-0 items-center gap-1.5">
      {/* Set count circle — only when multiple sets are possible */}
      {maxSets > 1 && (
        <span className={`inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border text-xs font-bold ${
          winner
            ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan'
            : setScore > 0
              ? 'border-primary/50 bg-primary/10 text-primary-glow'
              : 'border-muted-foreground/25 bg-transparent text-muted-foreground/40'
        }`}>
          {setScore}
        </span>
      )}
      {/* Per-set circles — always shown, capped at maxSets */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxSets }, (_, i) => {
          const filled = setScore > i;
          return (
            <button
              key={i}
              type="button"
              disabled={!canEdit}
              onClick={() => canEdit && onCircleClick?.(i)}
              className={`inline-block h-[26px] w-[26px] rounded-full border transition-colors ${
                canEdit ? 'cursor-pointer hover:opacity-70' : 'cursor-default'
              } ${
                filled
                  ? winner
                    ? 'border-neon-cyan bg-neon-cyan/30'
                    : 'border-primary/50 bg-primary/15'
                  : 'border-muted-foreground/20 bg-transparent'
              }`}
            />
          );
        })}
      </div>
      {/* Score — input when canEdit, text otherwise */}
      {canEdit ? (
        <input
          type="number"
          min="0"
          value={scoreInputValue}
          onChange={(e) => onScoreChange?.(e.target.value)}
          onFocus={(e) => e.target.select()}
          className="w-11 rounded border border-border/50 bg-background/60 text-center text-sm font-bold text-foreground focus:border-primary/50 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      ) : (
        <span className={`font-display font-bold text-sm min-w-[1.5rem] text-center ${winner ? 'text-neon-cyan' : 'text-muted-foreground'}`}>
          {scoreInputValue || ''}
        </span>
      )}
    </div>
  </div>
);
