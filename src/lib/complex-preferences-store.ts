import type { ComplexPreference, DaySchedule, HolidaySchedule, PaymentMethod, PricingRule } from '@/types';

const storageKey = 'joga-junto-complex-preferences';

export const weekDayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export const paymentMethodOptions: PaymentMethod[] = ['pix', 'credit-card', 'debit-card', 'pay-on-site'];

const defaultDaySchedule = (day: string): DaySchedule => ({
  day,
  isClosed: day === 'sunday',
  openTime: '08:00',
  closeTime: '22:00',
});

const defaultHolidaySchedule = (date: string): HolidaySchedule => ({
  date,
  isClosed: true,
  openTime: '08:00',
  closeTime: '18:00',
});

const isDaySchedule = (value: unknown): value is DaySchedule => {
  if (!value || typeof value !== 'object') return false;
  const schedule = value as Record<string, unknown>;
  return typeof schedule.day === 'string'
    && typeof schedule.isClosed === 'boolean'
    && typeof schedule.openTime === 'string'
    && typeof schedule.closeTime === 'string';
};

const isHolidaySchedule = (value: unknown): value is HolidaySchedule => {
  if (!value || typeof value !== 'object') return false;
  const holiday = value as Record<string, unknown>;
  return typeof holiday.date === 'string'
    && typeof holiday.isClosed === 'boolean'
    && typeof holiday.openTime === 'string'
    && typeof holiday.closeTime === 'string';
};

const isPaymentMethod = (value: unknown): value is PaymentMethod =>
  value === 'pix' || value === 'credit-card' || value === 'debit-card' || value === 'pay-on-site';

const isPricingRule = (value: unknown): value is PricingRule => {
  if (!value || typeof value !== 'object') return false;
  const rule = value as Record<string, unknown>;
  return typeof rule.id === 'string'
    && typeof rule.day === 'string'
    && typeof rule.startTime === 'string'
    && typeof rule.endTime === 'string'
    && typeof rule.price === 'number';
};

const normalizePricingRules = (value: unknown): PricingRule[] => {
  if (Array.isArray(value) && value.every(isPricingRule)) return value;
  return [];
};

const normalizeWeekSchedule = (value: unknown, legacy?: { openTime?: string; closeTime?: string; openDays?: string[] }): DaySchedule[] => {
  if (Array.isArray(value) && value.every(isDaySchedule)) {
    return weekDayOrder.map((day) => value.find((schedule) => schedule.day === day) ?? defaultDaySchedule(day));
  }

  return weekDayOrder.map((day) => ({
    day,
    isClosed: !(legacy?.openDays ?? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']).includes(day),
    openTime: legacy?.openTime ?? '08:00',
    closeTime: legacy?.closeTime ?? '22:00',
  }));
};

const normalizeHolidays = (value: unknown): HolidaySchedule[] => {
  if (Array.isArray(value) && value.every(isHolidaySchedule)) {
    return [...value].sort((a, b) => a.date.localeCompare(b.date));
  }

  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return [...value].sort().map((date) => defaultHolidaySchedule(date));
  }

  return [];
};

const normalizePreference = (value: unknown): ComplexPreference | null => {
  if (!value || typeof value !== 'object') return null;
  const preference = value as Record<string, unknown>;
  if (typeof preference.complexId !== 'string') return null;

  return {
    complexId: preference.complexId,
    weekSchedule: normalizeWeekSchedule(preference.weekSchedule, {
      openTime: typeof preference.openTime === 'string' ? preference.openTime : undefined,
      closeTime: typeof preference.closeTime === 'string' ? preference.closeTime : undefined,
      openDays: Array.isArray(preference.openDays) ? preference.openDays.filter((day): day is string => typeof day === 'string') : undefined,
    }),
    holidays: normalizeHolidays(preference.holidays),
    paymentMethods: Array.isArray(preference.paymentMethods)
      ? preference.paymentMethods.filter(isPaymentMethod)
      : ['pix', 'credit-card', 'debit-card'],
    pricingRules: normalizePricingRules(preference.pricingRules),
  };
};

const defaultPreference = (complexId: string): ComplexPreference => ({
  complexId,
  weekSchedule: weekDayOrder.map((day) => defaultDaySchedule(day)),
  holidays: [],
  paymentMethods: ['pix', 'credit-card', 'debit-card'],
  pricingRules: [],
});

export const createHolidaySchedule = (date: string): HolidaySchedule => defaultHolidaySchedule(date);

export const getComplexPreferences = (): ComplexPreference[] => {
  if (typeof window === 'undefined') return [];
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as unknown[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizePreference).filter((preference): preference is ComplexPreference => preference !== null);
  } catch {
    return [];
  }
};

export const getComplexPreference = (complexId: string): ComplexPreference =>
  getComplexPreferences().find((preference) => preference.complexId === complexId) ?? defaultPreference(complexId);

export const saveComplexPreference = (nextPreference: ComplexPreference) => {
  if (typeof window === 'undefined') return;
  const currentPreferences = getComplexPreferences().filter((preference) => preference.complexId !== nextPreference.complexId);
  window.localStorage.setItem(storageKey, JSON.stringify([...currentPreferences, nextPreference]));
};
