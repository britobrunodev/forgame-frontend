import { useState } from 'react';
import { COURTS } from '@/data/mock';
import { Calendar, Building2 } from 'lucide-react';
import { useLanguage } from '@/i18n';

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
  const { t, sportName } = useLanguage();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const apps = Array.from(new Set(COURTS.map(c => c.application)));

  return (
    <div className="space-y-8 max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neon-cyan font-bold mb-1">{t('distributor')}</p>
          <h1 className="font-display font-black text-4xl"><span className="neon-text">{t('courtManagement')}</span></h1>
        </div>
        <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-sm">
          <Calendar className="w-4 h-4 text-neon-cyan" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent focus:outline-none font-semibold" />
        </label>
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
                  avail ? 'border-neon-cyan/40 shadow-[0_0_16px_hsl(var(--neon-cyan)/0.2)]' : 'border-live/40 shadow-[0_0_16px_hsl(var(--live)/0.2)]'
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
