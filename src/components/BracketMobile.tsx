import type { Championship } from '@/types';
import { MatchCard } from './MatchCard';
import { useLanguage } from '@/i18n';

type BracketRounds = Championship['rounds'];

export const BracketMobile = ({ rounds }: { rounds: BracketRounds }) => {
  const { roundName } = useLanguage();
  let counter = 0;

  return (
    <div className="space-y-6">
      {rounds.map((round) => (
        <section key={round.name}>
          <h4 className="mb-3 text-center font-display font-bold text-xs uppercase tracking-[0.2em] text-neon-cyan">
            {roundName(round.name)}
          </h4>
          <div className="space-y-3">
            {round.matches.map((m) => {
              counter += 1;
              return <MatchCard key={m.id} match={m} number={counter} round={roundName(round.name)} />;
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
