import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Building2, Loader2, Pencil, Plus, Receipt } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { courtsApi, sportComplexApi } from '@/lib/api';
import type { CourtData } from '@/lib/api';
import { useLanguage } from '@/i18n';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSession } from '@/session';

const ManagementDashboard = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isGestorMode, token } = useSession();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const selectedDate = new Date(`${date}T12:00:00`);
  const formattedDate = selectedDate.toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const { data: managedComplexes = [], isLoading } = useQuery({
    queryKey: ['complexes-mine'],
    queryFn: () => sportComplexApi.listMine(token!),
    enabled: !!token && isGestorMode,
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : managedComplexes.length === 0 ? (
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <h2 className="font-display text-2xl font-black">{t('noOwnedCourtsTitle')}</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('noOwnedCourtsDescription')}</p>
        </div>
      ) : (
        managedComplexes.map((complex) => (
          <ComplexSection
            key={complex.id}
            complexId={complex.id}
            complexName={complex.name}
            date={date}
            token={token!}
            language={language}
            onEditCourt={(court) => navigate(`/management/courts/${court.complex_id}-${court.id}/edit`)}
            onCourtPayments={(court) => navigate(`/management/payments?type=court&id=${court.id}`)}
            t={t}
          />
        ))
      )}
    </div>
  );
};

const ComplexSection = ({
  complexId,
  complexName,
  date,
  token,
  language,
  onEditCourt,
  onCourtPayments,
  t,
}: {
  complexId: number;
  complexName: string;
  date: string;
  token: string;
  language: string;
  onEditCourt: (court: CourtData) => void;
  onCourtPayments: (court: CourtData) => void;
  t: (key: string) => string;
}) => {
  const { data: courts = [], isLoading } = useQuery({
    queryKey: ['courts-all', complexId],
    queryFn: () => courtsApi.listAll(token, complexId),
    enabled: !!token,
  });

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Building2 className="w-4 h-4 text-neon-pink" />
        <h2 className="font-display font-bold text-sm uppercase tracking-[0.2em]">{complexName}</h2>
        <div className="flex-1 h-px bg-border ml-2" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : courts.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">{t('noAvailableSlots')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {courts.map((court) => (
            <div key={court.id} className="rounded-xl border border-neon-cyan/20 bg-gradient-card p-5 shadow-[0_0_2px_hsl(var(--neon-cyan)/0.04)] transition-smooth">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-display font-bold text-lg">{court.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground uppercase tracking-wider">{court.dimensions}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {t('hourlyRate')}: {new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', { style: 'currency', currency: 'BRL' }).format(court.hourly_rate)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEditCourt(court)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/70 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground hover:bg-secondary"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onCourtPayments(court)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/70 text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
                  >
                    <Receipt className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t('reservationsLabel')}</div>
                <div className="text-xs text-muted-foreground italic">{t('noReservations')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ManagementDashboard;
