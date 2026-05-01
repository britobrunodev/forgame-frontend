import { useState } from 'react';
import { MapPin, BookOpen } from 'lucide-react';
import { RESERVATION_PLACES } from '@/data/mock';
import { PlaceCard } from '@/components/PlaceCard';
import { useLanguage } from '@/i18n';
import ClassSchedule from './ClassSchedule';

const Reservations = () => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'quadras' | 'aulas'>('quadras');

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {RESERVATION_PLACES.map(p => <PlaceCard key={p.id} p={p} />)}
        </div>
      ) : (
        <ClassSchedule embedded />
      )}
    </div>
  );
};

export default Reservations;
