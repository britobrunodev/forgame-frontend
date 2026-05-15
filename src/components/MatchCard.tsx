import type { Match } from '@/types';
import { LiveBadge } from './LiveBadge';

interface Props {
  match: Match;
  number: number;
  round: string;
}

export const MatchCard = ({ match, number, round }: Props) => {
  const scoresA = match.scoresA ?? [];
  const scoresB = match.scoresB ?? [];
  const setWins = scoresA.reduce(
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
  const winnerA = match.status === 'finished' && setWins.a > setWins.b;
  const winnerB = match.status === 'finished' && setWins.b > setWins.a;

  return (
    <div className="rounded-lg border border-border bg-gradient-card overflow-hidden transition-smooth">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-background/40">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {match.time ?? '15:30'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LiveBadge status={match.status} />
        </div>
      </div>
      <div className="border-b border-border bg-background/20 px-3 py-1">
        <span className="font-display font-bold text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          #{String(number).padStart(2, '0')} {round}
        </span>
      </div>
      <TeamRow name={match.teamA?.name} scores={scoresA} winner={winnerA} emptyLabel="-" />
      <div className="h-px bg-border" />
      <TeamRow name={match.teamB?.name} scores={scoresB} winner={winnerB} emptyLabel="-" />
    </div>
  );
};

const stripSeedPrefix = (name?: string) => name?.replace(/^\d+\s*-\s*/, '') ?? name;

const TeamRow = ({ name, scores, winner, emptyLabel }: { name?: string; scores: Array<number | null>; winner: boolean; emptyLabel: string }) => (
  <div className={`flex items-center justify-between gap-2 px-3 py-2.5 ${winner ? 'bg-primary/10' : ''}`}>
    <span
      className={`min-w-0 flex-1 text-sm truncate ${
        name
          ? winner
            ? 'font-bold text-foreground'
            : 'font-semibold text-foreground/90'
          : 'text-muted-foreground italic'
      }`}
    >
      {name ? stripSeedPrefix(name) : emptyLabel}
    </span>
    <div className="ml-2 flex shrink-0 items-center gap-1">
      {scores.map((score, index) => (
        <span
          key={index}
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold ${
            score !== null && score !== undefined
              ? winner
                ? 'border-neon-cyan/45 bg-neon-cyan/10 text-neon-cyan'
                : 'border-muted-foreground/35 text-foreground'
              : 'border-muted-foreground/20 text-muted-foreground/50'
          }`}
        >
          {score ?? '–'}
        </span>
      ))}
    </div>
  </div>
);
