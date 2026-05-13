import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Trophy } from 'lucide-react';
import { SportIcon } from './SportIcon';
import { MapsButton } from './MapsButton';
import { YouTubeButton } from './YouTubeButton';
import { PositionedCoverImage } from './PositionedCoverImage';
import { SPORTS } from '@/data/mock';
import { useLanguage } from '@/i18n';
import type { SportId } from '@/types';

type ChampionshipCardData = {
  id: string;
  name: string;
  sport?: SportId | null;
  location: string;
  startDate: string;
  endDate: string;
  teamsCount: number;
  status: 'draft' | 'open' | 'live' | 'closed' | 'finished';
  image?: string;
  imageOffsetX?: number;
  imageOffsetY?: number;
  imageZoom?: number;
  prize?: string;
  youtubeUrl?: string;
  addressUrl?: string;
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  live:     { label: 'Ao vivo',               className: 'border-lime-300/70 bg-lime-400/22 text-lime-100 shadow-[0_0_14px_rgba(163,230,53,0.16)] animate-status-pulse' },
  open:     { label: 'Inscrições abertas',    className: 'border-neon-cyan/70 bg-neon-cyan/22 text-white shadow-[0_0_14px_hsl(var(--neon-cyan)/0.16)]' },
  closed:   { label: 'Inscrições encerradas', className: 'border-neon-pink/65 bg-neon-pink/22 text-white shadow-[0_0_14px_hsl(var(--neon-pink)/0.14)]' },
  finished: { label: 'Finalizado',            className: 'border-white/18 bg-black/72 text-white/88' },
  draft:    { label: 'Rascunho',              className: 'border-white/18 bg-black/72 text-white/88' },
};

const Overlay = ({
  c,
  badge,
  sport,
  isOpen,
  isLive,
  onRegister,
}: {
  c: ChampionshipCardData;
  badge: { label: string; className: string };
  sport: ReturnType<typeof SPORTS.find>;
  isOpen: boolean;
  isLive: boolean;
  onRegister: (e: React.MouseEvent) => void;
}) => {
  const { t, sportName } = useLanguage();
  return (
    <>
      {/* Gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          height: '50%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.94) 25%, rgba(0,0,0,0.7) 60%, transparent 100%)',
        }}
      />

      {/* Status badge — top right */}
      <div className="absolute right-3 top-3">
        <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-md ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {/* Sport badge — top left */}
      <div className="absolute left-3 top-3">
        <span className="inline-flex items-center gap-1 rounded-md border border-white/18 bg-black/72 px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.16em] text-white backdrop-blur-md shadow-[0_10px_24px_-18px_rgba(0,0,0,0.9)]">
          {sport && sport.id !== 'footvolley' && <SportIcon sportId={sport.id} className="h-3.5 w-3.5 translate-y-[0.5px]" />}
          <span className="translate-y-[0.5px] leading-none">{sport ? sportName(sport.id) : t('championships')}</span>
        </span>
      </div>

      {/* Name + meta — flush to bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-2 sm:px-4 sm:pb-2.5">
        <h3 className="line-clamp-2 font-display text-sm font-bold leading-tight text-white drop-shadow transition-smooth sm:text-base">
          {c.name}
        </h3>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-col">
            {c.location && c.location !== '-' && (
              <div className="flex items-center gap-1 text-[13px] text-white/65">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{c.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-[13px] text-white/65">
              <Calendar className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {c.startDate}{c.endDate && c.endDate !== c.startDate ? ` → ${c.endDate}` : ''}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <MapsButton url={c.addressUrl} compact />
            {isOpen && (
              <button
                type="button"
                onClick={onRegister}
                title={t('register')}
                aria-label={t('register')}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/50 bg-primary/20 text-primary-glow shadow-[0_0_10px_hsl(var(--primary)/0.2)] transition-smooth hover:bg-primary/30 hover:shadow-[0_0_14px_hsl(var(--primary)/0.3)]"
              >
                <Trophy className="h-4 w-4" />
              </button>
            )}
            {isLive && <YouTubeButton url={c.youtubeUrl} compact />}
          </div>
        </div>
      </div>
    </>
  );
};

export const ChampionshipCard = ({ c }: { c: ChampionshipCardData }) => {
  const navigate = useNavigate();
  const sport = c.sport ? SPORTS.find(s => s.id === c.sport) : null;
  const badge = STATUS_BADGE[c.status] ?? STATUS_BADGE.draft;
  const isOpen = c.status === 'open';
  const isLive = c.status === 'live';
  const isClickable = isOpen;

  const handleRegister = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/championships/${c.id}/register`);
  };

  const handleCardClick = () => {
    if (isClickable) navigate(`/championships/${c.id}/register`);
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-card ${isClickable ? 'cursor-pointer transition-smooth hover:-translate-y-0.5 hover:border-background hover:shadow-none' : 'cursor-default'}`}
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-secondary">
        {c.image ? (
          <PositionedCoverImage
            src={c.image}
            alt={c.name}
            offsetX={c.imageOffsetX ?? 0}
            offsetY={c.imageOffsetY ?? 0}
            zoom={c.imageZoom ?? 1}
            className="absolute inset-0 overflow-hidden"
            imgClassName={`pointer-events-none select-none transition-transform duration-500 ${isClickable ? 'group-hover:scale-105' : ''}`}
          >
            <Overlay c={c} badge={badge} sport={sport} isOpen={isOpen} isLive={isLive} onRegister={handleRegister} />
          </PositionedCoverImage>
        ) : (
          <>
            <div className="absolute inset-0 hex-grid opacity-30" />
            <Overlay c={c} badge={badge} sport={sport} isOpen={isOpen} isLive={isLive} onRegister={handleRegister} />
          </>
        )}
      </div>
    </article>
  );
};
