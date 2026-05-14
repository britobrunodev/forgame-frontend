import { useMemo, useState } from 'react';
import { Trophy, Flame, Calendar, Loader2, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ChampionshipCard } from '@/components/ChampionshipCard';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { championshipApi } from '@/lib/api';
import { formatUtcDate } from '@/lib/datetime';
import type { SportId } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Championships = () => {
  const { t, sportName, language } = useLanguage();
  const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
  const { currentUser, token } = useSession();
  const [selectedSport, setSelectedSport] = useState<'all' | string>('all');

  const { data: sports = [] } = useQuery({
    queryKey: ['championship-sports'],
    queryFn: () => championshipApi.listSports(token!),
    enabled: !!token,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['championships-public'],
    queryFn: () => championshipApi.list(token!, 1, 100),
    enabled: !!token,
  });

  const sportsById = useMemo(
    () => new Map(sports.map((sport) => [sport.id, sport])),
    [sports],
  );

  const championships = (data?.items ?? []).map((championship) => ({
    sportSlug: championship.sport_id != null ? sportsById.get(championship.sport_id)?.slug ?? null : null,
    id: String(championship.id),
    name: championship.name,
    sport: championship.sport_id != null ? mapSportSlug(sportsById.get(championship.sport_id)?.slug ?? null) : null,
    location: championship.complex_name ?? championship.complex_city ?? '-',
    startDate: formatUtcDate(championship.start_at, championship.timezone, locale),
    endDate: formatUtcDate(championship.end_at, championship.timezone, locale),
    teamsCount: championship.bracket_size ?? 0,
    status: mapChampionshipStatus(championship.status),
    image: championship.image_url ?? undefined,
    imageOffsetX: championship.image_offset_x ?? 0,
    imageOffsetY: championship.image_offset_y ?? 0,
    imageZoom: championship.image_zoom ?? 1,
    youtubeUrl: championship.transmission_url ?? undefined,
    addressUrl: championship.address_url ?? undefined,
  }))
    .filter((championship) => championship.status !== 'draft');

  const filteredChampionships = useMemo(
    () => championships.filter((championship) => selectedSport === 'all' || championship.sportSlug === selectedSport),
    [championships, selectedSport],
  );

  const live = filteredChampionships.filter((championship) => championship.status === 'live');
  const open = filteredChampionships.filter((championship) => championship.status === 'open');
  const closed = filteredChampionships.filter((championship) => championship.status === 'closed');

  return (
    <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))] space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-[#39E600]">{t('championships')}</p>
          <p className="mt-3 text-sm text-muted-foreground">{t('allChampionships')}</p>
        </div>
        <div className="w-full max-w-xs">
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="border-border bg-secondary/70 text-sm font-semibold">
              <SelectValue placeholder={t('allSports')} />
            </SelectTrigger>
            <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
              <SelectItem value="all">{t('allSports')}</SelectItem>
              {sports.map((sport) => (
                <SelectItem key={sport.id} value={sport.slug}>
                  {mapSportSlug(sport.slug) ? sportName(mapSportSlug(sport.slug)!) : sport.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <p className="text-sm font-semibold text-muted-foreground">
            {error instanceof Error ? error.message : t('googleAuthError')}
          </p>
        </div>
      ) : championships.length === 0 ? (
        <div className="p-10 text-center">
          <Trophy className="mx-auto h-10 w-10 text-muted-foreground/30" />
        </div>
      ) : (
        <>
          <Stats live={live.length} open={open.length} closed={closed.length} />

          {live.length > 0 ? (
            <Section title={t('featuredTournaments')} label={t('liveNow')} icon={<Flame className="h-4 w-4 text-live" />} accent>
              <Grid items={live} />
            </Section>
          ) : null}

          {open.length > 0 ? (
            <Section title={t('openRegistrationsDescription')} label={t('openRegistrations')} icon={<Calendar className="h-4 w-4 text-neon-cyan" />}>
              <Grid items={open} />
            </Section>
          ) : null}

          {closed.length > 0 ? (
            <Section title={t('closedRegistrationsDescription')} label={t('closedRegistrations')} icon={<Lock className="h-4 w-4 text-neon-pink" />}>
              <Grid items={closed} />
            </Section>
          ) : null}
        </>
      )}
    </div>
  );
};

const mapSportSlug = (slug: string | null | undefined): SportId | null => {
  if (slug === 'footvolley') return 'footvolley';
  if (slug === 'beach-tennis') return 'beach-tennis';
  if (slug === 'volleyball') return 'volleyball';
  return null;
};

const mapChampionshipStatus = (status: string): 'draft' | 'open' | 'live' | 'closed' | 'finished' => {
  if (status === 'live' || status === 'running') return 'live';
  if (status === 'open') return 'open';
  if (status === 'subscription_ended' || status === 'closed') return 'closed';
  if (status === 'ended' || status === 'finished') return 'finished';
  return 'draft';
};


const Stats = ({ live, open, closed }: { live: number; open: number; closed: number }) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {[
        { label: t('liveNow'), value: live, color: 'text-live' },
        { label: t('openRegistrations'), value: open, color: 'text-neon-cyan' },
        { label: t('closedRegistrations'), value: closed, color: 'text-neon-pink' },
        { label: t('championships'), value: live + open + closed, color: 'text-primary-glow' },
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

const Grid = ({ items }: { items: Array<{
  id: string;
  name: string;
  sportSlug?: string | null;
  sport?: SportId | null;
  location: string;
  startDate: string;
  endDate: string;
  teamsCount: number;
  status: 'draft' | 'open' | 'live' | 'closed' | 'finished';
  image?: string;
  imageOffsetX?: number;
  imageOffsetY?: number;
  imageZoom?: number;
  youtubeUrl?: string;
  addressUrl?: string;
}> }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {items.map((championship) => <ChampionshipCard key={championship.id} c={championship} />)}
  </div>
);

export default Championships;
