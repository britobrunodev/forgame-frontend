import type { Match } from '@/types';
import { LiveBadge } from './LiveBadge';

interface Props {
  match: Match;
}

export const MatchNode = ({ match }: Props) => {
  const winnerA = match.status === 'finished' && (match.scoreA ?? 0) > (match.scoreB ?? 0);
  const winnerB = match.status === 'finished' && (match.scoreB ?? 0) > (match.scoreA ?? 0);
  return (
    <div className="relative h-[108px] w-56 rounded-lg border border-border bg-gradient-card overflow-hidden transition-smooth hover:border-primary/40">
      <div className="flex h-7 items-center justify-between border-b border-border bg-background/40 px-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {match.time ?? '15:30'}
        </span>
        <LiveBadge status={match.status} />
      </div>
      <TeamRow name={match.teamA?.name} score={match.scoreA} winner={winnerA} emptyLabel="-" />
      <div className="h-px bg-border" />
      <TeamRow name={match.teamB?.name} score={match.scoreB} winner={winnerB} emptyLabel="-" />
    </div>
  );
};

const TeamRow = ({ name, score, winner, emptyLabel }: { name?: string; score?: number; winner: boolean; emptyLabel: string }) => (
  <div className={`flex h-10 items-center justify-between px-3 py-2 ${winner ? 'bg-primary/10' : ''}`}>
    <span className={`text-sm truncate ${name ? (winner ? 'font-bold text-foreground' : 'font-semibold text-foreground/90') : 'text-muted-foreground italic'}`}>
      {name ?? emptyLabel}
    </span>
    <span className={`font-display font-bold text-sm ml-2 ${winner ? 'text-neon-cyan' : 'text-muted-foreground'}`}>
      {score ?? '-'}
    </span>
  </div>
);
