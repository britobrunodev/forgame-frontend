import { RESERVATION_PLACES } from '@/data/mock';
import { PlaceCard } from '@/components/PlaceCard';
import { useLanguage } from '@/i18n';

const Reservations = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-7xl">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-neon-cyan font-bold mb-1">{t('bookACourt')}</p>
        <h1 className="font-display font-black text-4xl"><span className="neon-text">{t('reservations')}</span></h1>
        <p className="text-muted-foreground text-sm mt-2">{t('findArenasAndReserve')}</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {RESERVATION_PLACES.map(p => <PlaceCard key={p.id} p={p} />)}
      </div>
    </div>
  );
};

export default Reservations;
