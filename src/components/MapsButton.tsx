type Props = {
  url?: string;
  className?: string;
  compact?: boolean;
};

export const MapsButton = ({ url, className = '', compact = false }: Props) => {
  const sharedClasses = compact ? 'h-8 w-8' : 'h-10 w-10';
  const iconSize = compact ? 'h-[18px] w-[18px]' : 'h-[22px] w-[22px]';
  const icon = (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={iconSize}>
      <path
        fill="currentColor"
        d="M12 2.5a6.75 6.75 0 0 0-6.75 6.75c0 4.74 6.75 12.25 6.75 12.25s6.75-7.51 6.75-12.25A6.75 6.75 0 0 0 12 2.5Zm0 9.4a2.65 2.65 0 1 1 0-5.3 2.65 2.65 0 0 1 0 5.3Z"
      />
    </svg>
  );

  if (!url) {
    return (
      <span
        aria-disabled="true"
        title="Google Maps"
        className={`inline-flex items-center justify-center rounded-lg border border-neon-cyan/18 bg-neon-cyan/8 text-neon-cyan/35 ${sharedClasses} ${className}`}
      >
        {icon}
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Google Maps"
      title="Google Maps"
      className={`inline-flex items-center justify-center rounded-lg border border-neon-cyan/40 bg-neon-cyan/12 text-neon-cyan transition-smooth hover:bg-neon-cyan/18 hover:shadow-[0_0_14px_hsl(var(--neon-cyan)/0.14)] ${sharedClasses} ${className}`}
    >
      {icon}
    </a>
  );
};
