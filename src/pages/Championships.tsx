import { CHAMPIONSHIPS } from '@/data/mock';
import { ChampionshipCard } from '@/components/ChampionshipCard';
import { useLanguage } from '@/i18n';

const Championships = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-7xl">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-neon-cyan font-bold mb-1">{t('allCompetitions')}</p>
        <h1 className="font-display font-black text-4xl"><span className="neon-text">{t('championships')}</span></h1>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CHAMPIONSHIPS.map(c => <ChampionshipCard key={c.id} c={c} />)}
      </div>
    </div>
  );
};

export default Championships;
