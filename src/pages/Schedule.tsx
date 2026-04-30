import { useLanguage } from '@/i18n';

const Schedule = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl">
      <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('scheduleTitle')}</p>
      <p className="mb-6 mt-3 text-sm text-muted-foreground">{t('scheduleDescription')}</p>
      <div className="rounded-2xl border border-border bg-gradient-card p-10 text-center text-muted-foreground">
        {t('scheduleEmpty')}
      </div>
    </div>
  );
};

export default Schedule;
