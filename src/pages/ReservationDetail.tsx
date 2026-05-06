import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock3, MapPin, Star, Trophy } from 'lucide-react';
import { RESERVATION_PLACES } from '@/data/mock';
import { SportIcon } from '@/components/SportIcon';
import { useLanguage } from '@/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getAllCourts } from '@/lib/courts-store';
import { getComplexPreference } from '@/lib/complex-preferences-store';

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const formatDateValue = (dateValue: string) => {
  const [year, month, day] = dateValue.split('-');
  return `${day}/${month}/${year}`;
};

const timeToMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

const getSlotPrice = (baseRate: number, slot: { start: string; end: string }) => {
  const durationHours = Math.max((timeToMinutes(slot.end) - timeToMinutes(slot.start)) / 60, 0.5);
  const hour = Number(slot.start.split(':')[0]);
  const adjustedBase = hour >= 18 ? baseRate + 20 : hour <= 9 ? baseRate - 10 : baseRate;
  return adjustedBase * durationHours;
};

const ReservationDetail = () => {
  const navigate = useNavigate();
  const { placeId } = useParams();
  const { language, t, sportName } = useLanguage();
  const place = RESERVATION_PLACES.find((item) => item.id === placeId);
  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);
  const maxReservationDate = useMemo(() => addDays(today, 30), [today]);

  const dateOptions = useMemo(
    () => Array.from({ length: 5 }, (_, index) => toDateValue(addDays(today, index))),
    [today],
  );

  const [selectedDate, setSelectedDate] = useState(dateOptions[0]);
  const [selectedRange, setSelectedRange] = useState<{ courtId: string; startIndex: number; endIndex: number } | null>(null);
  const [isMonthlyRate, setIsMonthlyRate] = useState(false);

  if (!place) {
    return <div>{t('sportNotFound')}</div>;
  }

  const courts = getAllCourts().filter((court) => court.complexId === place.id);
  const selectedCourt = courts.find((court) => court.id === selectedRange?.courtId) ?? null;
  const selectedRangeSlots = selectedRange && selectedCourt
    ? selectedCourt.slotOptions.slice(selectedRange.startIndex, selectedRange.endIndex + 1)
    : [];
  const selectedStartTime = selectedRangeSlots[0]?.start ?? '-';
  const selectedEndTime = selectedRangeSlots[selectedRangeSlots.length - 1]?.end ?? '-';
  const selectedDuration = selectedRange
    ? `${selectedRangeSlots.reduce((sum, slot) => sum + Math.max((timeToMinutes(slot.end) - timeToMinutes(slot.start)) / 60, 0), 0)}h`
    : '-';
  const pricingRules = getComplexPreference(place.id).pricingRules;
  const overrideRateByCourtId = Object.fromEntries(
    courts.map((court) => {
      const matchingRule = pricingRules.find((rule) => (
        selectedDate >= rule.startDate
        && selectedDate <= rule.endDate
        && (rule.courtIds.includes('all') || rule.courtIds.includes(court.id))
      ));
      return [court.id, matchingRule?.price ?? court.hourlyRate];
    }),
  ) as Record<string, number>;
  const totalPrice = selectedCourt
    ? isMonthlyRate
      ? selectedCourt.monthlyRate
      : selectedRangeSlots.reduce((sum, slot) => sum + getSlotPrice(overrideRateByCourtId[selectedCourt.id] ?? selectedCourt.hourlyRate, slot), 0)
    : 0;

  const formattedDate = formatDateValue(selectedDate);
  const isCustomDate = !dateOptions.includes(selectedDate);
  const formattedTotal = new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalPrice);

  return (
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(116rem,calc(100vw-3rem))]">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-gradient-card shadow-card">
        <div className="grid gap-0 lg:h-[320px] lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative h-64 overflow-hidden bg-secondary lg:h-full">
            {place.image ? (
              <img src={place.image} alt={place.name} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 hex-grid opacity-30" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-background/10" />
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              {place.sports.map((sportId) => (
                <span key={sportId} className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-background/60 px-2 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                  <SportIcon sportId={sportId} className="h-3.5 w-3.5" />
                  {sportName(sportId)}
                </span>
              ))}
            </div>
          </div>

          <div className="flex h-full min-h-[260px] flex-col justify-center overflow-hidden p-5 sm:min-h-[280px] sm:p-6 lg:min-h-0">
            <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('reservationFlow')}</p>
            <h1 className="font-display text-2xl font-black leading-tight sm:text-3xl">{place.name}</h1>
            <p className="text-sm text-muted-foreground">{t('reserveCourtDescription')}</p>

            <div className="mt-2 mb-5">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{t('changeArena')}</div>
              <Select
                value={place.id}
                onValueChange={(value) => {
                  setSelectedRange(null);
                  navigate(`/reservations/${value}`);
                }}
              >
                <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                  {RESERVATION_PLACES.map((reservationPlace) => (
                    <SelectItem key={reservationPlace.id} value={reservationPlace.id}>
                      {reservationPlace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 text-sm">
              <InfoRow icon={<MapPin className="h-4 w-4 text-neon-cyan" />} value={`${place.city} · ${place.courts} ${t('courts')}`} />
              <InfoRow icon={<Star className="h-4 w-4 text-neon-cyan" />} value={`${place.rating} / 5.0`} />
              <InfoRow icon={<Calendar className="h-4 w-4 text-neon-cyan" />} value={formattedDate} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_320px]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neon-cyan" />
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">{t('selectDateLabel')}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {dateOptions.map((date) => {
                const isActive = date === selectedDate;
                const label = new Date(`${date}T12:00:00`).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
                  day: '2-digit',
                  month: 'short',
                });

                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedRange(null);
                    }}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-smooth ${
                      isActive
                        ? 'border border-primary/30 bg-primary/10 text-primary-glow shadow-[0_0_10px_hsl(var(--primary)/0.16)]'
                        : 'border border-border bg-secondary text-foreground hover:border-primary/35'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-smooth ${
                      isCustomDate
                        ? 'border border-primary/30 bg-primary/10 text-primary-glow shadow-[0_0_10px_hsl(var(--primary)/0.16)]'
                        : 'border border-border bg-secondary text-foreground hover:border-primary/35'
                    }`}
                  >
                    {isCustomDate ? formattedDate : t('customDate')}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto border-border bg-popover/95 p-0 backdrop-blur-xl">
                  <CalendarPicker
                    mode="single"
                    selected={new Date(`${selectedDate}T12:00:00`)}
                    onSelect={(nextDate) => {
                      if (!nextDate) return;
                      setSelectedDate(toDateValue(nextDate));
                      setSelectedRange(null);
                    }}
                    disabled={{ before: today, after: maxReservationDate }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-sm font-bold uppercase tracking-[0.2em]">{t('monthlyRateMode')}</div>
                <p className="mt-2 text-sm text-muted-foreground">{t('monthlyRateHint')}</p>
              </div>
              <Switch checked={isMonthlyRate} onCheckedChange={setIsMonthlyRate} />
            </div>
          </div>

          <div className="space-y-4">
            {courts.map((court) => {
              const reservations = court.reservations.filter((reservation) => reservation.date === selectedDate);
              const monthlyTimes = new Set(
                reservations.filter((reservation) => reservation.type === 'monthly').map((reservation) => reservation.start),
              );
              const reservedTimes = new Set(reservations.map((reservation) => reservation.start));

              return (
                <article key={court.id} className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold">{court.name}</h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-neon-cyan">{court.dimensions}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t('hourlyRate')}: {new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', { style: 'currency', currency: 'BRL' }).format(overrideRateByCourtId[court.id] ?? court.hourlyRate)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t('monthlyRate')}: {new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', { style: 'currency', currency: 'BRL' }).format(court.monthlyRate)}
                      </p>
                    </div>
                    <span className="rounded-full border border-border bg-background/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      {t('chooseTime')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {court.slotOptions.map((slot, slotIndex) => {
                      const isReserved = reservedTimes.has(slot.start);
                      const isMonthlyBooked = monthlyTimes.has(slot.start);
                      const isSelected = selectedRange?.courtId === court.id
                        && slotIndex >= selectedRange.startIndex
                        && slotIndex <= selectedRange.endIndex;
                      const slotPrice = getSlotPrice(overrideRateByCourtId[court.id] ?? court.hourlyRate, slot);

                      return (
                        <button
                          key={`${slot.start}-${slot.end}`}
                          type="button"
                          disabled={isReserved}
                          onClick={() => {
                            setSelectedRange((current) => {
                              if (!current || current.courtId !== court.id) {
                                return { courtId: court.id, startIndex: slotIndex, endIndex: slotIndex };
                              }

                              if (isMonthlyRate) {
                                return { courtId: court.id, startIndex: slotIndex, endIndex: slotIndex };
                              }

                              const [fromIndex, toIndex] = current.startIndex <= slotIndex ? [current.startIndex, slotIndex] : [slotIndex, current.startIndex];
                              const rangeSlots = court.slotOptions.slice(fromIndex, toIndex + 1);

                              if (rangeSlots.some((time) => reservedTimes.has(time.start))) {
                                return { courtId: court.id, startIndex: slotIndex, endIndex: slotIndex };
                              }

                              return {
                                courtId: court.id,
                                startIndex: fromIndex,
                                endIndex: toIndex,
                              };
                            });
                          }}
                          className={`rounded-xl px-3 py-3 text-sm font-semibold transition-smooth ${
                            isReserved
                              ? isMonthlyBooked
                                ? 'cursor-not-allowed border border-amber-200/10 bg-amber-100/10 text-amber-200/70'
                                : 'cursor-not-allowed border border-live/25 bg-live/10 text-live/80'
                              : isSelected
                                ? 'border border-primary/35 bg-primary/10 text-primary-glow shadow-[0_0_14px_hsl(var(--primary)/0.18)]'
                                : 'border border-border bg-background/35 text-foreground hover:border-neon-cyan/40 hover:text-neon-cyan'
                          }`}
                        >
                          <span className="block">{slot.start} - {slot.end}</span>
                          <span className="mt-1 block text-[11px] font-bold opacity-80">
                            {new Intl.NumberFormat(language === 'pt-BR' ? 'pt-BR' : 'en-US', { style: 'currency', currency: 'BRL' }).format(slotPrice)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {reservedTimes.size === court.slotOptions.length ? (
                    <p className="mt-4 text-sm text-muted-foreground">{t('noAvailableSlots')}</p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-neon-pink" />
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">{t('bookingSummary')}</h2>
            </div>
            <div className="space-y-3 text-sm">
              <SummaryRow label={t('sportComplex')} value={place.name} />
              <SummaryRow label={t('selectedCourt')} value={selectedCourt?.name ?? '-'} />
              <SummaryRow label={t('dimensions')} value={selectedCourt?.dimensions ?? '-'} />
              <SummaryRow label={t('selectDateLabel')} value={formattedDate} />
              <SummaryRow label={t('reservationStartTime')} value={selectedStartTime} />
              <SummaryRow label={t('reservationEndTime')} value={selectedEndTime} />
              <SummaryRow label={t('reservationDuration')} value={selectedDuration} />
              <SummaryRow label={isMonthlyRate ? t('monthlyRate') : t('totalPrice')} value={selectedCourt ? formattedTotal : '-'} />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-background/25 px-3 py-3 text-xs">
              <LegendItem colorClass="bg-live" label={t('singleBooked')} />
              <LegendItem colorClass="bg-amber-300/80" label={t('monthlyBooked')} />
            </div>

            <button
              type="button"
              disabled={!selectedRange}
              onClick={() => {
                if (!selectedRange || !selectedCourt) return;
                navigate('/payment', {
                  state: {
                    title: t('paymentTitle'),
                    description: t('paymentDescription'),
                    amount: formattedTotal,
                    complexId: place.id,
                    backTo: `/reservations/${place.id}`,
                    summary: [
                      { label: t('sportComplex'), value: place.name },
                      { label: t('selectedCourt'), value: selectedCourt.name },
                      { label: t('dimensions'), value: selectedCourt.dimensions },
                      { label: t('selectDateLabel'), value: formattedDate },
                      { label: t('reservationStartTime'), value: selectedStartTime },
                      { label: t('reservationEndTime'), value: selectedEndTime },
                      { label: t('reservationDuration'), value: selectedDuration },
                      { label: isMonthlyRate ? t('monthlyRate') : t('totalPrice'), value: formattedTotal },
                    ],
                  },
                });
              }}
              className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.2em] transition-smooth ${
                selectedRange
                  ? 'bg-gradient-primary shadow-neon hover:brightness-110'
                  : 'cursor-not-allowed border border-border bg-secondary text-muted-foreground'
              }`}
            >
              <Clock3 className="h-4 w-4" />
              {t('confirmReservation')}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, value }: { icon: React.ReactNode; value: string }) => (
  <div className="flex items-center gap-3">
    {icon}
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-background/30 p-3">
    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    <div className="mt-1 font-semibold text-foreground">{value}</div>
  </div>
);

const LegendItem = ({ colorClass, label }: { colorClass: string; label: string }) => (
  <div className="inline-flex items-center gap-2">
    <span className={`h-3 w-3 rounded-full ${colorClass}`} />
    <span className="font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
  </div>
);

export default ReservationDetail;
