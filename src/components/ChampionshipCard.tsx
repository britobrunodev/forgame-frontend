import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Trophy, ArrowRight } from 'lucide-react';
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
  live:     { label: 'Ao vivo',            className: 'border-lime-400/30 bg-lime-400/10 text-lime-400 animate-status-pulse' },
  open:     { label: 'Inscrições abertas', className: 'border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan' },
  closed:   { label: 'Inscrições encerradas', className: 'border-neon-pink/30 bg-neon-pink/10 text-neon-pink' },
  finished: { label: 'Finalizado',         className: 'border-border bg-background/60 text-muted-foreground' },
  draft:    { label: 'Rascunho',           className: 'border-border bg-background/60 text-muted-foreground' },
};

export const ChampionshipCard = ({ c }: { c: ChampionshipCardData }) => {
  const { t, sportName } = useLanguage();
  const navigate = useNavigate();
  const sport = c.sport ? SPORTS.find(s => s.id === c.sport) : null;
  const badge = STATUS_BADGE[c.status] ?? STATUS_BADGE.draft;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-card transition-smooth hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-neon">
      {/* Image area */}
      <Link to={`/championships/${c.id}`} className="block">
        <div className="relative aspect-[3/2] overflow-hidden bg-secondary">
          {c.image ? (
            <PositionedCoverImage
              src={c.image}
              alt={c.name}
              offsetX={c.imageOffsetX ?? 0}
              offsetY={c.imageOffsetY ?? 0}
              zoom={c.imageZoom ?? 1}
              className="absolute inset-0 overflow-hidden"
              imgClassName="pointer-events-none select-none transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 hex-grid opacity-30" />
          )}

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          {/* Status badge — top right */}
          <div className="absolute right-3 top-3">
            <span className={`inline-flex items-center rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${badge.className}`}>
              {badge.label}
            </span>
          </div>

          {/* Sport badge — top left */}
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-background/60 px-1.5 py-0.5 text-xs font-bold uppercase leading-none tracking-wider text-foreground backdrop-blur-md">
              {sport && <SportIcon sportId={sport.id} className="h-3.5 w-3.5 translate-y-[0.5px]" />}
              <span className="translate-y-[0.5px] leading-none">{sport ? sportName(sport.id) : t('championships')}</span>
            </span>
          </div>

          {/* Name + location overlaid at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <h3 className="line-clamp-2 font-display text-sm font-bold leading-tight text-foreground transition-smooth group-hover:text-primary-glow sm:text-base">
              {c.name}
            </h3>
            {c.location && c.location !== '-' && (
              <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground sm:gap-1.5 sm:text-xs">
                <MapPin className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />
                <span className="truncate">{c.location}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Footer action bar */}
      <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 shrink-0" />
            {c.startDate}
            {c.endDate && c.endDate !== c.startDate ? ` → ${c.endDate}` : ''}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <MapsButton url={c.addressUrl} compact />
          <YouTubeButton url={c.youtubeUrl} compact />
          {c.status === 'open' ? (
            <button
              type="button"
              onClick={() => navigate(`/championships/${c.id}/register`)}
              className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-glow transition-smooth hover:bg-primary/16"
            >
              <Trophy className="h-3 w-3" />
              {t('register')}
            </button>
          ) : (
            <Link
              to={`/championships/${c.id}`}
              className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground/60 transition-smooth group-hover:text-primary sm:text-xs"
            >
              <ArrowRight className="h-3.5 w-3.5 transition-smooth group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};
