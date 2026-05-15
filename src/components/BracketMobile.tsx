import type { Championship } from '@/types';
import { MatchNode, type ScoreUpdateFn } from './MatchNode';
import { useLanguage } from '@/i18n';

type BracketRounds = Championship['rounds'];

export const BracketMobile = ({
  rounds,
  highlightRound,
  canEdit,
  onScoreUpdate,
}: {
  rounds: BracketRounds;
  highlightRound?: string;
  canEdit?: boolean;
  onScoreUpdate?: ScoreUpdateFn;
}) => {
  const { roundName } = useLanguage();
  let counter = 0;

  return (
    <div className="space-y-6">
      {rounds.map((round) => {
        const isHighlighted = highlightRound === round.name;
        return (
          <section
            key={round.name}
            className={isHighlighted ? 'rounded-xl bg-neon-cyan/5 ring-1 ring-inset ring-neon-cyan/15 p-[15px]' : ''}
          >
            <h4 className="mb-3 text-center font-display font-bold text-xs uppercase tracking-[0.2em] text-neon-cyan">
              {roundName(round.name)}
            </h4>
            <div className="flex flex-col items-center space-y-3">
              {round.matches.map((m) => {
                counter += 1;
                return (
                  <div key={m.id} className="space-y-1">
                    <div className="px-1 text-center font-display text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      #{String(counter).padStart(2, '0')} {roundName(round.name)}
                    </div>
                    <MatchNode match={m} canEdit={canEdit} onScoreUpdate={onScoreUpdate} />
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
