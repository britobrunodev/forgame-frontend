import { RESERVATION_PLACES } from '@/data/mock';
import { PlaceCard } from '@/components/PlaceCard';
import { useLanguage } from '@/i18n';

const Reservations = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-7xl">
      <header>
        <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('reservations')}</p>
        <p className="mt-3 text-sm text-muted-foreground">{t('findArenasAndReserve')}</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {RESERVATION_PLACES.map(p => <PlaceCard key={p.id} p={p} />)}
      </div>
    </div>
  );
};

export default Reservations;
