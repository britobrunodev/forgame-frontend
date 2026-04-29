import type { Championship } from '@/types';
import { MatchNode } from './MatchNode';
import { BracketMobile } from './BracketMobile';
import { useLanguage } from '@/i18n';

type BracketRounds = Championship['rounds'];
export const CARD_HEIGHT = 76;
const SLOT_GAP = 18;
const SLOT_STEP = CARD_HEIGHT + SLOT_GAP;

export const Bracket = ({ rounds }: { rounds: BracketRounds }) => {
  const { roundName } = useLanguage();
  const baseHeight = Math.max(((rounds[0]?.matches.length ?? 1) - 1) * SLOT_STEP + CARD_HEIGHT, CARD_HEIGHT);
  const minHeight = rounds.length === 1 ? baseHeight : Math.max(baseHeight, 340);
  const isStandardProgression = rounds.every((round, index) => index === 0 || rounds[index - 1].matches.length === round.matches.length * 2);
  const totalHeight = Math.max(((rounds[0]?.matches.length ?? 1) - 1) * SLOT_STEP + CARD_HEIGHT, 340);

  return (
    <>
      <div className="md:hidden">
        <BracketMobile rounds={rounds} />
      </div>
      <div className="hidden md:block overflow-x-auto pb-4">
        {isStandardProgression ? (
          <div className="flex gap-4 min-w-max">
            {rounds.map((round, ri) => (
              <div key={round.name} className="flex flex-col">
                <h4 className="mb-4 w-56 text-center font-display font-bold text-xs uppercase tracking-[0.2em] text-neon-cyan">
                  {roundName(round.name)}
                </h4>
                <div className="relative" style={{ height: totalHeight, width: ri < rounds.length - 1 ? 288 : 224 }}>
                  {round.matches.map((match, mi) => {
                    const top = getStandardRoundTop(ri, mi);
                    const nextTop = ri < rounds.length - 1 ? getStandardRoundTop(ri + 1, Math.floor(mi / 2)) : top;
                    return (
                      <div key={match.id} className="absolute left-0 overflow-visible" style={{ top, width: 288, height: CARD_HEIGHT }}>
                        <div className="relative h-full w-full">
                          <MatchNode match={match} />
                        {ri < rounds.length - 1 && (
                            <PreciseBracketConnector deltaToNext={nextTop - top} />
                        )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
        <div className="flex gap-4 min-w-max">
          {rounds.map((round, ri) => (
            <div key={round.name} className="flex flex-col">
              <h4 className="mb-4 w-56 text-center font-display font-bold text-xs uppercase tracking-[0.2em] text-neon-cyan">
                {roundName(round.name)}
              </h4>
              <div className="flex flex-col justify-around flex-1 gap-4" style={{ minHeight }}>
                {round.matches.map((m, mi) => (
                  <div
                    key={m.id}
                    className="flex items-center"
                    style={{ marginTop: ri === 0 && mi === 0 ? 0 : `${ri * 8}px` }}
                  >
                    <MatchNode match={m} />
                    {ri < rounds.length - 1 && (
                      <BracketConnector
                        position={mi % 2 === 0 ? 'top' : 'bottom'}
                        spacing={Math.max(minHeight / Math.max(round.matches.length, 1), 64)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </>
  );
};

const getStandardRoundTop = (roundIndex: number, matchIndex: number) =>
  ((Math.pow(2, roundIndex) - 1) * SLOT_STEP) / 2 + matchIndex * Math.pow(2, roundIndex) * SLOT_STEP;

export const PreciseBracketConnector = ({ deltaToNext }: { deltaToNext: number }) => {
  const delta = deltaToNext;
  const absDelta = Math.max(Math.abs(delta), 1);
  const startY = delta >= 0 ? 0 : absDelta;
  const endY = delta >= 0 ? absDelta : 0;

  return (
    <div
      className="absolute left-56 w-16 overflow-visible"
      style={{ top: CARD_HEIGHT / 2 + Math.min(0, delta), height: absDelta }}
    >
      <div className="absolute left-0 h-px w-5 bg-primary/60" style={{ top: startY }} />
      <div className="absolute left-5 w-px bg-primary/60" style={{ top: Math.min(startY, endY), height: absDelta }} />
      <div className="absolute left-5 h-px w-11 bg-primary/60" style={{ top: endY }} />
    </div>
  );
};

export const BracketConnector = ({
  position,
  spacing,
  deltaToNext,
}: {
  position?: 'top' | 'bottom';
  spacing?: number;
  deltaToNext?: number;
}) => {
  if (typeof deltaToNext === 'number') {
    const centerOffset = deltaToNext;
    const goesDown = centerOffset >= 0;
    const verticalHeight = Math.max(Math.abs(centerOffset), 1);

    return (
      <div className="relative w-16 shrink-0" style={{ height: verticalHeight }}>
        <div className="absolute left-0 top-1/2 h-px w-5 -translate-y-1/2 bg-primary/60" />
        <div
          className="absolute left-5 w-px bg-primary/60"
          style={goesDown ? { top: '50%', height: verticalHeight } : { bottom: '50%', height: verticalHeight }}
        />
        <div
          className="absolute left-5 h-px w-11 bg-primary/60"
          style={goesDown ? { top: '100%' } : { bottom: '100%' }}
        />
      </div>
    );
  }

  const safeSpacing = Math.max((spacing ?? 64) / 2, 44);
  const direction = position ?? 'top';

  return (
    <div className="relative w-16 shrink-0" style={{ height: safeSpacing }}>
      <div
        className="absolute left-0 h-px w-5 bg-primary/60"
        style={direction === 'top' ? { top: 0 } : { bottom: 0 }}
      />
      <div className="absolute left-5 top-0 w-px bg-primary/60" style={{ height: safeSpacing }} />
      <div
        className="absolute left-5 h-px w-11 bg-primary/60"
        style={direction === 'top' ? { bottom: 0 } : { top: 0 }}
      />
    </div>
  );
};
