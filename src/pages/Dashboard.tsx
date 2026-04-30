import { CHAMPIONSHIPS, SPORTS } from '@/data/mock';
import { ChampionshipCard } from '@/components/ChampionshipCard';
import { SportIcon } from '@/components/SportIcon';
import { Trophy, Flame, Calendar } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';

const Dashboard = () => {
  const { t, sportName } = useLanguage();
  const { currentUser } = useSession();
  const preferred = CHAMPIONSHIPS.filter(c => currentUser.preferences.includes(c.sport));
  const live = preferred.filter(c => c.status === 'live');
  const upcoming = preferred.filter(c => c.status === 'upcoming');
  const others = CHAMPIONSHIPS.filter(c => !currentUser.preferences.includes(c.sport));

  return (
    <div className="space-y-10 max-w-7xl">
      <section>
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neon-cyan font-bold mb-1">{t('welcomeBack')}</p>
            <h1 className="font-display font-black text-3xl lg:text-4xl">
              {t('hey')}, <span className="neon-text">{currentUser.name.split(' ')[0]}</span>
            </h1>
          </div>
          <div className="hidden sm:flex gap-2">
            {currentUser.preferences.map(p => {
              const s = SPORTS.find(x => x.id === p)!;
              return (
                <span key={p} className="px-2.5 py-1 rounded-full bg-secondary border border-border text-xs font-bold flex items-center gap-1 leading-none">
                  <SportIcon sportId={s.id} className="h-3.5 w-3.5 translate-y-[0.5px]" />
                  <span className="translate-y-[0.5px] leading-none">{sportName(s.id)}</span>
                </span>
              );
            })}
          </div>
        </div>
        <p className="text-muted-foreground text-sm">{t('tournamentsTailored')}</p>
      </section>

      <Stats live={live.length} upcoming={upcoming.length} mySports={currentUser.preferences.length} />

      {live.length > 0 && (
        <Section title={t('featuredTournaments')} label={t('liveNow')} icon={<Flame className="w-4 h-4 text-live" />} accent>
          <Grid items={live} />
        </Section>
      )}

      {upcoming.length > 0 && (
        <Section title={t('nextStops')} label={t('upcomingForYou')} icon={<Calendar className="w-4 h-4 text-neon-cyan" />}>
          <Grid items={upcoming} />
        </Section>
      )}

      <Section title={t('expandArena')} label={t('discoverOtherSports')} icon={<Trophy className="w-4 h-4 text-neon-pink" />}>
        <Grid items={others} />
      </Section>
    </div>
  );
};

const Stats = ({ live, upcoming, mySports }: { live: number; upcoming: number; mySports: number }) => {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: t('liveNow'), value: live, color: 'text-live' },
        { label: t('upcoming'), value: upcoming, color: 'text-neon-cyan' },
        { label: t('mySports'), value: mySports, color: 'text-neon-pink' },
        { label: t('reservations'), value: 3, color: 'text-primary-glow' },
      ].map(s => (
        <div key={s.label} className="rounded-xl border border-border bg-gradient-card p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{s.label}</div>
          <div className={`font-display font-black text-3xl mt-1 ${s.color}`}>{s.value}</div>
        </div>
      ))}
    </div>
  );
};

const Section = ({ title, label, icon, children, accent }: { title: string; label: string; icon: React.ReactNode; children: React.ReactNode; accent?: boolean }) => (
  <section>
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h2 className={`font-display font-bold text-sm uppercase tracking-[0.2em] ${accent ? 'text-live' : 'text-foreground'}`}>{label}</h2>
      <div className="flex-1 h-px bg-border ml-2" />
    </div>
    <div className="mb-4 text-sm text-muted-foreground">{title}</div>
    {children}
  </section>
);

const Grid = ({ items }: { items: any[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {items.map(c => <ChampionshipCard key={c.id} c={c} />)}
  </div>
);

export default Dashboard;
