import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, Pencil, Plus, Users } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { useNavigate } from 'react-router-dom';
import { SportIcon } from '@/components/SportIcon';
import type { ClassSlot, SportId } from '@/types';

const classStorageKey = 'joga-junto-management-classes';

const exampleClasses: ClassSlot[] = [
  {
    id: 'class-example-1',
    complexId: 'p2',
    complexName: 'FTM Sports Center',
    sport: 'footvolley',
    professorName: 'Rafael Souza',
    date: 'Monday',
    startTime: '08:00',
    endTime: '09:00',
    maxSpots: 10,
    bookedSpots: 3,
    level: 'beginner',
  },
  {
    id: 'class-example-2',
    complexId: 'p2',
    complexName: 'FTM Sports Center',
    sport: 'volleyball',
    professorName: 'Victor Nunes',
    date: 'Wednesday',
    startTime: '10:30',
    endTime: '12:00',
    maxSpots: 12,
    bookedSpots: 6,
    level: 'intermediate',
  },
  {
    id: 'class-example-3',
    complexId: 'p3',
    complexName: 'Contorno da Bola',
    sport: 'beach-soccer',
    professorName: 'João Pedro',
    date: 'Friday',
    startTime: '18:00',
    endTime: '19:00',
    maxSpots: 8,
    bookedSpots: 4,
    level: 'advanced',
  },
  {
    id: 'class-example-specific',
    complexId: 'p1',
    complexName: 'Arena Copacabana',
    sport: 'beach-tennis',
    professorName: 'Carlos Lima',
    date: '2026-05-10 · DOM',
    startTime: '14:00',
    endTime: '15:30',
    maxSpots: 6,
    bookedSpots: 2,
    level: 'advanced',
  },
  {
    id: 'class-example-5',
    complexId: 'p2',
    complexName: 'FTM Sports Center',
    sport: 'beach-tennis',
    professorName: 'Fernanda Rocha',
    date: 'Tuesday',
    startTime: '07:00',
    endTime: '08:00',
    maxSpots: 8,
    bookedSpots: 7,
    level: 'intermediate',
  },
  {
    id: 'class-example-6',
    complexId: 'p3',
    complexName: 'Contorno da Bola',
    sport: 'footvolley',
    professorName: 'Thiago Cardoso',
    date: 'Thursday',
    startTime: '17:00',
    endTime: '18:30',
    maxSpots: 10,
    bookedSpots: 5,
    level: 'high-intermediate',
  },
  {
    id: 'class-example-7',
    complexId: 'p2',
    complexName: 'FTM Sports Center',
    sport: 'volleyball',
    professorName: 'Isabela Matos',
    date: 'Saturday',
    startTime: '09:00',
    endTime: '10:30',
    maxSpots: 14,
    bookedSpots: 10,
    level: 'high-advanced',
  },
  {
    id: 'class-example-8',
    complexId: 'p3',
    complexName: 'Contorno da Bola',
    sport: 'beach-soccer',
    professorName: 'Rodrigo Ferreira',
    date: 'Sunday',
    startTime: '16:00',
    endTime: '17:00',
    maxSpots: 8,
    bookedSpots: 2,
    level: 'beginner',
  },
  {
    id: 'class-example-9',
    complexId: 'p2',
    complexName: 'FTM Sports Center',
    sport: 'beach-tennis',
    professorName: 'Camila Duarte',
    date: '2026-05-15 · SEX',
    startTime: '11:00',
    endTime: '12:00',
    maxSpots: 6,
    bookedSpots: 6,
    level: 'professional',
  },
];

const ManagementClasses = () => {
  const { t, sportName } = useLanguage();
  const { isGestorMode } = useSession();
  const navigate = useNavigate();

  const [createdClasses] = useState<ClassSlot[]>(() => {
    if (typeof window === 'undefined') return exampleClasses;
    try {
      const stored = window.localStorage.getItem(classStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as ClassSlot[];
        if (parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return exampleClasses;
  });
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 8;
  const totalPages = Math.max(1, Math.ceil(createdClasses.length / PAGE_SIZE));
  const pagedClasses = createdClasses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!isGestorMode) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black">
            <span className="neon-text">{t('managementClasses')}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t('ownerOnlyDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(116rem,calc(100vw-3rem))]">
      <header>
        <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('managementClasses')}</p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('managementClassesIntro')}</p>
      </header>

      <div className="rounded-[2rem] border border-border bg-gradient-card p-4 shadow-card sm:p-6">
        {/* Top bar */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            {createdClasses.length} {t('classes')}
          </span>
          <button
            type="button"
            onClick={() => navigate('/management/classes/new')}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] text-neon-cyan transition-smooth hover:border-neon-cyan/40 hover:bg-secondary"
          >
            <Plus className="h-4 w-4" />
            {t('createClass')}
          </button>
        </div>

        {createdClasses.length === 0 ? (
          <div className="rounded-2xl border border-border bg-background/25 p-10 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">{t('noCreatedClasses')}</p>
          </div>
        ) : (
          <>
            {/* Mobile cards — below sm */}
            <div className="space-y-3 sm:hidden">
              {pagedClasses.map((slot) => (
                <div key={slot.id} className="rounded-2xl border border-border bg-background/40 p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neon-cyan/20 bg-neon-cyan/10">
                        <SportIcon sportId={slot.sport as SportId} className="h-4 w-4 text-neon-cyan" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{sportName(slot.sport as SportId)}</div>
                        {slot.level && (
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t(slot.level)}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg font-black text-foreground">{slot.startTime}</div>
                      <div className="text-[11px] text-muted-foreground">– {slot.endTime}</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-3 space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{slot.date} · Prof. {slot.professorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{slot.complexName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          <span className="font-bold text-neon-cyan">{slot.bookedSpots}</span>
                          <span> / {slot.maxSpots} {t('spots')}</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/management/classes/${slot.id}/edit`)}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table — from sm up */}
            <div className="hidden overflow-x-auto rounded-2xl border border-border sm:block">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-[19%]" />
                  <col className="w-[17%]" />
                  <col className="w-[13%]" />
                  <col className="w-[15%]" />
                  <col className="w-[9%]" />
                  <col className="w-[19%]" />
                  <col className="w-[8%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border bg-background/30 text-left text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    <th className="px-4 py-3">{t('classes')}</th>
                    <th className="px-4 py-3">{t('professor')}</th>
                    <th className="px-4 py-3">{t('weekSchedule')}</th>
                    <th className="px-4 py-3">{t('startTime')} / {t('reservationEndTime')}</th>
                    <th className="px-4 py-3">{t('spots')}</th>
                    <th className="px-4 py-3">{t('sportComplex')}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pagedClasses.map((slot) => (
                    <tr key={slot.id} className="transition-smooth hover:bg-primary/5">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neon-cyan/20 bg-neon-cyan/10">
                            <SportIcon sportId={slot.sport as SportId} className="h-3.5 w-3.5 text-neon-cyan" />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-foreground">{sportName(slot.sport as SportId)}</div>
                            {slot.level && (
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t(slot.level)}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="truncate text-foreground">{slot.professorName}</span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{slot.date}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-foreground">
                          <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="font-semibold">{slot.startTime}</span>
                          <span className="text-muted-foreground">–{slot.endTime}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="font-bold text-neon-cyan">{slot.bookedSpots}</span>
                          <span className="text-muted-foreground">/{slot.maxSpots}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate text-sm">{slot.complexName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => navigate(`/management/classes/${slot.id}/edit`)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {createdClasses.length > 0 && (
          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 transition-smooth disabled:opacity-40 hover:border-primary/40 hover:bg-secondary"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagementClasses;
