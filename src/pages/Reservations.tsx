import { useState } from 'react';
import { MapPin, Loader2, Star, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PlaceCard } from '@/components/PlaceCard';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { sportComplexApi, usersApi } from '@/lib/api';
import type { ReservationPlace } from '@/types';
import type { ReactNode } from 'react';

const Reservations = () => {
  const { t } = useLanguage();
  const { token } = useSession();
  const [search, setSearch] = useState('');

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => usersApi.getProfile(token!),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
  });

  const preferredIds = profile?.preferred_complexes ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ['complexes-public'],
    queryFn: () => sportComplexApi.listAll(token!, 1, 50),
    enabled: !!token,
  });

  const allComplexes = data?.items ?? [];

  const toPlace = (c: (typeof allComplexes)[number]): ReservationPlace => ({
    id: c.id,
    name: c.name,
    city: c.city ?? '',
    sports: (c.available_sports ?? []) as ReservationPlace['sports'],
    courts: 0,
    rating: 0,
    image: c.image_url ?? undefined,
    imageOffsetX: c.image_offset_x ?? 0,
    imageOffsetY: c.image_offset_y ?? 0,
    imageZoom: c.image_zoom ?? 1,
    country: c.country ?? undefined,
    active: c.is_active,
  });

  const needle = search.trim().toLowerCase();
  const matchesSearch = (c: (typeof allComplexes)[number]) =>
    !needle || c.name.toLowerCase().includes(needle) || (c.city ?? '').toLowerCase().includes(needle);

  const favoritePlaces = allComplexes.filter((c) => preferredIds.includes(c.id) && matchesSearch(c)).map(toPlace);
  const discoverPlaces = allComplexes.filter((c) => !preferredIds.includes(c.id) && matchesSearch(c)).slice(0, 10).map(toPlace);
  const noResults = needle && favoritePlaces.length === 0 && discoverPlaces.length === 0;

  return (
    <div className="mx-auto w-full max-w-[min(72rem,calc(100vw-2rem))] space-y-6">
      <header>
        <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('reservations')}</p>
        <p className="mt-3 text-sm text-muted-foreground">{t('findArenasAndReserve')}</p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar complexo ou cidade…"
          className="w-full rounded-xl border border-border bg-background/60 py-2.5 pl-10 pr-4 text-sm transition-smooth focus:border-primary focus:outline-none focus:shadow-glow"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : allComplexes.length === 0 || noResults ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/40 py-16 text-center">
          <MapPin className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-semibold text-muted-foreground">
            {noResults ? 'Nenhum complexo encontrado para essa busca.' : 'Nenhum complexo encontrado.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {favoritePlaces.length > 0 && (
            <section className="space-y-4">
              <SectionLabel icon={<Star className="h-3.5 w-3.5 fill-neon-cyan text-neon-cyan" />}>
                {t('favoriteComplexes')}
              </SectionLabel>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {favoritePlaces.map((p) => <PlaceCard key={p.id} p={p} />)}
              </div>
            </section>
          )}

          {discoverPlaces.length > 0 && (
            <section className="space-y-4">
              <SectionLabel icon={<MapPin className="h-3.5 w-3.5 text-muted-foreground" />}>
                {t('discoverComplexes')}
              </SectionLabel>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {discoverPlaces.map((p) => <PlaceCard key={p.id} p={p} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

const SectionLabel = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <div className="flex items-center gap-2">
    {icon}
    <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
      {children}
    </span>
  </div>
);

export default Reservations;
