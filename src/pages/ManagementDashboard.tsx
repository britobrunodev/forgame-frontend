import { useState } from 'react';
import { COURTS } from '@/data/mock';
import { Calendar, Building2 } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSession } from '@/session';

const isAvailableNow = (court: typeof COURTS[number], date: string) => {
  const now = new Date();
  const hh = now.getHours();
  const mm = now.getMinutes();
  const cur = hh * 60 + mm;
  const today = now.toISOString().slice(0, 10);
  if (date !== today) return court.reservations.filter(r => r.date === date).length === 0;
  return !court.reservations.some(r => {
    if (r.date !== date) return false;
    const [sh, sm] = r.start.split(':').map(Number);
    const [eh, em] = r.end.split(':').map(Number);
    return cur >= sh * 60 + sm && cur < eh * 60 + em;
  });
};

const ManagementDashboard = () => {
  const { t, sportName, language } = useLanguage();
  const { isOwnerMode } = useSession();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const apps = Array.from(new Set(COURTS.map(c => c.application)));
  const selectedDate = new Date(`${date}T12:00:00`);
  const formattedDate = selectedDate.toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (!isOwnerMode) {
    return (
      <div className="max-w-3xl">
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
    <div className="space-y-8 max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('distributor')}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('courtManagementIntro')}</p>
        </div>
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
      </header>

      {apps.map(app => (
        <section key={app}>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-neon-pink" />
            <h2 className="font-display font-bold text-sm uppercase tracking-[0.2em]">{app}</h2>
            <div className="flex-1 h-px bg-border ml-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COURTS.filter(c => c.application === app).map(court => {
              const avail = isAvailableNow(court, date);
              const dayRes = court.reservations.filter(r => r.date === date);
              return (
                <div key={court.id} className={`rounded-xl border bg-gradient-card p-5 transition-smooth ${
                  avail ? 'border-neon-cyan/20 shadow-[0_0_2px_hsl(var(--neon-cyan)/0.04)]' : 'border-live/20 shadow-[0_0_2px_hsl(var(--live)/0.04)]'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-display font-bold text-lg">{court.name}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{sportName(court.sport)}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                      avail ? 'bg-neon-cyan/10 border-neon-cyan/40 text-neon-cyan' : 'bg-live/10 border-live/40 text-live'
                    }`}>
                      {avail ? t('available') : t('occupied')}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t('reservationsLabel')}</div>
                    {dayRes.length === 0 ? (
                      <div className="text-xs text-muted-foreground italic">{t('noReservations')}</div>
                    ) : dayRes.map((r, i) => (
                      <div key={i} className="flex justify-between text-xs px-2 py-1.5 rounded-md bg-background/40 border border-border">
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
    </div>
  );
};

export default ManagementDashboard;
