import { useLanguage } from '@/i18n';

const Schedule = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display font-black text-4xl mb-2"><span className="neon-text">{t('scheduleTitle')}</span></h1>
      <p className="text-muted-foreground text-sm mb-6">{t('scheduleDescription')}</p>
      <div className="rounded-2xl border border-border bg-gradient-card p-10 text-center text-muted-foreground">
        {t('scheduleEmpty')}
      </div>
    </div>
  );
};

export default Schedule;
