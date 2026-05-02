type Props = {
  url?: string;
  compact?: boolean;
  className?: string;
};

export const YouTubeButton = ({ url, compact = false, className = '' }: Props) => {
  const sharedClasses = compact ? 'h-8 w-8' : 'h-10 w-10';
  const iconSize = compact ? 'h-4 w-4' : 'h-5 w-5';
  const icon = (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={iconSize}>
      <path
        fill="currentColor"
        d="M23.5 6.2a3.05 3.05 0 0 0-2.14-2.16C19.48 3.5 12 3.5 12 3.5s-7.48 0-9.36.54A3.05 3.05 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3.05 3.05 0 0 0 2.14 2.16C4.52 20.5 12 20.5 12 20.5s7.48 0 9.36-.54a3.05 3.05 0 0 0 2.14-2.16A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.6 15.78V8.22L16.1 12 9.6 15.78Z"
      />
    </svg>
  );

  if (!url) {
    return (
      <span
        aria-disabled="true"
        title="YouTube"
        className={`inline-flex items-center justify-center rounded-lg border border-live/18 bg-live/8 text-live/35 ${sharedClasses} ${className}`}
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
      aria-label="YouTube"
      title="YouTube"
      className={`inline-flex items-center justify-center rounded-lg border border-live/45 bg-live/14 text-live transition-smooth hover:bg-live/22 hover:shadow-[0_0_14px_hsl(var(--live)/0.16)] ${sharedClasses} ${className}`}
    >
      {icon}
    </a>
  );
};
