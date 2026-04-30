import { useParams } from 'react-router-dom';
import { CHAMPIONSHIPS, SPORTS, RESERVATION_PLACES } from '@/data/mock';
import { ChampionshipCard } from '@/components/ChampionshipCard';
import { PlaceCard } from '@/components/PlaceCard';
import { SportIcon } from '@/components/SportIcon';
import { useLanguage } from '@/i18n';

const SportPage = () => {
  const { t, sportName } = useLanguage();
  const { sportId } = useParams();
  const sport = SPORTS.find(s => s.id === sportId);
  if (!sport) return <div>{t('sportNotFound')}</div>;
  const champs = CHAMPIONSHIPS.filter(c => c.sport === sport.id);
  const places = RESERVATION_PLACES.filter(p => p.sports.includes(sport.id));

  return (
    <div className="space-y-10 max-w-7xl">
      <header>
        <div className="mb-2 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">
          <SportIcon sportId={sport.id} className="h-4 w-4 translate-y-[0.5px]" />
          <span>{sportName(sport.id)}</span>
        </div>
      </header>

      <section>
        <h2 className="font-display font-bold text-sm uppercase tracking-[0.2em] text-foreground mb-4">{t('championships')}</h2>
        {champs.length === 0 ? (
          <div className="text-muted-foreground text-sm rounded-xl border border-border bg-gradient-card p-8 text-center">
            {t('noChampionshipsYet')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {champs.map(c => <ChampionshipCard key={c.id} c={c} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display font-bold text-sm uppercase tracking-[0.2em] text-foreground mb-4">{t('whereToPlay')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map(p => <PlaceCard key={p.id} p={p} />)}
        </div>
      </section>
    </div>
  );
};

export default SportPage;
