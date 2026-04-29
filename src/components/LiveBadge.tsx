import { useLanguage } from '@/i18n';

interface Props {
  className?: string;
  status?: 'scheduled' | 'upcoming' | 'live' | 'finished';
}

export const LiveBadge = ({ className = '', status = 'live' }: Props) => {
  const { t } = useLanguage();
  const labelKey = status === 'finished' ? 'final' : status === 'live' ? 'inProgress' : 'notStarted';
  const toneClass =
    status === 'finished'
      ? 'text-neon-cyan'
      : status === 'live'
        ? 'text-lime-400 animate-status-pulse'
        : 'text-muted-foreground';

  return (
    <span
      aria-label={t(labelKey)}
      title={t(labelKey)}
      className={`font-display text-[10px] font-bold uppercase tracking-wider ${toneClass} ${className}`}
    >
      {t(labelKey)}
    </span>
  );
};
