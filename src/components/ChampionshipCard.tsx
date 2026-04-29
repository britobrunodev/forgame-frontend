import { Link } from 'react-router-dom';
import { MapPin, Users, Calendar, Trophy } from 'lucide-react';
import { LiveBadge } from './LiveBadge';
import { SportIcon } from './SportIcon';
import { SPORTS } from '@/data/mock';
import { useLanguage } from '@/i18n';
import type { Championship } from '@/types';

export const ChampionshipCard = ({ c }: { c: Championship }) => {
  const { t, sportName } = useLanguage();
  const sport = SPORTS.find(s => s.id === c.sport);
  return (
    <Link
      to={`/championships/${c.id}`}
      className="group relative overflow-hidden rounded-xl border border-border bg-gradient-card hover:shadow-neon transition-smooth hover:-translate-y-0.5 block"
    >
      <div className="h-32 relative overflow-hidden bg-secondary">
        {c.image ? (
          <img src={c.image} alt={c.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 hex-grid opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/30 to-background/10" />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-background/60 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-foreground border border-white/10 leading-none">
            {sport && <SportIcon sportId={sport.id} className="h-3.5 w-3.5 translate-y-[0.5px]" />}
            <span className="translate-y-[0.5px] leading-none">{sport ? sportName(sport.id) : c.sport}</span>
          </span>
          <LiveBadge status={c.status} />
        </div>
        {c.prize && (
          <div className="absolute bottom-3 right-3 text-right">
            <div className="text-[10px] uppercase tracking-widest text-foreground/80">{t('prizePool')}</div>
            <div className="font-display font-black text-foreground text-lg drop-shadow-lg">{c.prize}</div>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold text-base leading-tight mb-2 group-hover:neon-text transition-smooth">{c.name}</h3>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {c.location}</div>
          <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {c.startDate} → {c.endDate}</div>
          <div className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {c.teamsCount} {t('teams')}</div>
        </div>
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs font-bold text-neon-cyan flex items-center gap-1"><Trophy className="w-3 h-3" /> {t('viewBracket')}</span>
          <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground group-hover:text-primary-glow transition-smooth">→</span>
        </div>
      </div>
    </Link>
  );
};
