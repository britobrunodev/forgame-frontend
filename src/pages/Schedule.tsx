import { useLanguage } from '@/i18n';

const Schedule = () => {
  const { t } = useLanguage();

  return (
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] xl:max-w-[min(116rem,calc(100vw-3rem))]">
      <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('scheduleTitle')}</p>
      <p className="mb-6 mt-3 text-sm text-muted-foreground">{t('scheduleDescription')}</p>
      <div className="rounded-2xl border border-border bg-gradient-card p-10 text-center text-muted-foreground">
        {t('scheduleEmpty')}
      </div>
    </div>
  );
};

export default Schedule;
