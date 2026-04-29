import { useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CHAMPIONSHIPS, SPORTS } from '@/data/mock';
import { Bracket, CARD_HEIGHT, PreciseBracketConnector } from '@/components/Bracket';
import { LiveBadge } from '@/components/LiveBadge';
import { MatchNode } from '@/components/MatchNode';
import { ArrowLeft, MapPin, Calendar, Users, Trophy } from 'lucide-react';
import { useLanguage } from '@/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Championship, Match, Team } from '@/types';

type TeamCount = number;
type BracketRounds = Championship['rounds'];
type FinalsRounds = Array<{ name: string; matches: Match[] }>;
const BRACKET_SIZE_OPTIONS = [8, 16, 32];

const FOOTVOLLEY_TEAM_POOL = [
  'Tavinho e Gui BSB',
  'Amaury e Tavinho',
  'Arthur Adao e Dudu',
  'Edson Jr e Gui Nasc',
  'Jalisson e Rondy',
  'Bruno B. e Preto',
  'Joao ET e Neguebi',
  'Enzo e Lapiseira',
  'Vinicius e Felipe M.',
  'Indio e Felipe',
  'Flanklin e Landim',
  'Iago e Beguinha',
  'Parana e Juka',
  'Leo Bulks e D...',
  'Pedrinho e Re...',
  'Freitas e Gud...',
  'Sandrey e Brisa',
  'Dioguinho e Giovani',
  'Victor e Thierry',
  'Aguia e Bruninho',
  'Longo e Michel',
  'Kibinho e Murilo',
  'Gui e Juninho',
  'Renan e Neguinho',
  'Vitinho e Parana',
  'Chau e Thallys',
  'Saldanha e Juninho',
  'Hiltinho e Franklin',
  'Biel e Pablo',
  'Cezar e Arthur',
  'Leo e Eduzinho',
  'Breno e Natan',
];

const ChampionshipDetail = () => {
  const { t, sportName } = useLanguage();
  const { id } = useParams();
  const c = CHAMPIONSHIPS.find(x => x.id === id);
  const [selectedCategory, setSelectedCategory] = useState<'professional' | 'intermediate' | 'beginner'>('professional');
  const [selectedTeamCount, setSelectedTeamCount] = useState<TeamCount>(32);
  const [winnersOpen, setWinnersOpen] = useState(true);
  const [losersOpen, setLosersOpen] = useState(false);
  const [finalsOpen, setFinalsOpen] = useState(false);

  if (!c) return <div>{t('championshipNotFound')}</div>;
  const sport = SPORTS.find(s => s.id === c.sport);
  const architecture = useMemo(() => buildDoubleEliminationArchitecture(selectedTeamCount), [selectedTeamCount]);

  return (
    <div className="space-y-8">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth">
        <ArrowLeft className="w-4 h-4" /> {t('back')}
      </Link>

      <div className="rounded-2xl border border-border overflow-hidden relative bg-secondary min-h-[220px]">
        {c.image ? (
          <img src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 hex-grid opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="relative p-8">
          <div className="flex items-center gap-2 mb-3">
            {c.status === 'live' && <LiveBadge />}
            <span className="px-3 py-1 rounded-md bg-background/60 backdrop-blur-md text-xs font-bold uppercase tracking-wider border border-white/10">
              {sport?.icon} {sport ? sportName(sport.id) : c.sport}
            </span>
          </div>
          <h1 className="font-display font-black text-3xl lg:text-4xl mb-3 drop-shadow-lg">{c.name}</h1>
          <div className="flex flex-wrap gap-5 text-sm font-semibold">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {c.location}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {c.startDate} → {c.endDate}</span>
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {selectedTeamCount} {t('teams')}</span>
            {c.prize && <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4" /> {c.prize}</span>}
          </div>
        </div>
      </div>

      <section>
        <div className="rounded-2xl border border-border bg-gradient-card p-4 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-border pb-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="font-display font-bold text-sm uppercase tracking-[0.2em] text-neon-cyan">{t('bracket')}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-glow">
                  {t(selectedCategory)}
                </span>
                <span className="text-xs text-muted-foreground">{selectedTeamCount} {t('teams')}</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:w-[32rem]">
              <div>
                <div className="mb-2 text-[10px] font-display font-bold uppercase tracking-[0.25em] text-muted-foreground">
                  {t('category')}
                </div>
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as 'professional' | 'intermediate' | 'beginner')}>
                  <SelectTrigger className="h-10 rounded-xl border-border bg-secondary/60 text-sm font-semibold text-foreground shadow-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-gradient-card p-1.5 text-foreground shadow-card backdrop-blur-xl">
                    <SelectItem value="professional" className="rounded-lg py-2 pl-8 pr-3 text-sm font-semibold focus:bg-primary/15 focus:text-primary-glow">
                      {t('professional')}
                    </SelectItem>
                    <SelectItem value="intermediate" className="rounded-lg py-2 pl-8 pr-3 text-sm font-semibold focus:bg-primary/15 focus:text-primary-glow">
                      {t('intermediate')}
                    </SelectItem>
                    <SelectItem value="beginner" className="rounded-lg py-2 pl-8 pr-3 text-sm font-semibold focus:bg-primary/15 focus:text-primary-glow">
                      {t('beginner')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="mb-2 text-[10px] font-display font-bold uppercase tracking-[0.25em] text-muted-foreground">
                  {t('bracketSize')}
                </div>
                <Select value={String(selectedTeamCount)} onValueChange={(value) => setSelectedTeamCount(Number(value) as TeamCount)}>
                  <SelectTrigger className="h-10 rounded-xl border-border bg-secondary/60 text-sm font-semibold text-foreground shadow-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-gradient-card p-1.5 text-foreground shadow-card backdrop-blur-xl">
                    {BRACKET_SIZE_OPTIONS.map((size) => (
                      <SelectItem
                        key={size}
                        value={String(size)}
                        className="rounded-lg py-2 pl-8 pr-3 text-sm font-semibold focus:bg-primary/15 focus:text-primary-glow"
                      >
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <BracketPanel title={t('winnerBracket')} isOpen={winnersOpen} onToggle={() => setWinnersOpen((current) => !current)}>
              <Bracket rounds={architecture.winners} />
            </BracketPanel>

            <BracketPanel title={t('loserBracket')} isOpen={losersOpen} onToggle={() => setLosersOpen((current) => !current)}>
              <Bracket rounds={architecture.losers} />
            </BracketPanel>

            <BracketPanel title={t('finalsBracket')} isOpen={finalsOpen} onToggle={() => setFinalsOpen((current) => !current)}>
              <FinalsBracket rounds={architecture.finals} />
            </BracketPanel>
          </div>
        </div>
      </section>
    </div>
  );
};

const BracketPanel = ({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) => (
  <div className="rounded-2xl border border-border bg-background/20">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-smooth hover:bg-secondary/30"
    >
      <div className="font-display text-sm font-bold uppercase tracking-[0.2em] text-foreground">
        {title}
      </div>
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-display text-lg font-bold text-primary-glow">
        {isOpen ? '−' : '+'}
      </span>
    </button>
    {isOpen && <div className="border-t border-border px-2 pb-2 pt-4 sm:px-4 sm:pb-4">{children}</div>}
  </div>
);

const FinalsBracket = ({ rounds }: { rounds: FinalsRounds }) => {
  const { roundName } = useLanguage();
  const semifinals = rounds[0];
  const finalRound = rounds[1];
  const thirdPlaceRound = rounds[2];
  const gap = 18;
  const topSemiTop = 0;
  const bottomSemiTop = CARD_HEIGHT + gap;
  const totalHeight = bottomSemiTop + CARD_HEIGHT;
  const centerTop = (totalHeight - CARD_HEIGHT) / 2;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max gap-4">
        <section className="space-y-4">
          <h4 className="w-56 text-center font-display font-bold text-xs uppercase tracking-[0.2em] text-neon-cyan">
            {roundName(semifinals.name)}
          </h4>
          <div className="relative" style={{ height: totalHeight, width: 288 }}>
            <div className="absolute left-0 top-0 overflow-visible" style={{ width: 288, height: CARD_HEIGHT }}>
              <div className="relative h-full w-full">
                <MatchNode match={semifinals.matches[0]} />
                <PreciseBracketConnector deltaToNext={centerTop - topSemiTop} />
              </div>
            </div>
            <div className="absolute left-0 overflow-visible" style={{ top: bottomSemiTop, width: 288, height: CARD_HEIGHT }}>
              <div className="relative h-full w-full">
                <MatchNode match={semifinals.matches[1]} />
                <PreciseBracketConnector deltaToNext={centerTop - bottomSemiTop} />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="w-56 text-center font-display font-bold text-xs uppercase tracking-[0.2em] text-neon-cyan">
            {roundName(finalRound.name)}
          </h4>
          <div className="relative" style={{ height: totalHeight, width: 224 }}>
            <div className="absolute left-0" style={{ top: centerTop }}>
              <MatchNode match={finalRound.matches[0]} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="w-56 text-center font-display font-bold text-xs uppercase tracking-[0.2em] text-neon-cyan">
            {roundName(thirdPlaceRound.name)}
          </h4>
          <div className="relative" style={{ height: totalHeight, width: 224 }}>
            <div className="absolute left-0" style={{ top: centerTop }}>
              <MatchNode match={thirdPlaceRound.matches[0]} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const buildDoubleEliminationArchitecture = (size: TeamCount) => {
  const winnerSeeds = buildSeededTeams(size, FOOTVOLLEY_TEAM_POOL);
  const loserSize = Math.max(4, Math.floor(size / 4) * 2);
  const loserSeeds = buildSeededTeams(loserSize, rotatePool(FOOTVOLLEY_TEAM_POOL, size / 2));

  const winners = buildProgressiveBracket(winnerSeeds, 'cv');
  const losers = buildProgressiveBracket(loserSeeds, 'cp');

  const winnerQualified = getQualifiedTeams(winners);
  const loserQualified = getQualifiedTeams(losers);

  return {
    winners,
    losers,
    finals: buildFinalsBracket(winnerQualified, loserQualified),
  };
};

const rotatePool = (pool: string[], amount: number) => {
  const offset = amount % pool.length;
  return [...pool.slice(offset), ...pool.slice(0, offset)];
};

const buildSeededTeams = (size: TeamCount, pool: string[]): Team[] =>
  pool.slice(0, size).map((name, index) => ({
    id: `seed-${index + 1}`,
    name: `${index + 1} - ${name}`,
    seed: index + 1,
  }));

const buildProgressiveBracket = (initialTeams: Team[], prefix: string): BracketRounds => {
  let currentTeams = [...initialTeams];
  const rounds: BracketRounds = [];
  let roundIndex = 0;

  while (currentTeams.length > 2) {
    const currentSize = currentTeams.length;
    const nextSize = getNextStageSize(currentSize);
    const label = getRoundLabel(currentSize);
    const matches: Match[] = [];
    const nextTeams: Team[] = [];

    const byeCount = isPowerOfTwo(currentSize) ? 0 : 2 * nextSize - currentSize;
    const byeTeams = currentTeams.slice(0, byeCount);
    const playingTeams = currentTeams.slice(byeCount);

    nextTeams.push(...byeTeams);

    for (let index = 0; index < playingTeams.length; index += 2) {
      const teamA = playingTeams[index] ?? null;
      const teamB = playingTeams[index + 1] ?? null;
      const resolved = resolveMatch(label, `${prefix}-${roundIndex + 1}-${index / 2 + 1}`, teamA, teamB, index / 2);
      matches.push(resolved.match);
      if (resolved.winner) {
        nextTeams.push(resolved.winner);
      }
    }

    rounds.push({ name: label, matches });
    currentTeams = nextTeams;
    roundIndex += 1;
  }

  return rounds;
};

const isPowerOfTwo = (value: number) => value > 0 && (value & (value - 1)) === 0;

const getPreviousPowerOfTwo = (value: number) => {
  let power = 1;
  while (power * 2 < value) {
    power *= 2;
  }
  return power;
};

const getNextStageSize = (currentSize: number) => {
  if (currentSize <= 4) return 2;
  if (isPowerOfTwo(currentSize)) return currentSize / 2;
  return getPreviousPowerOfTwo(currentSize);
};

const getRoundLabel = (currentSize: number) => {
  if (currentSize === 4) return 'Semi';
  if (currentSize === 8) return 'Quartas';
  return String(currentSize);
};

const resolveMatch = (round: string, id: string, teamA: Team | null, teamB: Team | null, index: number) => {
  if (!teamA || !teamB) {
    return {
      match: {
        id,
        round,
        teamA,
        teamB,
        status: 'scheduled' as const,
      },
      winner: teamA ?? teamB,
      loser: teamA ? teamB : teamA,
    };
  }

  const teamAWins = index % 3 !== 1;
  const scoreA = teamAWins ? 18 : 15;
  const scoreB = teamAWins ? 14 : 18;

  return {
    match: {
      id,
      round,
      teamA,
      teamB,
      scoreA,
      scoreB,
      status: 'finished' as const,
    },
    winner: (teamAWins ? teamA : teamB) as Team,
    loser: (teamAWins ? teamB : teamA) as Team,
  };
};

const getQualifiedTeams = (rounds: BracketRounds): Team[] => {
  const lastRound = rounds[rounds.length - 1];
  if (!lastRound) return [];
  return lastRound.matches.flatMap((match) => {
    const teamAWins = (match.scoreA ?? 0) >= (match.scoreB ?? 0);
    return [teamAWins ? match.teamA : match.teamB].filter(Boolean) as Team[];
  });
};

const buildFinalsBracket = (winnerQualified: Team[], loserQualified: Team[]): FinalsRounds => {
  const semifinalOne = resolveMatch('Semi', 'finals-semi-1', winnerQualified[0] ?? null, loserQualified[1] ?? null, 0);
  const semifinalTwo = resolveMatch('Semi', 'finals-semi-2', winnerQualified[1] ?? null, loserQualified[0] ?? null, 1);
  const finalMatch = {
    id: 'finals-final',
    round: 'Final',
    teamA: semifinalOne.winner,
    teamB: semifinalTwo.winner,
    scoreA: 1,
    scoreB: 1,
    status: 'live' as const,
  };
  const thirdPlace = resolveMatch('Disputa de 3º Lugar', 'finals-third', semifinalOne.loser, semifinalTwo.loser, 0);

  return [
    {
      name: 'Semi',
      matches: [semifinalOne.match, semifinalTwo.match],
    },
    {
      name: 'Final',
      matches: [finalMatch],
    },
    {
      name: 'Disputa de 3º Lugar',
      matches: [thirdPlace.match],
    },
  ];
};

export default ChampionshipDetail;
