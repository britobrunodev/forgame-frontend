import type { Match } from '@/types';
import { useLanguage } from '@/i18n';

interface Props {
  match: Match;
  number: number;
  round: string;
}

export const MatchCard = ({ match, number, round }: Props) => {
  const { t } = useLanguage();
  const winnerA = match.status === 'finished' && (match.scoreA ?? 0) > (match.scoreB ?? 0);
  const winnerB = match.status === 'finished' && (match.scoreB ?? 0) > (match.scoreA ?? 0);
  return (
    <div
      className={`rounded-lg border bg-gradient-card overflow-hidden transition-smooth ${
        match.status === 'live'
          ? 'border-live/60 shadow-[0_0_16px_hsl(var(--live)/0.4)]'
          : 'border-border'
      }`}
    >
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-background/40">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-xs text-neon-cyan">
            #{String(number).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            {round}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {match.status === 'live' && <span className="inline-block h-2.5 w-2.5 rounded-full bg-live shadow-[0_0_10px_hsl(var(--live)/0.8)]" />}
          {match.status === 'finished' && (
            <span className="text-[10px] text-neon-cyan font-bold uppercase tracking-wider">{t('final')}</span>
          )}
        </div>
      </div>
      <TeamRow name={match.teamA?.name} score={match.scoreA} winner={winnerA} emptyLabel="-" />
      <div className="h-px bg-border" />
      <TeamRow name={match.teamB?.name} score={match.scoreB} winner={winnerB} emptyLabel="-" />
    </div>
  );
};

const TeamRow = ({ name, score, winner, emptyLabel }: { name?: string; score?: number; winner: boolean; emptyLabel: string }) => (
  <div className={`flex items-center justify-between px-3 py-2.5 ${winner ? 'bg-primary/10' : ''}`}>
    <span
      className={`text-sm truncate ${
        name
          ? winner
            ? 'font-bold text-foreground'
            : 'font-semibold text-foreground/90'
          : 'text-muted-foreground italic'
      }`}
    >
      {name ?? emptyLabel}
    </span>
    <span
      className={`font-display font-bold text-sm ml-2 ${
        winner ? 'text-neon-cyan' : 'text-muted-foreground'
      }`}
    >
      {score ?? '-'}
    </span>
  </div>
);
