import { useEffect, useMemo, useState } from 'react';
import { Building2, Calendar, CircleDollarSign, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { CURRENT_USER, RESERVATION_PLACES } from '@/data/mock';
import { DragSelectField } from '@/components/DragSelectField';
import { useLanguage } from '@/i18n';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type TournamentType = 'open-pairs' | 'mixed-pairs' | 'king-of-the-court';
type Category = 'professional' | 'gold' | 'silver' | 'advanced' | 'intermediate' | 'beginner';
type BracketSize = '8' | '16' | '32';
type Audience = 'mixed' | 'male' | 'female';
type CategorySchedule = Record<Category, { date: string; time: string }>;

const CATEGORY_ORDER: Category[] = ['beginner', 'intermediate', 'advanced', 'silver', 'gold', 'professional'];
const START_TIME_OPTIONS = ['08:00', '09:00', '10:00', '11:00', '13:00', '15:00', '17:00', '19:00'];

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromDateValue = (value: string) => new Date(`${value}T12:00:00`);

const buildDateOptions = (range: DateRange | undefined) => {
  if (!range?.from) return [];

  const start = new Date(range.from);
  start.setHours(12, 0, 0, 0);

  const end = range.to ? new Date(range.to) : new Date(range.from);
  end.setHours(12, 0, 0, 0);

  const values: string[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    values.push(toDateValue(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return values;
};

const TournamentSettings = () => {
  const { t, sportName, language } = useLanguage();
  const { toast } = useToast();
  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);
  const ownerComplexes = useMemo(
    () =>
      RESERVATION_PLACES.filter(
        (place) =>
          CURRENT_USER.applications?.includes(place.name) &&
          place.sports.includes('footvolley'),
      ),
    [],
  );

  const [tournamentName, setTournamentName] = useState('Copa Joga Junto Footvolley');
  const [sport, setSport] = useState<'footvolley'>('footvolley');
  const [tournamentType, setTournamentType] = useState<TournamentType>('open-pairs');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(['professional']);
  const [selectedAudiences, setSelectedAudiences] = useState<Audience[]>(['mixed']);
  const [uniformIncluded, setUniformIncluded] = useState(true);
  const [eventDateRange, setEventDateRange] = useState<DateRange | undefined>({
    from: fromDateValue('2026-05-18'),
    to: fromDateValue('2026-05-20'),
  });
  const [registrationDeadline, setRegistrationDeadline] = useState(fromDateValue('2026-05-12'));
  const [complexId, setComplexId] = useState(ownerComplexes[0]?.id ?? '');
  const [entryFee, setEntryFee] = useState('180');
  const [bracketSize, setBracketSize] = useState<BracketSize>('16');
  const [notes, setNotes] = useState('');
  const [categorySchedules, setCategorySchedules] = useState<CategorySchedule>({
    beginner: { date: '2026-05-18', time: '08:00' },
    intermediate: { date: '2026-05-18', time: '09:00' },
    advanced: { date: '2026-05-18', time: '10:00' },
    silver: { date: '2026-05-19', time: '11:00' },
    gold: { date: '2026-05-19', time: '13:00' },
    professional: { date: '2026-05-20', time: '15:00' },
  });

  const selectedComplex = ownerComplexes.find((complex) => complex.id === complexId) ?? ownerComplexes[0];
  const availableCategories = CATEGORY_ORDER.filter((current) => !selectedCategories.includes(current));
  const availableAudiences: Audience[] = ['mixed', 'male', 'female'].filter((current) => !selectedAudiences.includes(current as Audience)) as Audience[];
  const eventDateOptions = useMemo(() => buildDateOptions(eventDateRange), [eventDateRange]);
  const formattedEventDate = useMemo(() => {
    if (!eventDateRange?.from) return '-';

    const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
    const start = eventDateRange.from.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    if (!eventDateRange.to) return start;

    const end = eventDateRange.to.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return `${start} - ${end}`;
  }, [eventDateRange, language]);
  const formattedRegistrationDeadline = useMemo(
    () =>
      registrationDeadline.toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    [language, registrationDeadline],
  );

  useEffect(() => {
    const defaultDate = eventDateOptions[0] ?? '';

    setCategorySchedules((current) => {
      const next = { ...current };

      CATEGORY_ORDER.forEach((category, index) => {
        const previous = current[category];
        const validDate = previous?.date && eventDateOptions.includes(previous.date)
          ? previous.date
          : eventDateOptions[Math.min(index, Math.max(eventDateOptions.length - 1, 0))] ?? defaultDate;

        next[category] = {
          date: validDate,
          time: previous?.time ?? START_TIME_OPTIONS[Math.min(index, START_TIME_OPTIONS.length - 1)],
        };
      });

      return next;
    });
  }, [eventDateOptions]);

  if (CURRENT_USER.type !== 'distributor') {
    return (
      <div className="max-w-3xl">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-live">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('ownerOnlyTitle')}
          </div>
          <h1 className="mt-5 font-display text-4xl font-black">
            <span className="neon-text">{t('tournament')}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t('ownerOnlyDescription')}</p>
        </div>
      </div>
    );
  }

  const tournamentTypeLabel = {
    'open-pairs': t('openPairs'),
    'mixed-pairs': t('mixedPairs'),
    'king-of-the-court': t('kingOfTheCourt'),
  }[tournamentType];
  const audienceLabels = selectedAudiences.map((audience) => t(audience));

  const moveCategory = (category: Category, nextState: 'selected' | 'available') => {
    setSelectedCategories((current) => {
      const withoutCurrent = current.filter((item) => item !== category);
      if (nextState === 'selected') {
        return [...withoutCurrent, category].sort((left, right) => CATEGORY_ORDER.indexOf(left) - CATEGORY_ORDER.indexOf(right));
      }
      return withoutCurrent;
    });
  };

  const moveAudience = (audience: Audience, nextState: 'selected' | 'available') => {
    setSelectedAudiences((current) => {
      const withoutCurrent = current.filter((item) => item !== audience);
      if (nextState === 'selected') {
        return [...withoutCurrent, audience];
      }
      return withoutCurrent;
    });
  };

  const updateCategorySchedule = (category: Category, field: 'date' | 'time', value: string) => {
    setCategorySchedules((current) => ({
      ...current,
      [category]: {
        ...current[category],
        [field]: value,
      },
    }));
  };

  const handleDraft = () => {
    toast({
      title: t('draftSaved'),
      description: `${tournamentName} · ${selectedComplex?.name ?? '-'}`,
    });
  };

  const handlePublish = () => {
    toast({
      title: t('tournamentPublished'),
      description: `${tournamentName} · ${selectedComplex?.name ?? '-'}`,
    });
  };

  return (
    <div className="max-w-7xl space-y-8">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-[0.28em] text-neon-cyan">{t('tournamentBuilder')}</p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('tournamentBuilderIntro')}</p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <section className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card sm:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t('tournamentName')}>
              <Input
                value={tournamentName}
                onChange={(event) => setTournamentName(event.target.value)}
                placeholder={t('tournamentNamePlaceholder')}
                className="border-border bg-background/60"
              />
            </Field>

            <Field label={t('sport')}>
              <Select value={sport} onValueChange={(value: 'footvolley') => setSport(value)}>
                <SelectTrigger className="border-border bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                  <SelectItem value="footvolley">{sportName('footvolley')}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label={t('tournamentType')}>
              <Select value={tournamentType} onValueChange={(value: TournamentType) => setTournamentType(value)}>
                <SelectTrigger className="border-border bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                  <SelectItem value="open-pairs">{t('openPairs')}</SelectItem>
                  <SelectItem value="mixed-pairs">{t('mixedPairs')}</SelectItem>
                  <SelectItem value="king-of-the-court">{t('kingOfTheCourt')}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label={t('eventDate')}>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex w-full items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-left text-sm font-semibold transition-smooth hover:border-primary/40 hover:bg-secondary/80"
                  >
                    <Calendar className="h-4 w-4 text-neon-cyan" />
                    <span>{formattedEventDate}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto border-border bg-popover/95 p-0 backdrop-blur-xl">
                  <CalendarPicker
                    mode="range"
                    selected={eventDateRange}
                    onSelect={setEventDateRange}
                    disabled={{ before: today }}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field label={t('registrationDeadline')}>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex w-full items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-left text-sm font-semibold transition-smooth hover:border-primary/40 hover:bg-secondary/80"
                  >
                    <Calendar className="h-4 w-4 text-neon-cyan" />
                    <span>{formattedRegistrationDeadline}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto border-border bg-popover/95 p-0 backdrop-blur-xl">
                  <CalendarPicker
                    mode="single"
                    selected={registrationDeadline}
                    onSelect={(nextDate) => {
                      if (!nextDate) return;
                      setRegistrationDeadline(nextDate);
                    }}
                    disabled={{ before: today }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field label={t('sportComplex')}>
              <Select value={complexId} onValueChange={setComplexId}>
                <SelectTrigger className="border-border bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                  {ownerComplexes.map((complex) => (
                    <SelectItem key={complex.id} value={complex.id}>
                      {complex.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t('entryFee')}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-neon-cyan">R$</span>
                <Input
                  value={entryFee}
                  onChange={(event) => setEntryFee(event.target.value)}
                  className="border-border bg-background/60 pl-10"
                />
              </div>
            </Field>

            <Field label={t('bracketSize')}>
              <Select value={bracketSize} onValueChange={(value: BracketSize) => setBracketSize(value)}>
                <SelectTrigger className="border-border bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="32">32</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_260px] xl:items-start">
            <DragSelectField
              label={t('dragCategories')}
              hint=""
              availableTitle={t('availableCategories')}
              selectedTitle={t('selectedCategories')}
              availableItems={availableCategories.map((category) => ({ id: category, label: t(category) }))}
              selectedItems={selectedCategories.map((category) => ({ id: category, label: t(category) }))}
              onMove={(id, nextState) => moveCategory(id as Category, nextState)}
            />

            <DragSelectField
              label={t('dragAudience')}
              hint=""
              availableTitle={t('availableAudiences')}
              selectedTitle={t('selectedAudiences')}
              availableItems={availableAudiences.map((audience) => ({ id: audience, label: t(audience) }))}
              selectedItems={selectedAudiences.map((audience) => ({ id: audience, label: t(audience) }))}
              onMove={(id, nextState) => moveAudience(id as Audience, nextState)}
            />

            <div className="flex h-full flex-col">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('uniformIncluded')}</span>
              <div className="flex min-h-[136px] flex-1 items-start justify-between rounded-2xl border border-border bg-background/40 px-4 py-4">
                <div className="pr-4 pt-0.5">
                  <div className="font-semibold text-foreground">{t('uniformIncluded')}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{uniformIncluded ? t('yes') : t('no')}</div>
                </div>
                <Switch checked={uniformIncluded} onCheckedChange={setUniformIncluded} />
              </div>
            </div>
          </div>

          {selectedCategories.length > 0 && (
            <div className="mt-5 rounded-2xl border border-border bg-background/25 p-4 sm:p-5">
              <div className="mb-4">
                <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('categoryStartSchedule')}</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {selectedCategories.map((category) => (
                  <div key={category} className="rounded-2xl border border-border bg-background/40 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="font-display text-sm font-bold uppercase tracking-[0.18em] text-primary-glow">{t(category)}</div>
                      <Tag>{categorySchedules[category]?.time ?? '-'}</Tag>
                    </div>

                    <div className="grid gap-3">
                      <Field label={t('startDay')}>
                        <Select
                          value={categorySchedules[category]?.date ?? ''}
                          onValueChange={(value) => updateCategorySchedule(category, 'date', value)}
                          disabled={eventDateOptions.length === 0}
                        >
                          <SelectTrigger className="border-border bg-background/60">
                            <SelectValue placeholder={t('selectDate')} />
                          </SelectTrigger>
                          <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                            {eventDateOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {fromDateValue(option).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field label={t('startTime')}>
                        <Select
                          value={categorySchedules[category]?.time ?? START_TIME_OPTIONS[0]}
                          onValueChange={(value) => updateCategorySchedule(category, 'time', value)}
                        >
                          <SelectTrigger className="border-border bg-background/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-border bg-popover/95 backdrop-blur-xl">
                            {START_TIME_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5">
            <Field label={t('notes')}>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t('notesPlaceholder')}
                className="min-h-[140px] border-border bg-background/60"
              />
            </Field>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleDraft}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-semibold transition-smooth hover:border-primary/40 hover:bg-secondary/80"
            >
              <Sparkles className="h-4 w-4 text-neon-cyan" />
              {t('saveDraft')}
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.2em] shadow-neon transition-smooth hover:brightness-110"
            >
              <Trophy className="h-4 w-4" />
              {t('publishTournament')}
            </button>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-neon-cyan" />
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">{t('quickPreview')}</h2>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-background/40 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-neon-cyan">{sportName('footvolley')}</div>
              <h3 className="mt-2 font-display text-2xl font-black leading-tight">{tournamentName}</h3>
              <div className="mt-4 space-y-3 text-sm">
                <PreviewRow icon={<Trophy className="h-4 w-4 text-neon-cyan" />} label={t('tournamentType')} value={tournamentTypeLabel} />
                <PreviewRow icon={<Calendar className="h-4 w-4 text-neon-cyan" />} label={t('eventDate')} value={formattedEventDate} />
                <PreviewRow icon={<Calendar className="h-4 w-4 text-neon-cyan" />} label={t('registrationDeadline')} value={formattedRegistrationDeadline} />
                <PreviewRow icon={<Building2 className="h-4 w-4 text-neon-cyan" />} label={t('selectedVenue')} value={selectedComplex?.name ?? '-'} />
                <PreviewRow icon={<CircleDollarSign className="h-4 w-4 text-neon-cyan" />} label={t('entryFee')} value={`R$ ${entryFee}`} />
                <PreviewRow icon={<Sparkles className="h-4 w-4 text-neon-cyan" />} label={t('targetAudience')} value={audienceLabels.join(' · ') || '-'} />
                <PreviewRow icon={<Sparkles className="h-4 w-4 text-neon-cyan" />} label={t('uniformIncluded')} value={uniformIncluded ? t('yes') : t('no')} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                  <Tag key={category}>{t(category)}</Tag>
                ))}
                {selectedAudiences.map((audience) => (
                  <Tag key={audience}>{t(audience)}</Tag>
                ))}
                <Tag>{bracketSize} {t('teams')}</Tag>
                <Tag>{tournamentTypeLabel}</Tag>
              </div>
              {selectedCategories.length > 0 && (
                <div className="mt-5 space-y-2 border-t border-border/70 pt-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">{t('categoryStartSchedule')}</div>
                  <div className="space-y-2">
                    {selectedCategories.map((category) => (
                      <div key={category} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/35 px-3 py-2 text-xs">
                        <span className="font-semibold text-foreground">{t(category)}</span>
                        <span className="text-muted-foreground">
                          {(categorySchedules[category]?.date && categorySchedules[category]?.time)
                            ? `${fromDateValue(categorySchedules[category].date).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })} · ${categorySchedules[category].time}`
                            : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-neon-pink" />
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">{t('ownerComplexes')}</h2>
            </div>
            <div className="space-y-3">
              {ownerComplexes.map((complex) => (
                <div key={complex.id} className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="font-semibold text-foreground">{complex.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{complex.city}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {complex.sports.map((sportId) => (
                      <Tag key={sportId}>
                        {sportName(sportId)}
                      </Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    {children}
  </label>
);

const PreviewRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5">{icon}</div>
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="font-semibold text-foreground">{value}</div>
    </div>
  </div>
);

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-glow">
    {children}
  </span>
);

export default TournamentSettings;
