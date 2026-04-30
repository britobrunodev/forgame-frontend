import { useMemo, useState } from 'react';
import { Calendar, Clock3, Plus, Save, Settings2, X } from 'lucide-react';
import { RESERVATION_PLACES } from '@/data/mock';
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
import type { DaySchedule, HolidaySchedule, PaymentMethod, PricingRule } from '@/types';

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

const ComplexPreferences = () => {
  const { t } = useLanguage();
  const { isGestorMode, currentUser } = useSession();
  const { toast } = useToast();
  const ownedPlaces = useMemo(
    () => RESERVATION_PLACES.filter((place) => (currentUser.ownedComplexIds ?? []).includes(place.id)),
    [currentUser.ownedComplexIds],
  );
  const [selectedComplexId, setSelectedComplexId] = useState(ownedPlaces[0]?.id ?? '');
  const selectedPlace = ownedPlaces.find((place) => place.id === selectedComplexId) ?? null;
  const basePreference = selectedPlace ? getComplexPreference(selectedPlace.id) : null;
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>(basePreference?.weekSchedule ?? []);
  const [holidays, setHolidays] = useState<HolidaySchedule[]>(basePreference?.holidays ?? []);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(basePreference?.paymentMethods ?? []);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(basePreference?.pricingRules ?? []);
  const [dateSectionOpen, setDateSectionOpen] = useState(true);
  const [pricingSectionOpen, setPricingSectionOpen] = useState(true);
  const [paymentSectionOpen, setPaymentSectionOpen] = useState(true);

  const syncPreference = (complexId: string) => {
    const preference = getComplexPreference(complexId);
    setWeekSchedule(preference.weekSchedule);
    setHolidays(preference.holidays);
    setPaymentMethods(preference.paymentMethods);
    setPricingRules(preference.pricingRules);
  };

  if (!isGestorMode) {
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

  return (
    <div className="mx-auto w-full max-w-[min(108rem,calc(100vw-2rem))] space-y-8 xl:max-w-[min(116rem,calc(100vw-3rem))]">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('preferences')}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('complexPreferencesIntro')}</p>
        </div>
      </header>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_320px]">
        <section className="rounded-[2rem] border border-border bg-gradient-card p-5 shadow-card sm:p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('sportComplex')}</Label>
              <Select
                value={selectedComplexId}
                onValueChange={(value) => {
                  setSelectedComplexId(value);
                  syncPreference(value);
                }}
              >
                <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                  <SelectValue placeholder={t('selectComplex')} />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                  {ownedPlaces.map((place) => (
                    <SelectItem key={place.id} value={place.id}>
                      {place.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <PreferencePanel title={t('datesOpen')} isOpen={dateSectionOpen} onToggle={() => setDateSectionOpen((current) => !current)}>
              <div className="space-y-3">
                {weekDayOrder.map((day) => {
                  const schedule = weekSchedule.find((item) => item.day === day);
                  if (!schedule) return null;

                  return (
                    <div key={day} className="grid gap-2 rounded-2xl border border-border bg-background/30 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_auto_72px_auto_72px_auto] lg:items-center">
                      <div className="font-semibold text-foreground">{t(day)}</div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('opensShort')}</span>
                      <Input
                        type="text"
                        placeholder="HH:MM"
                        maxLength={5}
                        value={schedule.openTime}
                        disabled={schedule.isClosed}
                        onChange={(event) => {
                          setWeekSchedule((current) => current.map((item) => (
                            item.day === day ? { ...item, openTime: event.target.value } : item
                          )));
                        }}
                        className="h-10 border-border bg-background/60 font-mono disabled:opacity-50"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('closesShort')}</span>
                      <Input
                        type="text"
                        placeholder="HH:MM"
                        maxLength={5}
                        value={schedule.closeTime}
                        disabled={schedule.isClosed}
                        onChange={(event) => {
                          setWeekSchedule((current) => current.map((item) => (
                            item.day === day ? { ...item, closeTime: event.target.value } : item
                          )));
                        }}
                        className="h-10 border-border bg-background/60 font-mono disabled:opacity-50"
                      />
                      <label className="inline-flex items-center justify-self-start gap-2 text-sm font-medium lg:ml-4 lg:justify-self-end">
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
                      <div key={holiday.date} className="grid gap-2 rounded-2xl border border-border bg-background/30 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_auto_72px_auto_72px_auto_auto] lg:items-center">
                        <div className="font-semibold text-foreground">{formatDateValue(holiday.date)}</div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('opensShort')}</span>
                        <Input
                          type="text"
                          placeholder="HH:MM"
                          maxLength={5}
                          value={holiday.openTime}
                          disabled={holiday.isClosed}
                          onChange={(event) => {
                            setHolidays((current) => current.map((item) => (
                              item.date === holiday.date ? { ...item, openTime: event.target.value } : item
                            )));
                          }}
                          className="h-10 border-border bg-background/60 font-mono disabled:opacity-50"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('closesShort')}</span>
                        <Input
                          type="text"
                          placeholder="HH:MM"
                          maxLength={5}
                          value={holiday.closeTime}
                          disabled={holiday.isClosed}
                          onChange={(event) => {
                            setHolidays((current) => current.map((item) => (
                              item.date === holiday.date ? { ...item, closeTime: event.target.value } : item
                            )));
                          }}
                          className="h-10 border-border bg-background/60 font-mono disabled:opacity-50"
                        />
                        <label className="inline-flex items-center justify-self-start gap-2 text-sm font-medium lg:ml-4 lg:justify-self-end">
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
                          className="justify-self-start text-muted-foreground transition-smooth hover:text-foreground lg:justify-self-end"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PreferencePanel>

            <PreferencePanel title={t('pricingBySchedule')} isOpen={pricingSectionOpen} onToggle={() => setPricingSectionOpen((current) => !current)}>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">{t('noPricingRules').split('.')[0]}.</p>
                  <button
                    type="button"
                    onClick={() => setPricingRules((current) => [
                      ...current,
                      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, day: 'monday', startTime: '08:00', endTime: '12:00', price: 0 },
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
                      <div key={rule.id} className="grid gap-2 rounded-2xl border border-border bg-background/30 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_auto_72px_auto_72px_auto_88px_auto] lg:items-center">
                        <Select
                          value={rule.day}
                          onValueChange={(value) => setPricingRules((current) => current.map((item) => (
                            item.id === rule.id ? { ...item, day: value } : item
                          )))}
                        >
                          <SelectTrigger className="border-border bg-background/60 text-sm font-semibold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                            {weekDayOrder.map((day) => (
                              <SelectItem key={day} value={day}>{t(day)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('priceRuleFrom')}</span>
                        <Input
                          type="text"
                          placeholder="HH:MM"
                          maxLength={5}
                          value={rule.startTime}
                          onChange={(event) => setPricingRules((current) => current.map((item) => (
                            item.id === rule.id ? { ...item, startTime: event.target.value } : item
                          )))}
                          className="h-10 border-border bg-background/60 font-mono"
                        />

                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('priceRuleTo')}</span>
                        <Input
                          type="text"
                          placeholder="HH:MM"
                          maxLength={5}
                          value={rule.endTime}
                          onChange={(event) => setPricingRules((current) => current.map((item) => (
                            item.id === rule.id ? { ...item, endTime: event.target.value } : item
                          )))}
                          className="h-10 border-border bg-background/60 font-mono"
                        />

                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground lg:ml-4">R$</span>
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
                          className="h-10 border-border bg-background/60"
                        />

                        <button
                          type="button"
                          onClick={() => setPricingRules((current) => current.filter((item) => item.id !== rule.id))}
                          className="justify-self-start text-muted-foreground transition-smooth hover:text-foreground lg:justify-self-end"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PreferencePanel>

            <PreferencePanel title={t('paymentMethods')} isOpen={paymentSectionOpen} onToggle={() => setPaymentSectionOpen((current) => !current)}>
              <div className="grid gap-3 sm:grid-cols-2">
                {paymentMethodOptions.map((method) => {
                  const isSelected = paymentMethods.includes(method);
                  return (
                    <label key={method} className="flex items-center gap-3 rounded-xl border border-border bg-background/30 px-4 py-3 text-sm">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          setPaymentMethods((current) => (
                            checked
                              ? Array.from(new Set([...current, method]))
                              : current.filter((item) => item !== method)
                          ));
                        }}
                      />
                      <span className="font-medium">{paymentMethodLabel(t, method)}</span>
                    </label>
                  );
                })}
              </div>
            </PreferencePanel>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                if (!selectedPlace) return;
                saveComplexPreference({
                  complexId: selectedPlace.id,
                  weekSchedule,
                  holidays,
                  paymentMethods,
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
                ? pricingRules.map((rule) => `${t(rule.day)} ${rule.startTime}–${rule.endTime} R$${rule.price}`).join(' · ')
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

export default ComplexPreferences;
