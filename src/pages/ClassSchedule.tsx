import { useMemo, useState } from 'react';
import { CalendarDays, Check, Clock, MapPin, Users } from 'lucide-react';
import { CLASS_SCHEDULE, RESERVATION_PLACES, SPORTS } from '@/data/mock';
import { SportIcon } from '@/components/SportIcon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/i18n';
import { useToast } from '@/components/ui/use-toast';
import type { SportId } from '@/types';

const todayStr = new Date().toISOString().slice(0, 10);

const addDays = (dateStr: string, days: number) => {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const weekDays = Array.from({ length: 7 }, (_, i) => addDays(todayStr, i));

const ClassSchedule = ({ embedded = false }: { embedded?: boolean }) => {
  const { t, language, sportName } = useLanguage();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSport, setSelectedSport] = useState<'all' | SportId>('all');
  const [selectedComplexId, setSelectedComplexId] = useState<'all' | string>('all');
  const [enrolled, setEnrolled] = useState<string[]>([]);

  const visibleClasses = useMemo(
    () =>
      CLASS_SCHEDULE.filter((c) => {
        if (c.date !== selectedDate) return false;
        if (selectedSport !== 'all' && c.sport !== selectedSport) return false;
        if (selectedComplexId !== 'all' && c.complexId !== selectedComplexId) return false;
        return true;
      }).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [selectedDate, selectedSport, selectedComplexId],
  );

  const formatDayLabel = (dateStr: string) =>
    new Date(`${dateStr}T12:00:00`).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
      weekday: 'short',
    });

  const formatDayNum = (dateStr: string) =>
    new Date(`${dateStr}T12:00:00`).getDate();

  return (
    <div className="w-full space-y-6">
      {!embedded && (
        <header>
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('classes')}</p>
          <p className="mt-3 text-sm text-muted-foreground">{t('classScheduleIntro')}</p>
        </header>
      )}

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {weekDays.map((date) => {
          const isSelected = date === selectedDate;
          const isToday = date === todayStr;
          return (
            <button
              key={date}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={`flex min-w-[64px] shrink-0 flex-col items-center rounded-2xl border px-3 py-2.5 transition-smooth ${
                isSelected
                  ? 'border-primary/35 bg-primary/10 text-primary-glow shadow-[0_0_14px_hsl(var(--primary)/0.18)]'
                  : 'border-border bg-background/35 text-muted-foreground hover:border-primary/25 hover:text-foreground'
              }`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider">{formatDayLabel(date)}</span>
              <span className="mt-0.5 font-display text-xl font-black">{formatDayNum(date)}</span>
              {isToday && (
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-neon-cyan shadow-[0_0_8px_hsl(var(--neon-cyan))]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-2 md:max-w-xl">
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('sport')}</div>
          <Select value={selectedSport} onValueChange={(v) => setSelectedSport(v as 'all' | SportId)}>
            <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
              <SelectItem value="all">{t('allSports')}</SelectItem>
              {SPORTS.map((s) => (
                <SelectItem key={s.id} value={s.id}>{sportName(s.id)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('sportComplex')}</div>
          <Select value={selectedComplexId} onValueChange={setSelectedComplexId}>
            <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
              <SelectItem value="all">{t('allComplexes')}</SelectItem>
              {RESERVATION_PLACES.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Empty state */}
      {visibleClasses.length === 0 ? (
        <div className="rounded-[2rem] border border-border bg-gradient-card p-10 text-center shadow-card">
          <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">{t('noClassesAvailable')}</p>
        </div>
      ) : (
        <>
          {/* Mobile cards — visible below sm */}
          <div className="space-y-3 sm:hidden">
            {visibleClasses.map((slot) => {
              const isEnrolled = enrolled.includes(slot.id);
              const isFull = slot.bookedSpots >= slot.maxSpots;
              const available = slot.maxSpots - slot.bookedSpots;

              return (
                <div
                  key={slot.id}
                  className={`rounded-2xl border bg-gradient-card p-4 shadow-card transition-smooth ${
                    isEnrolled ? 'border-neon-cyan/30' : 'border-border'
                  }`}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neon-cyan/20 bg-neon-cyan/10">
                        <SportIcon sportId={slot.sport} className="h-4 w-4 text-neon-cyan" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{sportName(slot.sport)}</div>
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
                      <span>Prof. {slot.professorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{slot.complexName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      {isFull ? (
                        <span className="font-semibold text-live">{t('full')}</span>
                      ) : (
                        <span>
                          <span className="font-bold text-neon-cyan">{available}</span>
                          <span> / {slot.maxSpots} {t('spotsLeft')}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-3">
                    {isEnrolled ? (
                      <div className="flex items-center justify-center gap-2 rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-neon-cyan">
                        <Check className="h-3.5 w-3.5" />
                        {t('classBooked')}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isFull}
                        onClick={() => {
                          setEnrolled((prev) => [...prev, slot.id]);
                          toast({
                            title: t('classBooked'),
                            description: `${sportName(slot.sport)} · ${slot.startTime} – ${slot.endTime} · ${slot.complexName}`,
                          });
                        }}
                        className="w-full rounded-xl bg-gradient-primary py-2.5 font-display text-[11px] font-bold uppercase tracking-[0.15em] shadow-neon transition-smooth hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {t('bookClass')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table — visible from sm up */}
          <div className="hidden rounded-[2rem] border border-border bg-gradient-card shadow-card sm:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    <th className="px-5 py-3">{t('sport')}</th>
                    <th className="px-5 py-3">{t('startTime')}</th>
                    <th className="px-5 py-3">{t('professor')}</th>
                    <th className="hidden px-5 py-3 md:table-cell">{t('sportComplex')}</th>
                    <th className="px-5 py-3">{t('spots')}</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleClasses.map((slot) => {
                    const isEnrolled = enrolled.includes(slot.id);
                    const isFull = slot.bookedSpots >= slot.maxSpots;
                    const available = slot.maxSpots - slot.bookedSpots;

                    return (
                      <tr key={slot.id} className="transition-smooth hover:bg-primary/5">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neon-cyan/20 bg-neon-cyan/10">
                              <SportIcon sportId={slot.sport} className="h-4 w-4 text-neon-cyan" />
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">{sportName(slot.sport)}</div>
                              {slot.level && (
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t(slot.level)}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-foreground">
                            <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="font-semibold">{slot.startTime}</span>
                            <span className="text-muted-foreground">–</span>
                            <span className="text-muted-foreground">{slot.endTime}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm text-foreground">{slot.professorName}</div>
                        </td>
                        <td className="hidden px-5 py-4 md:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span>{slot.complexName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            {isFull ? (
                              <span className="text-xs font-semibold text-live">{t('full')}</span>
                            ) : (
                              <span className="text-xs">
                                <span className="font-bold text-neon-cyan">{available}</span>
                                <span className="text-muted-foreground"> / {slot.maxSpots}</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {isEnrolled ? (
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-neon-cyan">
                              <Check className="h-3 w-3" />
                              {t('classBooked')}
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={isFull}
                              onClick={() => {
                                setEnrolled((prev) => [...prev, slot.id]);
                                toast({
                                  title: t('classBooked'),
                                  description: `${sportName(slot.sport)} · ${slot.startTime} – ${slot.endTime} · ${slot.complexName}`,
                                });
                              }}
                              className="rounded-lg bg-gradient-primary px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.15em] shadow-neon transition-smooth hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {t('bookClass')}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClassSchedule;
