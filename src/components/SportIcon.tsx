import { useId } from 'react';
import type { SportId } from '@/types';

type Props = {
  sportId: SportId;
  className?: string;
};

export const SportIcon = ({ sportId, className = 'h-4 w-4' }: Props) => {
  const iconId = useId().replace(/:/g, '');
  const footvolleyGradientId = `footvolley-ball-fill-${iconId}`;
  const tennisGradientId = `tennis-ball-fill-${iconId}`;
  const volleyballGradientId = `volleyball-fill-${iconId}`;

  if (sportId === 'footvolley') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} block shrink-0 align-middle overflow-hidden`}>
        <defs>
          <radialGradient id={footvolleyGradientId} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffe666" />
            <stop offset="55%" stopColor="#ffd329" />
            <stop offset="100%" stopColor="#e7b900" />
          </radialGradient>
        </defs>
        <circle cx="12" cy="12" r="10" fill={`url(#${footvolleyGradientId})`} stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
        <path d="M12 2.4 15.4 8 12 12.4 8.6 8z" fill="#141414" />
        <path d="M21.2 8.5 15.7 8.2 12.3 12.5 15.7 16.8z" fill="#141414" />
        <path d="M8.2 15.8 12 12.4 15.8 16.1 12 21.3z" fill="#141414" />
        <path d="M2.8 8.8 8.2 8.1 11.5 12.3 8.2 16.1z" fill="#141414" />
        <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="0.8" />
      </svg>
    );
  }

  if (sportId === 'beach-tennis') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} block shrink-0 align-middle overflow-hidden`}>
        <defs>
          <radialGradient id={tennisGradientId} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#efff75" />
            <stop offset="65%" stopColor="#d9f127" />
            <stop offset="100%" stopColor="#b1cb08" />
          </radialGradient>
        </defs>
        <circle cx="12" cy="12" r="10" fill={`url(#${tennisGradientId})`} stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
        <path d="M7.6 3.6c2.9 2.5 3.8 5.1 3.8 8.4s-.9 5.9-3.8 8.4" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16.4 3.6c-2.9 2.5-3.8 5.1-3.8 8.4s.9 5.9 3.8 8.4" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (sportId === 'beach-soccer') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} block shrink-0 align-middle overflow-hidden`}>
        <defs>
          <radialGradient id={`football-fill-${iconId}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="72%" stopColor="#eef1f6" />
            <stop offset="100%" stopColor="#d3d9e4" />
          </radialGradient>
        </defs>
        <circle cx="12" cy="12" r="10" fill={`url(#football-fill-${iconId})`} stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" />
        <path d="M12 6.9 14.85 8.9 13.76 12.24h-3.52L9.15 8.9z" fill="#161616" />
        <path d="M9.15 8.9 5.78 10.24l.74 3.69 3.72-1.69z" fill="#161616" />
        <path d="M14.85 8.9 18.22 10.24l-.74 3.69-3.72-1.69z" fill="#161616" />
        <path d="M10.24 12.24 6.52 13.93 9.2 17.15h5.6l2.68-3.22-3.72-1.69z" fill="#161616" />
        <path d="M8.1 5.9c-.9 1.15-1.5 2.33-1.78 3.53M15.9 5.9c.9 1.15 1.5 2.33 1.78 3.53M4.95 14.25c.72 1.73 1.83 3.07 3.3 4.04M19.05 14.25c-.72 1.73-1.83 3.07-3.3 4.04" fill="none" stroke="rgba(22,22,22,0.82)" strokeWidth="1" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} block shrink-0 align-middle overflow-hidden`}>
      <defs>
        <radialGradient id={volleyballGradientId} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f1f4fb" />
          <stop offset="70%" stopColor="#d9dee9" />
          <stop offset="100%" stopColor="#b7c0cf" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill={`url(#${volleyballGradientId})`} stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" />
      <path d="M6.5 5.8c2.6.9 4.8 2.9 6.4 6.2 1.5 3.1 1.9 6.2 1.4 8.3" fill="none" stroke="rgba(129,141,161,0.9)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M16.7 4.8c-2.8 1.6-4.8 3.7-6 6.4-1.4 3-1.8 5.8-1.3 8.1" fill="none" stroke="rgba(129,141,161,0.9)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4.4 12.2c2.3-1.1 5.2-1.6 8.8-1.3 2.8.2 5 .9 6.5 1.9" fill="none" stroke="rgba(129,141,161,0.9)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
};
