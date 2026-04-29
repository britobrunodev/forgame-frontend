import { MapPin, Star } from 'lucide-react';
import { SPORTS } from '@/data/mock';
import { useLanguage } from '@/i18n';
import type { ReservationPlace } from '@/types';

export const PlaceCard = ({ p }: { p: ReservationPlace }) => {
  const { t, sportName } = useLanguage();

  return (
    <div className="rounded-xl border border-border bg-gradient-card overflow-hidden hover:shadow-neon hover:-translate-y-0.5 transition-smooth group">
      <div className="h-32 relative bg-secondary overflow-hidden">
        {p.image ? (
          <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 hex-grid opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/60 backdrop-blur-md text-xs font-bold border border-white/10">
          <Star className="w-3 h-3 fill-neon-cyan text-neon-cyan" /> {p.rating}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold text-base group-hover:neon-text transition-smooth">{p.name}</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
          <MapPin className="w-3 h-3" /> {p.city} · {p.courts} {t('courts')}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {p.sports.map(sid => {
            const s = SPORTS.find(x => x.id === sid)!;
            return (
              <span key={sid} className="px-2 py-0.5 rounded-md bg-secondary border border-border text-[10px] font-bold uppercase tracking-wider">
                {s.icon} {sportName(s.id)}
              </span>
            );
          })}
        </div>
        <button className="mt-4 w-full py-2 rounded-lg bg-secondary border border-border hover:border-neon-cyan/50 hover:text-neon-cyan text-xs font-display font-bold uppercase tracking-widest transition-smooth">
          {t('reserve')}
        </button>
      </div>
    </div>
  );
};
