import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Plus, SlidersHorizontal } from 'lucide-react';
import { SportIcon } from '@/components/SportIcon';
import { getCountryLabel } from '@/data/countries';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { getManagedSportComplexes } from '@/lib/sport-complexes-store';

const SportComplexesManagement = () => {
  const navigate = useNavigate();
  const { language, t, sportName } = useLanguage();
  const { isGestorMode, currentUser } = useSession();
  const visibleComplexes = useMemo(
    () => getManagedSportComplexes(currentUser.ownedComplexIds ?? []),
    [currentUser.ownedComplexIds],
  );

  if (!isGestorMode) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black">
            <span className="neon-text">{t('sportComplexes')}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t('ownerOnlyDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(116rem,calc(100vw-3rem))]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('sportComplexes')}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('sportComplexesIntro')}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/settings/complex/new')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/70 text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
        >
          <Plus className="h-4 w-4" />
        </button>
      </header>

      {visibleComplexes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleComplexes.map((complex) => {
            const fullAddress = complex.street
              ? `${complex.street}${complex.addressNumber ? `, ${complex.addressNumber}` : ''}${complex.addressComplement ? ` · ${complex.addressComplement}` : ''}`
              : '-';

            return (
              <article key={complex.id} className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neon-cyan">{t('sportComplexes')}</p>
                    <h2 className="mt-2 font-display text-2xl font-black leading-tight">{complex.name}</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-neon-cyan" />
                        {complex.city}
                      </span>
                      <span>{complex.country ? getCountryLabel(complex.country, language) : '-'}</span>
                      <span>{complex.courts} {t('courts')}</span>
                    </div>
                  </div>
                  <div className="rounded-full border border-border bg-background/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {complex.rating > 0 ? `${complex.rating.toFixed(1)} / 5` : t('newComplexLabel')}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <InfoRow label={t('fullAddress')} value={fullAddress} />
                  <InfoRow label={t('zipCode')} value={complex.zipCode || '-'} />
                </div>

                <div className="mt-5">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{t('sportsAvailable')}</div>
                  <div className="flex flex-wrap gap-2">
                    {complex.sports.map((sportId) => (
                      <span key={sportId} className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-glow">
                        <SportIcon sportId={sportId} className="h-3.5 w-3.5" />
                        {sportName(sportId)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => navigate(`/management/preferences?complexId=${complex.id}`)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-sm font-semibold text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {t('preferences')}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <h2 className="font-display text-2xl font-black">{t('noSportComplexesTitle')}</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('noSportComplexesDescription')}</p>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-background/25 p-3">
    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    <div className="mt-1 font-semibold text-foreground">{value}</div>
  </div>
);

export default SportComplexesManagement;
