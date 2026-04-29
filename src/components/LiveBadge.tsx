import { useLanguage } from '@/i18n';

interface Props {
  className?: string;
}

export const LiveBadge = ({ className = '' }: Props) => {
  const { t } = useLanguage();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-live/15 border border-live/40 text-live text-xs font-bold uppercase tracking-wider ${className}`}>
      <span className="live-dot" />
      {t('live')}
    </span>
  );
};
