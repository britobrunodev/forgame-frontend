import { useState } from 'react';
import { MapPin, BookOpen, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PlaceCard } from '@/components/PlaceCard';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { sportComplexApi } from '@/lib/api';
import type { ReservationPlace } from '@/types';
import ClassSchedule from './ClassSchedule';

const Reservations = () => {
  const { t } = useLanguage();
  const { token } = useSession();
  const [tab, setTab] = useState<'quadras' | 'aulas'>('quadras');
  const [page, setPage] = useState(1);
  const perPage = 12;

  const { data, isLoading } = useQuery({
    queryKey: ['sport-complexes-public', page],
    queryFn: () => sportComplexApi.listAll(token!, page, perPage),
    enabled: !!token,
  });
  const complexes = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;

  const places: ReservationPlace[] = complexes.map((c) => ({
    id: c.id,
    name: c.name,
    city: c.city ?? '',
    sports: [],
    courts: 0,
    rating: 0,
    image: c.image_url ?? undefined,
    imageOffsetY: c.image_offset_y ?? 0,
    country: c.country ?? undefined,
    active: c.is_active,
  }));

  return (
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-6 xl:max-w-[min(116rem,calc(100vw-3rem))]">
      <header>
        <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('reservations')}</p>
        <p className="mt-3 text-sm text-muted-foreground">{t('findArenasAndReserve')}</p>
      </header>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('quadras')}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold uppercase tracking-[0.15em] transition-smooth ${
            tab === 'quadras'
              ? 'border-primary/35 bg-primary/10 text-primary-glow shadow-[0_0_14px_hsl(var(--primary)/0.18)]'
              : 'border-border bg-background/35 text-muted-foreground hover:border-primary/25 hover:text-foreground'
          }`}
        >
          <MapPin className="h-4 w-4" />
          {t('courtManagement')}
        </button>
        <button
          type="button"
          onClick={() => setTab('aulas')}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold uppercase tracking-[0.15em] transition-smooth ${
            tab === 'aulas'
              ? 'border-primary/35 bg-primary/10 text-primary-glow shadow-[0_0_14px_hsl(var(--primary)/0.18)]'
              : 'border-border bg-background/35 text-muted-foreground hover:border-primary/25 hover:text-foreground'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          {t('classes')}
        </button>
      </div>

      {tab === 'quadras' ? (
        isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : places.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/40 py-16 text-center">
            <MapPin className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-semibold text-muted-foreground">Nenhum complexo encontrado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {places.map((p) => <PlaceCard key={p.id} p={p} />)}
            </div>
            {totalPages > 1 ? (
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-sm font-semibold text-muted-foreground transition-smooth hover:border-primary/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>
                <span className="text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-sm font-semibold text-muted-foreground transition-smooth hover:border-primary/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        )
      ) : (
        <ClassSchedule embedded />
      )}
    </div>
  );
};

export default Reservations;
