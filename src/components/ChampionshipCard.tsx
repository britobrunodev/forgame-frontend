import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Users, Calendar, Trophy } from 'lucide-react';
import { LiveBadge } from './LiveBadge';
import { SportIcon } from './SportIcon';
import { MapsButton } from './MapsButton';
import { YouTubeButton } from './YouTubeButton';
import { SPORTS } from '@/data/mock';
import { useLanguage } from '@/i18n';
import type { Championship } from '@/types';

export const ChampionshipCard = ({ c }: { c: Championship }) => {
  const { t, sportName } = useLanguage();
  const navigate = useNavigate();
  const sport = SPORTS.find(s => s.id === c.sport);

  return (
    <article className="group relative overflow-hidden rounded-xl border border-border bg-gradient-card transition-smooth hover:-translate-y-0.5 hover:shadow-neon">
      <Link to={`/championships/${c.id}`} className="block">
        <div className="relative h-32 overflow-hidden bg-secondary">
          {c.image ? (
            <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 hex-grid opacity-30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/30 to-background/10" />
          <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-background/60 px-1.5 py-0.5 text-xs font-bold uppercase leading-none tracking-wider text-foreground backdrop-blur-md">
              {sport && <SportIcon sportId={sport.id} className="h-3.5 w-3.5 translate-y-[0.5px]" />}
              <span className="translate-y-[0.5px] leading-none">{sport ? sportName(sport.id) : c.sport}</span>
            </span>
            <LiveBadge status={c.status} />
          </div>
          {c.prize && (
            <div className="absolute bottom-3 right-3 text-right">
              <div className="text-[10px] uppercase tracking-widest text-foreground/80">{t('prizePool')}</div>
              <div className="font-display text-lg font-black text-foreground drop-shadow-lg">{c.prize}</div>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/championships/${c.id}`} className="block">
          <h3 className="mb-2 font-display text-base font-bold leading-tight transition-smooth group-hover:neon-text">{c.name}</h3>
        </Link>

        <div className="flex items-end justify-between gap-3">
          <Link to={`/championships/${c.id}`} className="block flex-1">
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {c.location}</div>
              <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {c.startDate} → {c.endDate}</div>
              <div className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {c.teamsCount} {t('teams')}</div>
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-2 self-end">
            <MapsButton compact />
            <YouTubeButton url={c.youtubeUrl} compact />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <Link to={`/championships/${c.id}`} className="flex items-center gap-1 text-xs font-bold text-neon-cyan">
            <Trophy className="h-3 w-3" /> {t('viewBracket')}
          </Link>
          {c.status === 'upcoming' || c.status === 'live' ? (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); navigate(`/championships/${c.id}/register`); }}
              className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-glow transition-smooth hover:bg-primary/16"
            >
              {t('register')}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
};
