import { Trophy, Flame, Calendar } from 'lucide-react';
import { CHAMPIONSHIPS, SPORTS } from '@/data/mock';
import { ChampionshipCard } from '@/components/ChampionshipCard';
import { SportIcon } from '@/components/SportIcon';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';

const Championships = () => {
  const { t, sportName } = useLanguage();
  const { currentUser } = useSession();
  const preferred = CHAMPIONSHIPS.filter((championship) => currentUser.preferences.includes(championship.sport));
  const live = preferred.filter((championship) => championship.status === 'live');
  const upcoming = preferred.filter((championship) => championship.status === 'upcoming');
  const others = CHAMPIONSHIPS.filter((championship) => !currentUser.preferences.includes(championship.sport));

  return (
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-10 xl:max-w-[min(116rem,calc(100vw-3rem))]">
      <section>
        <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('championships')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentUser.preferences.map((preference) => {
              const sport = SPORTS.find((item) => item.id === preference);
              if (!sport) return null;

              return (
                <span key={preference} className="flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-bold leading-none">
                  <SportIcon sportId={sport.id} className="h-3.5 w-3.5 translate-y-[0.5px]" />
                  <span className="translate-y-[0.5px] leading-none">{sportName(sport.id)}</span>
                </span>
              );
            })}
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{t('tournamentsTailored')}</p>
      </section>

      <Stats live={live.length} upcoming={upcoming.length} mySports={currentUser.preferences.length} />

      {live.length > 0 ? (
        <Section title={t('featuredTournaments')} label={t('liveNow')} icon={<Flame className="h-4 w-4 text-live" />} accent>
          <Grid items={live} />
        </Section>
      ) : null}

      {upcoming.length > 0 ? (
        <Section title={t('nextStops')} label={t('upcomingForYou')} icon={<Calendar className="h-4 w-4 text-neon-cyan" />}>
          <Grid items={upcoming} />
        </Section>
      ) : null}

      <Section title={t('expandArena')} label={t('discoverOtherSports')} icon={<Trophy className="h-4 w-4 text-neon-pink" />}>
        <Grid items={others} />
      </Section>
    </div>
  );
};

const Stats = ({ live, upcoming, mySports }: { live: number; upcoming: number; mySports: number }) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {[
        { label: t('liveNow'), value: live, color: 'text-live' },
        { label: t('upcoming'), value: upcoming, color: 'text-neon-cyan' },
        { label: t('mySports'), value: mySports, color: 'text-neon-pink' },
        { label: t('reservations'), value: 3, color: 'text-primary-glow' },
      ].map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border bg-gradient-card p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
          <div className={`mt-1 font-display text-3xl font-black ${stat.color}`}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
};

const Section = ({
  title,
  label,
  icon,
  children,
  accent = false,
}: {
  title: string;
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accent?: boolean;
}) => (
  <section>
    <div className="mb-4 flex items-center gap-2">
      {icon}
      <h2 className={`font-display text-sm font-bold uppercase tracking-[0.2em] ${accent ? 'text-live' : 'text-foreground'}`}>{label}</h2>
      <div className="ml-2 h-px flex-1 bg-border" />
    </div>
    <div className="mb-4 text-sm text-muted-foreground">{title}</div>
    {children}
  </section>
);

const Grid = ({ items }: { items: typeof CHAMPIONSHIPS }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    {items.map((championship) => <ChampionshipCard key={championship.id} c={championship} />)}
  </div>
);

export default Championships;
