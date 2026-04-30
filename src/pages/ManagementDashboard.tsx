import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RESERVATION_PLACES } from '@/data/mock';
import { Calendar, Building2, Plus } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSession } from '@/session';
import { getAllCourts } from '@/lib/courts-store';

const ManagementDashboard = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isGestorMode, currentUser } = useSession();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const ownedComplexIds = currentUser.ownedComplexIds ?? [];
  const visiblePlaces = RESERVATION_PLACES.filter((place) => ownedComplexIds.includes(place.id));
  const visibleCourts = getAllCourts().filter((court) => ownedComplexIds.includes(court.complexId));
  const selectedDate = new Date(`${date}T12:00:00`);
  const formattedDate = selectedDate.toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (!isGestorMode) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black">
            <span className="neon-text">{t('courtManagement')}</span>
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
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('distributor')}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('courtManagementIntro')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/management/courts/new')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/70 text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
          >
            <Plus className="w-4 h-4" />
          </button>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/70 px-3 py-2 text-sm font-semibold transition-smooth hover:border-primary/40 hover:bg-secondary"
              >
                <Calendar className="w-4 h-4 text-neon-cyan" />
                {formattedDate}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto border-border bg-popover/95 p-0 backdrop-blur-xl">
              <CalendarPicker
                mode="single"
                selected={selectedDate}
                onSelect={(nextDate) => {
                  if (!nextDate) return;
                  const year = nextDate.getFullYear();
                  const month = String(nextDate.getMonth() + 1).padStart(2, '0');
                  const day = String(nextDate.getDate()).padStart(2, '0');
                  setDate(`${year}-${month}-${day}`);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {visiblePlaces.map((place) => (
        <section key={place.id}>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-neon-pink" />
            <h2 className="font-display font-bold text-sm uppercase tracking-[0.2em]">{place.name}</h2>
            <div className="flex-1 h-px bg-border ml-2" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {visibleCourts.filter((court) => court.complexId === place.id).map((court) => {
              const dayRes = court.reservations.filter((reservation) => reservation.date === date);
              return (
                <div key={court.id} className="rounded-xl border border-neon-cyan/20 bg-gradient-card p-5 shadow-[0_0_2px_hsl(var(--neon-cyan)/0.04)] transition-smooth">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-display font-bold text-lg">{court.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground uppercase tracking-wider">{court.dimensions}</div>
                      <div className="mt-2 text-xs text-muted-foreground">{t('hourlyRate')}: {new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', { style: 'currency', currency: 'BRL' }).format(court.hourlyRate)}</div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t('reservationsLabel')}</div>
                    {dayRes.length === 0 ? (
                      <div className="text-xs text-muted-foreground italic">{t('noReservations')}</div>
                    ) : dayRes.map((r, i) => (
                      <div key={i} className="flex flex-col gap-1 rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-mono font-bold text-neon-cyan">{r.start} – {r.end}</span>
                        <span className="text-muted-foreground">{r.user}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {visiblePlaces.length === 0 ? (
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <h2 className="font-display text-2xl font-black">{t('noOwnedCourtsTitle')}</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('noOwnedCourtsDescription')}</p>
        </div>
      ) : null}
    </div>
  );
};

export default ManagementDashboard;
