import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Lock, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n';
import type { ReservationPlace } from '@/types';

export const PlaceCard = ({ p }: { p: ReservationPlace }) => {
  const { t } = useLanguage();
  const href = `/reservations/complexes/${p.id}`;
  const isActive = p.active !== false;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [objectPositionY, setObjectPositionY] = useState(`calc(50% + ${p.imageOffsetY ?? 0}px)`);

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const container = containerRef.current;
    if (!container || !img.naturalWidth || !img.naturalHeight) return;
    const containerH = container.clientHeight;
    const containerW = container.clientWidth;
    const scale = Math.max(containerW / img.naturalWidth, containerH / img.naturalHeight);
    const scaledH = img.naturalHeight * scale;
    const maxOffset = Math.max(0, (scaledH - containerH) / 2);
    const safeOffset = Math.max(-maxOffset, Math.min(maxOffset, p.imageOffsetY ?? 0));
    setObjectPositionY(`calc(50% + ${safeOffset}px)`);
  };

  return (
    <div className={`group relative overflow-hidden rounded-2xl border bg-gradient-card transition-smooth ${isActive ? 'border-border hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-neon' : 'pointer-events-none border-border/40 opacity-50 grayscale'}`}>
      {!isActive && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/60 backdrop-blur-[2px]">
          <Lock className="h-6 w-6 text-muted-foreground" />
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Indisponível</span>
        </div>
      )}

      <Link to={href} className="block">
        {/* Image — aspect-[3/2] makes the card nearly square when combined with the footer */}
        <div ref={containerRef} className="relative aspect-[3/2] overflow-hidden bg-secondary">
          {p.image ? (
            <img
              src={p.image}
              alt={p.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ objectPosition: `center ${objectPositionY}` }}
              onLoad={handleImgLoad}
            />
          ) : (
            <div className="absolute inset-0 hex-grid opacity-30" />
          )}
          {/* Stronger gradient so text is always readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          {/* Rating badge */}
          {p.rating > 0 && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg border border-white/10 bg-background/60 px-2 py-1 text-xs font-bold backdrop-blur-md">
              <Star className="h-3 w-3 fill-neon-cyan text-neon-cyan" /> {p.rating}
            </div>
          )}

          {/* Name + location overlaid on the image */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <h3 className="line-clamp-2 font-display text-sm font-bold leading-tight text-foreground transition-smooth group-hover:text-primary-glow sm:text-base">
              {p.name}
            </h3>
            {p.city && (
              <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground sm:gap-1.5 sm:text-xs">
                <MapPin className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />
                <span className="truncate">{p.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Reserve action bar */}
        <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3">
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground transition-smooth group-hover:text-foreground sm:text-xs">
            {t('reserve')}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-smooth group-hover:translate-x-0.5 group-hover:text-primary sm:h-4 sm:w-4" />
        </div>
      </Link>
    </div>
  );
};
