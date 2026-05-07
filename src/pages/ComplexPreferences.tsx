import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock3, Plus, Save, Settings2, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { DragSelectField } from '@/components/DragSelectField';
import { useLanguage } from '@/i18n';
import { useSession } from '@/session';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { createHolidaySchedule, getComplexPreference, paymentMethodOptions, saveComplexPreference, weekDayOrder } from '@/lib/complex-preferences-store';
import { sportComplexApi } from '@/lib/api';

import type { DaySchedule, HolidaySchedule, PaymentMethod, PricingRule } from '@/types';
import { getAllCourts } from '@/lib/courts-store';

const formatDateValue = (dateValue: string) => {
  const [year, month, day] = dateValue.split('-');
  return `${day}/${month}/${year}`;
};

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const todayDateValue = toDateValue(new Date());
const timeOptions = Array.from({ length: 24 * 4 }, (_, index) => {
  const totalMinutes = index * 15;
  const hour = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minute = String(totalMinutes % 60).padStart(2, '0');
  return `${hour}:${minute}`;
});

const describePricingRuleCourts = (
  t: (key: string) => string,
  courtIds: string[],
  ownedCourts: { id: string; name: string }[],
) => {
  if (courtIds.includes('all')) return t('allCourts');
  const courtNames = courtIds
    .map((courtId) => ownedCourts.find((court) => court.id === courtId)?.name)
    .filter((name): name is string => Boolean(name));
  return courtNames.join(', ') || '-';
};

const ComplexPreferences = () => {
  const { t } = useLanguage();
  const { complexId } = useParams<{ complexId: string }>();
  const { currentUser, isGestorMode, token } = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const canManageComplexes = currentUser.isAdmin || isGestorMode;
  const { data: manageableComplexes = [], isLoading } = useQuery({
    queryKey: ['sport-complexes'],
    queryFn: async () => {
      const response = await sportComplexApi.list(token!, 1, 100);
      return response.items;
    },
    enabled: !!token && canManageComplexes,
  });
  const selectedPlace = useMemo(
    () => manageableComplexes.find((place) => String(place.id) === complexId) ?? null,
    [manageableComplexes, complexId],
  );
  const selectedComplexKey = selectedPlace ? String(selectedPlace.id) : '';
  const basePreference = selectedComplexKey ? getComplexPreference(selectedComplexKey) : null;
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>(basePreference?.weekSchedule ?? []);
  const [holidays, setHolidays] = useState<HolidaySchedule[]>(basePreference?.holidays ?? []);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(basePreference?.paymentMethods ?? []);
  const [classesPaymentMethods, setClassesPaymentMethods] = useState<PaymentMethod[]>(basePreference?.classesPaymentMethods ?? []);
  const [rentalPaymentMethods, setRentalPaymentMethods] = useState<PaymentMethod[]>(basePreference?.rentalPaymentMethods ?? []);
  const [championshipPaymentMethods, setChampionshipPaymentMethods] = useState<PaymentMethod[]>(basePreference?.championshipPaymentMethods ?? []);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(basePreference?.pricingRules ?? []);
  const [dateSectionOpen, setDateSectionOpen] = useState(false);
  const [pricingSectionOpen, setPricingSectionOpen] = useState(false);
  const [paymentSectionOpen, setPaymentSectionOpen] = useState(false);
  const ownedCourts = useMemo(
    () => getAllCourts().filter((court) => court.complexId === selectedComplexKey),
    [selectedComplexKey],
  );

  useEffect(() => {
    if (!selectedComplexKey) return;
    syncPreference(selectedComplexKey);
  }, [selectedComplexKey]);

  const syncPreference = (complexId: string) => {
    const preference = getComplexPreference(complexId);
    setWeekSchedule(preference.weekSchedule);
    setHolidays(preference.holidays);
    setPaymentMethods(preference.paymentMethods);
    setClassesPaymentMethods(preference.classesPaymentMethods);
    setRentalPaymentMethods(preference.rentalPaymentMethods);
    setChampionshipPaymentMethods(preference.championshipPaymentMethods);
    setPricingRules(preference.pricingRules);
  };

  if (!canManageComplexes) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black">
            <span className="neon-text">{t('preferences')}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t('ownerOnlyDescription')}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Clock3 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!selectedPlace) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <h1 className="font-display text-3xl font-black">{t('sportComplexes')}</h1>
          <p className="mt-3 text-sm text-muted-foreground">Complexo não encontrado ou sem acesso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(116rem,calc(100vw-3rem))]">
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/management/complexs')}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('preferences')}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t('complexPreferencesIntro')}</p>
        </div>
      </header>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_320px]">
        <section className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('sportComplex')}</Label>
              <div className="rounded-xl border border-border bg-background/30 px-4 py-3 text-sm font-semibold text-foreground">
                {selectedPlace.name}
              </div>
            </div>

            <PreferencePanel title={t('datesOpen')} isOpen={dateSectionOpen} onToggle={() => setDateSectionOpen((current) => !current)}>
              <div className="space-y-3">
                {weekDayOrder.map((day) => {
                  const schedule = weekSchedule.find((item) => item.day === day);
                  if (!schedule) return null;

                  return (
                    <div key={day} className="rounded-2xl border border-border bg-background/30 px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="min-w-[80px] font-semibold text-foreground">{t(day)}</div>
                        <div className="flex flex-1 items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('opensShort')}</span>
                          <Select
                            value={schedule.openTime}
                            onValueChange={(value) => {
                              setWeekSchedule((current) => current.map((item) => (
                                item.day === day ? { ...item, openTime: value } : item
                              )));
                            }}
                            disabled={schedule.isClosed}
                          >
                            <SelectTrigger className="h-9 w-24 border-border bg-background/60 font-mono text-sm disabled:opacity-50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-72 border-border bg-popover/95 backdrop-blur-xl">
                              {timeOptions.map((time) => (
                                <SelectItem key={time} value={time} className="font-mono">
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('closesShort')}</span>
                          <Select
                            value={schedule.closeTime}
                            onValueChange={(value) => {
                              setWeekSchedule((current) => current.map((item) => (
                                item.day === day ? { ...item, closeTime: value } : item
                              )));
                            }}
                            disabled={schedule.isClosed}
                          >
                            <SelectTrigger className="h-9 w-24 border-border bg-background/60 font-mono text-sm disabled:opacity-50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-72 border-border bg-popover/95 backdrop-blur-xl">
                              {timeOptions.map((time) => (
                                <SelectItem key={time} value={time} className="font-mono">
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <Checkbox
                            checked={schedule.isClosed}
                            onCheckedChange={(checked) => {
                              setWeekSchedule((current) => current.map((item) => (
                                item.day === day ? { ...item, isClosed: checked === true } : item
                              )));
                            }}
                          />
                          {t('closed')}
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('holidays')}</div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/70 px-3 py-2 text-sm font-semibold transition-smooth hover:border-primary/40 hover:bg-secondary"
                      >
                        <Calendar className="h-4 w-4 text-neon-cyan" />
                        {t('addHoliday')}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-auto border-border bg-popover/95 p-0 backdrop-blur-xl">
                      <CalendarPicker
                        mode="single"
                        onSelect={(nextDate) => {
                          if (!nextDate) return;
                          const nextValue = toDateValue(nextDate);
                          setHolidays((current) => {
                            if (current.some((holiday) => holiday.date === nextValue)) return current;
                            return [...current, createHolidaySchedule(nextValue)].sort((a, b) => a.date.localeCompare(b.date));
                          });
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {holidays.length === 0 ? (
                  <div className="rounded-xl border border-border bg-background/30 px-4 py-4 text-sm text-muted-foreground">
                    {t('noHolidays')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {holidays.map((holiday) => (
                      <div key={holiday.date} className="rounded-2xl border border-border bg-background/30 px-3 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="min-w-[80px] font-semibold text-foreground">{formatDateValue(holiday.date)}</div>
                          <div className="flex flex-1 items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('opensShort')}</span>
                            <Select
                              value={holiday.openTime}
                              onValueChange={(value) => {
                                setHolidays((current) => current.map((item) => (
                                  item.date === holiday.date ? { ...item, openTime: value } : item
                                )));
                              }}
                              disabled={holiday.isClosed}
                            >
                              <SelectTrigger className="h-9 w-24 border-border bg-background/60 font-mono text-sm disabled:opacity-50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-72 border-border bg-popover/95 backdrop-blur-xl">
                                {timeOptions.map((time) => (
                                  <SelectItem key={time} value={time} className="font-mono">
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('closesShort')}</span>
                            <Select
                              value={holiday.closeTime}
                              onValueChange={(value) => {
                                setHolidays((current) => current.map((item) => (
                                  item.date === holiday.date ? { ...item, closeTime: value } : item
                                )));
                              }}
                              disabled={holiday.isClosed}
                            >
                              <SelectTrigger className="h-9 w-24 border-border bg-background/60 font-mono text-sm disabled:opacity-50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-72 border-border bg-popover/95 backdrop-blur-xl">
                                {timeOptions.map((time) => (
                                  <SelectItem key={time} value={time} className="font-mono">
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <label className="flex items-center gap-2 text-sm font-medium">
                            <Checkbox
                              checked={holiday.isClosed}
                              onCheckedChange={(checked) => {
                                setHolidays((current) => current.map((item) => (
                                  item.date === holiday.date ? { ...item, isClosed: checked === true } : item
                                )));
                              }}
                            />
                            {t('closed')}
                          </label>
                          <button
                            type="button"
                            onClick={() => setHolidays((current) => current.filter((item) => item.date !== holiday.date))}
                            className="ml-auto text-muted-foreground transition-smooth hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PreferencePanel>

            <PreferencePanel title={t('pricingBySchedule')} isOpen={pricingSectionOpen} onToggle={() => setPricingSectionOpen((current) => !current)}>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">{t('pricingRulesHint')}</p>
                  <button
                    type="button"
                    onClick={() => setPricingRules((current) => [
                      ...current,
                      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, startDate: todayDateValue, endDate: todayDateValue, courtIds: ['all'], price: 0 },
                    ])}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/70 px-3 py-2 text-sm font-semibold transition-smooth hover:border-primary/40 hover:bg-secondary"
                  >
                    <Plus className="h-4 w-4 text-neon-cyan" />
                    {t('addPricingRule')}
                  </button>
                </div>

                {pricingRules.length === 0 ? (
                  <div className="rounded-xl border border-border bg-background/30 px-4 py-4 text-sm text-muted-foreground">
                    {t('noPricingRules')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pricingRules.map((rule) => (
                      <div key={rule.id} className="rounded-2xl border border-border bg-background/30 px-3 py-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('priceRuleFrom')}</span>
                            <Input
                              type="date"
                              value={rule.startDate}
                              onChange={(event) => setPricingRules((current) => current.map((item) => (
                                item.id === rule.id ? { ...item, startDate: event.target.value } : item
                              )))}
                              className="h-9 border-border bg-background/60 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('priceRuleTo')}</span>
                            <Input
                              type="date"
                              value={rule.endDate}
                              onChange={(event) => setPricingRules((current) => current.map((item) => (
                                item.id === rule.id ? { ...item, endDate: event.target.value } : item
                              )))}
                              className="h-9 border-border bg-background/60 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('priceRulePrice')}</span>
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              value={rule.price === 0 ? '' : String(rule.price)}
                              onChange={(event) => {
                                const next = event.target.value.replace(/[^\d]/g, '');
                                setPricingRules((current) => current.map((item) => (
                                  item.id === rule.id ? { ...item, price: Number(next) || 0 } : item
                                )));
                              }}
                              className="h-9 w-24 border-border bg-background/60 text-sm"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setPricingRules((current) => current.filter((item) => item.id !== rule.id))}
                            className="ml-auto text-muted-foreground transition-smooth hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-4">
                          <DragSelectField
                            label={t('courtManagement')}
                            hint=""
                            availableTitle={t('availableCourts')}
                            selectedTitle={t('selectedCourts')}
                            availableItems={[
                              { id: 'all', label: t('allCourts') },
                              ...ownedCourts.map((court) => ({ id: court.id, label: court.name })),
                            ].filter((item) => !rule.courtIds.includes(item.id))}
                            selectedItems={rule.courtIds.map((courtId) => ({
                              id: courtId,
                              label: courtId === 'all' ? t('allCourts') : ownedCourts.find((court) => court.id === courtId)?.name ?? courtId,
                            }))}
                            onMove={(id, nextState) => {
                              setPricingRules((current) => current.map((item) => {
                                if (item.id !== rule.id) return item;
                                const withoutCurrent = item.courtIds.filter((courtId) => courtId !== id);
                                if (nextState === 'available') {
                                  return { ...item, courtIds: withoutCurrent };
                                }
                                if (id === 'all') {
                                  return { ...item, courtIds: ['all'] };
                                }
                                return { ...item, courtIds: [...withoutCurrent.filter((courtId) => courtId !== 'all'), id] };
                              }));
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PreferencePanel>

            <PreferencePanel title={t('paymentMethods')} isOpen={paymentSectionOpen} onToggle={() => setPaymentSectionOpen((current) => !current)}>
              <div className="space-y-5">
                <PaymentMethodSubSection
                  title={t('classesPaymentMethods')}
                  selected={classesPaymentMethods}
                  onChange={setClassesPaymentMethods}
                  t={t}
                />
                <PaymentMethodSubSection
                  title={t('rentalPaymentMethods')}
                  selected={rentalPaymentMethods}
                  onChange={setRentalPaymentMethods}
                  t={t}
                />
                <PaymentMethodSubSection
                  title={t('championshipPaymentMethods')}
                  selected={championshipPaymentMethods}
                  onChange={setChampionshipPaymentMethods}
                  t={t}
                />
              </div>
            </PreferencePanel>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                if (!selectedPlace) return;
                saveComplexPreference({
                  complexId: String(selectedPlace.id),
                  weekSchedule,
                  holidays,
                  paymentMethods,
                  classesPaymentMethods,
                  rentalPaymentMethods,
                  championshipPaymentMethods,
                  pricingRules,
                });
                toast({
                  title: t('preferencesSaved'),
                  description: selectedPlace.name,
                });
              }}
              disabled={!selectedPlace}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary-glow shadow-[0_0_12px_hsl(var(--primary)/0.18)] transition-smooth hover:bg-primary/16 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Save className="h-4 w-4" />
            </button>
          </div>
        </section>

        <aside className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-neon-cyan" />
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">{t('quickPreview')}</h2>
          </div>

          <div className="space-y-3 text-sm">
            <PreviewRow label={t('sportComplex')} value={selectedPlace?.name ?? '-'} />
            <PreviewRow
              label={t('openDays')}
              value={weekSchedule.filter((day) => !day.isClosed).map((day) => `${t(day.day)} ${day.openTime}-${day.closeTime}`).join(' · ') || '-'}
            />
            <PreviewRow
              label={t('closedDays')}
              value={weekSchedule.filter((day) => day.isClosed).map((day) => t(day.day)).join(' · ') || '-'}
            />
            <PreviewRow
              label={t('holidays')}
              value={holidays.length > 0 ? holidays.map((holiday) => (
                `${formatDateValue(holiday.date)} ${holiday.isClosed ? `(${t('closed')})` : `${holiday.openTime}-${holiday.closeTime}`}`
              )).join(' · ') : '-'}
            />
            <PreviewRow
              label={t('paymentMethods')}
              value={paymentMethods.length > 0 ? paymentMethods.map((method) => paymentMethodLabel(t, method)).join(' · ') : '-'}
            />
            <PreviewRow
              label={t('pricingRules')}
              value={pricingRules.length > 0
                ? pricingRules.map((rule) => `${formatDateValue(rule.startDate)} - ${formatDateValue(rule.endDate)} · ${describePricingRuleCourts(t, rule.courtIds, ownedCourts)} · R$${rule.price}`).join(' · ')
                : '-'}
            />
          </div>

          <div className="mt-5 rounded-xl border border-border bg-background/30 p-4 text-sm text-muted-foreground">
            <div className="mb-2 inline-flex items-center gap-2 font-semibold text-foreground">
              <Clock3 className="h-4 w-4 text-neon-cyan" />
              {t('complexCalendar')}
            </div>
            <p>{t('complexCalendarHint')}</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

const PreviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-background/30 p-3">
    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    <div className="mt-1 font-semibold text-foreground">{value}</div>
  </div>
);

const PreferencePanel = ({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-border bg-background/18">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-smooth hover:bg-secondary/25"
    >
      <div className="font-display text-sm font-bold uppercase tracking-[0.2em] text-foreground">{title}</div>
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary-glow">
        <span className="font-display text-lg font-bold leading-none">{isOpen ? '−' : '+'}</span>
      </span>
    </button>
    {isOpen ? <div className="border-t border-border px-4 pb-4 pt-4">{children}</div> : null}
  </div>
);

const paymentMethodLabel = (t: (key: string) => string, method: PaymentMethod) => ({
  pix: t('pix'),
  'credit-card': t('creditCard'),
  'debit-card': t('debitCard'),
  'pay-on-site': t('payOnSite'),
}[method]);

const PaymentMethodSubSection = ({
  title,
  selected,
  onChange,
  t,
}: {
  title: string;
  selected: PaymentMethod[];
  onChange: (next: PaymentMethod[]) => void;
  t: (key: string) => string;
}) => (
  <div>
    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{title}</div>
    <div className="grid gap-2 sm:grid-cols-2">
      {paymentMethodOptions.map((method) => {
        const isSelected = selected.includes(method);
        return (
          <label key={method} className="flex items-center gap-3 rounded-xl border border-border bg-background/30 px-4 py-3 text-sm">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => {
                onChange(
                  checked
                    ? Array.from(new Set([...selected, method]))
                    : selected.filter((item) => item !== method),
                );
              }}
            />
            <span className="font-medium">{paymentMethodLabel(t, method)}</span>
          </label>
        );
      })}
    </div>
  </div>
);

export default ComplexPreferences;
