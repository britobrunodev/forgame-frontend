import { Link } from 'react-router-dom';
import { MapPin, Star, Lock } from 'lucide-react';
import { SportIcon } from '@/components/SportIcon';
import { SPORTS } from '@/data/mock';
import { useLanguage } from '@/i18n';
import type { ReservationPlace } from '@/types';

export const PlaceCard = ({ p }: { p: ReservationPlace }) => {
  const { t, sportName } = useLanguage();
  const href = `/reservations/${p.id}`;
  const isActive = p.active !== false;

  return (
    <div className={`rounded-xl border bg-gradient-card overflow-hidden transition-smooth group relative ${isActive ? 'border-border hover:shadow-neon hover:-translate-y-0.5' : 'border-border/40 opacity-50 grayscale pointer-events-none'}`}>
      {!isActive && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/60 backdrop-blur-[2px]">
          <Lock className="h-6 w-6 text-muted-foreground" />
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Indisponível</span>
        </div>
      )}
      <Link to={href} className="block">
        <div className="h-32 relative bg-secondary overflow-hidden">
          {p.image ? (
            <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 hex-grid opacity-30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
          {p.rating > 0 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/60 backdrop-blur-md text-xs font-bold border border-white/10">
              <Star className="w-3 h-3 fill-neon-cyan text-neon-cyan" /> {p.rating}
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link to={href} className="block">
          <h3 className="font-display font-bold text-base group-hover:neon-text transition-smooth">{p.name}</h3>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
          <MapPin className="w-3 h-3" /> {p.city}{p.courts > 0 ? ` · ${p.courts} ${t('courts')}` : ''}
        </div>
        {p.sports.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {p.sports.map(sid => {
              const s = SPORTS.find(x => x.id === sid)!;
              return (
                <span key={sid} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-secondary border border-border text-[10px] font-bold uppercase tracking-wider leading-none">
                  <SportIcon sportId={s.id} className="h-3.5 w-3.5 translate-y-[0.5px]" />
                  <span className="translate-y-[0.5px] leading-none">{sportName(s.id)}</span>
                </span>
              );
            })}
          </div>
        )}
        <Link to={href} className="mt-4 flex w-full items-center justify-center rounded-lg border border-border bg-secondary py-2 text-xs font-display font-bold uppercase tracking-widest transition-smooth hover:border-neon-cyan/50 hover:text-neon-cyan">
          {t('reserve')}
        </Link>
      </div>
    </div>
  );
};
