import { CHAMPIONSHIPS } from '@/data/mock';
import { ChampionshipCard } from '@/components/ChampionshipCard';
import { useLanguage } from '@/i18n';

const Championships = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-7xl">
      <header>
        <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('championships')}</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CHAMPIONSHIPS.map(c => <ChampionshipCard key={c.id} c={c} />)}
      </div>
    </div>
  );
};

export default Championships;
